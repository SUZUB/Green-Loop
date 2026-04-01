import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, User, MapPin, Phone, Star, Weight, Wallet, CalendarDays, Search } from "lucide-react";

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

type PickupTransactionRow = {
  id: string;
  created_at: string;
  picker_id: string;
  recycler_id: string;
  weight_kg: number;
  points_earned: number;
};

export default function PickerProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tab, setTab] = useState<"overview" | "history">("overview");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PickerProfileRow | null>(null);
  const [tx, setTx] = useState<PickupTransactionRow[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;

      if (!user) {
        if (!cancelled) {
          setProfile(null);
          setTx([]);
          setLoading(false);
        }
        return;
      }

      const [{ data: profileRow, error: profileErr }, { data: txRows, error: txErr }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, role, coin_balance, total_pickups, total_recycled_kg, total_points, consecutive_weeks")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("pickup_transactions")
          .select("id, created_at, picker_id, recycler_id, weight_kg, points_earned")
          .eq("picker_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (!cancelled) {
        if (profileErr) {
          toast({ title: "Profile load failed", description: profileErr.message, variant: "destructive" });
        }
        if (txErr) {
          toast({ title: "History load failed", description: txErr.message, variant: "destructive" });
        }
        setProfile((profileRow as PickerProfileRow | null) ?? null);
        setTx((txRows as PickupTransactionRow[] | null) ?? []);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tx;
    return tx.filter((row) => row.id.toLowerCase().includes(q) || new Date(row.created_at).toLocaleDateString("en-IN").includes(search));
  }, [search, tx]);

  const totalWeight = useMemo(() => tx.reduce((sum, r) => sum + (r.weight_kg || 0), 0), [tx]);
  const totalEarnings = useMemo(() => tx.reduce((sum, r) => sum + (r.points_earned || 0) / 10, 0), [tx]);

  return (
    <div className="min-h-screen bg-background/40">
      <PageBackground type="recycling" overlay="bg-foreground/50" />

      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center h-14 px-4 gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/picker/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-ocean" />
            <span className="font-display font-semibold">Picker Profile</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="font-display font-bold text-lg truncate">
                        {profile?.full_name || "Picker"}
                      </h1>
                      <Badge className="bg-primary/10 text-primary border-primary/20">Verified</Badge>
                      <Badge variant="outline" className="text-muted-foreground">
                        {profile?.role ? profile.role.toUpperCase() : "PICKER"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Active zone • Live tracking enabled
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3" /> Contact on file
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <div className="font-display font-bold">{(profile?.total_recycled_kg ?? totalWeight).toFixed(1)} kg</div>
                    <p className="text-[10px] text-muted-foreground">Collected</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <div className="font-display font-bold">{profile?.total_pickups ?? tx.length}</div>
                    <p className="text-[10px] text-muted-foreground">Pickups</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <div className="font-display font-bold">₹{Math.round(totalEarnings)}</div>
                    <p className="text-[10px] text-muted-foreground">Earnings</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-3">
                <Card className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Wallet className="h-4 w-4" />
                      <span className="text-sm">Coin balance</span>
                    </div>
                    <span className="font-display font-bold text-primary">{profile?.coin_balance ?? 0} pts</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground">Total points</p>
                      <p className="text-xl font-display font-bold">{profile?.total_points ?? 0}</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground">Consecutive weeks</p>
                      <p className="text-xl font-display font-bold">{profile?.consecutive_weeks ?? 0}</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by transaction id or date" className="pl-9" />
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <Card className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">No pickup transactions yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">Scan a recycler QR to record your first pickup.</p>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {filtered.map((row, i) => (
                      <motion.div key={row.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                        <Card className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-mono text-muted-foreground">{row.id}</p>
                              <p className="mt-2 text-sm font-medium flex items-center gap-2">
                                <Weight className="h-4 w-4 text-primary" /> {row.weight_kg.toFixed(1)} kg
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {new Date(row.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-display font-bold text-primary">+{row.points_earned} pts</p>
                              <p className="text-xs text-muted-foreground">₹{Math.round(row.points_earned / 10)}</p>
                              <div className="mt-2 flex items-center justify-end gap-0.5 text-earth">
                                <Star className="h-3 w-3 fill-earth text-earth" />
                                <Star className="h-3 w-3 fill-earth text-earth" />
                                <Star className="h-3 w-3 fill-earth text-earth" />
                                <Star className="h-3 w-3 fill-earth text-earth" />
                                <Star className="h-3 w-3 fill-earth text-earth" />
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

