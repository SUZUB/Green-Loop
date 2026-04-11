import { useState, useEffect } from "react";
import { motion, animate, useMotionValue, AnimatePresence } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUserStats } from "@/hooks/useUserStats";
import { useRecycleHub } from "@/hooks/useRecycleHub";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, MapPin, Trophy, Leaf, Wallet, BookOpen, Users, Gift,
  Award, Share2, Coins, ChevronRight, MessageCircle, Layers,
  Package, Ticket, DollarSign, Building2, Train, ShoppingBag, Bus,
} from "lucide-react";
import { useRVMData, LOCATION_LABELS } from "@/hooks/useRVMData";

const quickActions = [
  { key: "dashboard",  icon: LayoutDashboard, label: "Dashboard",    path: "/recycler/dashboard",  color: "bg-[#10B981]" },
  { key: "nearbyRVMs", icon: MapPin,          label: "Nearby RVMs",  path: "/recycler/nearby-rvms", color: "bg-[#10B981]" },
  { key: "leaderboard",icon: Trophy,          label: "Leaderboard",  path: "/recycler/leaderboard",color: "bg-[#10B981]" },
  { key: "myImpact",   icon: Leaf,            label: "My Impact",    path: "/recycler/impact",     color: "bg-[#10B981]" },
  { key: "wallet",     icon: Wallet,          label: "Wallet",       path: "/recycler/wallet",     color: "bg-[#10B981]" },
  { key: "rewards",    icon: Gift,            label: "Rewards",      path: "/recycler/rewards",    color: "bg-[#10B981]" },
  { key: "achievements",icon: Award,          label: "Achievements", path: "/recycler/achievements",color: "bg-[#10B981]" },
  { key: "referrals",  icon: Share2,          label: "Referrals",    path: "/recycler/referral",   color: "bg-[#10B981]" },
  { key: "learn",      icon: BookOpen,        label: "Learn",        path: "/education/knowledge-hub",color: "bg-[#10B981]" },
  { key: "community",  icon: Users,           label: "Community",    path: "/community",           color: "bg-[#10B981]" },
] as const;

type QuickActionKey = (typeof quickActions)[number]["key"];

interface RecentActivity {
  id: string;
  desc: string;
  pts: string;
  date: string;
}

interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

function CountUp({ value, prefix = "", suffix = "", decimals = 0 }: CountUpProps) {
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const unsubscribe = motionValue.on("change", (latest) => {
      setDisplayValue(latest);
    });
    const animation = animate(motionValue, value, { duration: 1.1, ease: "easeOut" });
    return () => {
      animation.stop();
      unsubscribe();
    };
  }, [motionValue, value]);

  const formatted = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString();
  return <span>{prefix}{formatted}{suffix}</span>;
}

const HEATMAP_URL = "https://id-preview--9c2cc02e-e619-4557-9a1b-fe8248a52c7f.lovable.app/?__lovable_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiQnJYemd1b2xDQWJsNEVpNjlXZjNHcWJENTJ3MSIsInByb2plY3RfaWQiOiI5YzJjYzAyZS1lNjE5LTQ1NTctOWExYi1mZTgyNDhhNTJjN2YiLCJhY2Nlc3NfdHlwZSI6InByb2plY3QiLCJpc3MiOiJsb3ZhYmxlLWFwaSIsInN1YiI6IjljMmNjMDJlLWU2MTktNDU1Ny05YTFiLWZlODI0OGE1MmM3ZiIsImF1ZCI6WyJsb3ZhYmxlLWFwcCJdLCJleHAiOjE3NzY0NTY0NDUsIm5iZiI6MTc3NTg1MTY0NSwiaWF0IjoxNzc1ODUxNjQ1fQ.N7iR29ag67q0GqvFBEuNxjCt-okRpQBuZUg0SzRT6GwAVgAoRliJJPVVaxCo8HSMu4dWnyvUMT64CMd3hgdoxlpV4_eWRIbARpjbuSusZExcQVqI-Xq0SPueLKjIrjS7SuGYChJwCMYsjI1yR1YyJJ-Bma_Hjh5lcYAY0ac68F2PLgGRiQvNvInFSb2oA3sD-oAaZTRJV_eX924aQI6nkpJrwK6ER956DSQ7iiM2etasjI0qh2XloPmpDnBg7ItCr15W68xr01-sDXZ97z9d_pkxSBafctRzFXFf1Z68JFoljcnH8mWsMmCWWelZaOJ4i01yE_VWhDthnV3yPPH7WzSltTBo9SX8hUQ0gMidRdyZLOLHOqzf8hc8sOBKXwGFC50tnT4cBng9Q9pl92PE8GfjYHImnGtwvEbKqsEZkV4IJvQSKNWSnN3Uu_I00wL4EUwxU7FsuylLwQNHOoNPzrvf43taulI9Wv2ydgySw_2KGLJ2YlTbqRyi4oVoCh9nq-s1NETnPiTlLqkDTvrBlPwpSB5OeWTiUXkT7bqMa4LQk9HGjr4oO6zzXvA5-MxWlAvm10szs6eNKDDClbkEmWRigdwje77n8xQ9SrbUtm2IojxM8yAITXDksf8g531jOJb946UIlr_E91_Wn8wucTBcpw4fwqSnPT8oWr-d9U4";

