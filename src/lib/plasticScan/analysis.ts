export type LangCode = "en" | "hi" | "es";

// All material categories Camera 2 can detect
export type MaterialKind =
  | "PET_BOTTLE"
  | "HDPE_BOTTLE"
  | "METAL_CAN_ALUMINUM"
  | "METAL_CAN_STEEL"
  | "GLASS_BOTTLE_CLEAR"
  | "GLASS_BOTTLE_COLORED"
  | "CARDBOARD"
  | "PAPER"
  | "TETRA_PACK"
  | "PLASTIC_OTHER"
  | "NON_RECYCLABLE";

// Legacy alias kept for backward compat with paymentEngine / tests
export type PlasticKind = "PET" | "HDPE" | "PVC" | "LDPE" | "PP" | "PS" | "Other";

export type ConditionKind = "clean" | "dirty" | "damaged" | "crushed";
export type RecyclabilityLevel = "high" | "moderate" | "low";

// Credit unit: "each" = per item, "kg" = per kilogram
export type CreditUnit = "each" | "kg";

export type DetectedItem = {
  materialKind: MaterialKind;
  // Legacy field — mapped from materialKind for backward compat
  plasticType: PlasticKind;
  displayType: string;
  confidence: number;
  condition: ConditionKind;
  contamination: string[];
  brandHint: string | null;
  weightEstimateGrams: [number, number];
  // How many individual items (for "each" rated materials)
  countEstimate: number;
  creditUnit: CreditUnit;
  creditsPerUnit: number;
};

export type ScanAnalysis = {
  quality: { ok: boolean; issues: string[]; liveHint: string | null };
  items: DetectedItem[];
  recyclability: RecyclabilityLevel;
  recyclabilityExplanation: string;
  binColorKey: "blue" | "yellow" | "red" | "green" | "special";
  binColorLabel: string;
  preparation: string[];
  carbonCreditsApprox: number;
  facilityNote: string;
  environmentalImpact: string;
  upcycling: string[];
  educationalTip: string;
  uncertainAlternative: string | null;
};

// ── Material metadata ────────────────────────────────────────────────────────

interface MaterialMeta {
  displayType: string;
  recyclability: RecyclabilityLevel;
  binColorKey: ScanAnalysis["binColorKey"];
  binColorLabel: string;
  creditUnit: CreditUnit;
  creditsPerUnit: number;
  // Legacy plastic type mapping
  plasticType: PlasticKind;
}

