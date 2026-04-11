// import { useState } from "react";
// import { motion } from "framer-motion";
// import { PageBackground } from "@/components/PageBackground";
// import { useNavigate } from "react-router-dom";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { BuyerBottomNav } from "@/components/BuyerNav";
// import { useToast } from "@/hooks/use-toast";
// import { useRecycleHub } from "@/hooks/useRecycleHub";
// import {
//   Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
// } from "@/components/ui/table";
// import {
//   Factory, ClipboardList, Package, Leaf, BarChart3,
//   Plus, Eye, MapPin, IndianRupee, ArrowRight, ShoppingCart,
// } from "lucide-react";

// const quickActions = [
//   { icon: Leaf, label: "Buy Carbon Credits", path: "/buyer/carbon-market", color: "bg-emerald" },
//   { icon: Plus, label: "Post Sourcing Request", path: "/buyer/listings", color: "bg-[#10B981]" },
//   { icon: Eye, label: "Supplier Applications", path: "/buyer/suppliers", color: "bg-[#10B981]" },
//   { icon: MapPin, label: "Track Orders", path: "/buyer/orders", color: "bg-[#10B981]" },
//   { icon: BarChart3, label: "Analytics", path: "/buyer/analytics", color: "bg-leaf" },
// ];

// const recentOrders = [
//   { id: "ORD-001", supplier: "ABC Recyclers", type: "PET", qty: "500 kg", status: "In Transit", statusColor: "text-[#14532D]" },
//   { id: "ORD-002", supplier: "XYZ Plastics", type: "HDPE", qty: "1,000 kg", status: "Processing", statusColor: "text-warning" },
//   { id: "ORD-003", supplier: "Eco Solutions", type: "PET", qty: "300 kg", status: "Delivered", statusColor: "text-[#14532D]" },
// ];

// const BuyerDashboard = () => {
//   const navigate = useNavigate();
//   const { userBalance, availableMarketCredits } = useRecycleHub();

//   const metrics = [
//     { icon: Leaf, label: "Carbon Credit Portfolio", value: userBalance.toLocaleString("en-IN"), color: "bg-emerald", accent: true },
//     { icon: ClipboardList, label: "Available Market Credits", value: availableMarketCredits.toString(), color: "bg-[#10B981]", accent: false },
//     { icon: Package, label: "Total Purchased", value: "12,500 kg", color: "bg-[#10B981]", accent: false },
//     { icon: IndianRupee, label: "Total Spent", value: "₹1,87,500", color: "bg-[#10B981]", accent: false },
//   ];

//   return (
//     <div className="min-h-screen pb-20">
//       <PageBackground type="oceanPlastic" overlay="bg-[#F8FAF9]/65" />
      
//       <nav className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ background: "rgba(248,250,249,0.95)", borderColor: "#D1FAE5" }}>
//         <div className="container mx-auto flex items-center justify-between h-14 px-4">
//           <div className="flex items-center gap-2">
//             <Factory className="h-6 w-6 text-[#065F46]" />
//             <span className="font-display font-bold text-lg">GREEN LOOP</span>
//             <span className="text-xs bg-[#10B981]/10 text-[#065F46] px-2 py-0.5 rounded-full font-medium">Buyer</span>
//           </div>
//           <Button variant="ghost" size="sm" onClick={() => navigate("/buyer/profile")}>
//             Profile
//           </Button>
//         </div>
//       </nav>

//       <div className="container mx-auto max-w-7xl px-4 py-6">
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
//           <h1 className="text-2xl font-display font-bold">Welcome back! 🏭</h1>
//           <p className="text-[#475569] text-sm">Manage plastic sourcing & carbon credit operations</p>
//         </motion.div>

