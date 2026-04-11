import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRScannerModal } from "@/components/picker/QRScannerModal";
import { PageBackground } from "@/components/PageBackground";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePickerGeolocation } from "@/hooks/usePickerGeolocation";
import { subscribeToCompletions } from "@/hooks/usePickupSchedule";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Weight,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  Package,
  Star,
  Truck,
  MessageCircle,
  Navigation,
  User,
  ChevronRight,
  X,
  Bike,
  Car,
  LayoutDashboard,
  Wallet,
  BarChart3,
  Timer,
  ScanLine,
  Layers,
} from "lucide-react";

const HEATMAP_URL = "https://id-preview--9c2cc02e-e619-4557-9a1b-fe8248a52c7f.lovable.app/?__lovable_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiQnJYemd1b2xDQWJsNEVpNjlXZjNHcWJENTJ3MSIsInByb2plY3RfaWQiOiI5YzJjYzAyZS1lNjE5LTQ1NTctOWExYi1mZTgyNDhhNTJjN2YiLCJhY2Nlc3NfdHlwZSI6InByb2plY3QiLCJpc3MiOiJsb3ZhYmxlLWFwaSIsInN1YiI6IjljMmNjMDJlLWU2MTktNDU1Ny05YTFiLWZlODI0OGE1MmM3ZiIsImF1ZCI6WyJsb3ZhYmxlLWFwcCJdLCJleHAiOjE3NzY0NTY0NDUsIm5iZiI6MTc3NTg1MTY0NSwiaWF0IjoxNzc1ODUxNjQ1fQ.N7iR29ag67q0GqvFBEuNxjCt-okRpQBuZUg0SzRT6GwAVgAoRliJJPVVaxCo8HSMu4dWnyvUMT64CMd3hgdoxlpV4_eWRIbARpjbuSusZExcQVqI-Xq0SPueLKjIrjS7SuGYChJwCMYsjI1yR1YyJJ-Bma_Hjh5lcYAY0ac68F2PLgGRiQvNvInFSb2oA3sD-oAaZTRJV_eX924aQI6nkpJrwK6ER956DSQ7iiM2etasjI0qh2XloPmpDnBg7ItCr15W68xr01-sDXZ97z9d_pkxSBafctRzFXFf1Z68JFoljcnH8mWsMmCWWelZaOJ4i01yE_VWhDthnV3yPPH7WzSltTBo9SX8hUQ0gMidRdyZLOLHOqzf8hc8sOBKXwGFC50tnT4cBng9Q9pl92PE8GfjYHImnGtwvEbKqsEZkV4IJvQSKNWSnN3Uu_I00wL4EUwxU7FsuylLwQNHOoNPzrvf43taulI9Wv2ydgySw_2KGLJ2YlTbqRyi4oVoCh9nq-s1NETnPiTlLqkDTvrBlPwpSB5OeWTiUXkT7bqMa4LQk9HGjr4oO6zzXvA5-MxWlAvm10szs6eNKDDClbkEmWRigdwje77n8xQ9SrbUtm2IojxM8yAITXDksf8g531jOJb946UIlr_E91_Wn8wucTBcpw4fwqSnPT8oWr-d9U4";

interface Pickup {
  id: number;
  recycler: string;
  date: string;
  time: string;
  weight: string;
  address: string;
  status: string;
  phone: string;
  vehicleType: "bike" | "auto" | "van";
  isPrePickup: boolean;
  etaMinutes?: number;
  gpsLat?: number;
  gpsLng?: number;
  destLat?: number;
  destLng?: number;
}