const RecyclerDashboard = () => {
  const navigate = useNavigate();
  const stats = useUserStats();
  const { toast } = useToast();
  const { globalMetrics, recentActivity: seededRecentActivity, quickActionStats, joinChallenge, challenges } = useRecycleHub();
  const { rvms } = useRVMData();
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>(seededRecentActivity);
  const [selectedAction, setSelectedAction] = useState<QuickActionKey | null>(null);
  const [claimedRewards, setClaimedRewards] = useState<Record<string, boolean>>({ bottle: false, ticket: false, voucher: false });
  const [showChallengesPanel, setShowChallengesPanel] = useState(() => {
    try {
      const stored = window.localStorage.getItem("recycler_dashboard_show_challenges_panel");
      return stored === null ? true : stored === "true";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("recycler_dashboard_show_challenges_panel", String(showChallengesPanel));
    } catch {
      // ignore
    }
  }, [showChallengesPanel]);

  // Handle quick action navigation
  useEffect(() => {
    if (selectedAction === "rewards") {
      // Navigate to rewards directly
      navigate("/recycler/rewards");
      setSelectedAction(null);
    }
  }, [selectedAction, navigate]);

  const quickActionSummaries: Record<QuickActionKey, { subtitle: string; badge?: { label: string; count: number; color: string } }> = {
    dashboard: {
      subtitle: "View overview",
    },
    nearbyRVMs: {
      subtitle: `${rvms.filter(r => r.fillPct < 90).length} available`,
      badge: { label: "RVMs", count: rvms.length, color: "bg-[#10B981]" },
    },
    leaderboard: {
      subtitle: `of ${quickActionStats.leaderboard.totalRecyclers}`,
    },
    myImpact: {
      subtitle: "Total waste diverted",
    },
    wallet: {
      subtitle: `Last earned +₹${quickActionStats.wallet.lastEarned}`,
    },
    rewards: {
      subtitle: `${quickActionStats.rewards.pointsToMilestone} pts to next`,
      badge: { label: "Rewards", count: quickActionStats.rewards.availableRewards, color: "bg-[#10B981]" },
    },
    achievements: {
      subtitle: "Badges earned",
      badge: { label: "Badges", count: quickActionStats.achievements.badgesEarned, color: "bg-[#10B981]" },
    },
    referrals: {
      subtitle: `${quickActionStats.referrals.pendingRewardCredits} credits pending`,
      badge: { label: "Referrals", count: quickActionStats.referrals.successfulReferrals, color: "bg-[#10B981]" },
    },
    learn: {
      subtitle: `${quickActionStats.learn.inProgress} in progress`,
      badge: { label: "Learning", count: quickActionStats.learn.inProgress, color: "bg-[#f6ad55]" },
    },
    community: {
      subtitle: `${quickActionStats.community.pendingMessages} messages`,
      badge: { label: "Messages", count: quickActionStats.community.pendingMessages, color: "bg-[#10B981]" },
    },
  };

  const quickActionCountProps: Record<QuickActionKey, { value: number; prefix?: string; suffix?: string; decimals?: number }> = {
    dashboard: { value: stats.coinBalance },
    nearbyRVMs: { value: rvms.filter(r => r.fillPct < 90).length },
    leaderboard: { value: quickActionStats.leaderboard.rank, prefix: "#" },
    myImpact: { value: quickActionStats.myImpact.totalWasteDivertedKg, suffix: " kg", decimals: 1 },
    wallet: { value: quickActionStats.wallet.balance, prefix: "₹" },
    rewards: { value: quickActionStats.rewards.availableRewards },
    achievements: { value: quickActionStats.achievements.badgesEarned, suffix: `/${quickActionStats.achievements.totalBadges}` },
    referrals: { value: quickActionStats.referrals.successfulReferrals },
    learn: { value: quickActionStats.learn.completedCourses },
    community: { value: quickActionStats.community.activeGroups },
  };

  const rewardOptions = [
    { id: "bottle", label: "Reusable Bottle", description: "Stainless eco bottle ready to claim", icon: Package, color: "bg-emerald-100 text-[#14532D]" },
    { id: "ticket", label: "Community Pass", description: "VIP event access for Recycler members", icon: Ticket, color: "bg-sky-100 text-sky-700" },
    { id: "voucher", label: "Carbon Voucher", description: "Instant ₹150 credit on your next pickup", icon: DollarSign, color: "bg-[#DCFCE7] text-[#14532D]" },
  ] as const;

  const displayCoinBalance = stats.coinBalance;

  return (
    <div className="min-h-screen w-full" style={{ background: "#F9FAFB" }}>

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b border-[#D1FAE5]" style={{ background: "rgba(249,250,251,0.95)", backdropFilter: "blur(12px)" }}>
        <h1 className="text-lg font-display font-bold text-[#1E293B]">GREEN LOOP — Recycler Dashboard</h1>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowChallengesPanel((v) => !v)}
        >
          {showChallengesPanel ? "Hide Challenges" : "Show Challenges"}
        </Button>
      </div>

      {/* ── Main content — two-column on large screens ── */}
      <div className="max-w-[1200px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">

        {/* LEFT: quick actions + content */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Heatmap CTA */}
          <Card
            className="overflow-hidden border-[#D1FAE5] cursor-pointer group hover:shadow-lg transition-shadow"
            onClick={() => window.open(HEATMAP_URL, "_blank", "noopener,noreferrer")}
          >
            <div className="relative bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] p-8 flex flex-col items-center justify-center gap-4 text-center min-h-[160px]">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 rounded-full border border-[#10B981]/20 animate-ping absolute" />
                <div className="w-48 h-48 rounded-full border border-[#10B981]/10 animate-ping absolute" style={{ animationDelay: "0.5s" }} />
              </div>
              <div className="relative z-10 w-14 h-14 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center group-hover:bg-[#10B981]/30 transition-colors">
                <Layers className="h-7 w-7 text-[#10B981]" />
              </div>
              <div className="relative z-10">
                <p className="font-display font-bold text-white text-lg">Live Plastic Heatmap</p>
                <p className="text-white/60 text-sm mt-1">View real-time hotspots and active collection zones</p>
              </div>
              <Button
                className="relative z-10 gap-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-full px-6"
                onClick={(e) => { e.stopPropagation(); window.open(HEATMAP_URL, "_blank", "noopener,noreferrer"); }}
              >
                <Layers className="h-4 w-4" /> Open Heatmap
              </Button>
            </div>
          </Card>

          {/* Quick action grid */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#475569] mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {quickActions.map((action) => (
                <motion.button
                  key={action.key}
                  whileHover={{ y: -2, scale: 1.02 }}
                  onClick={() => {
                    if (action.key === "rewards") navigate(action.path);
                    else setSelectedAction(action.key);
                  }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-[#D1FAE5] hover:border-[#10B981] hover:shadow-md transition-all text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] flex items-center justify-center">
                    <action.icon className="h-5 w-5 text-[#065F46]" />
                  </div>
                  <span className="text-xs font-semibold text-[#1E293B]">{action.label}</span>
                  <span className="text-[10px] text-[#475569]">{quickActionSummaries[action.key].subtitle}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#475569] mb-3">Recent Activity</h2>
            <Card className="divide-y divide-[#D1FAE5]">
              {recentActivity.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3">
                  <p className="text-sm text-[#1E293B] truncate flex-1">{item.desc}</p>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="text-xs font-bold text-[#10B981]">{item.pts}</span>
                    <span className="text-xs text-[#475569]">{item.date}</span>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* Nearest RVMs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#475569]">Nearest RVMs</h2>
              <Button size="sm" variant="ghost" className="text-xs text-[#14532D]" onClick={() => navigate("/recycler/profile")}>
                View all →
              </Button>
            </div>
            <div className="space-y-2">
              {[...rvms].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 4).map((rvm) => {
                const fillColor = rvm.fillPct >= 90 ? "text-red-600" : rvm.fillPct >= 70 ? "text-amber-600" : "text-[#14532D]";
                const barColor  = rvm.fillPct >= 90 ? "bg-red-500" : rvm.fillPct >= 70 ? "bg-amber-400" : "bg-[#10B981]";
                const statusLabel = rvm.fillPct >= 90 ? "Full" : rvm.fillPct >= 70 ? "Filling" : "Available";
                const statusBadge = rvm.fillPct >= 90
                  ? "bg-red-100 text-red-700 border-red-200"
                  : rvm.fillPct >= 70
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-[#DCFCE7] text-[#14532D] border-[#D1FAE5]";
                const LocIcon = rvm.locationType === "metro_station" ? Train
                  : rvm.locationType === "mall" ? ShoppingBag
                  : rvm.locationType === "bus_stand" ? Bus
                  : Building2;
                return (
                  <motion.div key={rvm.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="p-3 border-[#D1FAE5] flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] flex items-center justify-center shrink-0">
                        <LocIcon className="h-4 w-4 text-[#14532D]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold truncate">{rvm.name}</p>
                          <Badge variant="outline" className={`text-[10px] shrink-0 ${statusBadge}`}>{statusLabel}</Badge>
                        </div>
                        <p className="text-xs text-[#475569] mb-1.5">{LOCATION_LABELS[rvm.locationType]} · {rvm.distanceKm} km</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${rvm.fillPct}%` }} />
                          </div>
                          <span className={`text-[10px] font-bold shrink-0 ${fillColor}`}>{rvm.fillPct}%</span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Challenges panel — natural document flow */}
        {showChallengesPanel && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full lg:w-80 shrink-0 space-y-4"
          >
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#475569]">Active Challenges</h2>

            {/* Challenges list — no fixed height, expands naturally */}
            <div className="flex flex-col gap-5 pb-10">
              {challenges && challenges.length > 0 ? (
                challenges.map((challenge: any, idx: number) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div
                      className="rounded-2xl border bg-white p-4 space-y-3 hover:shadow-md transition-all"
                      style={{ borderColor: "#D1FAE5", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#1E293B] truncate">{challenge.title}</p>
                          <p className="text-xs text-[#475569] mt-0.5">{challenge.locationName}</p>
                        </div>
                        {/* Points — bright mint badge */}
                        <span className="shrink-0 rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-xs font-bold text-[#059669]">
                          {challenge.points} pts
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="bg-[#F0FDF4] border border-[#D1FAE5] text-[#475569] px-2 py-0.5 rounded-full">{challenge.targetImpactKg} kg target</span>
                        <span className="text-[#475569]">{challenge.participants || 1} participants</span>
                      </div>

                      <Progress value={Math.min(100, (challenge.participants || 1) * 20)} className="h-1.5" />

                      <Button
                        size="sm"
                        className={`w-full ${challenge.joined
                          ? "bg-[#F1F5F9] text-[#475569] hover:bg-[#F1F5F9] cursor-default"
                          : "bg-[#DCFCE7] text-[#14532D] hover:bg-[#A7F3D0] border-0"
                        }`}
                        disabled={challenge.joined}
                        onClick={async () => {
                          const joined = await joinChallenge(challenge.id);
                          toast({
                            title: joined ? "🎯 Challenge joined!" : "Already joined",
                            description: joined
                              ? `You're now participating in ${challenge.title}`
                              : `You're already in ${challenge.title}.`,
                            variant: joined ? "success" : "default",
                          });
                        }}
                      >
                        {challenge.joined ? "Joined ✓" : <>Join Challenge <ChevronRight className="h-3 w-3" /></>}
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-2xl border border-[#D1FAE5] bg-white p-10 text-center">
                  <Trophy className="h-8 w-8 text-[#D1FAE5] mx-auto mb-3" />
                  <p className="text-sm font-medium text-[#475569]">No challenges available right now.</p>
                  <p className="text-xs text-[#94A3B8] mt-1">Check back soon for new missions.</p>
                </div>
              )}
            </div>

            {/* Community chat shortcut */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate("/community")}
            >
              <MessageCircle className="h-4 w-4" /> Open Community
            </Button>
          </motion.div>
        )}
      </div>

      {/* Quick action detail dialog */}
      {selectedAction && selectedAction !== "rewards" && (
        <Dialog open={!!selectedAction} onOpenChange={() => setSelectedAction(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#1E293B] text-xl">
                <CountUp {...quickActionCountProps[selectedAction]} />
              </DialogTitle>
              <DialogDescription className="text-[#475569]">
                {quickActionSummaries[selectedAction].subtitle}
              </DialogDescription>
            </DialogHeader>
            <div className="text-sm text-[#475569]">
              {selectedAction === "myImpact" && (
                <p>Equivalent to {Math.round(quickActionStats.myImpact.totalWasteDivertedKg / 0.024)} plastic bottles avoided.</p>
              )}
              {selectedAction === "nearbyRVMs" && (
                <p>{rvms.filter(r => r.fillPct < 90).length} RVMs available nearby. {rvms.filter(r => r.fillPct >= 90).length} are full — avoid those.</p>
              )}
              {selectedAction === "leaderboard" && (
                <p>Top {Math.round((quickActionStats.leaderboard.rank / quickActionStats.leaderboard.totalRecyclers) * 100)}% of all recyclers.</p>
              )}
            </div>
            <Button className="w-full" onClick={() => {
              const path = quickActions.find((a) => a.key === selectedAction)?.path || "/";
              setSelectedAction(null);
              navigate(path);
            }}>
              View Details <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RecyclerDashboard;
