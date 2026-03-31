import { motion } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { BuyerBottomNav } from "@/components/BuyerNav";
import {
  Factory, TrendingUp, TrendingDown, IndianRupee, Package,
  BarChart3, PieChart,
} from "lucide-react";

const purchaseSummary = [
  { label: "This Month", value: "3,200 kg", amount: "₹48,000", change: "+12%", up: true },
  { label: "Last Month", value: "2,850 kg", amount: "₹42,750", change: "", up: true },
  { label: "This Quarter", value: "9,100 kg", amount: "₹1,36,500", change: "+18%", up: true },
];

const typeBreakdown = [
  { type: "PET", qty: "5,200 kg", pct: 42, cost: "₹78,000", color: "bg-primary" },
  { type: "HDPE", qty: "3,100 kg", pct: 25, cost: "₹37,200", color: "bg-ocean" },
  { type: "PP", qty: "2,400 kg", pct: 19, cost: "₹43,200", color: "bg-earth" },
  { type: "Mixed", qty: "1,800 kg", pct: 14, cost: "₹18,000", color: "bg-leaf" },
];

const supplierPerformance = [
  { name: "ABC Recyclers", onTime: 96, quality: 98, price: "₹14.2/kg", score: "A+" },
  { name: "XYZ Plastics", onTime: 92, quality: 95, price: "₹15.1/kg", score: "A" },
  { name: "Green Plastics", onTime: 94, quality: 93, price: "₹17.8/kg", score: "A" },
  { name: "Eco Solutions", onTime: 88, quality: 90, price: "₹12.5/kg", score: "B+" },
];

const priceTrends = [
  { type: "PET", current: "₹15/kg", avg: "₹14.5/kg", trend: "↑ 3%", up: true },
  { type: "HDPE", current: "₹12/kg", avg: "₹12.8/kg", trend: "↓ 6%", up: false },
  { type: "PP", current: "₹18/kg", avg: "₹17.5/kg", trend: "↑ 3%", up: true },
  { type: "Mixed", current: "₹10/kg", avg: "₹10.2/kg", trend: "↓ 2%", up: false },
];

const BuyerAnalytics = () => {
  return (
    <div className="min-h-screen bg-background/40 pb-20">
      <PageBackground type="oceanPlastic" overlay="bg-foreground/50" />
      
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Factory className="h-6 w-6 text-earth" />
            <span className="font-display font-bold text-lg">Analytics</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Purchase Summary */}
        <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-earth" /> Purchase Summary
        </h2>
        <div className="space-y-3 mb-8">
          {purchaseSummary.map((p, i) => (
            <motion.div key={p.label} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{p.label}</p>
                  <p className="font-display font-bold">{p.value}</p>
                  <p className="text-xs text-muted-foreground">{p.amount}</p>
                </div>
                {p.change && (
                  <span className={`text-sm font-semibold flex items-center gap-1 ${p.up ? "text-primary" : "text-destructive"}`}>
                    {p.up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {p.change}
                  </span>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Plastic Type Breakdown */}
        <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-earth" /> Plastic Type Breakdown
        </h2>
        <div className="space-y-3 mb-8">
          {typeBreakdown.map((t, i) => (
            <motion.div key={t.type} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.05 }}>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${t.color}`} />
                    <span className="font-semibold text-sm">{t.type}</span>
                  </div>
                  <span className="text-sm font-medium">{t.qty}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${t.color}`} style={{ width: `${t.pct}%` }} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{t.pct}% of total</span>
                  <span className="text-xs text-muted-foreground">{t.cost}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Price Trends */}
        <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-earth" /> Market Price Trends
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {priceTrends.map((p, i) => (
            <motion.div key={p.type} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.05 }}>
              <Card className="p-4">
                <p className="font-semibold text-sm mb-1">{p.type}</p>
                <p className="text-lg font-display font-bold">{p.current}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Avg: {p.avg}</span>
                  <span className={`text-xs font-semibold ${p.up ? "text-destructive" : "text-primary"}`}>{p.trend}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Supplier Performance */}
        <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2">
          <Package className="h-5 w-5 text-earth" /> Supplier Performance
        </h2>
        <div className="space-y-3">
          {supplierPerformance.map((s, i) => (
            <motion.div key={s.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.05 }}>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{s.name}</span>
                  <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s.score}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">{s.onTime}%</p>
                    <p>On-time</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{s.quality}%</p>
                    <p>Quality</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{s.price}</p>
                    <p>Avg price</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <BuyerBottomNav />
    </div>
  );
};

export default BuyerAnalytics;
