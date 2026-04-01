import { motion } from "framer-motion";

import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { useToast } from "@/hooks/use-toast";
import { Copy, Share2, Gift, Users, CheckCircle2 } from "lucide-react";

const referralCode = "RECYCLE-AB7X";

const referrals = [
  { name: "Priya Singh", status: "completed", bonus: 50, date: "Mar 1, 2026" },
  { name: "Amit Kumar", status: "pending", bonus: 0, date: "Mar 5, 2026" },
  { name: "Sara Khan", status: "completed", bonus: 50, date: "Feb 20, 2026" },
];

const Referral = () => {
  const { toast } = useToast();

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({ title: "Copied!", description: "Referral code copied to clipboard." });
  };

  const shareCode = () => {
    const text = `Join me on GREEN LOOP and earn ₹5 bonus! Use my code: ${referralCode} 🌍♻️ Together we can save the planet!`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: "Share text copied!" });
    }
  };

  const totalEarned = referrals.filter((r) => r.status === "completed").reduce((s, r) => s + r.bonus, 0);

  return (
    <div className="min-h-screen bg-background/40">
      <PageBackground type="ocean" overlay="bg-foreground/50" />

      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Code card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-hero-gradient p-6 rounded-2xl mb-6 text-center">
            <Gift className="h-10 w-10 text-primary-foreground mx-auto mb-3" />
            <h2 className="text-primary-foreground font-display font-bold text-lg mb-1">Invite Friends, Earn Points</h2>
            <p className="text-primary-foreground/70 text-sm mb-4">Earn 50 bonus points for each friend who completes their first pickup!</p>
            <div className="bg-primary-foreground/20 rounded-xl p-3 flex items-center justify-between mb-4">
              <span className="font-display font-bold text-primary-foreground text-lg tracking-wider">{referralCode}</span>
              <Button size="sm" variant="secondary" onClick={copyCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="flex-1 gap-1.5" onClick={shareCode}>
                <Share2 className="h-4 w-4" /> Share on WhatsApp
              </Button>
              <Button size="sm" variant="secondary" className="flex-1 gap-1.5" onClick={shareCode}>
                <Share2 className="h-4 w-4" /> Share Link
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
            <div className="text-xl font-display font-bold">{referrals.length}</div>
            <p className="text-[10px] text-muted-foreground">Invited</p>
          </Card>
          <Card className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-leaf" />
            <div className="text-xl font-display font-bold">{referrals.filter((r) => r.status === "completed").length}</div>
            <p className="text-[10px] text-muted-foreground">Completed</p>
          </Card>
          <Card className="p-4 text-center">
            <Gift className="h-5 w-5 mx-auto mb-1 text-earth" />
            <div className="text-xl font-display font-bold">{totalEarned}</div>
            <p className="text-[10px] text-muted-foreground">Pts Earned</p>
          </Card>
        </div>

        {/* Referral history */}
        <h2 className="text-lg font-display font-bold mb-3">Referral History</h2>
        <div className="space-y-2">
          {referrals.map((ref, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{ref.name}</p>
                  <p className="text-xs text-muted-foreground">{ref.date}</p>
                </div>
                <div className="text-right">
                  <Badge variant={ref.status === "completed" ? "default" : "outline"} className="text-[10px]">
                    {ref.status === "completed" ? "Completed" : "Pending first pickup"}
                  </Badge>
                  {ref.bonus > 0 && <p className="text-xs text-primary font-bold mt-1">+{ref.bonus} pts</p>}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Referral;
