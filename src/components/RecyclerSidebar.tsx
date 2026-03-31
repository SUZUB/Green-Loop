import { motion } from "framer-motion";
import {
  Home, Zap, ShoppingCart, User, Wallet, Trophy, Leaf, Award, Share2, BookOpen, Users, CalendarPlus,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { EcoLogo } from "@/components/EcoLogo";
import { useRecycleHub } from "@/hooks/useRecycleHub";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { PulseEffect } from "@/components/PulseEffect";

interface NavigationItem {
  key: string;
  icon: React.ComponentType<{ size: number; strokeWidth: number; className: string }>;
  label: string;
  path: string;
}

interface QuickActionItem {
  key: string;
  icon: React.ComponentType<{ size: number; className: string }>;
  label: string;
  path: string;
}

const dashboardItems: NavigationItem[] = [
  { key: "home", icon: Home, label: "Home", path: "/recycler/dashboard" },
];

const recyclerToolsItems: NavigationItem[] = [
  { key: "challenges", icon: Zap, label: "Challenges", path: "/recycler/challenges" },
  { key: "market", icon: ShoppingCart, label: "Market", path: "/buyer/dashboard" },
];

const quickActionItems: QuickActionItem[] = [
  { key: "wallet", icon: Wallet, label: "Wallet", path: "/recycler/wallet" },
  { key: "leaderboard", icon: Trophy, label: "Leaderboard", path: "/recycler/leaderboard" },
  { key: "myImpact", icon: Leaf, label: "My Impact", path: "/recycler/impact" },
  { key: "achievements", icon: Award, label: "Achievements", path: "/recycler/achievements" },
  { key: "referrals", icon: Share2, label: "Referrals", path: "/recycler/referral" },
  { key: "learn", icon: BookOpen, label: "Learn", path: "/education/knowledge-hub" },
  { key: "community", icon: Users, label: "Community", path: "/community" },
  { key: "bookPickup", icon: CalendarPlus, label: "Book Pickup", path: "/recycler/booking" },
];

export function RecyclerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { globalMetrics, quickActionStats } = useRecycleHub();
  const prevImpactRef = useRef(quickActionStats.myImpact.totalWasteDivertedKg);
  const [impactPulseKey, setImpactPulseKey] = useState(0);

  useEffect(() => {
    if (quickActionStats.myImpact.totalWasteDivertedKg !== prevImpactRef.current) {
      setImpactPulseKey((prev) => prev + 1);
      prevImpactRef.current = quickActionStats.myImpact.totalWasteDivertedKg;
    }
  }, [quickActionStats.myImpact.totalWasteDivertedKg]);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const renderNavItem = (item: NavigationItem) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <motion.button
        key={item.key}
        onClick={() => navigate(item.path)}
        whileHover={{ x: 4 }}
        className={`w-full relative flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group ${
          active
            ? "bg-emerald-500/10 text-white"
            : "text-slate-300 hover:text-white"
        }`}
      >
        {/* Active indicator - left border */}
        {active && (
          <motion.div 
            layoutId="activeIndicator"
            className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        
        {/* Icon */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Icon 
            size={22} 
            strokeWidth={1.5}
            className={`shrink-0 transition-colors duration-200 ${
              active ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-500"
            }`}
          />
        </motion.div>
        
        {/* Label */}
        <span className={`text-sm font-semibold transition-colors duration-200 ${
          active ? "text-white" : "group-hover:text-white"
        }`}>
          {item.label}
        </span>
      </motion.button>
    );
  };

  const renderQuickActionTile = (item: QuickActionItem) => {
    const Icon = item.icon;

    return (
      <motion.button
        key={item.key}
        onClick={() => navigate(item.path)}
        whileHover={{ scale: 1.05, y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-200 group hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
      >
        <Icon 
          size={20}
          className="text-emerald-400 transition-transform duration-200 group-hover:text-emerald-300"
        />
        <span className="text-[11px] font-semibold text-white/90 text-center leading-tight">
          {item.label}
        </span>
      </motion.button>
    );
  };

  return (
    <aside className="h-full min-h-screen p-6 space-y-8 bg-[#020617] overflow-y-auto scrollbar-hide text-white flex flex-col">
      {/* EcoSync Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 pt-2"
      >
        <EcoLogo size="sm" />
        <div>
          <p className="text-sm font-bold text-white tracking-wider">EcoSync</p>
          <p className="text-xs text-slate-400">Green Loop</p>
        </div>
      </motion.div>

      {/* Dashboard Section */}
      <nav className="space-y-3">
        <h3 className="text-slate-500 uppercase tracking-widest text-[10px] font-semibold px-4 mb-3">
          Dashboard
        </h3>
        <div className="space-y-2">
          {dashboardItems.map(renderNavItem)}
        </div>
      </nav>

      {/* Recycler Tools Section */}
      <nav className="space-y-3">
        <h3 className="text-slate-500 uppercase tracking-widest text-[10px] font-semibold px-4 mb-3">
          Recycler Tools
        </h3>
        <div className="space-y-2">
          {recyclerToolsItems.map(renderNavItem)}
        </div>
      </nav>

      {/* Quick Actions Section */}
      <div className="space-y-3">
        <h3 className="text-slate-500 uppercase tracking-widest text-[10px] font-semibold px-4 mb-3">
          Operations
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActionItems.map(renderQuickActionTile)}
        </div>
      </div>

      {/* Sidebar Stats Section */}
      <div className="space-y-3 pt-4 border-t border-white/5">
        <h3 className="text-slate-500 uppercase tracking-widest text-[10px] font-semibold px-4 mb-3">
          Live Metrics
        </h3>
        <div className="space-y-3">
          {/* Global Impact */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 backdrop-blur-sm"
          >
            <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Global Impact</p>
            <motion.div
              layout
              className="flex items-baseline gap-1"
            >
              <p className="text-xl font-bold text-white">
                <AnimatedCounter
                  value={Math.round(globalMetrics.totalPlasticRecycledKg)}
                  suffix=""
                  className="inline-block"
                />
              </p>
              <span className="text-xs text-slate-400">kg</span>
            </motion.div>
          </motion.div>

          {/* Live Pickers */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 backdrop-blur-sm"
          >
            <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Live Pickers</p>
            <motion.div
              layout
              className="flex items-baseline gap-1"
            >
              <p className="text-xl font-bold text-white">
                <AnimatedCounter
                  value={globalMetrics.livePickersOnline}
                  suffix=""
                  className="inline-block"
                />
              </p>
              <span className="text-xs text-slate-400">active</span>
            </motion.div>
          </motion.div>

          {/* My Impact */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 backdrop-blur-sm overflow-hidden"
          >
            <PulseEffect trigger={impactPulseKey} color="rgba(16, 185, 129, 0.4)" intensity={1.2} />
            <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">My Impact</p>
            <motion.div
              layout
              className="flex items-baseline gap-1"
            >
              <p className="text-xl font-bold text-white">
                <AnimatedCounter
                  value={quickActionStats.myImpact.totalWasteDivertedKg}
                  suffix=""
                  className="inline-block"
                />
              </p>
              <span className="text-xs text-slate-400">kg</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="pt-4 border-t border-white/5 mt-auto">
        <motion.button
          whileHover={{ x: 4 }}
          onClick={() => navigate("/recycler/profile")}
          className={`w-full relative flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group ${
            isActive("/recycler/profile")
              ? "bg-emerald-500/10 text-white"
              : "text-slate-300 hover:text-white"
          }`}
        >
          {isActive("/recycler/profile") && (
            <motion.div 
              layoutId="activeIndicator"
              className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <User 
              size={22} 
              strokeWidth={1.5}
              className={`shrink-0 transition-colors duration-200 ${
                isActive("/recycler/profile") ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-500"
              }`}
            />
          </motion.div>
          
          <span className={`text-sm font-semibold transition-colors duration-200 ${
            isActive("/recycler/profile") ? "text-white" : "group-hover:text-white"
          }`}>
            Profile
          </span>
        </motion.button>
      </div>
    </aside>
  );
}
