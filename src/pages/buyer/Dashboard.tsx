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
//   { icon: Plus, label: "Post Sourcing Request", path: "/buyer/listings", color: "bg-earth" },
//   { icon: Eye, label: "Supplier Applications", path: "/buyer/suppliers", color: "bg-ocean" },
//   { icon: MapPin, label: "Track Orders", path: "/buyer/orders", color: "bg-primary" },
//   { icon: BarChart3, label: "Analytics", path: "/buyer/analytics", color: "bg-leaf" },
// ];

// const recentOrders = [
//   { id: "ORD-001", supplier: "ABC Recyclers", type: "PET", qty: "500 kg", status: "In Transit", statusColor: "text-ocean" },
//   { id: "ORD-002", supplier: "XYZ Plastics", type: "HDPE", qty: "1,000 kg", status: "Processing", statusColor: "text-warning" },
//   { id: "ORD-003", supplier: "Eco Solutions", type: "PET", qty: "300 kg", status: "Delivered", statusColor: "text-primary" },
// ];

// const BuyerDashboard = () => {
//   const navigate = useNavigate();
//   const { userBalance, availableMarketCredits } = useRecycleHub();

//   const metrics = [
//     { icon: Leaf, label: "Carbon Credit Portfolio", value: userBalance.toLocaleString("en-IN"), color: "bg-emerald", accent: true },
//     { icon: ClipboardList, label: "Available Market Credits", value: availableMarketCredits.toString(), color: "bg-ocean", accent: false },
//     { icon: Package, label: "Total Purchased", value: "12,500 kg", color: "bg-primary", accent: false },
//     { icon: IndianRupee, label: "Total Spent", value: "₹1,87,500", color: "bg-earth", accent: false },
//   ];

//   return (
//     <div className="min-h-screen bg-background/40 pb-20">
//       <PageBackground type="oceanPlastic" overlay="bg-foreground/50" />
      
//       <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
//         <div className="container mx-auto flex items-center justify-between h-14 px-4">
//           <div className="flex items-center gap-2">
//             <Factory className="h-6 w-6 text-earth" />
//             <span className="font-display font-bold text-lg">RecycleHub</span>
//             <span className="text-xs bg-earth/10 text-earth px-2 py-0.5 rounded-full font-medium">Buyer</span>
//           </div>
//           <Button variant="ghost" size="sm" onClick={() => navigate("/buyer/profile")}>
//             Profile
//           </Button>
//         </div>
//       </nav>

//       <div className="container mx-auto max-w-7xl px-4 py-6">
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
//           <h1 className="text-2xl font-display font-bold">Welcome back! 🏭</h1>
//           <p className="text-muted-foreground text-sm">Manage plastic sourcing & carbon credit operations</p>
//         </motion.div>

//         {/* Metrics */}
//         <div className="grid grid-cols-2 gap-3 mb-6">
//           {metrics.map((m, i) => (
//             <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
//               <Card className={`p-4 ${m.accent ? "border-l-4 border-l-emerald" : ""}`}>
//                 <div className="flex items-center gap-3">
//                   <div className={`w-10 h-10 rounded-lg ${m.color} flex items-center justify-center`}>
//                     <m.icon className="h-5 w-5 text-primary-foreground" />
//                   </div>
//                   <div>
//                     <p className={`text-lg font-display font-bold ${m.accent ? "text-emerald" : ""}`}>{m.value}</p>
//                     <p className="text-xs text-muted-foreground">{m.label}</p>
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
//                 className="w-full p-4 rounded-xl bg-card border border-border hover:shadow-soft transition-all flex items-center gap-3"
//               >
//                 <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center shrink-0`}>
//                   <action.icon className="h-5 w-5 text-primary-foreground" />
//                 </div>
//                 <span className="text-sm font-medium text-foreground">{action.label}</span>
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
//                 <p className="text-xs text-muted-foreground">{order.supplier} · {order.type} · {order.qty}</p>
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


import { useState } from "react";
import { motion } from "framer-motion";
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
  Plus, Eye, MapPin, IndianRupee, ArrowRight, ShoppingCart,
} from "lucide-react";

const quickActions = [
  { icon: Leaf, label: "Buy Carbon Credits", path: "/buyer/carbon-market", color: "bg-emerald" },
  { icon: Plus, label: "Post Sourcing Request", path: "/buyer/listings", color: "bg-earth" },
  { icon: Eye, label: "Supplier Applications", path: "/buyer/suppliers", color: "bg-ocean" },
  { icon: MapPin, label: "Track Orders", path: "/buyer/orders", color: "bg-primary" },
  { icon: BarChart3, label: "Analytics", path: "/buyer/analytics", color: "bg-leaf" },
];

const recentOrders = [
  { id: "ORD-001", supplier: "ABC Recyclers", type: "PET", qty: "500 kg", status: "In Transit", statusColor: "text-ocean" },
  { id: "ORD-002", supplier: "XYZ Plastics", type: "HDPE", qty: "1,000 kg", status: "Processing", statusColor: "text-warning" },
  { id: "ORD-003", supplier: "Eco Solutions", type: "PET", qty: "300 kg", status: "Delivered", statusColor: "text-primary" },
];

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { userBalance, availableMarketCredits } = useRecycleHub();

  const metrics = [
    { icon: Leaf, label: "Carbon Credit Portfolio", value: userBalance.toLocaleString("en-IN"), color: "bg-emerald", accent: true },
    { icon: ClipboardList, label: "Available Market Credits", value: availableMarketCredits.toString(), color: "bg-ocean", accent: false },
    { icon: Package, label: "Total Purchased", value: "12,500 kg", color: "bg-primary", accent: false },
    { icon: IndianRupee, label: "Total Spent", value: "₹1,87,500", color: "bg-earth", accent: false },
  ];

  return (
    <div className="min-h-screen bg-background/40 pb-20">
      <PageBackground type="oceanPlastic" overlay="bg-foreground/50" />
      
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Factory className="h-6 w-6 text-earth" />
            <span className="font-display font-bold text-lg">RecycleHub</span>
            <span className="text-xs bg-earth/10 text-earth px-2 py-0.5 rounded-full font-medium">Buyer</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/buyer/profile")}>
            Profile
          </Button>
        </div>
      </nav>

      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold">Welcome back! 🏭</h1>
          <p className="text-muted-foreground text-sm">Manage plastic sourcing & carbon credit operations</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {metrics.map((m) => (
            <div key={m.label}>
              <Card className={`p-4 ${m.accent ? "border-l-4 border-l-emerald" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${m.color} flex items-center justify-center`}>
                    <m.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className={`text-lg font-display font-bold ${m.accent ? "text-emerald" : ""}`}>{m.value}</p>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
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
              className="w-full p-4 rounded-xl bg-card border border-border hover:shadow-soft transition-all flex items-center gap-3"
            >
              <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center shrink-0`}>
                <action.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </button>
          ))}
        </div>

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
              <p className="text-xs text-muted-foreground">{order.supplier} · {order.type} · {order.qty}</p>
            </Card>
          ))}
        </div>
      </div>

      <BuyerBottomNav />
    </div>
  );
};

export default BuyerDashboard;