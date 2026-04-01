import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare, Trophy, ThumbsUp, Clock, Users, Target,
  Share2, MapPin, Flame, Leaf, Calendar, Navigation, X, Send,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface ForumPost {
  id: number;
  author: string;
  title: string;
  body: string;
  replies: number;
  likes: number;
  time: string;
  badge: string;
  comments: { author: string; text: string; time: string }[];
}

interface Challenge {
  id: number;
  title: string;
  desc: string;
  progress: number;
  target: number;
  unit: string;
  reward: number;
  endsIn: string;
  participants: number;
  isHeatmap: boolean;
  location: string;
  lat?: number;
  lng?: number;
  density: string;
}

// ── Static data ───────────────────────────────────────────────────────────────

const initialPosts: ForumPost[] = [
  {
    id: 1, author: "Priya S.", time: "2h ago", badge: "🏅 Helpful", likes: 24, replies: 2,
    title: "Best way to clean plastic before recycling?",
    body: "I've been rinsing bottles with water but wondering if there's a more efficient method. Any tips from experienced recyclers?",
    comments: [
      { author: "Rohit M.", text: "A quick rinse is enough — just remove food residue. No need to scrub.", time: "1h ago" },
      { author: "Anita K.", text: "I use a bottle brush for narrow-neck containers. Makes a big difference!", time: "45m ago" },
    ],
  },
  {
    id: 2, author: "Rohit M.", time: "5h ago", badge: "🌟 Popular", likes: 45, replies: 1,
    title: "How I reduced my household plastic by 80%",
    body: "Switched to reusable bags, glass containers, and bar soap. The biggest win was refusing single-use packaging at the source.",
    comments: [
      { author: "Priya S.", text: "Inspiring! I'm going to try the bar soap switch this week.", time: "4h ago" },
    ],
  },
  {
    id: 3, author: "Anita K.", time: "1d ago", badge: "", likes: 15, replies: 1,
    title: "Which types of packaging are hardest to recycle?",
    body: "Multi-layer packaging (like chip bags) and black plastic trays are the worst — most facilities can't process them.",
    comments: [
      { author: "Vikram P.", text: "Black plastic is a nightmare. The sorting machines can't detect it.", time: "20h ago" },
    ],
  },
  {
    id: 4, author: "Vikram P.", time: "2d ago", badge: "", likes: 10, replies: 1,
    title: "My experience as a first-time recycler",
    body: "Booked my first pickup last week. The picker arrived on time and the whole process took under 10 minutes. Highly recommend!",
    comments: [
      { author: "Anita K.", text: "Welcome to the community! It only gets easier from here 🌱", time: "1d ago" },
    ],
  },
];

const challenges: Challenge[] = [
  {
    id: 1, title: "Weekend Heatmap: Sector 7 Cleanup",
    desc: "High plastic density detected in Sector 7. Collect and scan to earn bonus credits!",
    progress: 18, target: 50, unit: "kg", reward: 10, endsIn: "2 days",
    participants: 86, isHeatmap: true,
    location: "Sector 7, Noida",
    lat: 28.5355, lng: 77.3910,
    density: "High",
  },
  {
    id: 2, title: "March Madness: Recycle 50 kg",
    desc: "Recycle 50 kg of plastic this month for bonus carbon credits",
    progress: 25, target: 50, unit: "kg", reward: 25, endsIn: "23 days",
    participants: 1240, isHeatmap: false,
    location: "", density: "",
  },
  {
    id: 3, title: "Zero Waste Week",
    desc: "Complete 5 pickups in one week with zero cancellations",
    progress: 2, target: 5, unit: "pickups", reward: 15, endsIn: "4 days",
    participants: 560, isHeatmap: false,
    location: "", density: "",
  },
  {
    id: 4, title: "Weekend Heatmap: Marine Drive",
    desc: "Coastal hotspot reported. AI-verified scan awards 2× credits!",
    progress: 5, target: 30, unit: "kg", reward: 20, endsIn: "1 day",
    participants: 42, isHeatmap: true,
    location: "Marine Drive, Mumbai",
    lat: 18.9438, lng: 72.8231,
    density: "Critical",
  },
];