//         {/* Metrics */}
//         <div className="grid grid-cols-2 gap-3 mb-6">
//           {metrics.map((m, i) => (
//             <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
//               <Card className={`p-4 ${m.accent ? "border-l-4 border-l-emerald" : ""}`}>
//                 <div className="flex items-center gap-3">
//                   <div className={`w-10 h-10 rounded-lg ${m.color} flex items-center justify-center`}>
//                     <m.icon className="h-5 w-5 text-white" />
//                   </div>
//                   <div>
//                     <p className={`text-lg font-display font-bold ${m.accent ? "text-emerald" : ""}`}>{m.value}</p>
//                     <p className="text-xs text-[#475569]">{m.label}</p>
//                   </div>
//                 </div>
//               </Card>
//             </motion.div>
//           ))}
//         </div>

//         {/* Quick Actions */}
//         <h2 className="text-lg font-display font-bold mb-3">Quick Actions</h2>
//         <div className="grid grid-cols-2 gap-3 mb-8">
//           {quickActions.map((action, i) => (
//             <motion.div key={action.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
//               <button
//                 onClick={() => navigate(action.path)}
//                 className="w-full p-4 rounded-xl bg-card border border-[#D1FAE5] hover:shadow-soft transition-all flex items-center gap-3"
//               >
//                 <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center shrink-0`}>
//                   <action.icon className="h-5 w-5 text-white" />
//                 </div>
//                 <span className="text-sm font-medium text-[#1E293B]">{action.label}</span>
//               </button>
//             </motion.div>
//           ))}
//         </div>

//         {/* Recent Orders */}
//         <div className="flex items-center justify-between mb-3">
//           <h2 className="text-lg font-display font-bold">Recent Orders</h2>
//           <Button variant="ghost" size="sm" onClick={() => navigate("/buyer/orders")} className="text-xs gap-1">
//             View All <ArrowRight className="h-3 w-3" />
//           </Button>
//         </div>
//         <div className="space-y-3 mb-4">
//           {recentOrders.map((order, i) => (
//             <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.05 }}>
//               <Card className="p-4">
//                 <div className="flex items-center justify-between mb-1">
//                   <span className="font-medium text-sm">{order.id}</span>
//                   <span className={`text-xs font-semibold ${order.statusColor}`}>{order.status}</span>
//                 </div>
//                 <p className="text-xs text-[#475569]">{order.supplier} · {order.type} · {order.qty}</p>
//               </Card>
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       <BuyerBottomNav />
//     </div>
//   );
// };

// export default BuyerDashboard;


import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BuyerBottomNav } from "@/components/BuyerNav";
import { useToast } from "@/hooks/use-toast";
import { useRecycleHub } from "@/hooks/useRecycleHub";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";
import {
  Factory, ClipboardList, Package, Leaf, BarChart3,
  Plus, Eye, MapPin, IndianRupee, ArrowRight, ShoppingCart, Sparkles,
} from "lucide-react";

const quickActions = [
  { icon: Leaf, label: "Buy Carbon Credits", path: "/buyer/carbon-market", color: "bg-emerald" },
  { icon: Plus, label: "Post Sourcing Request", path: "/buyer/listings", color: "bg-[#10B981]" },
  { icon: Eye, label: "Supplier Applications", path: "/buyer/suppliers", color: "bg-[#10B981]" },
  { icon: MapPin, label: "Track Orders", path: "/buyer/orders", color: "bg-[#10B981]" },
  { icon: BarChart3, label: "Analytics", path: "/buyer/analytics", color: "bg-leaf" },
];

