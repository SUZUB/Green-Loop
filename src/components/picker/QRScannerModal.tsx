/**
 * QRScannerModal — Dual-input scanner with full transaction completion logic.
 *
 * Steps:
 *   choose     → pick "Live Camera" or "Upload from Gallery"
 *   scan       → live camera feed
 *   upload     → file picker + Html5Qrcode.scanFile()
 *   confirm    → enter actual weight, preview credits
 *   processing → run completeTransaction + wallet update
 *   success    → show breakdown, both histories updated
 *   error      → retry options
 *
 * QR formats handled:
 *   { type: "recycler_identity", recycler_id, recycler_name?, pickup_id? }
 *   { type: "pickup_verify",     token }   ← Supabase-backed
 *
 * Validation: recycler_id must have a "scheduled" or "assigned" pickup
 *             before the transaction is allowed to proceed.
 */

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useRecycleHub } from "@/hooks/useRecycleHub";
import { usePickupSchedule } from "@/hooks/usePickupSchedule";
import {
  ScanLine, CheckCircle2, X, Loader2, Camera,
  AlertTriangle, Weight, Coins, ImageUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: (result: { weight_kg: number; points: number }) => void;
}

type Step = "choose" | "scan" | "upload" | "confirm" | "processing" | "success" | "error";

