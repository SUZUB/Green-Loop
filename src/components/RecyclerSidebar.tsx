import { motion } from "framer-motion";
import {
  Home, Zap, User, Wallet, Trophy, Leaf, Award, Share2, BookOpen, Users, CalendarPlus,
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
  { key: "bookPickup", icon: CalendarPlus, label: "Book Pickup", path: "/recycler/booking" },
  { key: "leaderboard", icon: Trophy, label: "Leaderboard", path: "/recycler/leaderboard" },
  { key: "myImpact", icon: Leaf, label: "My Impact", path: "/recycler/impact" },
  { key: "wallet", icon: Wallet, label: "Wallet", path: "/recycler/wallet" },
  { key: "achievements", icon: Award, label: "Achievements", path: "/recycler/achievements" },
  { key: "referrals", icon: Share2, label: "Referrals", path: "/recycler/referral" },
  { key: "aiCamera", icon: ScanLine, label: "AI Scanner", path: "/recycler/ai-camera" },
];

const quickActionItems: QuickActionItem[] = [
  { key: "learn", icon: BookOpen, label: "Learn", path: "/education/knowledge-hub" },
  { key: "community", icon: Users, label: "Community", path: "/community" },
  { key: "profile", icon: User, label: "Profile", path: "/recycler/profile" },
];

export function RecyclerSidebar({
  sidebarOpen,
  onToggleSidebar,
}: {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
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
        title={!sidebarOpen ? item.label : undefined}
        className={`w-full relative flex items-center ${sidebarOpen ? "gap-4 px-4" : "justify-center px-2"} py-3 rounded-xl transition-colors duration-150 group ${
          active ? "bg-emerald-100/80 text-slate-900" : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        {/* Icon */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Icon 
            size={22} 
            strokeWidth={1.5}
            className={`shrink-0 transition-colors duration-200 ${
              active ? "text-slate-900" : "text-slate-600 group-hover:text-slate-800"
            }`}
          />
        </motion.div>
        
        {/* Label */}
        {sidebarOpen && (
          <span className={`text-sm font-semibold transition-colors duration-200 ${
            active ? "text-slate-900" : "group-hover:text-slate-900"
          }`}>
            {item.label}
          </span>
        )}
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
        className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 bg-white transition-colors duration-150 group hover:border-slate-300"
      >
        <Icon 
          size={20}
          className="text-slate-700 transition-transform duration-200"
        />
        <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">
          {item.label}
        </span>
      </motion.button>
    );
  };

  return (
    <aside className={`h-full min-h-screen ${sidebarOpen ? "p-6 space-y-8" : "p-3 space-y-4"} bg-slate-50 overflow-y-auto scrollbar-hide text-slate-900 flex flex-col border-r border-slate-200 transition-all duration-200`}>
      {/* GREEN LOOP brand */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 pt-2"
      >
        <EcoLogo size="sm" />
        {sidebarOpen && (
          <div>
            <p className="text-sm font-bold text-slate-900 tracking-wider">GREEN LOOP</p>
            <p className="text-xs text-slate-500">Recycler</p>
          </div>
        )}
      </motion.div>

      {/* Dashboard Section */}
      <nav className="space-y-3">
        {sidebarOpen && <h3 className="text-slate-500 text-sm font-semibold px-2 mb-3">Navigation</h3>}
        <div className="space-y-2">
          {dashboardItems.map(renderNavItem)}
        </div>
      </nav>

      {/* Recycler Tools Section */}
      <nav className="space-y-3">
        {sidebarOpen && (
          <h3 className="text-slate-500 uppercase tracking-widest text-[10px] font-semibold px-4 mb-3">
            Recycler Tools
          </h3>
        )}
        <div className="space-y-2">
          {recyclerToolsItems.map(renderNavItem)}
        </div>
      </nav>

      {/* Quick Actions Section */}
      {sidebarOpen && (
        <div className="space-y-3">
          <h3 className="text-slate-500 uppercase tracking-widest text-[10px] font-semibold px-4 mb-3">
            Operations
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActionItems.map(renderQuickActionTile)}
          </div>
        </div>
      )}

      {/* Sidebar Stats Section */}
      {sidebarOpen && (
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <h3 className="text-slate-500 text-sm font-semibold px-2 mb-3">Live Metrics</h3>
        <div className="space-y-3">
          {/* Global Impact */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-3"
          >
            <p className="text-xs font-semibold text-slate-500 mb-1">Global Impact</p>
            <motion.div
              layout
              className="flex items-baseline gap-1"
            >
              <p className="text-xl font-bold text-slate-900">
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
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-3"
          >
            <p className="text-xs font-semibold text-slate-500 mb-1">Live Pickers</p>
            <motion.div
              layout
              className="flex items-baseline gap-1"
            >
              <p className="text-xl font-bold text-slate-900">
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
            className="relative rounded-xl border border-emerald-200 bg-emerald-50 p-3 overflow-hidden"
          >
            <PulseEffect trigger={impactPulseKey} color="rgba(16, 185, 129, 0.4)" intensity={1.2} />
            <p className="text-xs font-semibold text-slate-500 mb-1">My Impact</p>
            <motion.div
              layout
              className="flex items-baseline gap-1"
            >
              <p className="text-xl font-bold text-slate-900">
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
      )}

      {/* Profile Section */}
      <div className="pt-4 border-t border-slate-200 mt-auto space-y-2">
        <motion.button
          whileHover={{ x: 4 }}
          onClick={() => navigate("/recycler/profile")}
          title={!sidebarOpen ? "Profile" : undefined}
          className={`w-full relative flex items-center ${sidebarOpen ? "gap-4 px-4" : "justify-center px-2"} py-3 rounded-lg transition-all duration-200 group ${
            isActive("/recycler/profile")
              ? "bg-emerald-100/80 text-slate-900"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <User 
              size={22} 
              strokeWidth={1.5}
              className={`shrink-0 transition-colors duration-200 ${
                isActive("/recycler/profile") ? "text-slate-900" : "text-slate-600 group-hover:text-slate-800"
              }`}
            />
          </motion.div>
          
          {sidebarOpen && (
            <span className={`text-sm font-semibold transition-colors duration-200 ${
              isActive("/recycler/profile") ? "text-slate-900" : "group-hover:text-slate-900"
            }`}>
              Profile
            </span>
          )}
        </motion.button>

        {sidebarOpen && <button
          type="button"
          onClick={onToggleSidebar}
          className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 py-3"
        >
          <span className="text-base font-medium">{sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}</span>
        </button>}
      </div>
    </aside>
  );
}
