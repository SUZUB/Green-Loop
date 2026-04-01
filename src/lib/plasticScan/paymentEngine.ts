import { supabase } from "@/integrations/supabase/client";
import type { MaterialKind, PlasticKind, ScanAnalysis, DetectedItem, RecyclabilityLevel } from "./analysis";

export type { PlasticKind, MaterialKind, RecyclabilityLevel };

// ── Credit rates (authoritative source — Camera 2 uses these) ───────────────
// "each" materials: credits per individual item
// "kg" materials: credits per kilogram
export const CREDIT_RATES: Record<MaterialKind, number> = {
  PET_BOTTLE:          2,
  HDPE_BOTTLE:         2,
  METAL_CAN_ALUMINUM:  3,
  METAL_CAN_STEEL:     3,
  GLASS_BOTTLE_CLEAR:  2,
  GLASS_BOTTLE_COLORED: 2,
  CARDBOARD:           1,   // per kg
  PAPER:               1,   // per kg
  TETRA_PACK:          1.5,
  PLASTIC_OTHER:       0,   // rejected
  NON_RECYCLABLE:      0,   // rejected
};

// Legacy coin rates kept for backward compat with property tests
export const COIN_RATES: Record<PlasticKind, number | null> = {
  PET:   100,
  HDPE:  90,
  PP:    85,
  LDPE:  60,
  PVC:   50,
  PS:    null,
  Other: null,
};

// ── Types ────────────────────────────────────────────────────────────────────

export type EligibilityResult =
  | { eligible: true }
  | { eligible: false; reason: "low_recyclability"; plasticType: PlasticKind }
  | { eligible: false; reason: "contamination"; contaminants: string[] }
  | { eligible: false; reason: "quality"; issues: string[] };

export type PaymentLineItem = {
  materialKind: MaterialKind;
  displayType: string;
  count: number;
  weightKg: number;
  creditUnit: "each" | "kg";
  creditsPerUnit: number;
  totalCredits: number;
};

export type PaymentPreview = {
  scanId: string;
  recyclerUserId: string;
  lineItems: PaymentLineItem[];
  // Legacy field kept for backward compat
  items: Array<{ plasticType: PlasticKind; weightKg: number; coins: number }>;
  totalCoins: number;
  totalWeightKg: number;
  recyclability: RecyclabilityLevel;
};

export type PaymentReceipt = {
  transactionId: string;
  scanId: string;
  recyclerUserId: string;
  lineItems: PaymentLineItem[];
  plasticTypes: PlasticKind[];
  weightKg: number;
  coinsEarned: number;
  recyclerNewBalance: number;
  previousBalance: number;
  timestamp: string;
};

export class UnauthorizedError extends Error {
  constructor() { super("unauthorized"); this.name = "UnauthorizedError"; }
}

export class DuplicateScanError extends Error {
  constructor() { super("already_processed"); this.name = "DuplicateScanError"; }
}

// ── Core functions ───────────────────────────────────────────────────────────

export function generateScanId(): string {
  return crypto.randomUUID();
}

export function isEligibleMaterial(kind: MaterialKind): boolean {
  return CREDIT_RATES[kind] > 0;
}

export function checkEligibility(analysis: ScanAnalysis): EligibilityResult {
  if (!analysis.quality.ok) {
    return { eligible: false, reason: "quality", issues: analysis.quality.issues };
  }

  const allContaminants: string[] = [];
  for (const item of analysis.items) {
    allContaminants.push(...item.contamination);
  }
  if (allContaminants.length > 0) {
    return { eligible: false, reason: "contamination", contaminants: allContaminants };
  }

  const primary = analysis.items[0];
  if (!primary) {
    return { eligible: false, reason: "quality", issues: ["no_items_detected"] };
  }

  // Check using new material system first, fall back to legacy plastic type
  const materialKind = primary.materialKind ?? "PLASTIC_OTHER";
  if (!isEligibleMaterial(materialKind)) {
    return { eligible: false, reason: "low_recyclability", plasticType: primary.plasticType };
  }

  return { eligible: true };
}

export function getRejectionMessage(
  reason: "low_recyclability" | "contamination" | "quality",
  detail?: { plasticType?: PlasticKind; contaminants?: string[] }
): string {
  switch (reason) {
    case "low_recyclability":
      return `Item rejected: not recyclable — No credits added. ${detail?.plasticType ?? "This material"} cannot be accepted.`;
    case "contamination":
      return `Item rejected: contaminated or damaged — No credits added. Issues: ${detail?.contaminants?.join(", ") ?? "contamination detected"}.`;
    case "quality":
      return "Please hold items steady for complete scan. Image quality too low for reliable analysis.";
  }
}