const weeklyPickups: Pickup[] = [
  { id: 1, recycler: "Ananya Sharma", date: "Mar 8", time: "Morning", weight: "2.5 kg", address: "HSR Layout, Bangalore", status: "pending", phone: "+91 98765 43210", vehicleType: "bike", isPrePickup: true, etaMinutes: 23, gpsLat: 12.9120, gpsLng: 77.6300, destLat: 12.9141, destLng: 77.6368 },
  { id: 2, recycler: "Ravi Kumar", date: "Mar 8", time: "Afternoon", weight: "1.8 kg", address: "Koramangala, Bangalore", status: "pending", phone: "+91 87654 32109", vehicleType: "auto", isPrePickup: false },
  { id: 3, recycler: "Priya Nair", date: "Mar 9", time: "Morning", weight: "4.0 kg", address: "Indiranagar, Bangalore", status: "pending", phone: "+91 76543 21098", vehicleType: "van", isPrePickup: false },
  { id: 4, recycler: "Amit Patel", date: "Mar 7", time: "Evening", weight: "3.2 kg", address: "Whitefield, Bangalore", status: "completed", phone: "+91 65432 10987", vehicleType: "bike", isPrePickup: false },
  { id: 5, recycler: "Sara Khan", date: "Mar 6", time: "Morning", weight: "1.5 kg", address: "JP Nagar, Bangalore", status: "completed", phone: "+91 54321 09876", vehicleType: "auto", isPrePickup: false },
  { id: 6, recycler: "Deepak Reddy", date: "Mar 5", time: "Afternoon", weight: "2.0 kg", address: "BTM Layout, Bangalore", status: "cancelled", phone: "+91 43210 98765", vehicleType: "van", isPrePickup: false },
];

const performanceStats = [
  { icon: Package, label: "Pickups This Week", value: "8", color: "text-[#14532D]" },
  { icon: Weight, label: "Weight Collected", value: "15 kg", color: "text-[#14532D]" },
  { icon: TrendingUp, label: "Earnings", value: "₹150", color: "text-leaf" },
  { icon: Star, label: "Rating", value: "4.8 ★", color: "text-[#065F46]" },
];

const statusConfig = {
  pending: { icon: Loader2, label: "Pending", variant: "outline" as const, className: "border-warning text-warning" },
  completed: { icon: CheckCircle2, label: "Completed", variant: "outline" as const, className: "border-primary text-[#14532D]" },
  cancelled: { icon: XCircle, label: "Cancelled", variant: "outline" as const, className: "border-red-500/40 text-red-400" },
};

const vehicleIcons = { bike: Bike, auto: Truck, van: Car };
const vehicleLabels = { bike: "Bike", auto: "Auto Rickshaw", van: "Mini Van" };

