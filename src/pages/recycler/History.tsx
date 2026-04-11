import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePickupSchedule, ScheduledPickup } from "@/hooks/usePickupSchedule";
import { supabase } from "@/integrations/supabase/client";
import {
  CalendarDays, Clock, Weight, MapPin, CheckCircle2,
  Loader2, Package, Coins, User,
} from "lucide-react";

const timeSlotLabels: Record<string, string> = {
  morning: "Morning · 8 AM–12 PM",
  afternoon: "Afternoon · 12–5 PM",
  evening: "Evening · 5–8 PM",
};

function ActivePickupCard({ pickup }: { pickup: ScheduledPickup }) {
  const isAssigned = pickup.status === "assigned";

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      {/* Section label */}
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6fcf97] opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]" />
        </span>
        <p className="text-xs font-bold uppercase tracking-widest text-[#14532D]">Active Pickup</p>
      </div>

      {/* High-contrast card */}
      <div
        className={`relative rounded-2xl overflow-hidden p-5 text-[#1E293B] shadow-lg ${
          isAssigned
            ? "bg-gradient-to-br from-[#2d7a4f] to-[#1a4731]"
            : "bg-gradient-to-br from-[#2d7a4f] to-[#1a4731]"
        }`}
        style={{ boxShadow: isAssigned ? "0 0 0 3px rgba(245,158,11,0.35), 0 8px 32px rgba(0,0,0,0.25)" : "0 0 0 3px rgba(76,175,125,0.35), 0 8px 32px rgba(0,0,0,0.25)" }}
      >
        {/* Decorative circle */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />

        {/* Status badge */}
        <div className="flex items-center justify-between mb-4 relative">
          <Badge className={`text-xs font-bold border-0 ${isAssigned ? "bg-white/20 text-[#1E293B]" : "bg-white/20 text-[#1E293B]"}`}>
            {isAssigned ? "🚴 Picker Assigned" : "📅 Scheduled"}
          </Badge>
          <span className="text-[#1E293B]/70 text-xs font-mono">{pickup.id.slice(0, 10)}…</span>
        </div>

        {/* Weight — hero number */}
        <div className="mb-4 relative">
          <p className="text-[#1E293B]/70 text-xs mb-0.5">Estimated Weight</p>
          <p className="text-5xl font-display font-black tracking-tight">
            {Number(pickup.weight_kg).toFixed(1)} <span className="text-2xl font-semibold text-[#1E293B]/80">kg</span>
          </p>
          <p className="text-[#1E293B]/80 text-sm font-semibold mt-1">
            ≈ {Math.round(Number(pickup.weight_kg) * 100)} credits on completion
          </p>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-2 relative">
          <div className="bg-white/15 rounded-xl p-3">
            <CalendarDays className="h-4 w-4 text-[#1E293B]/70 mb-1" />
            <p className="text-[#1E293B] text-sm font-semibold">{pickup.date}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3">
            <Clock className="h-4 w-4 text-[#1E293B]/70 mb-1" />
            <p className="text-[#1E293B] text-sm font-semibold">{timeSlotLabels[pickup.time_slot] ?? pickup.time_slot}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 col-span-2">
            <MapPin className="h-4 w-4 text-[#1E293B]/70 mb-1" />
            <p className="text-[#1E293B] text-sm font-semibold truncate">{pickup.address}</p>
          </div>
          {pickup.picker_name && (
            <div className="bg-white/15 rounded-xl p-3 col-span-2 flex items-center gap-2">
              <User className="h-4 w-4 text-[#1E293B]/70 shrink-0" />
              <p className="text-[#1E293B] text-sm font-semibold">Picker: {pickup.picker_name}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function RecyclerHistory() {
  const { recyclerHistory } = usePickupSchedule();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? "local");
      setLoading(false);
    });
  }, []);

  const history: ScheduledPickup[] = userId ? recyclerHistory(userId) : [];

  const active = history.filter((p) => p.status !== "completed");
  const completed = history.filter((p) => p.status === "completed");

  const totalCredits = completed.reduce((sum, p) => sum + p.credits, 0);
  const totalKg = completed.reduce((sum, p) => sum + p.weight_kg, 0);

  return (
    <div className="min-h-screen">
      <PageBackground type="intro" overlay="bg-[#F8FAF9]/70" />
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <h1 className="text-2xl font-display font-bold mb-1 text-[#1E293B]">Pickup History</h1>
        <p className="text-sm text-[#1E293B]/60 mb-6">Your scheduled and completed pickups.</p>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#1E293B]/50" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="h-12 w-12 text-[#1E293B]/30 mb-4" />
            <p className="font-semibold text-[#1E293B]/60">No pickups yet</p>
            <p className="text-sm text-[#1E293B]/40 mt-1">Book your first pickup to see it here.</p>
          </div>
        ) : (
          <>
            <AnimatePresence>
              {active.map((pickup) => (
                <ActivePickupCard key={pickup.id} pickup={pickup} />
              ))}
            </AnimatePresence>

            {/* Summary stats — gold-accented glass */}
            {completed.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="glass-card rounded-2xl p-4 text-center border-t-2 border-t-amber-400/60">
                  <p className="text-2xl font-bold text-[#1E293B]">{totalCredits}</p>
                  <p className="text-xs text-[#1E293B]/60 mt-1">Credits Earned</p>
                </div>
                <div className="glass-card rounded-2xl p-4 text-center border-t-2 border-t-emerald-400/60">
                  <p className="text-2xl font-bold text-[#1E293B]">{totalKg.toFixed(1)} kg</p>
                  <p className="text-xs text-[#1E293B]/60 mt-1">Plastic Recycled</p>
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <>
                <p className="text-xs font-bold uppercase tracking-widest text-[#1E293B]/50 mb-3">Completed</p>
                <div className="space-y-3">
                  {completed.map((pickup, i) => (
                    <motion.div
                      key={pickup.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <div className="glass-card rounded-2xl p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-[#1E293B] truncate">{pickup.address}</p>
                            <p className="text-xs text-[#1E293B]/40 mt-0.5 font-mono">{pickup.id.slice(0, 14)}…</p>
                          </div>
                          <Badge className="shrink-0 text-xs bg-[#10B981]/20 text-[#065F46] border border-[#D1FAE5]">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-[#1E293B]/60">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 shrink-0" /> {pickup.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Weight className="h-3.5 w-3.5 shrink-0" /> {Number(pickup.weight_kg).toFixed(1)} kg
                          </span>
                          {pickup.picker_name && (
                            <span className="flex items-center gap-1.5 col-span-2">
                              <User className="h-3.5 w-3.5 shrink-0" /> {pickup.picker_name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#D1FAE5]">
                          <span className="text-xs text-[#1E293B]/40">
                            {pickup.completed_at
                              ? new Date(pickup.completed_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                              : "Completed"}
                          </span>
                          <span className="flex items-center gap-1 text-sm font-bold text-[#14532D]">
                            <Coins className="h-4 w-4" /> +{Number(pickup.credits)} credits
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