const topCarbonEarners = [
  { id: 1, name: "Meera Joshi",  credits: 2450, kg: 490, avatar: "MJ", rank: 1 },
  { id: 2, name: "Arun Thakur", credits: 1800, kg: 360, avatar: "AT", rank: 2 },
  { id: 3, name: "Lakshmi R.",  credits: 1250, kg: 250, avatar: "LR", rank: 3 },
  { id: 4, name: "Vikram P.",   credits: 980,  kg: 196, avatar: "VP", rank: 4 },
  { id: 5, name: "Priya S.",    credits: 720,  kg: 144, avatar: "PS", rank: 5 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Opens Google Maps directions to the given lat/lng or address string. */
function openGoogleMaps(lat?: number, lng?: number, address?: string) {
  let url: string;
  if (lat !== undefined && lng !== undefined) {
    url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  } else if (address) {
    url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`;
  } else {
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

function shareText(text: string) {
  if (navigator.share) {
    navigator.share({ text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text);
  }
}

// ── Forum post detail modal ───────────────────────────────────────────────────

function PostModal({
  post,
  onClose,
  onLike,
}: {
  post: ForumPost;
  onClose: () => void;
  onLike: (id: number) => void;
}) {
  const { toast } = useToast();
  const [comments, setComments] = useState(post.comments);
  const [input, setInput] = useState("");

  const handleComment = () => {
    const text = input.trim();
    if (!text) return;
    setComments((prev) => [...prev, { author: "You", text, time: "Just now" }]);
    setInput("");
    toast({ title: "Comment posted!" });
  };

  const handleShare = () => {
    shareText(`Check out this discussion on GREEN LOOP: "${post.title}"`);
    toast({ title: "Link copied to clipboard!" });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-border">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">{post.author} · {post.time}</p>
            <h3 className="font-display font-semibold text-base">{post.title}</h3>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 -mt-1" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body + comments */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{post.body}</p>

          <div className="flex items-center gap-3 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => { onLike(post.id); toast({ title: "Liked! 👍" }); }}
            >
              <ThumbsUp className="h-3.5 w-3.5" /> {post.likes} Likes
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={handleShare}>
              <Share2 className="h-3.5 w-3.5" /> Share
            </Button>
          </div>

          {comments.length > 0 && (
            <div className="space-y-3 pt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {comments.length} {comments.length === 1 ? "Reply" : "Replies"}
              </p>
              {comments.map((c, i) => (
                <div key={i} className="rounded-xl bg-muted/50 px-4 py-3">
                  <p className="text-xs font-semibold mb-1">{c.author} <span className="font-normal text-muted-foreground">· {c.time}</span></p>
                  <p className="text-sm">{c.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment input */}
        <div className="p-4 border-t border-border flex gap-2">
          <Input
            placeholder="Write a reply..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleComment()}
            className="flex-1"
          />
          <Button size="icon" onClick={handleComment} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── New post modal ────────────────────────────────────────────────────────────

function NewPostModal({ onClose, onPost }: { onClose: () => void; onPost: (title: string, body: string) => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-display font-semibold">Start a Discussion</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="p-5 space-y-3">
          <Input
            placeholder="Discussion title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />
          <textarea
            placeholder="Share your thoughts, tips, or questions..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            maxLength={1000}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button
            className="w-full"
            disabled={!title.trim() || !body.trim()}
            onClick={() => { onPost(title.trim(), body.trim()); onClose(); }}
          >
            Post Discussion
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const Community = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState("forum");
  const [posts, setPosts] = useState<ForumPost[]>(initialPosts);
  const [openPost, setOpenPost] = useState<ForumPost | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [joinedChallenges, setJoinedChallenges] = useState<number[]>([]);

  const handleLike = (id: number) => {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleNewPost = (title: string, body: string) => {
    const newPost: ForumPost = {
      id: Date.now(),
      author: "You",
      title,
      body,
      replies: 0,
      likes: 0,
      time: "Just now",
      badge: "",
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
    toast({ title: "Discussion posted! 🎉", description: "Your post is now live in the community." });
  };

  const handleJoinChallenge = (ch: Challenge) => {
    setJoinedChallenges((prev) => [...prev, ch.id]);
    toast({
      title: "Challenge accepted! 🎯",
      description: ch.location
        ? `You've joined "${ch.title}". Tap Navigate to get directions.`
        : `You've joined "${ch.title}". Good luck!`,
    });
  };

  const handleNavigate = (ch: Challenge) => {
    if (!ch.location && ch.lat === undefined) {
      toast({ title: "No location for this challenge", variant: "destructive" });
      return;
    }
    openGoogleMaps(ch.lat, ch.lng, ch.location);
  };

  const handleShareChallenge = (ch: Challenge) => {
    shareText(`Join me in the "${ch.title}" challenge on GREEN LOOP! 🌍♻️`);
    toast({ title: "Challenge link copied!" });
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

          {/* ── Forum Tab ── */}
          <TabsContent value="forum">
            <Button className="w-full mb-4 gap-2" onClick={() => setShowNewPost(true)}>
              <MessageSquare className="h-4 w-4" /> Start a Discussion
            </Button>
            <div className="space-y-3">
              {posts.map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card
                    className="p-4 cursor-pointer hover:shadow-soft transition-shadow"
                    onClick={() => setOpenPost(post)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm flex-1 pr-2">{post.title}</h3>
                      {post.badge && <Badge variant="secondary" className="text-[10px] shrink-0">{post.badge}</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{post.author}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.time}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {post.replies + post.comments.length}</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {post.likes}</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ── Challenges Tab ── */}
          <TabsContent value="challenges">
            <div className="space-y-3">
              {challenges.map((ch, i) => {
                const joined = joinedChallenges.includes(ch.id);
                const hasLocation = !!(ch.lat !== undefined || ch.location);
                return (
                  <motion.div key={ch.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className={`p-5 ${ch.isHeatmap ? "border-l-4 border-l-destructive" : ""}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {ch.isHeatmap
                            ? <Flame className="h-5 w-5 text-destructive" />
                            : <Target className="h-5 w-5 text-primary" />}
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
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>{ch.progress}/{ch.target} {ch.unit}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {ch.participants.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border gap-2 flex-wrap">
                        <Badge className="text-[10px] bg-emerald/10 text-emerald border-0">
                          <Leaf className="h-2.5 w-2.5 mr-1" /> {ch.reward} Bonus Carbon Credits
                        </Badge>
                        <div className="flex gap-2">
                          {/* Share button — always visible */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs gap-1 px-2"
                            onClick={() => handleShareChallenge(ch)}
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>

                          {joined ? (
                            hasLocation ? (
                              /* Navigate opens Google Maps */
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs gap-1"
                                onClick={() => handleNavigate(ch)}
                              >
                                <Navigation className="h-3 w-3" /> Navigate
                              </Button>
                            ) : (
                              <Badge variant="secondary" className="text-xs px-3 py-1">Joined ✓</Badge>
                            )
                          ) : (
                            <Button
                              size="sm"
                              className="text-xs bg-emerald hover:bg-emerald/90 text-emerald-foreground"
                              onClick={() => handleJoinChallenge(ch)}
                            >
                              Join Challenge
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* ── Top Earners Tab ── */}
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

      {/* ── Modals ── */}
      <AnimatePresence>
        {openPost && (
          <PostModal
            post={openPost}
            onClose={() => setOpenPost(null)}
            onLike={(id) => { handleLike(id); setOpenPost((p) => p ? { ...p, likes: p.likes + 1 } : p); }}
          />
        )}
        {showNewPost && (
          <NewPostModal onClose={() => setShowNewPost(false)} onPost={handleNewPost} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Community;
