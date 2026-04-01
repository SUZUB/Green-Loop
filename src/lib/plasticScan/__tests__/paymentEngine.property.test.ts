/**
 * Property-based tests for paymentEngine.ts
 * Feature: ai-camera-payment
 * Library: fast-check (min 100 runs each)
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  checkEligibility,
  calculatePayment,
  calculateItemCoins,
  generateScanId,
  getRejectionMessage,
  COIN_RATES,
} from "../paymentEngine";
import type { ScanAnalysis, DetectedItem, PlasticKind } from "../analysis";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const eligiblePlasticTypes: PlasticKind[] = ["PET", "HDPE", "PP", "LDPE", "PVC"];
const rejectedPlasticTypes: PlasticKind[] = ["PS", "Other"];
const allPlasticTypes: PlasticKind[] = [...eligiblePlasticTypes, ...rejectedPlasticTypes];

const arbWeightGrams = fc.tuple(
  fc.integer({ min: 10, max: 500 }),
  fc.integer({ min: 10, max: 500 })
).map(([a, b]): [number, number] => [Math.min(a, b), Math.max(a, b) + 1]);

const arbDetectedItem = (opts?: {
  plasticType?: fc.Arbitrary<PlasticKind>;
  contamination?: fc.Arbitrary<string[]>;
}): fc.Arbitrary<DetectedItem> =>
  fc.record({
    plasticType: opts?.plasticType ?? fc.constantFrom(...allPlasticTypes),
    displayType: fc.constant("Test Plastic"),
    confidence: fc.float({ min: 0.5, max: 0.97 }),
    condition: fc.constantFrom("clean" as const, "dirty" as const, "damaged" as const, "crushed" as const),
    contamination: opts?.contamination ?? fc.constant([]),
    brandHint: fc.constant(null),
    weightEstimateGrams: arbWeightGrams,
  });

const arbEligibleItem = (): fc.Arbitrary<DetectedItem> =>
  arbDetectedItem({ plasticType: fc.constantFrom(...eligiblePlasticTypes), contamination: fc.constant([]) });

const arbScanAnalysis = (opts?: {
  qualityOk?: boolean;
  primaryType?: fc.Arbitrary<PlasticKind>;
  contamination?: fc.Arbitrary<string[]>;
}): fc.Arbitrary<ScanAnalysis> =>
  fc.record({
    quality: fc.record({
      ok: fc.constant(opts?.qualityOk ?? true),
      issues: fc.constant([]),
      liveHint: fc.constant(null),
    }),
    items: fc.array(
      arbDetectedItem({
        plasticType: opts?.primaryType,
        contamination: opts?.contamination,
      }),
      { minLength: 1, maxLength: 4 }
    ),
    recyclability: fc.constantFrom("high" as const, "moderate" as const, "low" as const),
    recyclabilityExplanation: fc.constant(""),
    binColorKey: fc.constantFrom("blue" as const, "yellow" as const, "red" as const, "green" as const, "special" as const),
    binColorLabel: fc.constant(""),
    preparation: fc.constant([]),
    carbonCreditsApprox: fc.integer({ min: 0, max: 100 }),
    facilityNote: fc.constant(""),
    environmentalImpact: fc.constant(""),
    upcycling: fc.constant([]),
    educationalTip: fc.constant(""),
    uncertainAlternative: fc.constant(null),
  });

const arbEligibleScanAnalysis = (): fc.Arbitrary<ScanAnalysis> =>
  fc.array(arbEligibleItem(), { minLength: 1, maxLength: 4 }).map((items) => ({
    quality: { ok: true, issues: [], liveHint: null },
    items,
    recyclability: "high" as const,
    recyclabilityExplanation: "",
    binColorKey: "blue" as const,
    binColorLabel: "",
    preparation: [],
    carbonCreditsApprox: 0,
    facilityNote: "",
    environmentalImpact: "",
    upcycling: [],
    educationalTip: "",
    uncertainAlternative: null,
  }));

// ---------------------------------------------------------------------------
// Property 1: Quality gate blocks payment
// Feature: ai-camera-payment, Property 1: Quality gate blocks payment
// ---------------------------------------------------------------------------
describe("Property 1: Quality gate blocks payment", () => {
  it("checkEligibility returns eligible:false for any analysis with quality.ok=false", () => {
    fc.assert(
      fc.property(
        arbScanAnalysis({ qualityOk: false }),
        (analysis) => {
          const result = checkEligibility(analysis);
          return result.eligible === false;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2: Low-recyclability rejection
// Feature: ai-camera-payment, Property 2: Low-recyclability rejection
// ---------------------------------------------------------------------------
describe("Property 2: Low-recyclability rejection", () => {
  it("checkEligibility returns low_recyclability for PS or Other primary item (no contamination)", () => {
    fc.assert(
      fc.property(
        arbScanAnalysis({
          qualityOk: true,
          primaryType: fc.constantFrom(...rejectedPlasticTypes),
          contamination: fc.constant([]),
        }),
        (analysis) => {
          const result = checkEligibility(analysis);
          if (result.eligible) return false;
          const r = result as { eligible: false; reason: string };
          // Could be contamination from other items — accept either
          return r.reason === "low_recyclability" || r.reason === "contamination";
        }
      ),
      { numRuns: 100 }
    );
  });

  it("checkEligibility returns exactly low_recyclability when primary is PS/Other and no contamination anywhere", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...rejectedPlasticTypes).chain((pt) =>
          arbEligibleItem().map((item) => ({
            ...item,
            plasticType: pt as PlasticKind,
            contamination: [] as string[],
          }))
        ),
        (primaryItem) => {
          const analysis: ScanAnalysis = {
            quality: { ok: true, issues: [], liveHint: null },
            items: [primaryItem],
            recyclability: "low",
            recyclabilityExplanation: "",
            binColorKey: "red",
            binColorLabel: "",
            preparation: [],
            carbonCreditsApprox: 0,
            facilityNote: "",
            environmentalImpact: "",
            upcycling: [],
            educationalTip: "",
            uncertainAlternative: null,
          };
          const result = checkEligibility(analysis);
          return !result.eligible && (result as { eligible: false; reason: string }).reason === "low_recyclability";
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 3: Contamination rejection
// Feature: ai-camera-payment, Property 3: Contamination rejection
// ---------------------------------------------------------------------------
describe("Property 3: Contamination rejection", () => {
  it("checkEligibility returns contamination when any item has non-empty contamination array", () => {
    fc.assert(
      fc.property(
        fc.array(arbEligibleItem(), { minLength: 1, maxLength: 3 }).chain((items) =>
          fc.integer({ min: 0, max: items.length - 1 }).chain((idx) =>
            fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 3 }).map((contaminants) => {
              const contaminated = items.map((it, i) =>
                i === idx ? { ...it, contamination: contaminants } : it
              );
              return contaminated;
            })
          )
        ),
        (items) => {
          const analysis: ScanAnalysis = {
            quality: { ok: true, issues: [], liveHint: null },
            items,
            recyclability: "high",
            recyclabilityExplanation: "",
            binColorKey: "blue",
            binColorLabel: "",
            preparation: [],
            carbonCreditsApprox: 0,
            facilityNote: "",
            environmentalImpact: "",
            upcycling: [],
            educationalTip: "",
            uncertainAlternative: null,
          };
          const result = checkEligibility(analysis);
          return !result.eligible && (result as { eligible: false; reason: string }).reason === "contamination";
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 4: Rejection reason is distinguishable
// Feature: ai-camera-payment, Property 4: Rejection reason is distinguishable
// ---------------------------------------------------------------------------
describe("Property 4: Rejection reason is distinguishable", () => {
  it("getRejectionMessage produces different non-empty strings for different reasons", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("low_recyclability" as const, "contamination" as const),
        fc.constantFrom("low_recyclability" as const, "contamination" as const),
        (r1, r2) => {
          if (r1 === r2) return true;
          const m1 = getRejectionMessage(r1);
          const m2 = getRejectionMessage(r2);
          return m1.length > 0 && m2.length > 0 && m1 !== m2;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 5: Coin calculation formula
// Feature: ai-camera-payment, Property 5: Coin calculation formula
// ---------------------------------------------------------------------------
describe("Property 5: Coin calculation formula", () => {
  it("calculateItemCoins matches the formula round(midKg * rate)", () => {
    fc.assert(
      fc.property(
        arbEligibleItem(),
        (item) => {
          const rate = COIN_RATES[item.plasticType]!;
          const midKg = (item.weightEstimateGrams[0] + item.weightEstimateGrams[1]) / 2 / 1000;
          const expected = Math.round(midKg * rate);
          return calculateItemCoins(item) === expected;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6: Multi-item coin summation
// Feature: ai-camera-payment, Property 6: Multi-item coin summation
// ---------------------------------------------------------------------------
describe("Property 6: Multi-item coin summation", () => {
  it("calculatePayment totalCoins equals max(1, sum of individual coins)", () => {
    fc.assert(
      fc.property(
        fc.array(arbEligibleItem(), { minLength: 1, maxLength: 5 }),
        (items) => {
          const mockAnalysis: ScanAnalysis = {
            quality: { ok: true, issues: [], liveHint: null },
            items,
            recyclability: "high",
            recyclabilityExplanation: "",
            binColorKey: "blue",
            binColorLabel: "",
            preparation: [],
            carbonCreditsApprox: 0,
            facilityNote: "",
            environmentalImpact: "",
            upcycling: [],
            educationalTip: "",
            uncertainAlternative: null,
          };
          const preview = calculatePayment(mockAnalysis, "test-scan-id");
          const sum = items.reduce((acc, it) => acc + calculateItemCoins(it), 0);
          return preview.totalCoins === Math.max(1, sum);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 7: Minimum 1 coin guaranteed
// Feature: ai-camera-payment, Property 7: Minimum 1 coin guaranteed
// ---------------------------------------------------------------------------
describe("Property 7: Minimum 1 coin guaranteed", () => {
  it("calculatePayment always returns totalCoins >= 1 for eligible scans", () => {
    fc.assert(
      fc.property(
        arbEligibleScanAnalysis(),
        (analysis) => {
          const preview = calculatePayment(analysis, crypto.randomUUID());
          return preview.totalCoins >= 1;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 11: Generated scan IDs are unique
// Feature: ai-camera-payment, Property 11: Generated scan IDs are unique
// ---------------------------------------------------------------------------
describe("Property 11: Generated scan IDs are unique", () => {
  it("generateScanId produces unique UUIDs across multiple calls", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 50 }),
        (n) => {
          const ids = Array.from({ length: n }, () => generateScanId());
          return new Set(ids).size === n;
        }
      ),
      { numRuns: 100 }
    );
  });
});
