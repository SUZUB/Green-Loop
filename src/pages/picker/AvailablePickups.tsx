import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useRVMData, LOCATION_LABELS } from "@/hooks/useRVMData";
import { useRecycleHub } from "@/hooks/useRecycleHub";
import {
  MapPin, Navigation, Coins, AlertTriangle, CheckCircle2,
  Bell, Building2, Train, ShoppingBag, Bus, RefreshCw,
} from "lucide-react";

const LOCATION_ICONS: Record<string, React.ElementType> = {
  bus_stand: Bus, hospital: Building2, metro_station: Train,
  mall: ShoppingBag, public_place: Building2,
};

function openMaps(lat: number, lng: number) {
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
    "_blank", "noopener,noreferrer"
  );
}

function FillBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-400" : "bg-[#10B981]";
  return (
    <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function AvailablePickups() {
  const { toast } = useToast();
  const { rvms, fullAlerts, markCollected } = useRVMData();
  const { depositPoints } = useRecycleHub();

  // Track which RVMs this picker has already collected this session
  const [collected, setCollected] = useState<Set<string>>(new Set());
  // Track notified RVMs so we don't spam
  const notifiedRef = useRef<Set<string>>(new Set());

  // Auto-notify when any RVM hits 100%
  useEffect(() => {
    rvms.forEach((rvm) => {
      if (rvm.fillPct >= 100 && !notifiedRef.current.has(rvm.id)) {
        notifiedRef.current.add(rvm.id);
        toast({
          title: `🚨 RVM Full — ${rvm.name}`,
          description: `${rvm.address} is at 100% capacity. Go collect it to earn ${rvm.estimatedEarnings} pts!`,
        });
      }
      // Reset notification if RVM gets collected (fillPct drops)
      if (rvm.fillPct < 90) {
        notifiedRef.current.delete(rvm.id);
      }
    });
  }, [rvms, toast]);

  const handleMarkCollected = (rvmId: string, rvmName: string, earnings: number) => {
    markCollected(rvmId, earnings, depositPoints);
    setCollected((prev) => new Set([...prev, rvmId]));
    toast({
      title: "RVM Collected ✓",
      description: `${rvmName} emptied. +${earnings} pts added to your wallet.`,
    });
  };

  // Sort: fullest first, then by distance
  const sortedRVMs = [...rvms].sort((a, b) => {
    if (b.fillPct !== a.fillPct) return b.fillPct - a.fillPct;
    return a.distanceKm - b.distanceKm;
  });

  const fullCount = rvms.filter((r) => r.fillPct >= 90).length;

  return (
    <div className="min-h-screen pb-8">
      <PageBackground type="recycling" overlay="bg-[#F8FAF9]/65" />
      <div className="container mx-auto px-4 py-6 max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold">RVM Pickups</h1>
            <p className="text-sm text-[#475569] mt-0.5">
              {fullCount > 0
                ? `${fullCount} machine${fullCount !== 1 ? "s" : ""} need collection`
                : "All machines have capacity"}
            </p>
          </div>
          {fullCount > 0 && (
            <Badge className="bg-red-600 text-white gap-1 flex items-center">
              <Bell className="h-3 w-3" /> {fullCount} Alert{fullCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {/* Notification banner */}
        <AnimatePresence>
          {fullCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4"
            >
              <Card className="p-4 bg-red-50 border-red-200 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-red-700">Collection needed</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    {fullCount} RVM{fullCount !== 1 ? "s are" : " is"} at or near capacity. Collect the fullest ones first for maximum earnings.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RVM list — sorted by fill level */}
        <div className="space-y-3">
          {sortedRVMs.map((rvm, i) => {
            const Icon = LOCATION_ICONS[rvm.locationType] ?? Building2;
            const isCollected = collected.has(rvm.id);
            const isFull = rvm.fillPct >= 90;
            const fillColor = rvm.fillPct >= 90 ? "text-red-600" : rvm.fillPct >= 70 ? "text-amber-600" : "text-[#14532D]";
            const cardBorder = rvm.fillPct >= 90 ? "border-red-200" : "border-[#D1FAE5]";
            const priorityLabel = rvm.fillPct >= 100 ? "FULL" : rvm.fillPct >= 90 ? "NEAR FULL" : rvm.fillPct >= 70 ? "FILLING" : "AVAILABLE";
            const priorityBadge = rvm.fillPct >= 100
              ? "bg-red-600 text-white"
              : rvm.fillPct >= 90
              ? "bg-red-100 text-red-700 border-red-200"
              : rvm.fillPct >= 70
              ? "bg-amber-100 text-amber-700 border-amber-200"
              : "bg-[#DCFCE7] text-[#14532D] border-[#D1FAE5]";

            return (
              <motion.div
                key={rvm.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className={`p-4 border ${cardBorder} ${isCollected ? "opacity-50" : ""}`}>
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isFull ? "bg-red-100" : "bg-[#F0FDF4]"}`}>
                        <Icon className={`h-5 w-5 ${isFull ? "text-red-600" : "text-[#14532D]"}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{rvm.name}</p>
                        <p className="text-xs text-[#475569] truncate">{rvm.address}</p>
                        <p className="text-xs text-[#475569] mt-0.5">
                          {LOCATION_LABELS[rvm.locationType]} · {rvm.distanceKm} km away
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${priorityBadge}`}>
                      {priorityLabel}
                    </Badge>
                  </div>

                  {/* Fill bar */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#475569]">Fill level</span>
                      <span className={`font-bold ${fillColor}`}>{rvm.fillPct}%</span>
                    </div>
                    <FillBar pct={rvm.fillPct} />
                  </div>

                  {/* Earnings + time full */}
                  <div className="flex items-center justify-between text-xs text-[#475569] mb-3">
                    <span className="flex items-center gap-1 text-[#14532D] font-semibold">
                      <Coins className="h-3.5 w-3.5" /> ~{rvm.estimatedEarnings} pts on collection
                    </span>
                    {rvm.minutesFull !== null && (
                      <span className="text-red-600">
                        Full {rvm.minutesFull >= 60
                          ? `${Math.floor(rvm.minutesFull / 60)}h ${Math.round(rvm.minutesFull % 60)}m`
                          : `${Math.round(rvm.minutesFull)}m`} ago
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  {isCollected ? (
                    <div className="flex items-center gap-2 text-sm text-[#14532D] bg-[#F0FDF4] rounded-lg px-3 py-2">
                      <CheckCircle2 className="h-4 w-4" /> Collected — thank you!
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className={`flex-1 gap-2 ${isFull ? "bg-red-600 hover:bg-red-700" : "bg-[#10B981] hover:bg-[#059669]"}`}
                        onClick={() => handleMarkCollected(rvm.id, rvm.name, rvm.estimatedEarnings)}
                        disabled={!isFull}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {isFull ? "Mark as Collected" : "Not full yet"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => openMaps(rvm.lat, rvm.lng)}
                      >
                        <Navigation className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {sortedRVMs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle2 className="h-12 w-12 text-[#10B981] mb-4 opacity-60" />
            <p className="font-semibold text-[#475569]">All RVMs are empty</p>
            <p className="text-sm text-[#475569] mt-1">You'll be notified when machines need collection.</p>
          </div>
        )}
      </div>
    </div>
  );
}
