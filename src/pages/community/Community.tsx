import { useState } from "react";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare, Trophy, ThumbsUp, Clock, Users, Target,
  Share2, MapPin, Flame, Leaf, Calendar, Navigation,
} from "lucide-react";

const forumPosts = [
  { id: 1, author: "Priya S.", title: "Best way to clean plastic before recycling?", replies: 12, likes: 24, time: "2h ago", badge: "🏅 Helpful" },
  { id: 2, author: "Rohit M.", title: "How I reduced my household plastic by 80%", replies: 8, likes: 45, time: "5h ago", badge: "🌟 Popular" },
  { id: 3, author: "Anita K.", title: "Which types of packaging are hardest to recycle?", replies: 6, likes: 15, time: "1d ago", badge: "" },
  { id: 4, author: "Vikram P.", title: "My experience as a first-time recycler", replies: 3, likes: 10, time: "2d ago", badge: "" },
];

const challenges = [
  {
    id: 1, title: "Weekend Heatmap: Sector 7 Cleanup",
    desc: "High plastic density detected in Sector 7. Collect and scan to earn bonus credits!",
    progress: 18, target: 50, unit: "kg", reward: 10, endsIn: "2 days",
    participants: 86, isHeatmap: true,
    location: "Sector 7, Noida",
    density: "High",
  },
  {
    id: 2, title: "March Madness: Recycle 50 kg",
    desc: "Recycle 50 kg of plastic this month for bonus carbon credits",
    progress: 25, target: 50, unit: "kg", reward: 25, endsIn: "23 days",
    participants: 1240, isHeatmap: false,
    location: "",
    density: "",
  },
  {
    id: 3, title: "Zero Waste Week",
    desc: "Complete 5 pickups in one week with zero cancellations",
    progress: 2, target: 5, unit: "pickups", reward: 15, endsIn: "4 days",
    participants: 560, isHeatmap: false,
    location: "",
    density: "",
  },
  {
    id: 4, title: "Weekend Heatmap: Marine Drive",
    desc: "Coastal hotspot reported. AI-verified scan awards 2× credits!",
    progress: 5, target: 30, unit: "kg", reward: 20, endsIn: "1 day",
    participants: 42, isHeatmap: true,
    location: "Marine Drive, Mumbai",
    density: "Critical",
  },
];

const topCarbonEarners = [
  { id: 1, name: "Meera Joshi", credits: 2450, kg: 490, avatar: "MJ", rank: 1 },
  { id: 2, name: "Arun Thakur", credits: 1800, kg: 360, avatar: "AT", rank: 2 },
  { id: 3, name: "Lakshmi R.", credits: 1250, kg: 250, avatar: "LR", rank: 3 },
  { id: 4, name: "Vikram P.", credits: 980, kg: 196, avatar: "VP", rank: 4 },
  { id: 5, name: "Priya S.", credits: 720, kg: 144, avatar: "PS", rank: 5 },
];

const Community = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState("forum");
  const [joinedChallenges, setJoinedChallenges] = useState<number[]>([]);

  const handleJoinChallenge = (id: number, title: string) => {
    setJoinedChallenges((prev) => [...prev, id]);
    toast({ title: "Challenge accepted! 🎯", description: `You've joined "${title}". Navigate to the hotspot to start collecting.` });
  };

  return (
    <div className="min-h-screen bg-background/40">
      <PageBackground type="oceanPlastic" overlay="bg-foreground/50" />

      <div className="container mx-auto px-4 py-6 max-w-lg">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="forum" className="flex-1">Forum</TabsTrigger>
            <TabsTrigger value="challenges" className="flex-1">Challenges</TabsTrigger>
            <TabsTrigger value="stories" className="flex-1">Top Earners</TabsTrigger>
          </TabsList>

          {/* Forum Tab */}
          <TabsContent value="forum">
            <Button className="w-full mb-4 gap-2">
              <MessageSquare className="h-4 w-4" /> Start a Discussion
            </Button>
            <div className="space-y-3">
              {forumPosts.map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="p-4 cursor-pointer hover:shadow-soft transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm flex-1 pr-2">{post.title}</h3>
                      {post.badge && <Badge variant="secondary" className="text-[10px] shrink-0">{post.badge}</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{post.author}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.time}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {post.replies}</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {post.likes}</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges">
            <div className="space-y-3">
              {challenges.map((ch, i) => {
                const joined = joinedChallenges.includes(ch.id);
                return (
                  <motion.div key={ch.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className={`p-5 ${ch.isHeatmap ? "border-l-4 border-l-destructive" : ""}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {ch.isHeatmap ? (
                            <Flame className="h-5 w-5 text-destructive" />
                          ) : (
                            <Target className="h-5 w-5 text-primary" />
                          )}
                          <h3 className="font-semibold text-sm">{ch.title}</h3>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          <Clock className="h-2.5 w-2.5 mr-1" /> {ch.endsIn}
                        </Badge>
                      </div>

                      {ch.isHeatmap && ch.location && (
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-3 w-3 text-destructive" />
                          <span className="text-xs font-medium">{ch.location}</span>
                          <Badge className={`text-[10px] ${ch.density === "Critical" ? "bg-destructive" : "bg-orange-500"} text-white border-0`}>
                            {ch.density} Density
                          </Badge>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mb-3">{ch.desc}</p>
                      <Progress value={(ch.progress / ch.target) * 100} className="h-2 mb-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{ch.progress}/{ch.target} {ch.unit}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {ch.participants.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <Badge className="text-[10px] bg-emerald/10 text-emerald border-0">
                          <Leaf className="h-2.5 w-2.5 mr-1" /> {ch.reward} Bonus Carbon Credits
                        </Badge>
                        {joined ? (
                          <Button size="sm" variant="outline" className="text-xs gap-1">
                            <Navigation className="h-3 w-3" /> Navigate
                          </Button>
                        ) : (
                          <Button size="sm" className="text-xs bg-emerald hover:bg-emerald/90 text-emerald-foreground" onClick={() => handleJoinChallenge(ch.id, ch.title)}>
                            Join Challenge
                          </Button>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Top Carbon Earners Tab */}
          <TabsContent value="stories">
            <div className="space-y-3">
              {topCarbonEarners.map((earner, i) => (
                <motion.div key={earner.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      earner.rank === 1 ? "bg-gold text-gold-foreground" :
                      earner.rank === 2 ? "bg-muted text-muted-foreground" :
                      earner.rank === 3 ? "bg-earth text-earth-foreground" :
                      "bg-accent text-accent-foreground"
                    }`}>
                      {earner.rank <= 3 ? ["🥇", "🥈", "🥉"][earner.rank - 1] : earner.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{earner.name}</p>
                      <p className="text-xs text-muted-foreground">{earner.kg} kg recycled</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-emerald">{earner.credits.toLocaleString("en-IN")}</p>
                      <p className="text-[10px] text-muted-foreground">Carbon Credits</p>
                    </div>
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

export default Community;
