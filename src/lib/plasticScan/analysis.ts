/**
 * Client-side image metrics and heuristic plastic classification for GREEN LOOP picker scans.
 * Optional server vision: set VITE_PLASTIC_VISION_URL to POST multipart image for JSON override.
 */

export type LangCode = "en" | "hi" | "es";

export type PlasticKind = "PET" | "HDPE" | "PVC" | "LDPE" | "PP" | "PS" | "Other";
export type ConditionKind = "clean" | "dirty" | "damaged" | "crushed";
export type RecyclabilityLevel = "high" | "moderate" | "low";

export type DetectedItem = {
  plasticType: PlasticKind;
  displayType: string;
  confidence: number;
  condition: ConditionKind;
  contamination: string[];
  brandHint: string | null;
  weightEstimateGrams: [number, number];
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

const PLASTIC_LABELS: Record<PlasticKind, string> = {
  PET: "PET (#1)",
  HDPE: "HDPE (#2)",
  PVC: "PVC (#3)",
  LDPE: "LDPE (#4)",
  PP: "PP (#5)",
  PS: "PS (#6)",
  Other: "Other / mixed plastic",
};

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

/** Laplacian variance proxy: higher = sharper */
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
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      const L = 0.299 * r + 0.587 * g + 0.114 * b;
      const idx = y * width + x;
      gray[idx] = L;
      sumL += L;
    }
  }
  const meanL = (sumL / n) * 255;
  let lapSum = 0;
  let lapSq = 0;
  let edgeSum = 0;
  let lapCount = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const lap =
        -4 * gray[idx] +
        gray[idx - 1] +
        gray[idx + 1] +
        gray[idx - width] +
        gray[idx + width];
      lapSum += lap;
      lapSq += lap * lap;
      lapCount++;
      const gx = gray[idx + 1] - gray[idx - 1];
      const gy = gray[idx + width] - gray[idx - width];
      edgeSum += Math.sqrt(gx * gx + gy * gy);
    }
  }
  const meanLap = lapSum / lapCount;
  const lapVar = lapSq / lapCount - meanLap * meanLap;
  const edgeEnergy = edgeSum / lapCount;
  return { meanL, lapVar: lapVar * 1e4, edgeEnergy: edgeEnergy * 255 };
}

const KINDS: PlasticKind[] = ["PET", "HDPE", "PVC", "LDPE", "PP", "PS", "Other"];

function pickPlastic(seed: number, bias: number): PlasticKind {
  const idx = (seed + Math.floor(bias * 7)) % KINDS.length;
  return KINDS[idx]!;
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
  const capped = Math.min(4, Math.max(1, base));
  if ((seed % 5) === 0 && capped < 3) return capped + 1;
  return capped;
}

function recyclabilityFor(kind: PlasticKind): RecyclabilityLevel {
  if (kind === "PET" || kind === "HDPE" || kind === "PP") return "high";
  if (kind === "LDPE" || kind === "PVC") return "moderate";
  if (kind === "PS" || kind === "Other") return "low";
  return "moderate";
}

function binFor(kind: PlasticKind): { key: ScanAnalysis["binColorKey"]; label: string } {
  switch (kind) {
    case "PET":
    case "HDPE":
    case "PP":
      return { key: "blue", label: "Blue / dry recyclables (rigid plastics)" };
    case "LDPE":
      return { key: "yellow", label: "Yellow or film-plastic drop-off (not curbside)" };
    case "PS":
      return { key: "red", label: "Special waste / reject — check local PS programs" };
    case "PVC":
      return { key: "special", label: "Special handling — rarely in mixed recycling" };
    default:
      return { key: "green", label: "Mixed or local guidance — confirm with municipality" };
  }
}

