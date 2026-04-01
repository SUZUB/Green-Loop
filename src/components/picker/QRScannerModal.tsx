import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScanLine, CheckCircle2, X, Loader2, Camera, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: (result: { weight_kg: number; points: number }) => void;
}

type Step = "scan" | "confirming" | "success" | "error";

export function QRScannerModal({ open, onClose, onSuccess }: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("scan");
  const [scanError, setScanError] = useState("");
  const [result, setResult] = useState<{ weight_kg: number; points: number } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!open) {
      setStep("scan");
      setScanError("");
      setResult(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || step !== "scan") return;

    let mounted = true;

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode("qr-verify-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          async (decoded) => {
            if (!mounted) return;
            try {
              const payload = JSON.parse(decoded);

              if (payload.type !== "pickup_verify" || !payload.token) {
                setScanError("Not a valid GREEN LOOP pickup QR. Ask the recycler to show their booking QR.");
                return;
              }

              await scanner.stop();
              if (!mounted) return;
              setStep("confirming");

              const { data: auth } = await supabase.auth.getUser();
              if (!auth.user) {
                setStep("error");
                setScanError("You must be logged in to verify a pickup.");
                return;
              }

              const { data, error } = await supabase.rpc("verify_pickup_token", {
                p_token: payload.token,
              });

              if (!mounted) return;

              if (error) {
                setStep("error");
                setScanError(
                  error.message.includes("token_invalid_or_not_assigned")
                    ? "QR is invalid, expired, or this pickup is not assigned to you."
                    : error.message
                );
                return;
              }

              const res = data as { weight_kg: number; points: number };
              setResult(res);
              setStep("success");
              onSuccess?.(res);
            } catch {
              setScanError("Could not read QR code. Try again.");
            }
          },
          () => {}
        );
      } catch {
        if (mounted) setScanError("Camera access denied. Allow camera permissions and try again.");
      }
    };

    const timer = setTimeout(startScanner, 300);

    return () => {
      mounted = false;
      clearTimeout(timer);
      scannerRef.current?.stop().catch(() => {});
      scannerRef.current = null;
    };
  }, [open, step]);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-foreground/60 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-sm"
      >
        <Card className="p-5 relative">
          <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>

          <AnimatePresence mode="wait">
            {step === "scan" && (
              <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  <h3 className="font-display font-bold text-lg">Scan Recycler QR</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Point your camera at the recycler's pickup verification QR code.
                </p>
                <div id="qr-verify-reader" className="w-full rounded-lg overflow-hidden" />
                {scanError && (
                  <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{scanError}</span>
                  </div>
                )}
              </motion.div>
            )}

            {step === "confirming" && (
              <motion.div key="confirming" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-8 text-center space-y-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                <p className="font-semibold">Verifying token…</p>
                <p className="text-sm text-muted-foreground">Completing pickup and calculating rewards.</p>
              </motion.div>
            )}

            {step === "success" && result && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl">Pickup Complete!</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    Weight: <span className="font-semibold text-foreground">{result.weight_kg} kg</span>
                  </p>
                  <p className="text-muted-foreground">
                    Points earned: <span className="font-bold text-primary text-lg">{result.points}</span>
                  </p>
                </div>
                <Button className="w-full" onClick={onClose}>Done</Button>
              </motion.div>
            )}

            {step === "error" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 py-4 text-center">
                <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
                <h3 className="font-display font-bold text-lg">Verification Failed</h3>
                <p className="text-sm text-muted-foreground">{scanError}</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => { setScanError(""); setStep("scan"); }}>
                    <ScanLine className="h-4 w-4 mr-2" /> Try Again
                  </Button>
                  <Button variant="ghost" className="flex-1" onClick={onClose}>Close</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </motion.div>
  );
}
