/**
 * VerifyCollectionModal
 * ─────────────────────
 * Opens when a user clicks a blue Picker marker on the map.
 *
 * Flow:
 *   idle     → user sees "Verify Collection" CTA
 *   scanning → webcam frame is captured and sent to the Python backend
 *              POST http://localhost:5050/scan  { image: "<base64 jpeg>" }
 *   result   → RECYCLABLE  → updates myImpact + shows success
 *              NON-RECYCLABLE → shows rejection warning
 *              UNKNOWN     → shows unknown state
 *   error    → backend unreachable (server not running)
 */

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, CheckCircle2, AlertTriangle, Loader2, ScanLine, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRecycleHub } from "@/hooks/useRecycleHub";
import { useToast } from "@/hooks/use-toast";

const SCANNER_URL = import.meta.env.VITE_PLASTIC_VISION_URL ?? "http://localhost:5050/scan";

type ScanResult = {
  label: string;
  classification: "RECYCLABLE" | "NON-RECYCLABLE" | "UNKNOWN";
  confidence: number;
};

type Stage = "idle" | "scanning" | "result" | "error";

interface Props {
  pickerId: string;
  pickerLabel?: string;
  onClose: () => void;
}

export function VerifyCollectionModal({ pickerId, pickerLabel, onClose }: Props) {
  const { depositPoints, quickActionStats, setQuickActionStats } = useRecycleHub() as any;
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [stage, setStage] = useState<Stage>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const captureAndScan = useCallback(async () => {
    setStage("scanning");
    setResult(null);
    setErrorMsg("");

    try {
      // 1. Open camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();

      // 2. Wait a moment for camera to stabilise
      await new Promise((r) => setTimeout(r, 1200));

      // 3. Capture frame to canvas
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0);
      stopCamera();

      // 4. Convert to base64 and POST to Python backend
      const base64 = canvas.toDataURL("image/jpeg", 0.82).split(",")[1];
      const res = await fetch(SCANNER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data: ScanResult = await res.json();
      setResult(data);
      setStage("result");

      // 5. Update myImpact if recyclable
      if (data.classification === "RECYCLABLE") {
        // Estimate ~0.5 kg per verified collection; award 50 points
        const weightKg = 0.5;
        const points = 50;
        depositPoints?.(points, `Verified collection — ${data.label}`);
        // Also bump totalWasteDivertedKg directly via context setter if available
        if (typeof setQuickActionStats === "function") {
          setQuickActionStats((prev: any) => ({
            ...prev,
            myImpact: {
              totalWasteDivertedKg: Number(
                (prev.myImpact.totalWasteDivertedKg + weightKg).toFixed(1)
              ),
            },
          }));
        }
        toast({
          title: "Collection verified ✓",
          description: `+${points} pts · +${weightKg} kg added to My Impact`,
        });
      }
    } catch (err: any) {
      stopCamera();
      const msg =
        err?.message?.includes("fetch") || err?.message?.includes("Failed")
          ? "Could not reach the AI scanner. Make sure the Python server is running:\n  python ai_camera/plastic_scanner.py server"
          : err?.message ?? "Scan failed";
      setErrorMsg(msg);
      setStage("error");
    }
  }, [depositPoints, setQuickActionStats, stopCamera, toast]);

  const reset = () => {
    stopCamera();
    setStage("idle");
    setResult(null);
    setErrorMsg("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-black/60 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D1FAE5]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            <span className="font-display font-bold text-[#1E293B] text-sm">
              {pickerLabel ?? `Picker ${pickerId.slice(0, 6)}`}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { stopCamera(); onClose(); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-5">
          <AnimatePresence mode="wait">

            {/* ── Idle ── */}
            {stage === "idle" && (
              <motion.div key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto">
                  <Camera className="h-8 w-8 text-[#14532D]" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#1E293B]">Verify Collection</h3>
                  <p className="text-sm text-[#475569] mt-1">
                    Point the camera at the plastic material to verify it's recyclable before logging the collection.
                  </p>
                </div>
                <Button className="w-full gap-2 bg-[#10B981] hover:bg-[#059669]" onClick={() => void captureAndScan()}>
                  <ScanLine className="h-4 w-4" /> Start AI Scan
                </Button>
              </motion.div>
            )}

            {/* ── Scanning ── */}
            {stage === "scanning" && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
                  <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Loader2 className="h-10 w-10 animate-spin text-[#10B981]" />
                  </div>
                  {/* Scan frame overlay */}
                  <div className="absolute inset-6 border-2 border-[#10B981]/70 rounded-xl pointer-events-none" />
                </div>
                <p className="text-sm text-center text-[#475569]">Capturing frame and analysing…</p>
              </motion.div>
            )}

            {/* ── Result ── */}
            {stage === "result" && result && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {result.classification === "RECYCLABLE" ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-9 w-9 text-[#14532D]" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-display font-bold text-lg text-[#14532D]">Material Accepted</h3>
                      <p className="text-sm text-[#475569] mt-1">This plastic is recyclable and has been logged.</p>
                    </div>
                    <div className="bg-[#F0FDF4] rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#475569]">Detected</span>
                        <span className="font-semibold capitalize">{result.label}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#475569]">Confidence</span>
                        <Badge className="bg-[#10B981] text-white">{Math.round(result.confidence * 100)}%</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#475569]">Impact added</span>
                        <span className="font-semibold text-[#14532D]">+0.5 kg · +50 pts</span>
                      </div>
                    </div>
                  </>
                ) : result.classification === "NON-RECYCLABLE" ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                      <AlertTriangle className="h-9 w-9 text-red-600" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-display font-bold text-lg text-red-600">Material Not Accepted</h3>
                      <p className="text-sm text-[#475569] mt-1 font-medium">
                        Material not accepted for this challenge.
                      </p>
                      <p className="text-xs text-[#475569] mt-1">
                        Detected: <span className="font-semibold capitalize">{result.label}</span> ({Math.round(result.confidence * 100)}% confidence)
                      </p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-xs text-red-700">
                      This item is non-recyclable (multi-layer laminate, film, or contaminated material). Do not mix with recyclable plastics.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                      <HelpCircle className="h-9 w-9 text-amber-600" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-display font-bold text-lg text-amber-700">Unknown Material</h3>
                      <p className="text-sm text-[#475569] mt-1">Could not classify with confidence. Try again with better lighting.</p>
                    </div>
                  </>
                )}
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1" onClick={reset}>Scan Again</Button>
                  <Button className="flex-1 bg-[#10B981] hover:bg-[#059669]" onClick={() => { stopCamera(); onClose(); }}>Done</Button>
                </div>
              </motion.div>
            )}

            {/* ── Error ── */}
            {stage === "error" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                  <AlertTriangle className="h-9 w-9 text-red-500" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#1E293B]">Scan Failed</h3>
                  <p className="text-xs text-[#475569] mt-2 whitespace-pre-line">{errorMsg}</p>
                </div>
                <div className="bg-[#F8FAF9] rounded-xl p-3 text-left text-xs text-[#475569] font-mono">
                  python ai_camera/plastic_scanner.py server
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={reset}>Retry</Button>
                  <Button variant="ghost" className="flex-1" onClick={() => { stopCamera(); onClose(); }}>Close</Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
