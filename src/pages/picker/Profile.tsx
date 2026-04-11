import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QRScannerModal } from "@/components/picker/QRScannerModal";
import { usePickupSchedule, PickerTransaction } from "@/hooks/usePickupSchedule";
import {
  Loader2, ArrowLeft, User, MapPin, Phone, Star, Weight,
  Wallet, CalendarDays, Search, ScanLine, CheckCircle2, Coins,
} from "lucide-react";

type PickerProfileRow = {
  id: string;
  full_name: string;
  role: string;
  coin_balance: number;
  total_pickups: number;
  total_recycled_kg: number;
  total_points: number;
  consecutive_weeks: number;
};

export default function PickerProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getPickerTransactions } = usePickupSchedule();

  const [tab, setTab] = useState<"overview" | "history">("overview");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PickerProfileRow | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  // local delta counters — incremented on each successful scan without page refresh
  const [localPickupsDelta, setLocalPickupsDelta] = useState(0);
  const [localKgDelta, setLocalKgDelta] = useState(0);
  const [localCreditsDelta, setLocalCreditsDelta] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) { if (!cancelled) setLoading(false); return; }
      setUserId(user.id);

      const { data: profileRow, error: profileErr } = await supabase
        .from("profiles")
        .select("id, full_name, role, coin_balance, total_pickups, total_recycled_kg, total_points, consecutive_weeks")
        .eq("id", user.id)
        .maybeSingle();

      if (!cancelled) {
        if (profileErr) toast({ title: "Profile load failed", description: profileErr.message, variant: "destructive" });
        setProfile((profileRow as PickerProfileRow | null) ?? null);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [toast]);

  // Reactive local transactions (no page refresh needed)
  const localTx: PickerTransaction[] = userId ? getPickerTransactions(userId) : [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return localTx;
    return localTx.filter(
      (t) =>
        t.recycler_name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        new Date(t.completed_at).toLocaleDateString("en-IN").includes(search)
    );
  }, [search, localTx]);

  // Stats: DB baseline + local deltas
  const displayPickups = (profile?.total_pickups ?? 0) + localPickupsDelta;
  const displayKg = ((profile?.total_recycled_kg ?? 0) + localKgDelta).toFixed(1);
  const displayEarnings = Math.round(((profile?.coin_balance ?? 0) + localCreditsDelta) / 10);

  const handleScanSuccess = (result: { weight_kg: number; points: number }) => {
    setScannerOpen(false);
    setLocalPickupsDelta((d) => d + 1);
    setLocalKgDelta((d) => d + result.weight_kg);
    setLocalCreditsDelta((d) => d + result.points);
    // Switch to history tab to show the new entry
    setTab("history");
    toast({
      title: "Pickup complete ✓",
      description: `${result.weight_kg} kg collected · ${result.points} credits added to your wallet.`,
    });
  };

  return (
    <div className="min-h-screen">
      <PageBackground type="intro" overlay="bg-[#F8FAF9]/65" />

      <nav className="sticky top-0 z-50 bg-black/30 backdrop-blur-md border-b border-[#D1FAE5]">
        <div className="container mx-auto flex items-center h-14 px-4 gap-3">
          <Button variant="ghost" size="icon" className="text-[#1E293B] hover:bg-white/10" onClick={() => navigate("/picker/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#14532D]" />
            <span className="font-display font-semibold text-[#1E293B]">Picker Profile</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#1E293B]/60" />
          </div>
        ) : (
          <>
            {/* ── Profile hero card ── */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
              <div className="glass-card rounded-2xl p-6 mb-5">
                {/* Avatar + name */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#10B981]/30 border-2 border-[#D1FAE5] flex items-center justify-center">
                    <User className="h-8 w-8 text-[#065F46]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="font-display font-bold text-lg text-[#1E293B] truncate">
                        {profile?.full_name || "Picker"}
                      </h1>
                      <Badge className="bg-[#10B981]/20 text-[#065F46] border border-emerald-400/40 text-[10px]">
                        ✓ Verified
                      </Badge>
                      <Badge className="bg-white/10 text-[#1E293B]/70 border border-[#D1FAE5] text-[10px]">
                        {profile?.role?.toUpperCase() ?? "PICKER"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-[#1E293B]/60 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Active zone · Live tracking enabled
                    </p>
                    <p className="text-xs text-[#1E293B]/60 flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3" /> Contact on file
                    </p>
                  </div>
                </div>

                {/* Stats — gold-accented glass tiles */}
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[
                    { value: `${displayKg} kg`, label: "Collected" },
                    { value: String(displayPickups), label: "Pickups" },
                    { value: `₹${displayEarnings}`, label: "Earnings" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-white/10 border border-[#f6ad55]/30 p-3 text-center">
                      <div className="font-display font-bold text-[#1E293B] text-lg">{s.value}</div>
                      <p className="text-[10px] text-[#1E293B]/60 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Scan CTA — deep forest green */}
                <div className="mt-4">
                  <Button
                    className="w-full gap-2 h-12 text-base font-semibold btn-forest shadow-lg"
                    onClick={() => setScannerOpen(true)}
                  >
                    <ScanLine className="h-5 w-5" />
                    Scan Recycler QR Code
                  </Button>
                  <p className="text-xs text-[#1E293B]/50 text-center mt-2">
                    Open camera or upload a QR photo to confirm and earn credits.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ── Tabs ── */}
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList className="w-full mb-4 bg-white/10 border border-[#D1FAE5]">
                <TabsTrigger value="overview" className="flex-1 text-[#1E293B]/70 data-[state=active]:bg-[#10B981] data-[state=active]:text-[#1E293B]">Overview</TabsTrigger>
                <TabsTrigger value="history" className="flex-1 text-[#1E293B]/70 data-[state=active]:bg-[#10B981] data-[state=active]:text-[#1E293B]">
                  History
                  {localTx.length > 0 && (
                    <span className="ml-1.5 bg-[#10B981] text-[#1E293B] text-[10px] font-bold rounded-full px-1.5 py-0.5">
                      {localTx.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview" className="space-y-3">
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#1E293B]/60">
                      <Wallet className="h-4 w-4" />
                      <span className="text-sm">Coin balance</span>
                    </div>
                    <span className="font-display font-bold text-[#14532D]">
                      {(profile?.coin_balance ?? 0) + localCreditsDelta} pts
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#D1FAE5] bg-white/5 p-3">
                      <p className="text-xs text-[#1E293B]/50">Total points</p>
                      <p className="text-xl font-display font-bold text-[#1E293B]">
                        {(profile?.total_points ?? 0) + localCreditsDelta}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#D1FAE5] bg-white/5 p-3">
                      <p className="text-xs text-[#1E293B]/50">Consecutive weeks</p>
                      <p className="text-xl font-display font-bold text-[#1E293B]">{profile?.consecutive_weeks ?? 0}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* History */}
              <TabsContent value="history" className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E293B]/40" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by recycler name or date…"
                    className="pl-9 bg-white/10 border-[#D1FAE5] text-[#1E293B] placeholder:text-[#1E293B]/40 focus:border-emerald-400"
                  />
                </div>

                <AnimatePresence initial={false}>
                  {filtered.length === 0 ? (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="glass-card rounded-2xl p-8 text-center">
                        <ScanLine className="h-10 w-10 text-[#1E293B]/30 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-[#1E293B]/60">No pickup transactions yet.</p>
                        <p className="text-xs text-[#1E293B]/40 mt-1">
                          Tap "Scan Recycler QR Code" above to record your first pickup.
                        </p>
                        <Button
                          size="sm"
                          className="mt-4 gap-2 btn-forest"
                          onClick={() => setScannerOpen(true)}
                        >
                          <ScanLine className="h-4 w-4" /> Scan Now
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    filtered.map((tx, i) => (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <div className="glass-card rounded-2xl p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="h-4 w-4 text-[#14532D] shrink-0" />
                                <p className="font-semibold text-sm text-[#1E293B] truncate">{tx.recycler_name}</p>
                              </div>
                              <p className="text-xs text-[#1E293B]/50 truncate pl-6">{tx.address}</p>
                              <p className="mt-2 text-sm font-medium flex items-center gap-1.5 pl-6 text-[#1E293B]/80">
                                <Weight className="h-3.5 w-3.5 text-[#14532D]" />
                                {tx.weight_kg.toFixed(1)} kg collected
                              </p>
                              <p className="mt-1 text-xs text-[#1E293B]/40 flex items-center gap-1 pl-6">
                                <CalendarDays className="h-3 w-3" />
                                {new Date(tx.completed_at).toLocaleString("en-IN", {
                                  day: "numeric", month: "short", year: "numeric",
                                  hour: "2-digit", minute: "2-digit",
                                })}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="flex items-center gap-1 text-sm font-bold text-[#14532D] justify-end">
                                <Coins className="h-4 w-4" /> +{tx.credits}
                              </span>
                              <p className="text-xs text-[#1E293B]/40 mt-0.5">credits</p>
                              <div className="mt-2 flex items-center justify-end gap-0.5">
                                {[...Array(5)].map((_, s) => (
                                  <Star key={s} className="h-3 w-3 fill-[#f6ad55] text-[#f6ad55]" />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      <QRScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onSuccess={handleScanSuccess}
      />
    </div>
  );
}
