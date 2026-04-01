/**
 * Payment Engine for AI Camera Payment feature.
 * Encapsulates eligibility checking, coin calculation, and RPC submission.
 */

import { supabase } from "@/integrations/supabase/client";
import type { PlasticKind, ScanAnalysis, DetectedItem, RecyclabilityLevel } from "./analysis";

// Re-export for consumers
export type { PlasticKind, RecyclabilityLevel };

// ---------------------------------------------------------------------------
// Coin rates per kg by plastic type (null = rejected)
// ---------------------------------------------------------------------------
export const COIN_RATES: Record<PlasticKind, number | null> = {
  PET:   100,
  HDPE:  90,
  PP:    85,
  LDPE:  60,
  PVC:   50,
  PS:    null,
  Other: null,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type EligibilityResult =
  | { eligible: true }
  | { eligible: false; reason: "low_recyclability"; plasticType: PlasticKind }
  | { eligible: false; reason: "contamination"; contaminants: string[] }
  | { eligible: false; reason: "quality"; issues: string[] };

export type PaymentPreview = {
  scanId: string;
  recyclerUserId: string;
  items: Array<{ plasticType: PlasticKind; weightKg: number; coins: number }>;
  totalCoins: number;
  totalWeightKg: number;
  recyclability: RecyclabilityLevel;
};

export type PaymentReceipt = {
  transactionId: string;
  scanId: string;
  recyclerUserId: string;
  plasticTypes: PlasticKind[];
  weightKg: number;
  coinsEarned: number;
  recyclerNewBalance: number;
  timestamp: string;
};

export class UnauthorizedError extends Error {
  constructor() { super("unauthorized"); this.name = "UnauthorizedError"; }
}

export class DuplicateScanError extends Error {
  constructor() { super("already_processed"); this.name = "DuplicateScanError"; }
}

// ---------------------------------------------------------------------------
// generateScanId
// ---------------------------------------------------------------------------
export function generateScanId(): string {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// checkEligibility
// ---------------------------------------------------------------------------
export function checkEligibility(analysis: ScanAnalysis): EligibilityResult {
  // 1. Quality gate
  if (!analysis.quality.ok) {
    return { eligible: false, reason: "quality", issues: analysis.quality.issues };
  }

  // 2. Contamination check (any item)
  const allContaminants: string[] = [];
  for (const item of analysis.items) {
    allContaminants.push(...item.contamination);
  }
  if (allContaminants.length > 0) {
    return { eligible: false, reason: "contamination", contaminants: allContaminants };
  }

  // 3. Low-recyclability check (primary item)
  const primary = analysis.items[0];
  if (!primary) {
    return { eligible: false, reason: "quality", issues: ["no_items_detected"] };
  }
  if (COIN_RATES[primary.plasticType] === null) {
    return { eligible: false, reason: "low_recyclability", plasticType: primary.plasticType };
  }

  return { eligible: true };
}

// ---------------------------------------------------------------------------
// getRejectionMessage
// ---------------------------------------------------------------------------
export function getRejectionMessage(
  reason: "low_recyclability" | "contamination" | "quality",
  detail?: { plasticType?: PlasticKind; contaminants?: string[] }
): string {
  switch (reason) {
    case "low_recyclability":
      return `${detail?.plasticType ?? "This plastic"} (PS/Other) has low recyclability and cannot be accepted for payment. Please separate and dispose of it at a designated facility.`;
    case "contamination":
      return `Item rejected due to contamination: ${detail?.contaminants?.join(", ") ?? "unknown contaminants"}. Please clean the item and try again.`;
    case "quality":
      return "Image quality is too low for reliable analysis. Improve lighting or hold the camera steady and try again.";
  }
}

// ---------------------------------------------------------------------------
// calculateItemCoins
// ---------------------------------------------------------------------------
export function calculateItemCoins(item: DetectedItem): number {
  const rate = COIN_RATES[item.plasticType];
  if (rate === null) return 0;
  const midKg = (item.weightEstimateGrams[0] + item.weightEstimateGrams[1]) / 2 / 1000;
  return Math.round(midKg * rate);
}

// ---------------------------------------------------------------------------
// calculatePayment
// ---------------------------------------------------------------------------
export function calculatePayment(analysis: ScanAnalysis, scanId: string, recyclerUserId: string): PaymentPreview {
  const eligibleItems = analysis.items.filter((it) => COIN_RATES[it.plasticType] !== null);

  const items = eligibleItems.map((it) => ({
    plasticType: it.plasticType,
    weightKg: (it.weightEstimateGrams[0] + it.weightEstimateGrams[1]) / 2 / 1000,
    coins: calculateItemCoins(it),
  }));

  const rawTotal = items.reduce((sum, it) => sum + it.coins, 0);
  const totalCoins = Math.max(1, rawTotal);
  const totalWeightKg = items.reduce((sum, it) => sum + it.weightKg, 0);

  return {
    scanId,
    recyclerUserId,
    items,
    totalCoins,
    totalWeightKg,
    recyclability: analysis.recyclability,
  };
}

// ---------------------------------------------------------------------------
// submitPayment — credits the RECYCLER's account (identified by QR scan)
// ---------------------------------------------------------------------------
export async function submitPayment(preview: PaymentPreview): Promise<PaymentReceipt> {
  const primaryType = preview.items[0]?.plasticType ?? "Other";

  const { data, error } = await supabase.rpc("process_scan_payment", {
    p_scan_id:        preview.scanId,
    p_recycler_id:    preview.recyclerUserId,
    p_plastic_type:   primaryType,
    p_weight_kg:      preview.totalWeightKg,
    p_coins_earned:   preview.totalCoins,
    p_scan_metadata: {
      items: preview.items,
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
    plasticTypes: preview.items.map((it) => it.plasticType),
    weightKg: preview.totalWeightKg,
    coinsEarned: result.coins_earned,
    recyclerNewBalance: result.recycler_new_balance,
    timestamp: result.timestamp,
  };
}