function formatCountdown(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const Dashboard = () => {
  const navigate = useNavigate();
  usePickerGeolocation(); // Start broadcasting location every 10s
  const [tab, setTab] = useState("schedule");
  const [bottomTab, setBottomTab] = useState("dashboard");
  const [showDashboard, setShowDashboard] = useState(() => {
    try {
      const stored = window.localStorage.getItem("picker_dashboard_show_sections");
      return stored === null ? true : stored === "true";
    } catch {
      return true;
    }
  });
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [pickupHistory, setPickupHistory] = useState<{ id: string; recycler_id: string; weight_kg: number; points_earned: number; created_at: string }[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Live deltas — updated instantly when a scan completes, no page reload needed
  const [sessionPickups, setSessionPickups] = useState(0);
  const [sessionKg, setSessionKg]           = useState(0);
  const [sessionCredits, setSessionCredits] = useState(0);

  // Subscribe to global completion events
  useEffect(() => {
    return subscribeToCompletions((e) => {
      setSessionPickups((n) => n + 1);
      setSessionKg((n) => Number((n + e.weight_kg).toFixed(1)));
      setSessionCredits((n) => n + e.credits);
      // Prepend to local earnings history
      setPickupHistory((prev) => [{
        id: e.pickupId,
        recycler_id: e.recycler_id,
        weight_kg: e.weight_kg,
        points_earned: e.credits,
        created_at: e.completed_at,
      }, ...prev]);
    });
  }, []);

  // Real profile from DB
  const [dbProfile, setDbProfile] = useState<{
    full_name: string; email: string; coin_balance: number;
    total_pickups: number; total_recycled_kg: number; created_at: string;
  } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) return;
      const { data } = await supabase.from("profiles")
        .select("full_name, coin_balance, total_pickups, total_recycled_kg, created_at")
        .eq("id", user.id).maybeSingle();
      if (data) {
        setDbProfile({ ...(data as any), email: user.email ?? "" });
      }
    }
    loadProfile();
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("picker_dashboard_show_sections", String(showDashboard));
    } catch {
      // ignore
    }
  }, [showDashboard]);

  useEffect(() => {
    if (bottomTab === "earnings") {
      const fetchHistory = async () => {
        setHistoryLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("pickup_transactions")
            .select("*")
            .eq("picker_id", user.id)
            .order("created_at", { ascending: false });
          setPickupHistory(data || []);
        }
        setHistoryLoading(false);
      };
      fetchHistory();
    }
  }, [bottomTab]);

  const pending = weeklyPickups.filter((p) => p.status === "pending");
  const completed = weeklyPickups.filter((p) => p.status === "completed");

  return (
    <div className="min-h-screen">
      <PageBackground type="recycling" overlay="bg-[#F8FAF9]/65" />
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ background: "rgba(248,250,249,0.95)", borderColor: "#D1FAE5" }}>
        <div className="container mx-auto flex items-center h-14 px-4 gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/role-select")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-[#14532D]" />
            <span className="font-display font-semibold">Picker Dashboard</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              className="gap-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-full"
              onClick={() => setShowScanner(true)}
            >
              <ScanLine className="h-4 w-4" />
              <span className="hidden sm:inline">Scan QR</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowDashboard((v) => !v)}>
              {showDashboard ? "Hide" : "Show"}
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 pb-24 max-w-lg">
        {bottomTab === "dashboard" && (
          <AnimatePresence initial={false}>
            {showDashboard && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mb-5">
                  <Card
                    className="overflow-hidden border-[#D1FAE5] cursor-pointer group hover:shadow-lg transition-shadow"
                    onClick={() => window.open(HEATMAP_URL, "_blank", "noopener,noreferrer")}
                  >
                    <div className="relative bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] p-6 flex flex-col items-center justify-center gap-3 text-center min-h-[140px]">
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-28 h-28 rounded-full border border-[#10B981]/20 animate-ping absolute" />
                        <div className="w-44 h-44 rounded-full border border-[#10B981]/10 animate-ping absolute" style={{ animationDelay: "0.5s" }} />
                      </div>
                      <div className="relative z-10 w-12 h-12 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center group-hover:bg-[#10B981]/30 transition-colors">
                        <Layers className="h-6 w-6 text-[#10B981]" />
                      </div>
                      <div className="relative z-10">
                        <p className="font-display font-bold text-white">Live Plastic Heatmap</p>
                        <p className="text-white/60 text-xs mt-0.5">Real-time hotspots and active zones</p>
                      </div>
                      <Button
                        className="relative z-10 gap-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-full px-5 text-sm"
                        onClick={(e) => { e.stopPropagation(); window.open(HEATMAP_URL, "_blank", "noopener,noreferrer"); }}
                      >
                        <Layers className="h-4 w-4" /> Open Heatmap
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Scan QR Button */}
                <Button
                  className="w-full mb-4 gap-2 h-12 text-base"
                  onClick={() => setShowScanner(true)}
                >
                  <ScanLine className="h-5 w-5" />
                  Scan Recycler QR Code
                </Button>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {performanceStats.map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                      <Card className="p-4">
                        <stat.icon className={`h-5 w-5 mb-2 ${stat.color}`} />
                        <div className="text-2xl font-display font-bold">{stat.value}</div>
                        <p className="text-xs text-[#475569]">{stat.label}</p>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList className="w-full">
                    <TabsTrigger value="schedule" className="flex-1">
                      <CalendarDays className="h-4 w-4 mr-1.5" /> Schedule ({pending.length})
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex-1">
                      <CheckCircle2 className="h-4 w-4 mr-1.5" /> History ({completed.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="schedule" className="mt-4 space-y-3">
                    {pending.length === 0 ? (
                      <p className="text-center text-[#475569] py-8">No pending pickups</p>
                    ) : (
                      pending.map((pickup, i) => (
                        <motion.div key={pickup.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                          <PickupCard pickup={pickup} onTrack={() => setSelectedPickup(pickup)} />
                        </motion.div>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="history" className="mt-4 space-y-3">
                    {weeklyPickups
                      .filter((p) => p.status !== "pending")
                      .map((pickup, i) => (
                        <motion.div key={pickup.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                          <PickupCard pickup={pickup} />
                        </motion.div>
                      ))}
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {bottomTab === "schedule" && (
          <div className="space-y-3">
            <h2 className="text-lg font-display font-bold mb-4">Weekly Schedule</h2>
            {weeklyPickups.map((pickup, i) => (
              <motion.div key={pickup.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <PickupCard pickup={pickup} onTrack={pickup.isPrePickup && pickup.status === "pending" ? () => setSelectedPickup(pickup) : undefined} />
              </motion.div>
            ))}
          </div>
        )}

        {bottomTab === "stats" && (
          <div className="space-y-4">
            <h2 className="text-lg font-display font-bold mb-4">Performance Stats</h2>
            {performanceStats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-display font-bold">{stat.value}</div>
                    <p className="text-sm text-[#475569]">{stat.label}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
            <Card className="p-5">
              <h3 className="font-semibold mb-3">Weekly Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-[#475569]">Completed</p><p className="font-bold text-lg">{completed.length}</p></div>
                <div><p className="text-[#475569]">Pending</p><p className="font-bold text-lg">{pending.length}</p></div>
                <div><p className="text-[#475569]">Total Weight</p><p className="font-bold text-lg">15 kg</p></div>
                <div><p className="text-[#475569]">Avg Rating</p><p className="font-bold text-lg">4.8 ★</p></div>
              </div>
            </Card>
          </div>
        )}

        {bottomTab === "earnings" && (
          <div className="space-y-4">
            <h2 className="text-lg font-display font-bold mb-4">Earnings</h2>
            <Card className="p-5 bg-[#F0FDF4] border-[#D1FAE5]">
              <p className="text-sm text-[#475569]">Total Earnings (All Time)</p>
              <p className="text-3xl font-display font-bold text-[#14532D] mt-1">
                ₹{(pickupHistory.reduce((sum, t) => sum + t.points_earned / 10, 0) + sessionCredits / 10).toFixed(0)}
              </p>
              <p className="text-xs text-[#475569] mt-1">
                {pickupHistory.length} pickup{pickupHistory.length !== 1 ? "s" : ""} • {(pickupHistory.reduce((sum, t) => sum + t.weight_kg, 0) + sessionKg).toFixed(1)} kg collected
              </p>
              {sessionPickups > 0 && (
                <p className="text-xs text-[#14532D] font-semibold mt-1">
                  +{sessionPickups} pickup{sessionPickups > 1 ? "s" : ""} this session · +{sessionCredits} credits
                </p>
              )}
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold mb-3">Pickup History</h3>
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-[#475569]" />
                </div>
              ) : pickupHistory.length === 0 ? (
                <p className="text-center text-[#475569] py-8 text-sm">No pickups yet. Scan a recycler's QR code to get started!</p>
              ) : (
                <div className="space-y-3">
                  {pickupHistory.map((t) => (
                    <div key={t.id} className="flex items-center justify-between py-2 border-b border-[#D1FAE5] last:border-0">
                      <div>
                        <p className="text-sm font-medium">{t.weight_kg} kg collected</p>
                        <p className="text-xs text-[#475569]">
                          {new Date(t.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          {" • "}{t.points_earned} pts
                        </p>
                      </div>
                      <span className="text-sm font-bold text-[#14532D]">₹{(t.points_earned / 10).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold mb-2">Payment Info</h3>
              <p className="text-sm text-[#475569]">Payments are processed weekly every Monday to your linked bank account.</p>
            </Card>
          </div>
        )}

        {bottomTab === "profile" && (
          <div className="space-y-4">
            <h2 className="text-lg font-display font-bold mb-4">Profile</h2>
            <Card className="p-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center">
                <User className="h-8 w-8 text-[#14532D]" />
              </div>
              <div>
                <p className="font-display font-bold text-lg">{dbProfile?.full_name || "Picker"}</p>
                <p className="text-sm text-[#475569]">{dbProfile?.email}</p>
                {dbProfile?.created_at && (
                  <p className="text-xs text-[#475569]">
                    Active since {new Date(dbProfile.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </p>
                )}
                <Badge className="mt-1 bg-[#DCFCE7] text-[#14532D] border-[#D1FAE5]">Verified</Badge>
              </div>
            </Card>
            <Card className="p-5 space-y-3">
              <h3 className="font-semibold">Lifetime Stats</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-[#475569]">Total Pickups</p><p className="font-bold text-lg">{(dbProfile?.total_pickups ?? 0) + sessionPickups}</p></div>
                <div><p className="text-[#475569]">Total Earnings</p><p className="font-bold text-lg">₹{Math.floor(((dbProfile?.coin_balance ?? 0) + sessionCredits) / 10)}</p></div>
                <div><p className="text-[#475569]">Weight Collected</p><p className="font-bold text-lg">{((dbProfile?.total_recycled_kg ?? 0) + sessionKg).toFixed(1)} kg</p></div>
                <div><p className="text-[#475569]">Points Balance</p><p className="font-bold text-lg">{(dbProfile?.coin_balance ?? 0) + sessionCredits}</p></div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedPickup && (
          <PrePickupTracker pickup={selectedPickup} onClose={() => setSelectedPickup(null)} />
        )}
      </AnimatePresence>

      <QRScannerModal
        open={showScanner}
        onClose={() => setShowScanner(false)}
      />

      <div className="fixed bottom-0 left-0 right-0 z-40 nav-glass border-t border-[#D1FAE5]">
        <div className="container mx-auto max-w-lg flex items-center justify-around h-16">
          {[
            { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
            { icon: CalendarDays, label: "Schedule", key: "schedule" },
            { icon: BarChart3, label: "Stats", key: "stats" },
            { icon: Wallet, label: "Earnings", key: "earnings" },
            { icon: User, label: "Profile", key: "profile" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setBottomTab(item.key)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                bottomTab === item.key ? "text-[#14532D]" : "text-[#475569] hover:text-[#1E293B]"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => navigate("/picker/available-pickups")}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-[#475569] hover:text-[#1E293B]"
          >
            <Package className="h-5 w-5" />
            <span className="text-[10px] font-medium">Pickups</span>
          </button>
        </div>
      </div>
    </div>
  );
};

function PickupCard({ pickup, onTrack }: { pickup: Pickup; onTrack?: () => void }) {
  const config = statusConfig[pickup.status as keyof typeof statusConfig];
  const VehicleIcon = vehicleIcons[pickup.vehicleType];
  const [countdown, setCountdown] = useState((pickup.etaMinutes || 0) * 60);

  useEffect(() => {
    if (!pickup.isPrePickup || pickup.status !== "pending") return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [pickup.isPrePickup, pickup.status]);

  return (
    <Card className="p-4">
      {pickup.isPrePickup && pickup.status === "pending" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-3 -mt-1 -mx-1 px-3 py-2 rounded-lg bg-[#DCFCE7] border border-[#D1FAE5] flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-[#14532D] animate-pulse" />
            <span className="text-xs font-medium text-[#14532D]">
              Arriving in <span className="font-display font-bold">{formatCountdown(countdown)}</span>
            </span>
          </div>
          <Button size="sm" variant="ghost" className="h-7 text-xs text-[#14532D] gap-1" onClick={onTrack}>
            Track <ChevronRight className="h-3 w-3" />
          </Button>
        </motion.div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            {pickup.recycler}
            <VehicleIcon className="h-3.5 w-3.5 text-[#475569]" />
          </h3>
          <p className="text-xs text-[#475569] flex items-center gap-1 mt-0.5">
            <CalendarDays className="h-3 w-3" /> {pickup.date} • <Clock className="h-3 w-3" /> {pickup.time}
          </p>
        </div>
        <Badge variant={config.variant} className={config.className}>
          {config.label}
        </Badge>
      </div>
      <div className="flex items-center gap-4 text-sm text-[#475569]">
        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {pickup.address}</span>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#D1FAE5]">
        <span className="text-sm flex items-center gap-1"><Weight className="h-3.5 w-3.5" /> {pickup.weight}</span>
        {pickup.status === "pending" && (
          <div className="flex gap-2">
            {pickup.isPrePickup && (
              <Button size="sm" variant="default" className="gap-1.5 text-xs" onClick={onTrack}>
                <Navigation className="h-3 w-3" /> Track
              </Button>
            )}
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Phone className="h-3 w-3" /> Call
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function PrePickupTracker({ pickup, onClose }: { pickup: Pickup; onClose: () => void }) {
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: "system", text: `Chat with ${pickup.recycler}`, time: "" },
    { sender: "recycler", text: "Hi! I'm ready with the plastic. When will you arrive?", time: "2 min ago" },
  ]);
  const VehicleIcon = vehicleIcons[pickup.vehicleType];

  // Live countdown
  const [countdown, setCountdown] = useState((pickup.etaMinutes || 0) * 60);
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const etaDisplay = formatCountdown(countdown);
  const etaMinsDisplay = `${Math.ceil(countdown / 60)} min`;

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, { sender: "picker", text: chatInput, time: "Just now" }]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { sender: "recycler", text: "Thanks for the update! See you soon. 👍", time: "Just now" }]);
    }, 1500);
  };

  // Chat overlay
  if (showChat) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="sticky top-0 z-10 backdrop-blur-md border-b" style={{ background: "rgba(248,250,249,0.95)", borderColor: "#D1FAE5" }}>
          <div className="container mx-auto flex items-center gap-3 h-14 px-4 max-w-lg">
            <Button variant="ghost" size="sm" className="p-1" onClick={() => setShowChat(false)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="w-9 h-9 rounded-full bg-[#DCFCE7] flex items-center justify-center">
              <User className="h-5 w-5 text-[#14532D]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{pickup.recycler}</p>
              <p className="text-xs text-[#475569]">Online • {pickup.address}</p>
            </div>
            <Button variant="ghost" size="sm" className="p-1" onClick={() => window.open(`tel:${pickup.phone.replace(/\s/g, "")}`)}>
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
          <div className="space-y-3">
            {chatMessages.filter(m => m.sender !== "system").map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === "picker" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.sender === "picker"
                    ? "bg-[#10B981] text-white rounded-br-md"
                    : "bg-card border border-[#D1FAE5] rounded-bl-md"
                }`}>
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender === "picker" ? "text-white/60" : "text-[#475569]"}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 nav-glass border-t border-[#D1FAE5] p-3">
          <div className="max-w-lg mx-auto flex items-center gap-2">
            <input
              placeholder="Type a message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
              className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button size="sm" onClick={handleSendChat} disabled={!chatInput.trim()} className="h-10 w-10 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm"
    >
      <div className="sticky top-0 z-10 backdrop-blur-md border-b" style={{ background: "rgba(248,250,249,0.95)", borderColor: "#D1FAE5" }}>
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-[#14532D] animate-pulse" />
            <span className="font-display font-semibold">Live Tracking</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg space-y-4">
        {/* Live ETA Banner */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-4 bg-[#F0FDF4] border-[#D1FAE5]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center">
                  <Timer className="h-6 w-6 text-[#14532D]" />
                </div>
                <div>
                  <p className="text-xs text-[#475569]">Estimated Arrival</p>
                  <p className="text-2xl font-display font-bold text-[#14532D]">{etaDisplay}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#475569]">Distance</p>
                <p className="font-display font-bold text-[#1E293B]">~{(countdown * 0.02).toFixed(1)} km</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Heatmap button — replaces GPS map */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card
            className="overflow-hidden border-[#D1FAE5] cursor-pointer group hover:shadow-lg transition-shadow h-64"
            onClick={() => window.open(HEATMAP_URL, "_blank", "noopener,noreferrer")}
          >
            <div className="relative bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] h-full flex flex-col items-center justify-center gap-3 text-center">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-28 h-28 rounded-full border border-[#10B981]/20 animate-ping absolute" />
                <div className="w-44 h-44 rounded-full border border-[#10B981]/10 animate-ping absolute" style={{ animationDelay: "0.5s" }} />
              </div>
              <div className="relative z-10 w-12 h-12 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center group-hover:bg-[#10B981]/30 transition-colors">
                <Layers className="h-6 w-6 text-[#10B981]" />
              </div>
              <div className="relative z-10">
                <p className="font-display font-bold text-white">Live Plastic Heatmap</p>
                <p className="text-white/60 text-xs mt-0.5">View active collection zones</p>
              </div>
              <Button
                className="relative z-10 gap-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-full px-5 text-sm"
                onClick={(e) => { e.stopPropagation(); window.open(HEATMAP_URL, "_blank", "noopener,noreferrer"); }}
              >
                <Layers className="h-4 w-4" /> Open Heatmap
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Recycler Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-[#DCFCE7] flex items-center justify-center">
                <User className="h-7 w-7 text-[#14532D]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-display font-bold">{pickup.recycler}</h3>
                <p className="text-sm text-[#475569] flex items-center gap-1.5">
                  <VehicleIcon className="h-3.5 w-3.5" /> {vehicleLabels[pickup.vehicleType]}
                </p>
              </div>
              <Badge className="bg-[#DCFCE7] text-[#14532D] border-[#D1FAE5]">
                <Timer className="h-3 w-3 mr-1" /> {etaMinsDisplay}
              </Badge>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-[#475569]">
                <Phone className="h-4 w-4" />
                <span>{pickup.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-[#475569]">
                <MapPin className="h-4 w-4" />
                <span>{pickup.address}</span>
              </div>
              <div className="flex items-center gap-3 text-[#475569]">
                <Weight className="h-4 w-4" />
                <span>Estimated: {pickup.weight}</span>
              </div>
              <div className="flex items-center gap-3 text-[#475569]">
                <Clock className="h-4 w-4" />
                <span>{pickup.date} • {pickup.time} slot</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Contact Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-3">
          <Button size="lg" className="gap-2" onClick={() => window.open(`tel:${pickup.phone.replace(/\s/g, "")}`)}>
            <Phone className="h-4 w-4" /> Call Recycler
          </Button>
          <Button size="lg" variant="outline" className="gap-2" onClick={() => setShowChat(true)}>
            <MessageCircle className="h-4 w-4" /> Chat
          </Button>
        </motion.div>

        {/* Status timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-5">
            <h4 className="font-display font-semibold mb-4">Pickup Status</h4>
            <div className="space-y-4">
              {[
                { label: "Pickup confirmed", time: "1 hour ago", done: true },
                { label: "Recycler on the way", time: "10 min ago", done: true },
                { label: "Arriving at location", time: `ETA ${etaDisplay}`, done: false },
                { label: "Pickup completed", time: "", done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${step.done ? "bg-[#10B981]" : "bg-muted-foreground/30"}`} />
                    {i < 3 && <div className={`w-0.5 h-6 ${step.done ? "bg-[#10B981]/50" : "bg-muted-foreground/20"}`} />}
                  </div>
                  <div className="-mt-0.5">
                    <p className={`text-sm font-medium ${step.done ? "text-[#1E293B]" : "text-[#475569]"}`}>{step.label}</p>
                    {step.time && <p className="text-xs text-[#475569]">{step.time}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
