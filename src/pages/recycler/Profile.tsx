import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { useRVMData, LOCATION_LABELS } from "@/hooks/useRVMData";
import { useRecycleHub } from "@/hooks/useRecycleHub";
import {
  User, Mail, Star, Loader2, MapPin, QrCode,
  AlertTriangle, CheckCircle2, Wifi, Building2, Train, ShoppingBag, Bus,
} from "lucide-react";

interface ProfileRow {
  id: string; full_name: string; role: string;
  coin_balance: number; total_pickups: number;
  total_recycled_kg: number; total_points: number;
}

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

const RecyclerProfile = () => {
  const { toast } = useToast();
  const { depositPoints, userBalance } = useRecycleHub();
  const { rvms, fullAlerts } = useRVMData();

  const [tab, setTab] = useState("rvm");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("Recycler");
  const [email, setEmail] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [scanHistory, setScanHistory] = useState<{ rvmId: string; rvmName: string; pts: number; at: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) { setLoading(false); return; }
      setEmail(user.email ?? "");
      setUserId(user.id);
      const { data: profileRow } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (!cancelled) {
        const p = profileRow as ProfileRow | null;
        setProfile(p);
        setEditName(p?.full_name ?? "");
        setUserName(p?.full_name ?? user.email ?? "Recycler");
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const qrPayload = userId
    ? JSON.stringify({ type: "rvm_scan", recycler_id: userId, recycler_name: userName })
    : null;

  const handleRVMScan = (rvmId: string, rvmName: string) => {
    const pts = 50;
    depositPoints(pts, `RVM scan — ${rvmName}`);
    setScanHistory((prev) => [{ rvmId, rvmName, pts, at: new Date().toISOString() }, ...prev.slice(0, 19)]);
    toast({ title: "Coins earned!", description: `+${pts} pts added for scanning at ${rvmName}` });
  };

  const handleSaveSettings = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: editName }).eq("id", auth.user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      setProfile((prev) => prev ? { ...prev, full_name: editName } : prev);
      setUserName(editName);
      toast({ title: "Profile saved!" });
    }
  };

  const initials = (profile?.full_name ?? "?").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#14532D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageBackground type="waste" overlay="bg-[#F8FAF9]/65" />
      <div className="container mx-auto px-4 py-6 max-w-lg">

        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-hero-gradient flex items-center justify-center text-white font-display font-bold text-xl">
                {initials || <User className="h-7 w-7" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-lg">{profile?.full_name || "Recycler"}</h2>
                  <Badge className="text-[10px] bg-[#10B981]">Verified</Badge>
                </div>
                <p className="text-xs text-[#475569] flex items-center gap-1"><Mail className="h-3 w-3" />{email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 rounded-lg bg-muted">
                <div className="font-display font-bold">{userBalance}</div>
                <p className="text-[10px] text-[#475569]">Coin Balance</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <div className="font-display font-bold">{scanHistory.length}</div>
                <p className="text-[10px] text-[#475569]">RVM Scans</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full mb-4 grid grid-cols-4">
            <TabsTrigger value="rvm">Scan RVM</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* ── Scan at RVM ── */}
          <TabsContent value="rvm" className="space-y-4">
            <Card className="p-5 bg-[#10B981] border-0 rounded-2xl text-[#1E293B]">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="h-5 w-5" />
                <span className="font-display font-bold">Scan at RVM</span>
              </div>
              <p className="text-sm text-[#1E293B]/80">
                Visit a nearby Reverse Vending Machine, place your plastic inside, then scan your QR code at the machine to earn coins instantly.
              </p>
            </Card>

            {/* Personal QR code */}
            <Card className="p-6 text-center space-y-4">
              <h3 className="font-display font-bold text-lg">Your RVM QR Code</h3>
              <p className="text-sm text-[#475569]">Show this at any GREEN LOOP RVM after depositing plastic to earn coins.</p>
              {qrPayload ? (
                <div className="flex justify-center">
                  <div className="bg-white p-5 rounded-2xl shadow-md inline-block border border-slate-100">
                    <QRCodeSVG value={qrPayload} size={200} bgColor="#ffffff" fgColor="#111827" level="H" />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-[#475569]" /></div>
              )}
              <p className="text-[10px] font-mono text-[#475569]">ID: {userId?.slice(0, 20)}…</p>
            </Card>

            {/* Nearby RVMs */}
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#14532D]" /> Nearby RVMs
              </h3>
              <div className="space-y-3">
                {[...rvms].sort((a, b) => a.distanceKm - b.distanceKm).map((rvm) => {
                  const Icon = LOCATION_ICONS[rvm.locationType] ?? Building2;
                  const fillColor = rvm.fillPct >= 90 ? "text-red-600" : rvm.fillPct >= 70 ? "text-amber-600" : "text-[#14532D]";
                  const statusLabel = rvm.fillPct >= 90 ? "Full" : rvm.fillPct >= 70 ? "Filling" : "Available";
                  const statusBadge = rvm.fillPct >= 90
                    ? "bg-red-100 text-red-700 border-red-200"
                    : rvm.fillPct >= 70
                    ? "bg-amber-100 text-amber-700 border-amber-200"
                    : "bg-[#DCFCE7] text-[#14532D] border-[#D1FAE5]";
                  return (
                    <motion.div key={rvm.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="p-4 border-[#D1FAE5]">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] flex items-center justify-center shrink-0">
                              <Icon className="h-4 w-4 text-[#14532D]" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{rvm.name}</p>
                              <p className="text-xs text-[#475569] truncate">{rvm.address}</p>
                              <p className="text-xs text-[#475569] mt-0.5">{LOCATION_LABELS[rvm.locationType]} · {rvm.distanceKm} km away</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={`text-[10px] shrink-0 ${statusBadge}`}>{statusLabel}</Badge>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#475569]">Fill level</span>
                            <span className={`font-semibold ${fillColor}`}>{rvm.fillPct}%</span>
                          </div>
                          <FillBar pct={rvm.fillPct} />
                        </div>
                        {rvm.fillPct < 90 ? (
                          <Button size="sm" className="w-full mt-3 gap-2 bg-[#10B981] hover:bg-[#059669]" onClick={() => handleRVMScan(rvm.id, rvm.name)}>
                            <QrCode className="h-4 w-4" /> Scan at this RVM
                          </Button>
                        ) : (
                          <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Machine full — choose another RVM nearby
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Scan history */}
            {scanHistory.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-3">Recent Scans</h3>
                <div className="space-y-2">
                  {scanHistory.map((s, i) => (
                    <Card key={i} className="p-3 flex items-center justify-between border-[#D1FAE5]">
                      <div>
                        <p className="text-sm font-medium">{s.rvmName}</p>
                        <p className="text-xs text-[#475569]">{new Date(s.at).toLocaleString()}</p>
                      </div>
                      <span className="font-display font-bold text-[#14532D] text-sm">+{s.pts} pts</span>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── RVM Full Alerts ── */}
          <TabsContent value="alerts" className="space-y-4">
            <Card className="p-4 bg-red-50 border-red-200 rounded-2xl">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-semibold text-sm text-red-700">RVM Full Alerts</span>
              </div>
              <p className="text-xs text-red-600">
                {fullAlerts.length} machine{fullAlerts.length !== 1 ? "s" : ""} at or near capacity. Avoid these until collected.
              </p>
            </Card>

            {fullAlerts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-10 w-10 text-[#10B981] mx-auto mb-3" />
                <p className="font-semibold text-[#14532D]">All RVMs have capacity</p>
                <p className="text-sm text-[#475569] mt-1">No machines are full right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fullAlerts.map((rvm) => {
                  const Icon = LOCATION_ICONS[rvm.locationType] ?? Building2;
                  return (
                    <motion.div key={rvm.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                      <Card className="p-4 border-red-200 bg-red-50/50">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                            <Icon className="h-4 w-4 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold text-sm truncate">{rvm.name}</p>
                              <Badge className="bg-red-600 text-white text-[10px] shrink-0">{rvm.fillPct}% Full</Badge>
                            </div>
                            <p className="text-xs text-[#475569] truncate mt-0.5">{rvm.address}</p>
                            <p className="text-xs text-[#475569]">{LOCATION_LABELS[rvm.locationType]} · {rvm.distanceKm} km away</p>
                          </div>
                        </div>
                        <FillBar pct={rvm.fillPct} />
                        <div className="flex items-center justify-between mt-2 text-xs text-[#475569]">
                          <span className="flex items-center gap-1">
                            <Wifi className="h-3 w-3" />
                            {rvm.minutesFull !== null
                              ? `Full for ${rvm.minutesFull >= 60 ? `${Math.floor(rvm.minutesFull / 60)}h ${Math.round(rvm.minutesFull % 60)}m` : `${Math.round(rvm.minutesFull)}m`}`
                              : "Nearly full"}
                          </span>
                          <span className="text-red-600 font-medium">Avoid — use another RVM</span>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Available machines */}
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#10B981]" /> Available Machines
              </h3>
              <div className="space-y-2">
                {rvms.filter((r) => r.fillPct < 90).sort((a, b) => a.distanceKm - b.distanceKm).map((rvm) => {
                  const Icon = LOCATION_ICONS[rvm.locationType] ?? Building2;
                  return (
                    <Card key={rvm.id} className="p-3 border-[#D1FAE5] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] flex items-center justify-center shrink-0">
                        <Icon className="h-3.5 w-3.5 text-[#14532D]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{rvm.name}</p>
                        <p className="text-xs text-[#475569]">{rvm.distanceKm} km · {rvm.fillPct}% full</p>
                      </div>
                      <div className="w-16"><FillBar pct={rvm.fillPct} /></div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* ── Feedback ── */}
          <TabsContent value="feedback">
            <Card className="p-5 space-y-4">
              <div>
                <Label>Rate your experience</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setFeedbackRating(s)}>
                      <Star className={`h-8 w-8 ${s <= feedbackRating ? "fill-[#6fcf97] text-[#065F46]" : "text-muted"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Comments</Label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Tell us how we can improve..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={() => { toast({ title: "Thank you for your feedback!" }); setFeedbackRating(0); setFeedbackText(""); }}>
                Submit Feedback
              </Button>
            </Card>
          </TabsContent>

          {/* ── Settings ── */}
          <TabsContent value="settings">
            <Card className="p-5 space-y-4">
              <div><Label>Full Name</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" /></div>
              <div>
                <Label>Email</Label>
                <Input value={email} disabled className="mt-1 opacity-60" />
                <p className="text-xs text-[#475569] mt-1">Email cannot be changed here.</p>
              </div>
              <div><Label>Phone</Label><Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Enter phone number" className="mt-1" /></div>
              <div><Label>Address</Label><Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Enter your address" className="mt-1" /></div>
              <Button className="w-full" onClick={handleSaveSettings} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Changes
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RecyclerProfile;