const MATERIAL_META: Record<MaterialKind, MaterialMeta> = {
  PET_BOTTLE: {
    displayType: "Plastic Bottle (PET #1)",
    recyclability: "high",
    binColorKey: "blue",
    binColorLabel: "Blue bin — rigid plastics",
    creditUnit: "each",
    creditsPerUnit: 2,
    plasticType: "PET",
  },
  HDPE_BOTTLE: {
    displayType: "Plastic Bottle (HDPE #2)",
    recyclability: "high",
    binColorKey: "blue",
    binColorLabel: "Blue bin — rigid plastics",
    creditUnit: "each",
    creditsPerUnit: 2,
    plasticType: "HDPE",
  },
  METAL_CAN_ALUMINUM: {
    displayType: "Aluminum Can",
    recyclability: "high",
    binColorKey: "blue",
    binColorLabel: "Blue bin — metals",
    creditUnit: "each",
    creditsPerUnit: 3,
    plasticType: "Other",
  },
  METAL_CAN_STEEL: {
    displayType: "Steel Can",
    recyclability: "high",
    binColorKey: "blue",
    binColorLabel: "Blue bin — metals",
    creditUnit: "each",
    creditsPerUnit: 3,
    plasticType: "Other",
  },
  GLASS_BOTTLE_CLEAR: {
    displayType: "Glass Bottle (Clear)",
    recyclability: "high",
    binColorKey: "green",
    binColorLabel: "Green bin — glass",
    creditUnit: "each",
    creditsPerUnit: 2,
    plasticType: "Other",
  },
  GLASS_BOTTLE_COLORED: {
    displayType: "Glass Bottle (Colored)",
    recyclability: "moderate",
    binColorKey: "green",
    binColorLabel: "Green bin — glass",
    creditUnit: "each",
    creditsPerUnit: 2,
    plasticType: "Other",
  },
  CARDBOARD: {
    displayType: "Cardboard",
    recyclability: "high",
    binColorKey: "yellow",
    binColorLabel: "Yellow bin — paper & cardboard",
    creditUnit: "kg",
    creditsPerUnit: 1,
    plasticType: "Other",
  },
  PAPER: {
    displayType: "Paper",
    recyclability: "high",
    binColorKey: "yellow",
    binColorLabel: "Yellow bin — paper & cardboard",
    creditUnit: "kg",
    creditsPerUnit: 1,
    plasticType: "Other",
  },
  TETRA_PACK: {
    displayType: "Tetra Pack",
    recyclability: "moderate",
    binColorKey: "yellow",
    binColorLabel: "Special collection — tetra packs",
    creditUnit: "each",
    creditsPerUnit: 1.5,
    plasticType: "Other",
  },
  PLASTIC_OTHER: {
    displayType: "Mixed / Other Plastic",
    recyclability: "low",
    binColorKey: "red",
    binColorLabel: "Check local guidance — mixed plastics",
    creditUnit: "kg",
    creditsPerUnit: 0,
    plasticType: "PS",
  },
  NON_RECYCLABLE: {
    displayType: "Non-Recyclable",
    recyclability: "low",
    binColorKey: "red",
    binColorLabel: "General waste — not recyclable",
    creditUnit: "each",
    creditsPerUnit: 0,
    plasticType: "Other",
  },
};

// All material kinds Camera 2 can detect (ordered by detection priority)
const ALL_KINDS: MaterialKind[] = [
  "PET_BOTTLE", "HDPE_BOTTLE",
  "METAL_CAN_ALUMINUM", "METAL_CAN_STEEL",
  "GLASS_BOTTLE_CLEAR", "GLASS_BOTTLE_COLORED",
  "CARDBOARD", "PAPER", "TETRA_PACK",
  "PLASTIC_OTHER",
];

// ── Image analysis helpers ───────────────────────────────────────────────────

function hashImageSample(data: Uint8ClampedArray, step = 16): number {
  let h = 2166136261;
  for (let i = 0; i < data.length; i += step * 4) {
    h ^= data[i] ?? 0;
    h = Math.imul(h, 16777619);
    h ^= data[i + 1] ?? 0;
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function downscaleToCanvas(img: CanvasImageSource, maxW = 360): HTMLCanvasElement {
  const c = document.createElement("canvas");
  const w = "width" in img && typeof img.width === "number" ? img.width : 640;
  const h = "height" in img && typeof img.height === "number" ? img.height : 480;
  const scale = Math.min(1, maxW / w);
  c.width = Math.max(32, Math.floor(w * scale));
  c.height = Math.max(32, Math.floor(h * scale));
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

export function measureSharpnessAndBrightness(canvas: HTMLCanvasElement): {
  meanL: number;
  lapVar: number;
  edgeEnergy: number;
} {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { meanL: 128, lapVar: 0, edgeEnergy: 0 };
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let sumL = 0;
  const n = width * height;
  const gray = new Float32Array(n);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const L = 0.299 * (data[i] / 255) + 0.587 * (data[i + 1] / 255) + 0.114 * (data[i + 2] / 255);
      gray[y * width + x] = L;
      sumL += L;
    }
  }
  const meanL = (sumL / n) * 255;
  let lapSq = 0, lapSum = 0, edgeSum = 0, lapCount = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const lap = -4 * gray[idx] + gray[idx - 1] + gray[idx + 1] + gray[idx - width] + gray[idx + width];
      lapSum += lap; lapSq += lap * lap; lapCount++;
      const gx = gray[idx + 1] - gray[idx - 1];
      const gy = gray[idx + width] - gray[idx - width];
      edgeSum += Math.sqrt(gx * gx + gy * gy);
    }
  }
  const meanLap = lapSum / lapCount;
  return {
    meanL,
    lapVar: (lapSq / lapCount - meanLap * meanLap) * 1e4,
    edgeEnergy: (edgeSum / lapCount) * 255,
  };
}

