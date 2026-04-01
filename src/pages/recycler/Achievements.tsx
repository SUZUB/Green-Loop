import { useState } from "react";
import { motion } from "framer-motion";

import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { CertificateModal } from "@/components/recycler/CertificateModal";
import { useUserStats, BADGE_DEFS } from "@/hooks/useUserStats";
import { Share2, Award, Loader2 } from "lucide-react";

const getBadgeProgress = (key: string, stats: ReturnType<typeof useUserStats>) => {
  const map: Record<string, { current: string; requirement: string; progress: number }> = {
    plastic_saver: { current: `${stats.totalPickups} pickup`, requirement: "1 pickup", progress: Math.min(stats.totalPickups / 1 * 100, 100) },
    eco_warrior: { current: `${stats.totalRecycledKg} kg`, requirement: "100 kg", progress: Math.min(stats.totalRecycledKg / 100 * 100, 100) },
    green_champion: { current: `${stats.totalRecycledKg} kg`, requirement: "500 kg", progress: Math.min(stats.totalRecycledKg / 500 * 100, 100) },
    consistency_king: { current: `${stats.consecutiveWeeks} weeks`, requirement: "10 weeks", progress: Math.min(stats.consecutiveWeeks / 10 * 100, 100) },
    community_hero: { current: `${stats.referralCount} referral`, requirement: "5 referrals", progress: Math.min(stats.referralCount / 5 * 100, 100) },
    planet_guardian: { current: `${stats.co2Saved.toFixed(1)} kg CO₂`, requirement: "1,000 kg CO₂", progress: Math.min(stats.co2Saved / 1000 * 100, 100) },
    ocean_protector: { current: `${stats.animalsSaved} animals`, requirement: "100 animals", progress: Math.min(stats.animalsSaved / 100 * 100, 100) },
    zero_waste_hero: { current: `${stats.totalPickups} pickups`, requirement: "50 pickups", progress: Math.min(stats.totalPickups / 50 * 100, 100) },
  };
  return map[key] || { current: "0", requirement: "?", progress: 0 };
};

const handleShare = (badge: { name: string; unlocked: boolean }) => {
  const text = badge.unlocked
    ? `I just earned the "${badge.name}" badge on GREEN LOOP! 🎉 Join me in saving the planet 🌍`
    : `I'm working towards the "${badge.name}" badge on GREEN LOOP! 💪🌍`;
  if (navigator.share) {
    navigator.share({ text });
  } else {
    navigator.clipboard.writeText(text);
  }
};

const Achievements = () => {
  const stats = useUserStats();
  const [certOpen, setCertOpen] = useState(false);

  const earnedKeys = new Set(stats.earnedBadges.map((b) => {
    const def = BADGE_DEFS.find((d) => d.name === b.name);
    return def?.key;
  }));

  const allBadges = BADGE_DEFS.map((def) => {
    const unlocked = earnedKeys.has(def.key);
    const earned = stats.earnedBadges.find((b) => b.name === def.name);
    const prog = getBadgeProgress(def.key, stats);
    return { ...def, unlocked, date: earned?.date, ...prog };
  });

  const unlocked = allBadges.filter((b) => b.unlocked);
  const locked = allBadges.filter((b) => !b.unlocked);

  if (stats.isLoading) {
    return (
      <div className="min-h-screen bg-background/40 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/40">
      <PageBackground type="recycling" overlay="bg-foreground/50" />

      <div className="container mx-auto px-4 py-6 max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted-foreground">
            {unlocked.length} of {allBadges.length} badges unlocked
          </motion.p>
          {unlocked.length > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Button size="sm" className="gap-1.5" onClick={() => setCertOpen(true)}>
                <Award className="h-4 w-4" /> Get Certificate
              </Button>
            </motion.div>
          )}
        </div>

        {unlocked.length > 0 && (
          <>
            <h2 className="text-lg font-display font-bold mb-3 text-primary">🏆 Unlocked</h2>
            <div className="space-y-3 mb-8">
              {unlocked.map((badge, i) => (
                <motion.div key={badge.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="p-4 border-primary/30 bg-accent/50">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{badge.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{badge.name}</h3>
                          <Badge className="text-[10px]">Unlocked</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{badge.desc}</p>
                        {badge.date && <p className="text-[10px] text-muted-foreground mt-1">Earned on {badge.date}</p>}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleShare(badge)}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}

        <h2 className="text-lg font-display font-bold mb-3">🔒 In Progress</h2>
        <div className="space-y-3">
          {locked.map((badge, i) => (
            <motion.div key={badge.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }}>
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl opacity-40">{badge.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{badge.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{badge.desc}</p>
                    <div className="mt-2 space-y-1">
                      <Progress value={badge.progress} className="h-1.5" />
                      <p className="text-[10px] text-muted-foreground">{badge.current} / {badge.requirement}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <CertificateModal
        open={certOpen}
        onOpenChange={setCertOpen}
        userName={stats.fullName}
        totalRecycled={`${stats.totalRecycledKg} kg`}
        co2Saved={`${stats.co2Saved.toFixed(1)} kg`}
        animalsSaved={stats.animalsSaved}
        badges={stats.earnedBadges}
      />

    </div>
  );
};

export default Achievements;
