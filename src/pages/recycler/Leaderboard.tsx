import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useRecycleHub } from "@/hooks/useRecycleHub";

import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Trophy, Medal, Crown, Share2, TrendingUp } from "lucide-react";

const Leaderboard = () => {
  const [period, setPeriod] = useState("monthly");
  const { leaderboardUsers } = useRecycleHub();

  // Sort by credits (highest first) to get dynamic ranking
  const sortedUsers = useMemo(() => {
    return [...leaderboardUsers].sort((a, b) => b.credits - a.credits);
  }, [leaderboardUsers]);

  const handleShare = (rank: number, name: string) => {
    const text = `I'm ranked #${rank}${name === "You" ? "" : ` as ${name}`} on EcoSync! Join me in saving the planet 🌍 #EcoSync`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-screen bg-background/40">
      <PageBackground type="recycling" overlay="bg-foreground/50" />

      <div className="container mx-auto px-4 py-6 max-w-lg">
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="w-full mb-6">
            <TabsTrigger value="weekly" className="flex-1">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1">Monthly</TabsTrigger>
            <TabsTrigger value="alltime" className="flex-1">All Time</TabsTrigger>
          </TabsList>

          <TabsContent value={period}>
            {/* Top 3 podium */}
            <div className="flex items-end justify-center gap-3 mb-8">
              {[sortedUsers[1], sortedUsers[0], sortedUsers[2]].map((user, i) => {
                const heights = ["h-24", "h-32", "h-20"];
                const sizes = ["w-12 h-12", "w-16 h-16", "w-12 h-12"];
                const badges = ["🥈", "🥇", "🥉"];
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-2xl mb-1">{badges[i]}</span>
                    <div className={`${sizes[i]} rounded-full bg-hero-gradient flex items-center justify-center text-primary-foreground font-bold text-sm mb-2`}>
                      {user.avatar}
                    </div>
                    <p className="text-xs font-semibold text-center mb-1">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground mb-2">{user.kgRecycled} kg</p>
                    <div className={`${heights[i]} w-20 rounded-t-xl ${i === 1 ? "bg-hero-gradient" : "bg-muted"} flex items-end justify-center pb-2`}>
                      <span className={`text-xs font-bold ${i === 1 ? "text-primary-foreground" : "text-muted-foreground"}`}>
                        #{user.rank}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Rest of leaderboard */}
            <div className="space-y-2">
              {sortedUsers.slice(3).map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                >
                  <Card className={`p-4 flex items-center gap-3 ${user.isCurrentUser ? "border-emerald-400 bg-emerald-500/10" : ""}`}>
                    <span className="w-8 text-center font-display font-bold text-muted-foreground">
                      #{user.rank}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-sm font-bold text-white">
                      {user.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {user.name} {user.isCurrentUser && <Badge className="ml-1 text-[10px] bg-emerald-500">You</Badge>}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.kgRecycled} kg • {user.credits.toLocaleString()} credits</p>
                    </div>
                    {user.isCurrentUser && (
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => handleShare(user.rank, user.name)}>
                        <Share2 className="h-3 w-3" />
                      </Button>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
};

export default Leaderboard;
