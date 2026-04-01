import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  Loader2,
  AlertTriangle,
  ScanLine,
  FlipHorizontal,
  RotateCcw,
  Volume2,
  Share2,
  History,
  Layers,
  SunMedium,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  analyzeImageElement,
  tryVisionEndpoint,
  type LangCode,
  type ScanAnalysis,
} from "@/lib/plasticScan/analysis";

const HISTORY_KEY = "green_loop_picker_scan_history";

type HistoryRow = {
  id: string;
  fileName: string;
  scannedAt: string;
  analysis: ScanAnalysis;
};

function isHistoryRow(x: unknown): x is HistoryRow {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  const a = o.analysis;
  if (!a || typeof a !== "object") return false;
  const items = (a as ScanAnalysis).items;
  return typeof o.id === "string" && typeof o.fileName === "string" && typeof o.scannedAt === "string" && Array.isArray(items);
}

type Stage = "idle" | "validating" | "detecting" | "analyzing" | "done";

const UI: Record<
  LangCode,
  {
    title: string;
    subtitle: string;
    liveCamera: string;
    upload: string;
    capture: string;
    retake: string;
    analyze: string;
    batch: string;
    readAloud: string;
    share: string;
    history: string;
    qualityBlock: string;
    moveCloser: string;
  }
> = {
  en: {
    title: "AI Plastic Scanner",
    subtitle: "Live camera or upload — optimized for pickers on GREEN LOOP.",
    liveCamera: "Live camera",
    upload: "Upload image",
    capture: "Capture",
    retake: "Retake",
    analyze: "Analyze",
    batch: "Batch mode",
    readAloud: "Read results",
    share: "Share summary",
    history: "Scan history",
    qualityBlock: "Image quality too low for reliable analysis. Improve lighting or hold steady.",
    moveCloser: "Move closer",
  },
  hi: {
    title: "AI प्लास्टिक स्कैनर",
    subtitle: "लाइव कैमरा या अपलोड — GREEN LOOP पिकर्स के लिए।",
    liveCamera: "लाइव कैमरा",
    upload: "छवि अपलोड",
    capture: "कैप्चर",
    retake: "फिर से लें",
    analyze: "विश्लेषण",
    batch: "बैच मोड",
    readAloud: "पढ़कर सुनाएं",
    share: "साझा करें",
    history: "इतिहास",
    qualityBlock: "विश्लेषण के लिए छवि बहुत कमजोर है। रोशनी बेहतर करें।",
    moveCloser: "करीब लाएं",
  },
  es: {
    title: "Escáner AI de plástico",
    subtitle: "Cámara en vivo o subida — para recolectores en GREEN LOOP.",
    liveCamera: "Cámara en vivo",
    upload: "Subir imagen",
    capture: "Capturar",
    retake: "Repetir",
    analyze: "Analizar",
    batch: "Modo lote",
    readAloud: "Leer en voz alta",
    share: "Compartir",
    history: "Historial",
    qualityBlock: "Calidad de imagen insuficiente. Mejora la luz o el enfoque.",
    moveCloser: "Acercar",
  },
};

