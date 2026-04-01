import { useState, useEffect } from "react";
import { motion, animate, useMotionValue, AnimatePresence } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QRCodeDisplay } from "@/components/recycler/QRCodeDisplay";
import { PickerMapTracker } from "@/components/recycler/PickerMapTracker";
import { useUserStats } from "@/hooks/useUserStats";
import { useRecycleHub } from "@/hooks/useRecycleHub";
import { useToast } from "@/hooks/use-toast";
import { HeatmapPoint } from "@/hooks/useHeatmapData";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, CalendarPlus, Trophy, Leaf, Wallet, BookOpen, Users, Gift,
  Award, Share2, Coins, ChevronRight, QrCode, MessageCircle,
  Package, Ticket, DollarSign,
} from "lucide-react";

const quickActions = [
  { key: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/recycler/dashboard", color: "bg-cyan-500" },
  { key: "bookPickup", icon: CalendarPlus, label: "Book Pickup", path: "/recycler/booking", color: "bg-emerald-500" },
  { key: "leaderboard", icon: Trophy, label: "Leaderboard", path: "/recycler/leaderboard", color: "bg-sky-500" },
  { key: "myImpact", icon: Leaf, label: "My Impact", path: "/recycler/impact", color: "bg-emerald-600" },
  { key: "wallet", icon: Wallet, label: "Wallet", path: "/recycler/wallet", color: "bg-yellow-500" },
  { key: "rewards", icon: Gift, label: "Rewards", path: "/recycler/rewards", color: "bg-fuchsia-500" },
  { key: "achievements", icon: Award, label: "Achievements", path: "/recycler/achievements", color: "bg-violet-500" },
  { key: "referrals", icon: Share2, label: "Referrals", path: "/recycler/referral", color: "bg-cyan-500" },
  { key: "learn", icon: BookOpen, label: "Learn", path: "/education/knowledge-hub", color: "bg-indigo-500" },
  { key: "community", icon: Users, label: "Community", path: "/community", color: "bg-rose-500" },
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

const RecyclerDashboard = () => {
  const navigate = useNavigate();
  const stats = useUserStats();
  const { toast } = useToast();
  const { globalMetrics, recentActivity: seededRecentActivity, quickActionStats, joinChallenge, challenges } = useRecycleHub();
  const [showQR, setShowQR] = useState(false);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>(seededRecentActivity);
  const [latestHeatmapEvent, setLatestHeatmapEvent] = useState<HeatmapPoint | null>(null);
  const [simulatedCoinDelta, setSimulatedCoinDelta] = useState(0);
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

  const handleHeatmapEvent = (payload: { latestPoint: HeatmapPoint; liveCount: number; coinBalanceDelta: number }) => {
    setLatestHeatmapEvent(payload.latestPoint);
    setSimulatedCoinDelta(payload.coinBalanceDelta);
  };

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
    bookPickup: {
      subtitle: quickActionStats.bookPickup.nextScheduled,
      badge: { label: "Recent", count: quickActionStats.bookPickup.recentPickups, color: "bg-emerald-500" },
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
      badge: { label: "Rewards", count: quickActionStats.rewards.availableRewards, color: "bg-emerald-500" },
    },
    achievements: {
      subtitle: "Badges earned",
      badge: { label: "Badges", count: quickActionStats.achievements.badgesEarned, color: "bg-sky-500" },
    },
    referrals: {
      subtitle: `${quickActionStats.referrals.pendingRewardCredits} credits pending`,
      badge: { label: "Referrals", count: quickActionStats.referrals.successfulReferrals, color: "bg-emerald-500" },
    },
    learn: {
      subtitle: `${quickActionStats.learn.inProgress} in progress`,
      badge: { label: "Learning", count: quickActionStats.learn.inProgress, color: "bg-amber-500" },
    },
    community: {
      subtitle: `${quickActionStats.community.pendingMessages} messages`,
      badge: { label: "Messages", count: quickActionStats.community.pendingMessages, color: "bg-rose-500" },
    },
  };

  const quickActionCountProps: Record<QuickActionKey, { value: number; prefix?: string; suffix?: string; decimals?: number }> = {
    dashboard: { value: stats.coinBalance },
    bookPickup: { value: quickActionStats.bookPickup.recentPickups },
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
    { id: "bottle", label: "Reusable Bottle", description: "Stainless eco bottle ready to claim", icon: Package, color: "bg-emerald-100 text-emerald-700" },
    { id: "ticket", label: "Community Pass", description: "VIP event access for Recycler members", icon: Ticket, color: "bg-sky-100 text-sky-700" },
    { id: "voucher", label: "Carbon Voucher", description: "Instant ₹150 credit on your next pickup", icon: DollarSign, color: "bg-amber-100 text-amber-700" },
  ] as const;

  const displayCoinBalance = stats.coinBalance + simulatedCoinDelta;

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* Full-screen map background - z-0 base layer */}
      <div className="absolute inset-0 z-0">
        <PickerMapTracker
          role="recycler"
          title="GREEN LOOP live map"
          onHeatmapEvent={handleHeatmapEvent}
        />
      </div>

      {/* Content overlay container - z-50 for UI elements, map is z-0 */}
      <div className="absolute inset-0 z-50 pointer-events-none overflow-visible">
        <div className="absolute top-6 left-6 pointer-events-auto">
          <Button
            size="sm"
            variant="outline"
            className="bg-[#020617]/70 text-white border-white/10 hover:bg-[#020617]/90"
            onClick={() => setShowChallengesPanel((v) => !v)}
          >
            {showChallengesPanel ? "Hide Dashboard" : "Show Dashboard"}
          </Button>
        </div>
        
        {/* RIGHT SIDE: Challenges Panel - Narrower & Tall */}
        <AnimatePresence>
          {showChallengesPanel && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="absolute top-8 right-8 bottom-8 w-72 pointer-events-auto flex flex-col"
              style={selectedAction !== null ? { pointerEvents: "none", visibility: "hidden", opacity: 0 } : { pointerEvents: "auto", visibility: "visible", opacity: 1 }}
            >
                <div className="rounded-2xl bg-[#020617]/90 backdrop-blur-3xl border border-emerald-500/20 shadow-2xl flex flex-col flex-1 p-5 min-h-0">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white drop-shadow-md mb-4 shrink-0">Active Challenges</h3>
                  <div className="space-y-3 overflow-y-auto flex-1 pr-2 scrollbar-emerald min-h-0">
                    {challenges && challenges.length > 0 ? (
                      challenges.slice(0, 4).map((challenge: any, idx: number) => (
                        <motion.div
                          key={challenge.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="rounded-lg bg-slate-900/50 backdrop-blur-md border border-white/10 hover:border-emerald-500/30 p-3 transition-all hover:shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white uppercase tracking-[0.1em] drop-shadow-md truncate">{challenge.title}</p>
                              <p className="text-xs font-bold text-emerald-400 drop-shadow-md mt-0.5">{challenge.targetImpactKg} kg</p>
                            </div>
                            <Trophy className="h-4 w-4 text-amber-400 flex-shrink-0 drop-shadow-md shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                          </div>
                          <div className="mb-2">
                            <Progress value={Math.min(100, (challenge.participants || 1) * 20)} className="h-1.5 rounded-full bg-white/10" />
                            <p className="text-xs text-slate-400 drop-shadow-md mt-1">{challenge.participants || 1} participants</p>
                          </div>
                          <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg text-xs h-7 shadow-lg hover:shadow-[0_0_16px_rgba(16,185,129,0.4)]"
                            disabled={challenge.joined}
                            onClick={async () => {
                              const joined = await joinChallenge(challenge.id);
                              toast({
                                title: joined ? "🎯 Challenge joined!" : "Already joined",
                                description: joined ? `You're now participating in ${challenge.title}` : `You're already in ${challenge.title}.`,
                                variant: joined ? "success" : "default",
                              });
                            }}
                          >
                            {challenge.joined ? "Joined" : <>Join <ChevronRight className="h-3 w-3 ml-1" /></>}
                          </Button>
                        </motion.div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-20 text-center">
                        <p className="text-xs text-slate-400 drop-shadow-md">No active challenges</p>
                      </div>
                    )}
                  </div>
                </div>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedAction && selectedAction !== "rewards" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          >
            <Dialog open={!!selectedAction && selectedAction !== "rewards"} onOpenChange={() => setSelectedAction(null)}>
              <DialogContent className="rounded-2xl bg-[#020617]/95 backdrop-blur-3xl border border-emerald-500/20 shadow-2xl max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white text-xl drop-shadow-md">
                    <CountUp {...quickActionCountProps[selectedAction]} />
                  </DialogTitle>
                  <DialogDescription className="text-emerald-400 drop-shadow-md">{quickActionSummaries[selectedAction].subtitle}</DialogDescription>
                </DialogHeader>
                <div className="text-sm text-slate-300 drop-shadow-md">
                  {selectedAction === "myImpact" && (
                    <div>Equivalent to {Math.round(quickActionStats.myImpact.totalWasteDivertedKg / 0.024)} plastic bottles avoided.</div>
                  )}
                  {selectedAction === "bookPickup" && (
                    <>Recent: {quickActionStats.bookPickup.recentPickups} pickups</>
                  )}
                  {selectedAction === "leaderboard" && (
                    <>Top {Math.round((quickActionStats.leaderboard.rank / quickActionStats.leaderboard.totalRecyclers) * 100)}% of recyclers</>
                  )}
                </div>
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]" onClick={() => {
                  const path = quickActions.find((a) => a.key === selectedAction)?.path || '/';
                  setSelectedAction(null);
                  navigate(path);
                }}>
                  View Details <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </DialogContent>
            </Dialog>
          </motion.div>
        )}

        {/* AI CHAT BUTTON - Bottom Right with Gradient Glow */}
        <motion.button
          initial={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.12 }}
          onClick={() => navigate("/community")}
          className="absolute bottom-8 right-8 pointer-events-auto z-[80]"
          style={{ display: "block", visibility: "visible" }}
        >
          <div className="relative">
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(16, 185, 129, 0.6), 0 0 40px rgba(6, 182, 212, 0.3)",
                  "0 0 40px rgba(16, 185, 129, 0.8), 0 0 60px rgba(6, 182, 212, 0.5)",
                  "0 0 20px rgba(16, 185, 129, 0.6), 0 0 40px rgba(6, 182, 212, 0.3)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-full blur-xl"
            />
            <Button className="relative rounded-full h-16 w-16 bg-gradient-to-br from-emerald-500 via-emerald-400 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-xl flex items-center justify-center group border-2 border-white/50">
              <MessageCircle className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
            </Button>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default RecyclerDashboard;
