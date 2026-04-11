import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePickupSchedule } from "@/hooks/usePickupSchedule";
import { supabase } from "@/integrations/supabase/client";
import { QRScannerModal } from "@/components/picker/QRScannerModal";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2, Loader2, Package, Coins, Weight,
  CalendarDays, ScanLine, MapPin,
} from "lucide-react";

export default function PickerHistory() {
  const { getPickerTransactions } = usePickupSchedule();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
      setLoading(false);
    });
  }, []);

  // Reactive — updates the moment a new transaction is written by the scanner
  const history = userId ? getPickerTransactions(userId) : [];
  const totalCredits = history.reduce((sum, p) => sum + p.credits, 0);
  const totalKg = history.reduce((sum, p) => sum + p.weight_kg, 0);

  return (
    <div className="min-h-screen">
      <PageBackground type="recycling" overlay="bg-[#F8FAF9]/65" />
      <div className="container mx-auto px-4 py-6 max-w-lg">

        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-display font-bold">Completed Pickups</h1>
          <Button size="sm" className="gap-2 bg-[#10B981] hover:bg-[#10B981] text-[#1E293B]" onClick={() => setScannerOpen(true)}>
            <ScanLine className="h-4 w-4" /> Scan QR
          </Button>
        </div>
        <p className="text-sm text-[#475569] mb-6">Your pickup history and credits earned.</p>

        {history.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-[#14532D]">{totalCredits}</p>
              <p className="text-xs text-[#475569] mt-1">Total Credits Earned</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-[#14532D]">{totalKg.toFixed(1)} kg</p>
              <p className="text-xs text-[#475569] mt-1">Plastic Collected</p>
            </Card>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#14532D]" />
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {history.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center">
                <Package className="h-12 w-12 text-[#475569] mb-4 opacity-40" />
                <p className="font-semibold text-[#475569]">No completed pickups yet</p>
                <p className="text-sm text-[#475569] mt-1 mb-5">Scan a recycler's QR to record your first pickup.</p>
                <Button className="gap-2 bg-[#10B981] hover:bg-[#10B981] text-[#1E293B]" onClick={() => setScannerOpen(true)}>
                  <ScanLine className="h-4 w-4" /> Scan to Complete Pickup
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {history.map((tx, i) => (
                  <motion.div key={tx.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.04 }}>
                    <Card className="p-4 space-y-3 border-[#D1FAE5]">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#14532D] shrink-0" />
                            <p className="font-semibold text-sm truncate">{tx.recycler_name}</p>
                          </div>
                          {tx.address && (
                            <p className="text-xs text-[#475569] mt-0.5 pl-6 truncate flex items-center gap-1">
                              <MapPin className="h-3 w-3 shrink-0" /> {tx.address}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="shrink-0 text-xs bg-[#10B981]/10 text-[#14532D] border-emerald-500/20">
                          Completed
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-[#475569] pl-1">
                        <span className="flex items-center gap-1.5">
                          <Weight className="h-3.5 w-3.5 shrink-0" /> {tx.weight_kg.toFixed(1)} kg
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                          {new Date(tx.completed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#D1FAE5]">
                        <span className="text-xs text-[#475569]">
                          {new Date(tx.completed_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="flex items-center gap-1 text-sm font-bold text-[#14532D]">
                          <Coins className="h-4 w-4" /> +{tx.credits} credits
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>

      <QRScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onSuccess={(result) => {
          setScannerOpen(false);
          toast({ title: "Pickup complete ✓", description: `${result.weight_kg} kg · ${result.points} credits earned.` });
        }}
      />
    </div>
  );
}
