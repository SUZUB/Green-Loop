import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useRecycleHub } from "@/hooks/useRecycleHub";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, CreditCard, Heart, Crown } from "lucide-react";

const plans = [
  { name: "Silver", cost: 500, color: "bg-muted", perks: ["₹50 subscription discount", "Basic offers access"] },
  { name: "Gold", cost: 1500, color: "bg-earth", perks: ["Premium offers", "Priority pickups", "Partner discounts"] },
  { name: "Platinum", cost: 3000, color: "bg-hero-gradient", perks: ["All Gold benefits", "Free pickups", "Exclusive events"] },
];

const ngos = [
  { name: "Ocean Cleanup Foundation", mission: "Removing plastic from oceans worldwide", impact: "10 pts = 1 tree planted" },
  { name: "Green Earth India", mission: "Grassroots recycling awareness in rural India", impact: "50 pts = clean water for 1 family" },
  { name: "Save The Turtles", mission: "Protecting sea turtles from plastic pollution", impact: "100 pts = 1 turtle nest protected" },
];

const WalletPage = () => {
  const { toast } = useToast();
  const { userBalance, fullTransactionList, depositPoints, withdrawPoints } = useRecycleHub();
  const [tab, setTab] = useState("overview");
  const [cashoutAmount, setCashoutAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleCashout = () => {
    const pts = Math.floor(Number(cashoutAmount));
    if (!Number.isFinite(pts) || pts < 1000) {
      toast({ title: "Minimum 1,000 points required", description: "Keep recycling to earn more!", variant: "destructive" });
      return;
    }
    if (pts > userBalance) {
      toast({ title: "Insufficient balance", description: "Reduce the cash-out amount to your available points.", variant: "destructive" });
      return;
    }
    const res = withdrawPoints(pts, "Cash-out requested");
    if (!res.ok) {
      toast({ title: "Cash-out failed", description: res.error, variant: "destructive" });
      return;
    }
    toast({ title: "Cash-out requested!", description: `₹${pts / 10} will be transferred in 24-48 hours.` });
    setCashoutAmount("");
  };

  return (
    <div className="min-h-screen bg-background/40">
      <PageBackground type="recycling" overlay="bg-foreground/50" />
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-hero-gradient p-6 rounded-2xl mb-6">
            <div className="flex items-center gap-2 mb-3">
              <WalletIcon className="h-5 w-5 text-primary-foreground" />
              <span className="text-primary-foreground/80 text-sm">Wallet Balance</span>
            </div>
            <div className="text-4xl font-display font-bold text-primary-foreground">{userBalance} pts</div>
            <p className="text-primary-foreground/60 text-xs mt-1">≈ ₹{Math.floor(userBalance / 10)}</p>
          </Card>
        </motion.div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="overview" className="flex-1">History</TabsTrigger>
            <TabsTrigger value="cashout" className="flex-1">Cash Out</TabsTrigger>
            <TabsTrigger value="plans" className="flex-1">Plans</TabsTrigger>
            <TabsTrigger value="donate" className="flex-1">Donate</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-2">
            <Card className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Deposit points</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="e.g. 250"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        const amount = Math.floor(Number(depositAmount));
                        const res = depositPoints(amount, "Manual deposit");
                        if (!res.ok) {
                          toast({ title: "Deposit failed", description: res.error, variant: "destructive" });
                          return;
                        }
                        toast({ title: "Deposit successful", description: `+${amount} points added.`, variant: "success" });
                        setDepositAmount("");
                      }}
                    >
                      <ArrowUpRight className="h-4 w-4 mr-1.5" /> Deposit
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Withdraw points</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="e.g. 100"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const amount = Math.floor(Number(withdrawAmount));
                        const res = withdrawPoints(amount, "Manual withdrawal");
                        if (!res.ok) {
                          toast({ title: "Withdrawal failed", description: res.error, variant: "destructive" });
                          return;
                        }
                        toast({ title: "Withdrawal successful", description: `-${amount} points deducted.`, variant: "success" });
                        setWithdrawAmount("");
                      }}
                    >
                      <ArrowDownLeft className="h-4 w-4 mr-1.5" /> Withdraw
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                These controls are for testing wallet operations end-to-end (validation, balance updates, history).
              </p>
            </Card>

            {fullTransactionList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">No transactions yet.</p>
            ) : (
              fullTransactionList.map((tx, i) => (
                <motion.div key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <Card className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent text-primary">
                        {tx.amount >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p>
                      </div>
                    </div>
                    <span className={`font-display font-bold text-sm ${tx.amount >= 0 ? "text-primary" : "text-destructive"}`}>
                      {tx.amount >= 0 ? `+${tx.amount}` : tx.amount}
                    </span>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="cashout">
            <Card className="p-5 space-y-4">
              <div>
                <Label>Points to cash out</Label>
                <Input type="number" placeholder="Min 1,000 points" value={cashoutAmount} onChange={(e) => setCashoutAmount(e.target.value)} className="mt-1" />
                {cashoutAmount && parseInt(cashoutAmount) >= 1000 && (
                  <p className="text-xs text-primary mt-1">You'll receive ₹{parseInt(cashoutAmount) / 10}</p>
                )}
              </div>
              <div><Label>Bank Account (IFSC)</Label><Input placeholder="SBIN0001234" className="mt-1" /></div>
              <div><Label>Account Number</Label><Input placeholder="1234567890" className="mt-1" /></div>
              <p className="text-xs text-muted-foreground">Processing time: 24-48 hours</p>
              <Button className="w-full gap-2" onClick={handleCashout}><CreditCard className="h-4 w-4" /> Request Cash-Out</Button>
            </Card>
          </TabsContent>

          <TabsContent value="plans">
            <div className="space-y-3">
              {plans.map((plan, i) => (
                <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg ${plan.color} flex items-center justify-center`}>
                        <Crown className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold">{plan.name}</h3>
                        <p className="text-xs text-muted-foreground">{plan.cost} pts/month</p>
                      </div>
                    </div>
                    <ul className="space-y-1 mb-3">
                      {plan.perks.map((p) => (
                        <li key={p} className="text-xs text-muted-foreground flex items-center gap-1.5"><span className="text-primary">✓</span> {p}</li>
                      ))}
                    </ul>
                    <Button size="sm" variant={userBalance >= plan.cost ? "default" : "outline"} className="w-full" disabled={userBalance < plan.cost}>
                      {userBalance >= plan.cost ? "Subscribe" : `Need ${plan.cost - userBalance} more pts`}
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="donate">
            <div className="space-y-3">
              {ngos.map((ngo, i) => (
                <motion.div key={ngo.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-leaf flex items-center justify-center shrink-0">
                        <Heart className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{ngo.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{ngo.mission}</p>
                        <Badge variant="secondary" className="mt-2 text-[10px]">{ngo.impact}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1 text-xs">50 pts</Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs">100 pts</Button>
                      <Button size="sm" className="flex-1 text-xs">500 pts</Button>
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

export default WalletPage;
