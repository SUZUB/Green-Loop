import { motion } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRVMData, LOCATION_LABELS } from "@/hooks/useRVMData";
import { useRecycleHub } from "@/hooks/useRecycleHub";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin, Building2, Train, ShoppingBag, Bus,
  AlertTriangle, CheckCircle2, Navigation, QrCode, Wifi,
} from "lucide-react";

const LOCATION_ICONS: Record<string, React.ElementType> = {
  bus_stand: Bus, hospital: Building2, metro_station: Train,
  mall: ShoppingBag, public_place: Building2,
};

function FillBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-400" : "bg-[#10B981]";
  return (
    <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function NearbyRVMs() {
  const { rvms, fullAlerts } = useRVMData();
  const { depositPoints } = useRecycleHub();
  const { toast } = useToast();

  const handleScan = (rvmId: string, rvmName: string) => {
    depositPoints(50, `RVM scan — ${rvmName}`);
    toast({ title: "Coins earned!", description: `+50 pts added for scanning at ${rvmName}` });
  };

  const sorted = [...rvms].sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <div className="min-h-screen pb-8">
      <PageBackground type="recycling" overlay="bg-[#F8FAF9]/65" />
      <div className="container mx-auto px-4 py-6 max-w-lg">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-[#14532D]" /> Nearby RVMs
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            {sorted.filter(r => r.fillPct < 90).length} available · {fullAlerts.length} full
          </p>
        </div>

        {/* Full alerts banner */}
        {fullAlerts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <Card className="p-4 bg-red-50 border-red-200 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-red-700">
                  {fullAlerts.length} machine{fullAlerts.length !== 1 ? "s" : ""} full — avoid these
                </p>
                <p className="text-xs text-red-600 mt-0.5">
                  {fullAlerts.map(r => r.name).join(", ")}
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* RVM list */}
        <div className="space-y-3">
          {sorted.map((rvm, i) => {
            const Icon = LOCATION_ICONS[rvm.locationType] ?? Building2;
            const isFull = rvm.fillPct >= 90;
            const fillColor = rvm.fillPct >= 90 ? "text-red-600" : rvm.fillPct >= 70 ? "text-amber-600" : "text-[#14532D]";
            const statusLabel = rvm.fillPct >= 100 ? "FULL" : rvm.fillPct >= 90 ? "NEAR FULL" : rvm.fillPct >= 70 ? "FILLING" : "AVAILABLE";
            const statusBadge = rvm.fillPct >= 90
              ? "bg-red-100 text-red-700 border-red-200"
              : rvm.fillPct >= 70
              ? "bg-amber-100 text-amber-700 border-amber-200"
              : "bg-[#DCFCE7] text-[#14532D] border-[#D1FAE5]";

            return (
              <motion.div key={rvm.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className={`p-4 border ${isFull ? "border-red-200" : "border-[#D1FAE5]"}`}>
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
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${statusBadge}`}>{statusLabel}</Badge>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#475569]">Fill level</span>
                      <span className={`font-bold ${fillColor}`}>{rvm.fillPct}%</span>
                    </div>
                    <FillBar pct={rvm.fillPct} />
                  </div>

                  {rvm.minutesFull !== null && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mb-3">
                      <Wifi className="h-3 w-3" />
                      Full for {rvm.minutesFull >= 60
                        ? `${Math.floor(rvm.minutesFull / 60)}h ${Math.round(rvm.minutesFull % 60)}m`
                        : `${Math.round(rvm.minutesFull)}m`}
                    </p>
                  )}

                  <div className="flex gap-2">
                    {isFull ? (
                      <div className="flex-1 flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Machine full — choose another
                      </div>
                    ) : (
                      <Button size="sm" className="flex-1 gap-2 bg-[#10B981] hover:bg-[#059669]" onClick={() => handleScan(rvm.id, rvm.name)}>
                        <QrCode className="h-4 w-4" /> Scan at this RVM
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${rvm.lat},${rvm.lng}&travelmode=walking`, "_blank", "noopener,noreferrer")}
                    >
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