function ScanResultBody({
  analysis,
  t,
  batchMode,
  onRetake,
  speakSummary,
  shareSummary,
}: {
  analysis: ScanAnalysis;
  t: (typeof UI)["en"];
  batchMode: boolean;
  onRetake: () => void;
  speakSummary: () => void;
  shareSummary: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge className="bg-emerald-600">{analysis.recyclability} recyclability</Badge>
        <Badge variant="outline">{analysis.binColorLabel}</Badge>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Detected items</h3>
        {analysis.items.map((it, idx) => (
          <div key={idx} className="rounded-xl border p-3 text-sm space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{it.displayType}</span>
              <Badge variant="secondary">{Math.round(it.confidence * 100)}%</Badge>
              <Badge variant="outline">{it.condition}</Badge>
            </div>
            {it.brandHint && <p className="text-muted-foreground text-xs">Label hint: {it.brandHint}</p>}
            <p className="text-xs text-muted-foreground">
              Est. weight: {it.weightEstimateGrams[0]}–{it.weightEstimateGrams[1]} g
            </p>
            {it.contamination.length > 0 && (
              <p className="text-xs text-amber-800">
                <AlertTriangle className="inline h-3 w-3 mr-1" />
                {it.contamination.join(" · ")}
              </p>
            )}
          </div>
        ))}
      </div>

      <details className="rounded-lg border bg-slate-50 p-3 text-sm">
        <summary className="cursor-pointer font-semibold">Recyclability & prep</summary>
        <p className="mt-2 text-muted-foreground">{analysis.recyclabilityExplanation}</p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          {analysis.preparation.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </details>

      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border p-3">
          <p className="text-xs font-semibold text-muted-foreground">Carbon credit (approx.)</p>
          <p className="text-lg font-bold text-primary">{analysis.carbonCreditsApprox} pts</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs font-semibold text-muted-foreground">Facilities</p>
          <p className="text-xs">{analysis.facilityNote}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{analysis.environmentalImpact}</p>
      <div className="text-sm">
        <p className="font-semibold mb-1">Upcycling ideas</p>
        <ul className="list-disc pl-5 space-y-1">
          {analysis.upcycling.map((u, i) => (
            <li key={i}>{u}</li>
          ))}
        </ul>
      </div>
      <p className="text-xs bg-primary/5 border border-primary/15 rounded-lg p-2">{analysis.educationalTip}</p>
      {analysis.uncertainAlternative && <p className="text-xs text-amber-900">{analysis.uncertainAlternative}</p>}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" className="gap-1" onClick={speakSummary}>
          <Volume2 className="h-4 w-4" /> {t.readAloud}
        </Button>
        <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => void shareSummary()}>
          <Share2 className="h-4 w-4" /> {t.share}
        </Button>
        <Button type="button" variant="secondary" size="sm" className="gap-1" onClick={onRetake}>
          <ScanLine className="h-4 w-4" /> {batchMode ? "Next scan" : t.retake}
        </Button>
      </div>
    </motion.div>
  );
}

function playTone(freq: number, duration = 0.08) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    o.start();
    o.stop(ctx.currentTime + duration);
    setTimeout(() => ctx.close(), 200);
  } catch {
    // ignore
  }
}

function blobFromCanvas(canvas: HTMLCanvasElement, quality = 0.82): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", quality));
}