const recentOrders = [
  { id: "ORD-001", supplier: "ABC Recyclers", type: "PET", qty: "500 kg", status: "In Transit", statusColor: "text-[#14532D]" },
  { id: "ORD-002", supplier: "XYZ Plastics", type: "HDPE", qty: "1,000 kg", status: "Processing", statusColor: "text-warning" },
  { id: "ORD-003", supplier: "Eco Solutions", type: "PET", qty: "300 kg", status: "Delivered", statusColor: "text-[#14532D]" },
];

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { userBalance, availableMarketCredits } = useRecycleHub();
  const [showDashboard, setShowDashboard] = useState(() => {
    try {
      const stored = window.localStorage.getItem("buyer_dashboard_show_sections");
      return stored === null ? true : stored === "true";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("buyer_dashboard_show_sections", String(showDashboard));
    } catch {
      // ignore
    }
  }, [showDashboard]);

  const metrics = [
    { icon: Leaf, label: "Carbon Credit Portfolio", value: userBalance.toLocaleString("en-IN"), color: "bg-emerald", accent: true },
    { icon: ClipboardList, label: "Available Market Credits", value: availableMarketCredits.toString(), color: "bg-[#10B981]", accent: false },
    { icon: Package, label: "Total Purchased", value: "12,500 kg", color: "bg-[#10B981]", accent: false },
    { icon: IndianRupee, label: "Total Spent", value: "₹1,87,500", color: "bg-[#10B981]", accent: false },
  ];

  return (
    <div className="min-h-screen pb-20">
      <PageBackground type="oceanPlastic" overlay="bg-[#F8FAF9]/65" />
      
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ background: "rgba(248,250,249,0.95)", borderColor: "#D1FAE5" }}>
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Factory className="h-6 w-6 text-[#065F46]" />
            <span className="font-display font-bold text-lg">GREEN LOOP</span>
            <span className="text-xs bg-[#10B981]/10 text-[#065F46] px-2 py-0.5 rounded-full font-medium">Buyer</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowDashboard((v) => !v)}>
              {showDashboard ? "Hide Dashboard" : "Show Dashboard"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/buyer/profile")}>
              Profile
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold">Welcome back! 🏭</h1>
          <p className="text-[#475569] text-sm">Manage plastic sourcing & carbon credit operations</p>
        </div>

        {/* Spotlight CTA: make carbon credit purchase the primary action for buyers */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6"
        >
          <Card className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-[#2d7a4f] to-emerald-800 text-[#1E293B] shadow-elevated">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-black/10 blur-2xl" />
            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">
                    <Sparkles className="h-3.5 w-3.5" />
                    Featured for Buyers
                  </div>
                  <h2 className="mt-4 text-3xl sm:text-4xl font-display font-bold tracking-tight">
                    Buy Carbon Credits
                  </h2>
                  <p className="mt-3 text-sm text-[#1E293B]/80">
                    Lock in credits from the live market and grow your portfolio. Your balance updates instantly after purchase.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full bg-white/10 px-3 py-2">
                      Balance: <span className="font-semibold">{userBalance.toLocaleString("en-IN")}</span> credits
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-2">
                      Live supply: <span className="font-semibold">{availableMarketCredits}</span> credits
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:min-w-[260px]">
                  <Button
                    size="lg"
                    className="h-12 w-full bg-white text-emerald-800 hover:bg-white/90 font-semibold"
                    onClick={() => navigate("/buyer/carbon-market")}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Buy Carbon Credits
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-full border-white/30 bg-transparent text-[#1E293B] hover:bg-white/10"
                    onClick={() => navigate("/buyer/analytics")}
                  >
                    View portfolio analytics <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <p className="text-xs text-[#1E293B]/70">
                    Tip: Purchases show up in your wallet history immediately.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <AnimatePresence initial={false}>
          {showDashboard && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {metrics.map((m) => (
                  <div key={m.label}>
                    <Card className={`p-4 ${m.accent ? "border-l-4 border-l-emerald" : ""}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${m.color} flex items-center justify-center`}>
                          <m.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className={`text-lg font-display font-bold ${m.accent ? "text-emerald" : ""}`}>{m.value}</p>
                          <p className="text-xs text-[#475569]">{m.label}</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <h2 className="text-lg font-display font-bold mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="w-full p-4 rounded-xl bg-card border border-[#D1FAE5] hover:shadow-soft transition-all flex items-center gap-3"
                  >
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center shrink-0`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-[#1E293B]">{action.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Orders */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display font-bold">Recent Orders</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/buyer/orders")} className="text-xs gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
        <div className="space-y-3 mb-4">
          {recentOrders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{order.id}</span>
                <span className={`text-xs font-semibold ${order.statusColor}`}>{order.status}</span>
              </div>
              <p className="text-xs text-[#475569]">{order.supplier} · {order.type} · {order.qty}</p>
            </Card>
          ))}
        </div>
      </div>

      <BuyerBottomNav />
    </div>
  );
};

export default BuyerDashboard;