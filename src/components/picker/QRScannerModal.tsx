import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ScanLine,
  Weight,
  CheckCircle2,
  X,
  Loader2,
  Camera,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QRScannerModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = "scan" | "weight" | "success";

export function QRScannerModal({ open, onClose, onSuccess }: QRScannerModalProps) {
  const [step, setStep] = useState<Step>("scan");
  const [recyclerId, setRecyclerId] = useState<string | null>(null);
  const [recyclerName, setRecyclerName] = useState("");
  const [weight, setWeight] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [scanError, setScanError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setStep("scan");
      setRecyclerId(null);
      setRecyclerName("");
      setWeight("");
      setPointsEarned(0);
      setScanError("");
    }
  }, [open]);

  useEffect(() => {
    if (open && step === "scan") {
      const startScanner = async () => {
        try {
          const scanner = new Html5Qrcode("qr-reader");
          scannerRef.current = scanner;
          await scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            async (decodedText) => {
              try {
                const data = JSON.parse(decodedText);
                if (data.type === "recycler" && data.id) {
                  await scanner.stop();
                  // Lookup recycler name
                  const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", data.id)
                    .single();
                  setRecyclerId(data.id);
                  setRecyclerName(profile?.full_name || "Recycler");
                  setStep("weight");
                } else {
                  setScanError("Invalid QR code. Please scan a recycler's QR code.");
                }
              } catch {
                setScanError("Invalid QR code format.");
              }
            },
            () => {} // ignore scan errors
          );
        } catch (err) {
          setScanError("Could not access camera. Please allow camera permissions.");
        }
      };
      // Small delay for DOM to render
      const timer = setTimeout(startScanner, 300);
      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.stop().catch(() => {});
          scannerRef.current = null;
        }
      };
    }
  }, [open, step]);

  const handleSubmit = async () => {
    const w = parseFloat(weight);
    if (!w || w <= 0 || w > 500) {
      toast({ title: "Enter a valid weight (0.1 – 500 kg)", variant: "destructive" });
      return;
    }
    if (!recyclerId) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please log in first", variant: "destructive" });
        setSubmitting(false);
        return;
      }

      const { data, error } = await (supabase.rpc as any)("complete_pickup_transaction", {
        p_picker_id: user.id,
        p_recycler_id: recyclerId,
        p_weight_kg: w,
      });

      if (error) throw error;

      const result = data as any;
      setPointsEarned(result.points);
      setStep("success");
      onSuccess?.();
    } catch (err: any) {
      toast({ title: "Failed to record pickup", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-foreground/60 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm"
      >
        <Card className="p-5 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <AnimatePresence mode="wait">
            {step === "scan" && (
              <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  <h3 className="font-display font-bold text-lg">Scan Recycler QR</h3>
                </div>
                <p className="text-sm text-muted-foreground">Point your camera at the recycler's QR code</p>
                <div id="qr-reader" className="w-full rounded-lg overflow-hidden" />
                {scanError && (
                  <p className="text-sm text-destructive">{scanError}</p>
                )}
              </motion.div>
            )}

            {step === "weight" && (
              <motion.div key="weight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Weight className="h-5 w-5 text-primary" />
                  <h3 className="font-display font-bold text-lg">Enter Weight</h3>
                </div>
                <Card className="p-3 bg-accent/30 border-primary/20">
                  <p className="text-sm"><span className="text-muted-foreground">Recycler:</span> <span className="font-semibold">{recyclerName}</span></p>
                </Card>
                <div>
                  <Label>Plastic Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="500"
                    placeholder="e.g. 2.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="mt-1 text-lg"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Points: <span className="font-bold text-primary">{weight ? Math.floor(parseFloat(weight || "0") * 100) : 0}</span> (100 pts/kg)
                  </p>
                </div>
                <Button className="w-full gap-2" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {submitting ? "Recording..." : "Confirm Pickup"}
                </Button>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl">Pickup Recorded!</h3>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Recycler: <span className="font-medium text-foreground">{recyclerName}</span></p>
                  <p className="text-sm text-muted-foreground">Weight: <span className="font-medium text-foreground">{weight} kg</span></p>
                  <p className="text-sm text-muted-foreground">Points awarded: <span className="font-bold text-primary">{pointsEarned}</span></p>
                </div>
                <Button className="w-full" onClick={onClose}>Done</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </motion.div>
  );
}