interface ScannedData {
  type: "pickup_verify" | "recycler_identity";
  token?: string;
  recycler_id?: string;
  recycler_name?: string;
  pickup_id?: string;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function parseQRPayload(raw: string): ScannedData | null {
  try {
    const p = JSON.parse(raw);
    if (p.type === "pickup_verify" || p.type === "recycler_identity") return p as ScannedData;
    return null;
  } catch {
    return null;
  }
}

// ─── component ──────────────────────────────────────────────────────────────

export function QRScannerModal({ open, onClose, onSuccess }: Props) {
  const { depositPoints } = useRecycleHub();
  const { completeTransaction, findActivePickupByRecycler } = usePickupSchedule();

  const [step, setStep] = useState<Step>("choose");
  const [scanError, setScanError] = useState("");
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [weightInput, setWeightInput] = useState("");
  const [result, setResult] = useState<{ weight_kg: number; points: number; recycler_name?: string } | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadProcessing, setUploadProcessing] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep("choose");
      setScanError("");
      setScannedData(null);
      setWeightInput("");
      setResult(null);
      setUploadPreview(null);
      setUploadProcessing(false);
    }
  }, [open]);

  // ── Live camera ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || step !== "scan") return;
    let mounted = true;

    const start = async () => {
      try {
        const scanner = new Html5Qrcode("qr-live-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decoded) => {
            if (!mounted) return;
            const payload = parseQRPayload(decoded);
            if (!payload) {
              setScanError("Not a valid GREEN LOOP QR. Ask the recycler to show their QR code.");
              return;
            }
            await scanner.stop();
            if (!mounted) return;
            setScannedData(payload);
            setScanError("");
            setStep("confirm");
          },
          () => {}
        );
      } catch {
        if (mounted) setScanError("Camera access denied. Allow camera permissions and try again.");
      }
    };

    const t = setTimeout(start, 300);
    return () => {
      mounted = false;
      clearTimeout(t);
      scannerRef.current?.stop().catch(() => {});
      scannerRef.current = null;
    };
  }, [open, step]);

  // ── Gallery upload ─────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const url = URL.createObjectURL(file);
    setUploadPreview(url);
    setUploadProcessing(true);
    setScanError("");

    try {
      const scanner = new Html5Qrcode("qr-upload-scratch");
      const decoded = await scanner.scanFile(file, false);
      const payload = parseQRPayload(decoded);

      if (!payload) {
        setScanError("Image doesn't contain a valid GREEN LOOP QR code.");
        setUploadProcessing(false);
        return;
      }

      setScannedData(payload);
      setUploadProcessing(false);
      setStep("confirm");
    } catch {
      setScanError("Could not read a QR code from this image. Try a clearer photo.");
      setUploadProcessing(false);
    } finally {
      // reset so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Transaction completion ─────────────────────────────────────────────────
  const handleConfirm = async () => {
    const weight = parseFloat(weightInput);
    if (!weight || weight <= 0) {
      setScanError("Enter a valid weight greater than 0.");
      return;
    }

    setStep("processing");
    setScanError("");

    // Resolve picker identity
    const { data: auth } = await supabase.auth.getUser();
    const pickerId = auth.user?.id ?? "local";
    const { data: profileRow } = auth.user
      ? await supabase.from("profiles").select("full_name").eq("id", auth.user.id).maybeSingle()
      : { data: null };
    const pickerName = (profileRow as any)?.full_name ?? "Picker";

    try {
      // ── Path A: Supabase token QR ──────────────────────────────────────────
      if (scannedData?.type === "pickup_verify" && scannedData.token) {
        const { data, error } = await supabase.rpc("verify_pickup_token", {
          p_token: scannedData.token,
        });

        if (error) {
          setStep("error");
          setScanError(
            error.message.includes("token_invalid_or_not_assigned")
              ? "QR is invalid, expired, or not assigned to you."
              : error.message
          );
          return;
        }

        const credits = Math.round(weight * 100);
        depositPoints(credits, `Pickup completed (${weight} kg)`);
        setResult({ weight_kg: weight, points: credits });
        setStep("success");
        onSuccess?.({ weight_kg: weight, points: credits });
        return;
      }

      // ── Path B: Local identity QR ──────────────────────────────────────────
      if (scannedData?.type === "recycler_identity" && scannedData.recycler_id) {
        const recyclerId = scannedData.recycler_id;

        // Validation: must have an active (scheduled/assigned) pickup
        const activePickup = findActivePickupByRecycler(recyclerId);
        const pickupId = scannedData.pickup_id ?? activePickup?.id;

        if (!pickupId || !activePickup) {
          setStep("error");
          setScanError(
            "No scheduled pickup found for this recycler. They must book a pickup before you can complete it."
          );
          return;
        }

        // Complete transaction → moves to history, credits both wallets,
        // writes picker-side transaction entry
        const { credits } = completeTransaction(pickupId, weight, pickerId, pickerName);
        depositPoints(credits, `Pickup completed (${weight} kg)`);

        setResult({
          weight_kg: weight,
          points: credits,
          recycler_name: scannedData.recycler_name ?? activePickup.recycler_name,
        });
        setStep("success");
        onSuccess?.({ weight_kg: weight, points: credits });
        return;
      }

      setStep("error");
      setScanError("Unrecognised QR format.");
    } catch (e: any) {
      setStep("error");
      setScanError(e?.message ?? "Something went wrong. Please try again.");
    }
  };

  const resetToChoose = () => {
    setScanError("");
    setScannedData(null);
    setWeightInput("");
    setUploadPreview(null);
    setUploadProcessing(false);
    setStep("choose");
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-foreground/60 flex items-center justify-center p-4"
    >
      {/* Hidden scratch div for gallery scan */}
      <div id="qr-upload-scratch" className="hidden" />

      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-sm"
      >
        <Card className="p-5 relative overflow-hidden">
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>

          <AnimatePresence mode="wait">

            {/* ── Step: Choose input method ── */}
            {step === "choose" && (
              <motion.div key="choose" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5 pt-1">
                <div>
                  <h3 className="font-display font-bold text-lg">Complete Pickup</h3>
                  <p className="text-sm text-[#475569] mt-1">
                    Scan the recycler's QR code to verify and complete the pickup.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Live camera */}
                  <button
                    onClick={() => { setScanError(""); setStep("scan"); }}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50 hover:bg-emerald-100 transition-colors text-[#14532D]"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#10B981] flex items-center justify-center">
                      <Camera className="h-6 w-6 text-[#1E293B]" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm">Scan Live QR</p>
                      <p className="text-xs text-[#14532D]/70 mt-0.5">Use camera</p>
                    </div>
                  </button>

                  {/* Gallery upload */}
                  <button
                    onClick={() => { setScanError(""); setStep("upload"); fileInputRef.current?.click(); }}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-sky-500 bg-sky-50 hover:bg-sky-100 transition-colors text-sky-700"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#10B981] flex items-center justify-center">
                      <ImageUp className="h-6 w-6 text-[#1E293B]" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm">Upload Photo</p>
                      <p className="text-xs text-[#14532D]/70 mt-0.5">From gallery</p>
                    </div>
                  </button>
                </div>

                {scanError && (
                  <div className="flex items-start gap-2 text-sm text-red-400 bg-[rgba(220,38,38,0.1)] rounded-lg p-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{scanError}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Step: Live camera ── */}
            {step === "scan" && (
              <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-[#14532D]" />
                  <h3 className="font-display font-bold text-lg">Scan Live QR</h3>
                </div>
                <p className="text-sm text-[#475569]">
                  Point your camera at the recycler's QR code.
                </p>
                <div id="qr-live-reader" className="w-full rounded-xl overflow-hidden" />
                {scanError && (
                  <div className="flex items-start gap-2 text-sm text-red-400 bg-[rgba(220,38,38,0.1)] rounded-lg p-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{scanError}</span>
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full" onClick={resetToChoose}>
                  ← Back
                </Button>
              </motion.div>
            )}

            {/* ── Step: Upload / processing image ── */}
            {step === "upload" && (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center gap-2">
                  <ImageUp className="h-5 w-5 text-[#14532D]" />
                  <h3 className="font-display font-bold text-lg">Upload QR Photo</h3>
                </div>

                {uploadPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#D1FAE5]">
                    <img src={uploadPreview} alt="QR preview" className="w-full object-contain max-h-52" />
                    {uploadProcessing && (
                      <div className="absolute inset-0 bg-background/70 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-[#14532D]" />
                        <p className="text-sm font-medium">Reading QR code…</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#D1FAE5] rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  >
                    <ImageUp className="h-10 w-10 text-[#475569] mx-auto mb-2" />
                    <p className="text-sm font-medium">Tap to choose a photo</p>
                    <p className="text-xs text-[#475569] mt-1">JPG, PNG, WebP supported</p>
                  </div>
                )}

                {scanError && (
                  <div className="flex items-start gap-2 text-sm text-red-400 bg-[rgba(220,38,38,0.1)] rounded-lg p-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{scanError}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={resetToChoose}>← Back</Button>
                  {scanError && (
                    <Button variant="outline" className="flex-1" onClick={() => { setUploadPreview(null); setScanError(""); fileInputRef.current?.click(); }}>
                      Try Another
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Step: Weight confirmation ── */}
            {step === "confirm" && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="flex items-center gap-2">
                  <Weight className="h-5 w-5 text-[#14532D]" />
                  <h3 className="font-display font-bold text-lg">Confirm Weight</h3>
                </div>

                {/* Recycler info */}
                {(scannedData?.recycler_name || scannedData?.recycler_id) && (
                  <div className="bg-emerald-50 border border-[#D1FAE5] rounded-xl p-3 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#14532D] shrink-0" />
                    <div>
                      <p className="text-xs text-[#14532D] font-semibold">QR Verified</p>
                      {scannedData.recycler_name && (
                        <p className="text-sm font-bold text-emerald-900">{scannedData.recycler_name}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="weight-input">Actual weight collected (kg)</Label>
                  <Input
                    id="weight-input"
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="e.g. 9"
                    value={weightInput}
                    onChange={(e) => { setWeightInput(e.target.value); setScanError(""); }}
                    className="h-12 text-xl font-bold"
                    autoFocus
                  />
                  {weightInput && parseFloat(weightInput) > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between bg-[#F0FDF4] rounded-xl px-4 py-3"
                    >
                      <span className="text-sm text-[#475569] flex items-center gap-1.5">
                        <Coins className="h-4 w-4 text-[#14532D]" />
                        {parseFloat(weightInput)} kg × 100
                      </span>
                      <span className="font-display font-black text-xl text-[#14532D]">
                        {Math.round(parseFloat(weightInput) * 100)} credits
                      </span>
                    </motion.div>
                  )}
                  {scanError && <p className="text-xs text-red-400">{scanError}</p>}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={resetToChoose}>
                    Re-scan
                  </Button>
                  <Button
                    className="flex-1 bg-[#10B981] hover:bg-[#10B981]"
                    disabled={!weightInput || parseFloat(weightInput) <= 0}
                    onClick={handleConfirm}
                  >
                    Complete Pickup
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Step: Processing ── */}
            {step === "processing" && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 text-center space-y-3">
                <Loader2 className="h-10 w-10 animate-spin text-[#14532D] mx-auto" />
                <p className="font-semibold">Completing transaction…</p>
                <p className="text-sm text-[#475569]">Updating history and crediting both wallets.</p>
              </motion.div>
            )}

            {/* ── Step: Success ── */}
            {step === "success" && result && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-[#10B981] flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="h-9 w-9 text-[#1E293B]" />
                </motion.div>

                <div>
                  <h3 className="font-display font-bold text-xl">Pickup Complete!</h3>
                  {result.recycler_name && (
                    <p className="text-sm text-[#475569] mt-0.5">
                      Recycler: <span className="font-semibold text-[#1E293B]">{result.recycler_name}</span>
                    </p>
                  )}
                </div>

                {/* Breakdown card */}
                <div className="bg-gradient-to-br from-[#2d7a4f] to-[#1a4731] rounded-2xl p-4 text-[#1E293B] text-left space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#1E293B]/70">Weight collected</span>
                    <span className="font-bold">{result.weight_kg} kg</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#1E293B]/70">Formula</span>
                    <span className="font-mono">{result.weight_kg} × 100</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#D1FAE5] pt-3">
                    <span className="font-semibold text-[#1E293B]">Credits earned</span>
                    <span className="font-display font-black text-3xl">{result.points}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-[#475569]">
                  <div className="bg-[#F0FDF4] rounded-lg p-2 text-center">
                    <p className="font-semibold text-[#1E293B]">Recycler history</p>
                    <p>Moved to Completed ✓</p>
                  </div>
                  <div className="bg-[#F0FDF4] rounded-lg p-2 text-center">
                    <p className="font-semibold text-[#1E293B]">Your history</p>
                    <p>Added to Completed ✓</p>
                  </div>
                </div>

                <Button className="w-full bg-[#10B981] hover:bg-[#10B981]" onClick={onClose}>
                  Done
                </Button>
              </motion.div>
            )}

            {/* ── Step: Error ── */}
            {step === "error" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 py-4 text-center">
                <AlertTriangle className="h-10 w-10 text-red-400 mx-auto" />
                <h3 className="font-display font-bold text-lg">Verification Failed</h3>
                <p className="text-sm text-[#475569]">{scanError}</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={resetToChoose}>
                    <ScanLine className="h-4 w-4 mr-2" /> Try Again
                  </Button>
                  <Button variant="ghost" className="flex-1" onClick={onClose}>Close</Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Hidden file input for gallery upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </motion.div>
  );
}