export default function PickerAICamera() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [lang, setLang] = useState<LangCode>("en");
  const [batchMode, setBatchMode] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("capture.jpg");
  const [blobRef, setBlobRef] = useState<Blob | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [analysis, setAnalysis] = useState<ScanAnalysis | null>(null);
  /** When user opens a past scan from the list (no image blob in memory). */
  const [fromHistory, setFromHistory] = useState(false);
  const [shutterFlash, setShutterFlash] = useState(false);
  const [history, setHistory] = useState<HistoryRow[]>(() => {
    try {
      const s = localStorage.getItem(HISTORY_KEY);
      if (!s) return [];
      const p = JSON.parse(s) as unknown;
      if (!Array.isArray(p)) return [];
      return p.filter(isHistoryRow);
    } catch {
      return [];
    }
  });

  const t = UI[lang];

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch {
      toast({
        title: "Camera unavailable",
        description: "Allow camera access or use upload instead.",
        variant: "destructive",
      });
    }
  }, [facing, stopCamera, toast]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const flipCamera = async () => {
    const next = facing === "user" ? "environment" : "user";
    setFacing(next);
    if (!cameraOn) return;
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: next, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch {
      toast({
        title: "Camera unavailable",
        description: "Allow camera access or use upload instead.",
        variant: "destructive",
      });
      setCameraOn(false);
    }
  };

  const progressValue = useMemo(() => {
    if (stage === "idle" || stage === "done") return 0;
    if (stage === "validating") return 25;
    if (stage === "detecting") return 55;
    if (stage === "analyzing") return 88;
    return 0;
  }, [stage]);

  const runAnalysis = async (blob: Blob, name: string) => {
    setStage("validating");
    await new Promise((r) => setTimeout(r, 400));
    setStage("detecting");
    await new Promise((r) => setTimeout(r, 500));

    const url = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("load"));
      img.src = url;
    });

    let result = await tryVisionEndpoint(blob);
    if (!result) {
      setStage("analyzing");
      result = await analyzeImageElement(img, name, lang);
    }
    URL.revokeObjectURL(url);

    if (!result.quality.ok) {
      setStage("idle");
      toast({ title: t.qualityBlock, description: result.quality.liveHint || t.moveCloser, variant: "destructive" });
      return;
    }

    setAnalysis(result);
    setFromHistory(false);
    setStage("done");
    playTone(880, 0.12);

    const row: HistoryRow = {
      id: `scan-${Date.now()}`,
      fileName: name,
      scannedAt: new Date().toISOString(),
      analysis: result,
    };
    setHistory((prev) => {
      const next = [row, ...prev].slice(0, 40);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    if (batchMode) {
      toast({ title: "Scan complete", description: "Capture the next item when ready." });
    }
  };

  const captureFrame = async () => {
    const video = videoRef.current;
    if (!video || !streamRef.current) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;

    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 160);
    playTone(440, 0.06);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const blob = await blobFromCanvas(canvas);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(url);
    setBlobRef(blob);
    setFileName(`capture-${Date.now()}.jpg`);
    setAnalysis(null);
    setFromHistory(false);
    setStage("idle");
    stopCamera();
  };

  const onPickFile = async (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(url);
    setBlobRef(file);
    setFileName(file.name);
    setAnalysis(null);
    setFromHistory(false);
    setStage("idle");
    stopCamera();
  };

  const resetCapture = () => {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(null);
    setBlobRef(null);
    setAnalysis(null);
    setFromHistory(false);
    setStage("idle");
    setFileName("capture.jpg");
  };

  const speakSummary = () => {
    if (!analysis) return;
    const primary = analysis.items[0];
    const text = [
      `GREEN LOOP scan.`,
      primary ? `${primary.displayType}, confidence ${Math.round(primary.confidence * 100)} percent.` : "",
      `Recyclability ${analysis.recyclability}.`,
      analysis.preparation[0],
    ].join(" ");
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "hi" ? "hi-IN" : lang === "es" ? "es-ES" : "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const shareSummary = async () => {
    if (!analysis) return;
    const lines = analysis.items
      .map((i) => `${i.displayType} (${Math.round(i.confidence * 100)}%) — ${i.condition}`)
      .join("\n");
    const body = `GREEN LOOP — Plastic scan\n${lines}\nRecyclability: ${analysis.recyclability}\n${analysis.binColorLabel}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "GREEN LOOP scan", text: body });
      } else {
        await navigator.clipboard.writeText(body);
        toast({ title: "Copied", description: "Summary copied to clipboard." });
      }
    } catch {
      toast({ title: "Share cancelled", variant: "destructive" });
    }
  };

  const stats = useMemo(() => {
    const map = new Map<string, number>();
    for (const h of history) {
      for (const it of h.analysis.items) {
        map.set(it.plasticType, (map.get(it.plasticType) || 0) + 1);
      }
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [history]);

  return (
    <div className="min-h-screen bg-background/40 pb-24">
      <PageBackground type="oceanPlastic" overlay="bg-foreground/40" />
      <div className="container mx-auto max-w-5xl px-4 py-6">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate("/picker/dashboard")} className="text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white">{t.title}</h1>
            <p className="text-white/80 text-sm mt-1">{t.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4 items-end">
          <div className="space-y-2">
            <Label className="text-white/90 text-xs">Language</Label>
            <Select value={lang} onValueChange={(v) => setLang(v as LangCode)}>
              <SelectTrigger className="w-[140px] bg-white/90">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-white">
            <Switch id="batch" checked={batchMode} onCheckedChange={setBatchMode} />
            <Label htmlFor="batch" className="text-sm cursor-pointer">
              {t.batch}
            </Label>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <Card className="p-4 md:p-5 bg-white/92 backdrop-blur border-white/50 overflow-hidden">
            {!capturedUrl && !analysis && (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[4/3] border border-slate-200">
                  <AnimatePresence>
                    {shutterFlash && (
                      <motion.div
                        className="absolute inset-0 bg-white z-20 pointer-events-none"
                        initial={{ opacity: 0.95 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                      />
                    )}
                  </AnimatePresence>
                  {cameraOn ? (
                    <>
                      <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                      <div className="absolute inset-0 pointer-events-none border-[3px] border-white/30 rounded-2xl m-4 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.15)]" />
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-3 flex-wrap">
                        <Button type="button" size="sm" variant="secondary" onClick={() => void flipCamera()}>
                          <FlipHorizontal className="h-4 w-4 mr-1" /> Flip
                        </Button>
                        <Button type="button" size="sm" className="gap-1" onClick={() => void captureFrame()}>
                          <Camera className="h-4 w-4" /> {t.capture}
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={stopCamera}>
                          Stop
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white/80 p-6 text-center">
                      <SunMedium className="h-10 w-10 mb-3 opacity-70" />
                      <p className="text-sm mb-4">Start the camera for a live preview, or upload a photo.</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button type="button" onClick={() => void startCamera()} className="gap-2">
                          <Camera className="h-4 w-4" /> {t.liveCamera}
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} className="gap-2">
                          <Upload className="h-4 w-4" /> {t.upload}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => void onPickFile(e.target.files?.[0])} />
              </div>
            )}

            {!capturedUrl && analysis && fromHistory && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">Past scan</Badge>
                  <p className="text-xs text-muted-foreground truncate">{fileName}</p>
                </div>
                <ScanResultBody
                  analysis={analysis}
                  t={t}
                  batchMode={batchMode}
                  speakSummary={speakSummary}
                  shareSummary={() => void shareSummary()}
                  onRetake={() => {
                    resetCapture();
                    void startCamera();
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={resetCapture}>
                  Close history view
                </Button>
              </div>
            )}

            {capturedUrl && (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-[4/3]">
                  <img src={capturedUrl} alt="Captured" className="w-full h-full object-contain" />
                  {analysis && (
                    <div className="absolute inset-0 pointer-events-none">
                      {analysis.items.map((_, i) => (
                        <div
                          key={i}
                          className="absolute border-2 border-emerald-400/90 rounded-lg bg-emerald-500/10"
                          style={{
                            left: `${8 + i * 12}%`,
                            top: `${12 + (i % 2) * 18}%`,
                            width: `${28 - i * 4}%`,
                            height: `${35 - i * 3}%`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{fileName}</p>

                {stage !== "idle" && stage !== "done" && (
                  <div className="space-y-2">
                    <Progress value={progressValue} className="h-2" />
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {stage === "validating" && "Validating image quality…"}
                      {stage === "detecting" && "Detecting objects…"}
                      {stage === "analyzing" && "Analyzing polymers & recyclability…"}
                    </p>
                  </div>
                )}

                {!analysis && stage === "idle" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() => blobRef && void runAnalysis(blobRef, fileName)}
                      disabled={!blobRef}
                      className="gap-2"
                    >
                      <ScanLine className="h-4 w-4" /> {t.analyze}
                    </Button>
                    <Button type="button" variant="outline" className="gap-2" onClick={resetCapture}>
                      <RotateCcw className="h-4 w-4" /> {t.retake}
                    </Button>
                  </div>
                )}

                {analysis && (
                  <ScanResultBody
                    analysis={analysis}
                    t={t}
                    batchMode={batchMode}
                    speakSummary={speakSummary}
                    shareSummary={() => void shareSummary()}
                    onRetake={() => {
                      resetCapture();
                      void startCamera();
                    }}
                  />
                )}
              </div>
            )}
          </Card>

          <Card className="p-4 md:p-5 bg-white/92 backdrop-blur border-white/50">
            <div className="flex items-center gap-2 mb-3">
              <History className="h-4 w-4" />
              <h2 className="font-semibold">{t.history}</h2>
            </div>
            {stats.length > 0 && (
              <div className="mb-4 rounded-lg border p-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <Layers className="h-3 w-3" /> Your top polymers (count)
                </p>
                <div className="flex flex-wrap gap-2">
                  {stats.map(([k, v]) => (
                    <Badge key={k} variant="secondary">
                      {k} ×{v}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2 max-h-[480px] overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No scans yet.</p>
              ) : (
                history.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => {
                      if (capturedUrl) URL.revokeObjectURL(capturedUrl);
                      setCapturedUrl(null);
                      setBlobRef(null);
                      setAnalysis(row.analysis);
                      setFromHistory(true);
                      setFileName(row.fileName);
                      setStage("done");
                      stopCamera();
                    }}
                    className="w-full text-left rounded-lg border p-3 hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-sm font-medium truncate">{row.fileName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(row.scannedAt).toLocaleString()}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {row.analysis.items.slice(0, 3).map((it, i) => (
                        <Badge key={i} variant="outline" className="text-[10px]">
                          {it.plasticType}
                        </Badge>
                      ))}
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
