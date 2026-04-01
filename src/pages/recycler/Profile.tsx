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
import {
  User, MapPin, Phone, Mail, Star, CalendarDays, Weight,
  Download, Search, CheckCircle2, XCircle, Loader2,
} from "lucide-react";

interface ProfileRow {
  id: string;
  full_name: string;
  role: string;
  coin_balance: number;
  total_pickups: number;
  total_recycled_kg: number;
  total_points: number;
}

interface PickupRow {
  id: string;
  pickup_date: string;
  weight_kg: number;
  points_earned: number;
  status: string;
}

const RecyclerProfile = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState("history");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [email, setEmail] = useState("");
  const [pickups, setPickups] = useState<PickupRow[]>([]);
  const [search, setSearch] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");

  // Editable settings fields
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) { setLoading(false); return; }

      setEmail(user.email ?? "");

      const [{ data: profileRow }, { data: pickupRows }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("recycling_pickups").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);

      if (!cancelled) {
        const p = profileRow as ProfileRow | null;
        setProfile(p);
        setEditName(p?.full_name ?? "");
        setPickups((pickupRows as PickupRow[] | null) ?? []);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = pickups.filter(
    (p) => p.id.toLowerCase().includes(search.toLowerCase()) ||
      new Date(p.pickup_date).toLocaleDateString("en-IN").includes(search)
  );

  const handleExport = () => {
    const csv = "ID,Date,Weight(kg),Points,Status\n" +
      pickups.map((p) =>
        `${p.id},${new Date(p.pickup_date).toLocaleDateString("en-IN")},${p.weight_kg},${p.points_earned},${p.status}`
      ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "pickup-history.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveSettings = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles")
      .update({ full_name: editName })
      .eq("id", auth.user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      setProfile((prev) => prev ? { ...prev, full_name: editName } : prev);
      toast({ title: "Profile saved! ✅" });
    }
  };

  const initials = (profile?.full_name ?? "?")
    .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen bg-background/40 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/40">
      <PageBackground type="waste" overlay="bg-foreground/50" />
      <div className="container mx-auto px-4 py-6 max-w-lg">

        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-hero-gradient flex items-center justify-center text-primary-foreground font-display font-bold text-xl">
                {initials || <User className="h-7 w-7" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-lg">{profile?.full_name || "Recycler"}</h2>
                  <Badge className="text-[10px] bg-ocean">Verified ✓</Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {email}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 rounded-lg bg-muted">
                <div className="font-display font-bold">{profile?.total_recycled_kg ?? 0} kg</div>
                <p className="text-[10px] text-muted-foreground">Recycled</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <div className="font-display font-bold">{profile?.coin_balance ?? 0}</div>
                <p className="text-[10px] text-muted-foreground">Points</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <div className="font-display font-bold">{profile?.total_pickups ?? 0}</div>
                <p className="text-[10px] text-muted-foreground">Pickups</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
            <TabsTrigger value="feedback" className="flex-1">Feedback</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
          </TabsList>

          {/* History */}
          <TabsContent value="history">
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by ID or date..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-1" disabled={pickups.length === 0}>
                <Download className="h-4 w-4" /> CSV
              </Button>
            </div>
            {filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-10 text-sm">
                {pickups.length === 0 ? "No pickups yet. Book your first pickup to get started!" : "No results match your search."}
              </p>
            ) : (
              <div className="space-y-2">
                {filtered.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                    <Card className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-muted-foreground">{p.id.slice(0, 12)}…</span>
                        <Badge variant="outline" className={`text-[10px] ${
                          p.status === "completed" ? "border-primary text-primary" : "border-destructive text-destructive"
                        }`}>
                          {p.status === "completed" ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                          {p.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {new Date(p.pickup_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          <span className="flex items-center gap-1"><Weight className="h-3 w-3" /> {p.weight_kg} kg</span>
                        </div>
                        <span className="font-display font-bold text-primary">+{p.points_earned} pts</span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Feedback */}
          <TabsContent value="feedback">
            <Card className="p-5 space-y-4">
              <div>
                <Label>Rate your experience</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setFeedbackRating(s)}>
                      <Star className={`h-8 w-8 ${s <= feedbackRating ? "fill-earth text-earth" : "text-muted"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Comments or suggestions</Label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Tell us how we can improve..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={() => {
                toast({ title: "Thank you for your feedback! 💚" });
                setFeedbackRating(0); setFeedbackText("");
              }}>Submit Feedback</Button>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card className="p-5 space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={email} disabled className="mt-1 opacity-60" />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here.</p>
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Enter phone number" className="mt-1" />
              </div>
              <div>
                <Label>Address</Label>
                <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Enter your address" className="mt-1" />
              </div>
              <Button className="w-full" onClick={handleSaveSettings} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RecyclerProfile;
