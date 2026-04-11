import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Leaf, ArrowUpRight, ArrowDownLeft, Banknote, TrendingUp, CreditCard, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserStats } from "@/hooks/useUserStats";
import { supabase } from "@/integrations/supabase/client";

interface LedgerEntry {
  id: string;
  type: "Collection" | "Sale";
  credits: number;
  cashAmount?: number;
  date: string;
  desc: string;
}

const CREDIT_VALUE_INR = 100; // 1 credit = ₹100
const KG_TO_CREDITS = 5; // 1 kg = 5 credits

const CarbonWallet = () => {
  const { toast } = useToast();
  const stats = useUserStats();
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(true);
  const [sellAmount, setSellAmount] = useState("");
  const [bankIFSC, setBankIFSC] = useState("");
  const [bankAccount, setBankAccount] = useState("");

  // Carbon credits = total_recycled_kg * 5
  const carbonCredits = Math.floor(stats.totalRecycledKg * KG_TO_CREDITS);
  const estimatedValue = carbonCredits * CREDIT_VALUE_INR;
  // Cash balance tracked via coin_balance (repurposed)
  const cashBalanceINR = stats.coinBalance;

  useEffect(() => {
    const fetchLedger = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLedgerLoading(false); return; }
      const { data } = await supabase
        .from("recycling_pickups")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) {
        setLedger(data.map((r: any) => ({
          id: r.id,
          type: "Collection" as const,
          credits: Math.floor(Number(r.weight_kg) * KG_TO_CREDITS),
          date: new Date(r.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
          desc: `${r.weight_kg} kg plastic collected`,
        })));
      }
      setLedgerLoading(false);
    };
    fetchLedger();
  }, [stats.coinBalance]);

  const handleSellCredits = () => {
    const credits = parseInt(sellAmount);
    if (!credits || credits < 1 || credits > carbonCredits) {
      toast({ title: "Invalid amount", description: `Enter between 1 and ${carbonCredits} credits.`, variant: "destructive" });
      return;
    }
    const cashEarned = credits * CREDIT_VALUE_INR;
    toast({ title: "Credits sold to network!", description: `${credits} credits → ₹${cashEarned.toLocaleString("en-IN")} added to your cash balance.` });
    setSellAmount("");
  };

  const handleWithdraw = () => {
    if (!bankIFSC || !bankAccount) {
      toast({ title: "Bank details required", description: "Please enter IFSC and account number.", variant: "destructive" });
      return;
    }
    if (cashBalanceINR < 100) {
      toast({ title: "Minimum ₹100 required", description: "Sell credits to build your cash balance.", variant: "destructive" });
      return;
    }
    toast({ title: "Withdrawal requested!", description: `₹${cashBalanceINR.toLocaleString("en-IN")} will be transferred in 24-48 hours.` });
  };

  return (
    <div className="min-h-screen">
      <PageBackground type="recycling" overlay="bg-[#F8FAF9]/65" />
      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Leaf className="h-6 w-6 text-emerald" />
            <h1 className="text-2xl font-display font-bold">Carbon Wallet</h1>
          </div>
          <p className="text-[#475569] text-sm">Your verified carbon credit portfolio</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="p-5 border-l-4 border-l-emerald">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#475569] uppercase tracking-wide">Verified Carbon Credits</p>
                  <p className="text-3xl font-display font-bold text-emerald">{carbonCredits.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-[#475569] mt-1">From {stats.totalRecycledKg} kg recycled • 5 credits/kg</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald/10 flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-emerald" />
                </div>
              </div>
            </Card>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="p-4 border-l-4 border-l-gold">
                <p className="text-xs text-[#475569] uppercase tracking-wide">Estimated Value</p>
                <p className="text-xl font-display font-bold text-gold">₹{estimatedValue.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-[#475569]">@ ₹100/credit</p>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="p-4 border-l-4 border-l-primary">
                <p className="text-xs text-[#475569] uppercase tracking-wide">Redeemable Cash</p>
                <p className="text-xl font-display font-bold">₹{cashBalanceINR.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-[#475569]">INR Balance</p>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald" />
                <h3 className="font-semibold text-sm">Sell Credits</h3>
              </div>
              <Input
                type="number"
                placeholder="Credits to sell"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                className="h-9 text-sm"
              />
              {sellAmount && parseInt(sellAmount) > 0 && (
                <p className="text-xs text-emerald">= ₹{(parseInt(sellAmount) * CREDIT_VALUE_INR).toLocaleString("en-IN")}</p>
              )}
              <Button size="sm" className="w-full bg-emerald hover:bg-emerald/90 text-emerald-foreground gap-1" onClick={handleSellCredits}>
                <ArrowUpRight className="h-3 w-3" /> Sell to Network
              </Button>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-gold" />
                <h3 className="font-semibold text-sm">Withdraw</h3>
              </div>
              <Input placeholder="IFSC Code" value={bankIFSC} onChange={(e) => setBankIFSC(e.target.value)} className="h-9 text-sm" />
              <Input placeholder="Account No." value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} className="h-9 text-sm" />
              <Button size="sm" variant="outline" className="w-full gap-1 border-gold text-gold hover:bg-gold/10" onClick={handleWithdraw}>
                <CreditCard className="h-3 w-3" /> Withdraw to Bank
              </Button>
            </Card>
          </motion.div>
        </div>

        {/* Ledger */}
        <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2">
          <IndianRupee className="h-4 w-4 text-emerald" /> Transaction Ledger
        </h2>
        <div className="space-y-2">
          {ledgerLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-[#475569]" /></div>
          ) : ledger.length === 0 ? (
            <p className="text-center text-[#475569] py-8 text-sm">No transactions yet. Start recycling to earn carbon credits!</p>
          ) : (
            ledger.map((entry, i) => (
              <motion.div key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                <Card className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      entry.type === "Collection" ? "bg-emerald/10 text-emerald" : "bg-gold/10 text-gold"
                    }`}>
                      {entry.type === "Collection" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        <Badge variant="outline" className="text-[10px] mr-2">{entry.type}</Badge>
                        {entry.desc}
                      </p>
                      <p className="text-[10px] text-[#475569]">{entry.date}</p>
                    </div>
                  </div>
                  <span className={`font-display font-bold text-sm ${entry.type === "Collection" ? "text-emerald" : "text-gold"}`}>
                    {entry.type === "Collection" ? "+" : "-"}{entry.credits} Credits
                  </span>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CarbonWallet;