// Calculate credits for a single detected item
export function calculateItemCredits(item: DetectedItem): number {
  const kind = item.materialKind ?? "PLASTIC_OTHER";
  const rate = CREDIT_RATES[kind];
  if (!rate) return 0;

  if (item.creditUnit === "each") {
    return Math.round(rate * item.countEstimate);
  } else {
    // kg-based: use weight estimate midpoint
    const midKg = (item.weightEstimateGrams[0] + item.weightEstimateGrams[1]) / 2 / 1000;
    return Math.round(rate * midKg);
  }
}

// Legacy function kept for property tests
export function calculateItemCoins(item: DetectedItem): number {
  const rate = COIN_RATES[item.plasticType];
  if (rate === null) return 0;
  const midKg = (item.weightEstimateGrams[0] + item.weightEstimateGrams[1]) / 2 / 1000;
  return Math.round(midKg * rate);
}

export function calculatePayment(analysis: ScanAnalysis, scanId: string, recyclerUserId: string): PaymentPreview {
  const eligibleItems = analysis.items.filter((it) => {
    const kind = it.materialKind ?? "PLASTIC_OTHER";
    return isEligibleMaterial(kind);
  });

  const lineItems: PaymentLineItem[] = eligibleItems.map((it) => {
    const kind = it.materialKind ?? "PLASTIC_OTHER";
    const rate = CREDIT_RATES[kind];
    const midKg = (it.weightEstimateGrams[0] + it.weightEstimateGrams[1]) / 2 / 1000;
    const totalCredits = it.creditUnit === "each"
      ? Math.round(rate * it.countEstimate)
      : Math.round(rate * midKg);

    return {
      materialKind: kind,
      displayType: it.displayType,
      count: it.countEstimate,
      weightKg: midKg,
      creditUnit: it.creditUnit,
      creditsPerUnit: rate,
      totalCredits,
    };
  });

  const rawTotal = lineItems.reduce((sum, li) => sum + li.totalCredits, 0);
  const totalCoins = Math.max(1, rawTotal);
  const totalWeightKg = lineItems.reduce((sum, li) => sum + li.weightKg, 0);

  // Legacy items field for backward compat
  const items = eligibleItems.map((it) => ({
    plasticType: it.plasticType,
    weightKg: (it.weightEstimateGrams[0] + it.weightEstimateGrams[1]) / 2 / 1000,
    coins: calculateItemCoins(it),
  }));

  return {
    scanId,
    recyclerUserId,
    lineItems,
    items,
    totalCoins,
    totalWeightKg,
    recyclability: analysis.recyclability,
  };
}

export async function submitPayment(preview: PaymentPreview): Promise<PaymentReceipt> {
  const primaryKind = preview.lineItems[0]?.materialKind ?? "PLASTIC_OTHER";

  // Fetch recycler's current balance for "previous balance" display
  let previousBalance = 0;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("coin_balance")
      .eq("id", preview.recyclerUserId)
      .maybeSingle();
    previousBalance = (data as any)?.coin_balance ?? 0;
  } catch {
    // non-fatal
  }

  const { data, error } = await supabase.rpc("process_scan_payment", {
    p_scan_id:       preview.scanId,
    p_recycler_id:   preview.recyclerUserId,
    p_plastic_type:  primaryKind,
    p_weight_kg:     preview.totalWeightKg,
    p_coins_earned:  preview.totalCoins,
    p_scan_metadata: {
      lineItems: preview.lineItems,
      recyclability: preview.recyclability,
    },
  });

  if (error) {
    if (error.code === "23505") throw new DuplicateScanError();
    if (error.code === "P0401" || error.message?.includes("unauthorized")) throw new UnauthorizedError();
    throw new Error(error.message ?? "Payment submission failed");
  }

  const result = data as {
    transaction_id: string;
    scan_id: string;
    recycler_id: string;
    coins_earned: number;
    recycler_new_balance: number;
    timestamp: string;
  };

  return {
    transactionId: result.transaction_id,
    scanId: result.scan_id,
    recyclerUserId: result.recycler_id,
    lineItems: preview.lineItems,
    plasticTypes: preview.items.map((it) => it.plasticType),
    weightKg: preview.totalWeightKg,
    coinsEarned: result.coins_earned,
    recyclerNewBalance: result.recycler_new_balance,
    previousBalance,
    timestamp: result.timestamp,
  };
}