function pickMaterial(seed: number, bias: number): MaterialKind {
  return ALL_KINDS[(seed + Math.floor(bias * ALL_KINDS.length)) % ALL_KINDS.length]!;
}

function conditionFromMetrics(meanL: number, lapVar: number, seed: number): ConditionKind {
  const r = (seed % 1000) / 1000;
  if (lapVar < 120 && meanL < 100) return "damaged";
  if (meanL < 70) return "dirty";
  if (r < 0.15) return "crushed";
  if (r < 0.35) return "dirty";
  return "clean";
}

function itemCountFromEdges(edgeEnergy: number, seed: number): number {
  const base = 1 + Math.floor(edgeEnergy / 45);
  const capped = Math.min(5, Math.max(1, base));
  return (seed % 5) === 0 && capped < 4 ? capped + 1 : capped;
}

// Heuristic: estimate how many individual items are visible based on edge complexity
function countEstimateForItem(edgeEnergy: number, seed: number, idx: number): number {
  const base = 1 + Math.floor((edgeEnergy / 60) * (1 - idx * 0.15));
  return Math.max(1, Math.min(8, base + ((seed >> (idx + 2)) % 3)));
}

// ── Main Camera 2 analysis function ─────────────────────────────────────────

export async function analyzeImageElement(
  source: CanvasImageSource,
  fileName: string,
  lang: LangCode
): Promise<ScanAnalysis> {
  const canvas = downscaleToCanvas(source, 400);
  const { meanL, lapVar, edgeEnergy } = measureSharpnessAndBrightness(canvas);
  const ctx = canvas.getContext("2d");
  const pixelData = ctx?.getImageData(0, 0, canvas.width, canvas.height).data;
  const seed = pixelData ? hashImageSample(pixelData) : Date.now();

  // Quality check
  const issues: string[] = [];
  let liveHint: string | null = null;
  if (meanL < 45) {
    issues.push("dark");
    liveHint = lang === "hi" ? "बेहतर रोशनी चाहिए" : lang === "es" ? "Mejor iluminación" : "Better lighting needed";
  }
  if (lapVar < 80) {
    issues.push("blurry");
    liveHint = liveHint || (lang === "hi" ? "कैमरा स्थिर रखें" : lang === "es" ? "Acerca el objeto" : "Move closer and hold steady");
  }
  const qualityOk = issues.length === 0;

  // Detect material kinds from filename hints + image metrics
  const nameLower = fileName.toLowerCase();
  const n = itemCountFromEdges(edgeEnergy, seed);
  const items: DetectedItem[] = [];

  for (let i = 0; i < n; i++) {
    let kind = pickMaterial(seed + i * 7919, edgeEnergy / 100 + i * 0.1);

    // Filename-based overrides (Camera 2 uses visual cues; filename hints simulate that)
    if (i === 0) {
      if (/pet|bottle|water|soda|cola/i.test(nameLower)) kind = "PET_BOTTLE";
      else if (/hdpe|detergent|milk|shampoo/i.test(nameLower)) kind = "HDPE_BOTTLE";
      else if (/can|aluminum|aluminium|beer|tin/i.test(nameLower)) kind = "METAL_CAN_ALUMINUM";
      else if (/steel|food.can|soup/i.test(nameLower)) kind = "METAL_CAN_STEEL";
      else if (/glass|jar/i.test(nameLower)) kind = "GLASS_BOTTLE_CLEAR";
      else if (/cardboard|box|carton/i.test(nameLower)) kind = "CARDBOARD";
      else if (/paper|newspaper|magazine/i.test(nameLower)) kind = "PAPER";
      else if (/tetra|juice.pack|milk.pack/i.test(nameLower)) kind = "TETRA_PACK";
    }

    const meta = MATERIAL_META[kind];
    const condition = conditionFromMetrics(meanL, lapVar, seed + i * 31);
    const contamination: string[] = [];
    if (condition === "dirty") contamination.push("Possible food or organic residue");
    if (kind === "PLASTIC_OTHER" || kind === "NON_RECYCLABLE") contamination.push("Mixed or unclear material");
    if ((seed + i) % 7 === 0 && condition !== "clean") contamination.push("Possible non-recyclable components");

    const brandHint =
      /coke|pepsi|bisleri|nestle|hul|unilever/i.test(nameLower) && i === 0
        ? nameLower.match(/coke|pepsi|bisleri|nestle|hul|unilever/i)?.[0] ?? null
        : (seed + i) % 4 === 0 ? "Unlabeled" : null;

    const w0 = 12 + ((seed >> (i + 3)) % 180);
    const w1 = w0 + 40 + ((seed >> (i + 5)) % 120);
    const countEst = countEstimateForItem(edgeEnergy, seed, i);

    items.push({
      materialKind: kind,
      plasticType: meta.plasticType,
      displayType: meta.displayType,
      confidence: Math.min(0.97, 0.58 + (lapVar / 800) * 0.25 + (qualityOk ? 0.12 : 0) - i * 0.04),
      condition,
      contamination,
      brandHint,
      weightEstimateGrams: [w0, w1],
      countEstimate: countEst,
      creditUnit: meta.creditUnit,
      creditsPerUnit: meta.creditsPerUnit,
    });
  }

  const primary = items[0]!;
  const primaryMeta = MATERIAL_META[primary.materialKind];
  const rec = primaryMeta.recyclability;

  const recyclabilityExplanation =
    rec === "high"
      ? "Widely accepted in standard recycling streams when clean and sorted."
      : rec === "moderate"
        ? "Recyclable only in specific streams — check local facility guidance."
        : "Not accepted in standard recycling. Use designated disposal programs.";

  const preparation =
    primary.condition === "clean"
      ? ["Rinse if required by local rules.", "Keep dry before drop-off."]
      : ["Rinse thoroughly to remove residue.", "Let dry before recycling."];

  const carbonCreditsApprox = Math.round(
    primary.creditUnit === "each"
      ? primary.creditsPerUnit * primary.countEstimate
      : primary.creditsPerUnit * ((primary.weightEstimateGrams[0] + primary.weightEstimateGrams[1]) / 2 / 1000)
  );

  return {
    quality: { ok: qualityOk, issues, liveHint },
    items,
    recyclability: rec,
    recyclabilityExplanation,
    binColorKey: primaryMeta.binColorKey,
    binColorLabel: primaryMeta.binColorLabel,
    preparation,
    carbonCreditsApprox,
    facilityNote: `Drop at a nearby collection point accepting ${primary.displayType}.`,
    environmentalImpact: "Diverting this material reduces landfill waste and conserves raw materials.",
    upcycling: primary.materialKind === "PET_BOTTLE"
      ? ["Cut bottles into planters.", "Use as storage containers."]
      : ["Repurpose for storage.", "Use in craft projects."],
    educationalTip: "Always check your local recycling guidelines — accepted materials vary by facility.",
    uncertainAlternative:
      primary.confidence < 0.72
        ? "If unsure about this material, ask at the collection point before mixing streams."
        : null,
  };
}

export async function tryVisionEndpoint(file: Blob): Promise<ScanAnalysis | null> {
  const url = import.meta.env.VITE_PLASTIC_VISION_URL as string | undefined;
  if (!url) return null;
  try {
    const fd = new FormData();
    fd.append("image", file, "capture.jpg");
    const res = await fetch(url, { method: "POST", body: fd });
    if (!res.ok) return null;
    const json = (await res.json()) as ScanAnalysis;
    if (json && Array.isArray(json.items)) return json;
  } catch {
    return null;
  }
  return null;
}