export async function analyzeImageElement(
  source: CanvasImageSource,
  fileName: string,
  lang: LangCode
): Promise<ScanAnalysis> {
  const canvas = downscaleToCanvas(source, 400);
  const { meanL, lapVar, edgeEnergy } = measureSharpnessAndBrightness(canvas);
  const ctx = canvas.getContext("2d");
  const data = ctx?.getImageData(0, 0, canvas.width, canvas.height).data;
  const seed = data ? hashImageSample(data) : Date.now();

  const issues: string[] = [];
  let liveHint: string | null = null;
  if (meanL < 45) {
    issues.push("dark");
    liveHint = lang === "hi" ? "बेहतर रोशनी चाहिए" : lang === "es" ? "Mejor iluminación" : "Better lighting needed";
  }
  if (lapVar < 80) {
    issues.push("blurry");
    liveHint =
      liveHint ||
      (lang === "hi" ? "कैमरा स्थिर रखें, थोड़ा करीब आएं" : lang === "es" ? "Acerca el objeto y enfoca" : "Move closer and hold steady");
  }

  const qualityOk = issues.length === 0;

  const n = itemCountFromEdges(edgeEnergy, seed);
  const items: DetectedItem[] = [];
  const nameLower = fileName.toLowerCase();
  for (let i = 0; i < n; i++) {
    let kind = pickPlastic(seed + i * 7919, edgeEnergy / 100 + i * 0.1);
    if (/pet|bottle|water|soda/i.test(nameLower) && i === 0) kind = "PET";
    if (/(hdpe|detergent|milk|shampoo)/i.test(nameLower) && i === 0) kind = "HDPE";
    if (/(bag|film|wrapper|ldpe)/i.test(nameLower) && i === 0) kind = "LDPE";
    if (/(foam|styro|thermocol|ps)/i.test(nameLower) && i === 0) kind = "PS";

    const condition = conditionFromMetrics(meanL, lapVar, seed + i * 31);
    const contamination: string[] = [];
    if (condition === "dirty") contamination.push("Possible food or organic residue");
    if (kind === "Other") contamination.push("Mixed or unclear polymer layers");
    if ((seed + i) % 7 === 0) contamination.push("Possible non-plastic components visible");

    const brandHint =
      /coke|pepsi|bisleri|nestle|hul|unilever/i.test(nameLower) && i === 0
        ? nameLower.match(/coke|pepsi|bisleri|nestle|hul|unilever/i)?.[0] ?? null
        : (seed + i) % 4 === 0
          ? "Unlabeled — check resin code"
          : null;

    const w0 = 12 + ((seed >> (i + 3)) % 180);
    const w1 = w0 + 40 + ((seed >> (i + 5)) % 120);

    items.push({
      plasticType: kind,
      displayType: PLASTIC_LABELS[kind],
      confidence: Math.min(0.97, 0.58 + (lapVar / 800) * 0.25 + (qualityOk ? 0.12 : 0) - i * 0.04),
      condition,
      contamination,
      brandHint,
      weightEstimateGrams: [w0, w1],
    });
  }

  const primary = items[0]!;
  const rec = recyclabilityFor(primary.plasticType);
  const bin = binFor(primary.plasticType);

  const recyclabilityExplanation =
    rec === "high"
      ? "Widely accepted in rigid plastic streams when clean and sorted."
      : rec === "moderate"
        ? "Recyclable only in specific streams; avoid contaminating mixed bins."
        : "Often not accepted curbside; use designated programs or disposal guidance.";

  const preparation =
    primary.condition === "clean"
      ? ["Rinse if required by local rules.", "Remove caps/labels only if your facility asks.", "Keep dry before drop-off."]
      : ["Rinse thoroughly to remove residue.", "Let dry before recycling.", "Separate films from rigid plastics."];

  const carbonCreditsApprox = Math.round(0.08 * (primary.weightEstimateGrams[0] + primary.weightEstimateGrams[1]) / 2);

  const facilityNote =
    "Drop at a nearby dry-waste center or kabadiwalla accepting " +
    primary.displayType +
    ". Enable location in the app when available for tailored suggestions.";

  const environmentalImpact =
    "Diverting this material cuts landfill methane and reduces virgin plastic demand when reprocessed correctly.";

  const upcycling =
    primary.plasticType === "PET"
      ? ["Cut bottles into planters or organizers.", "PET ribbon for crafts where safe."]
      : ["Storage bins for non-food use.", "Art projects with clean, smooth pieces."];

  const educationalTip =
    "Resin codes (#1–#7) describe polymer type, not guaranteed recyclability — always follow local labels.";

  const uncertainAlternative =
    primary.confidence < 0.72
      ? "If unsure, use your municipality's waste app or ask at the collection point before mixing streams."
      : null;

  return {
    quality: { ok: qualityOk, issues, liveHint },
    items,
    recyclability: rec,
    recyclabilityExplanation,
    binColorKey: bin.key,
    binColorLabel: bin.label,
    preparation,
    carbonCreditsApprox,
    facilityNote,
    environmentalImpact,
    upcycling,
    educationalTip,
    uncertainAlternative,
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
