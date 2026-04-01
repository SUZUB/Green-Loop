import { Sprout, LayoutDashboard, List, Package, BarChart3, MessageCircle, CreditCard, User, MapPin } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

type NavItem = { id: string; label: string; icon: React.ComponentType<{ className?: string }>; path: string };

const buyerNav: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/buyer/dashboard" },
  { id: "listings", label: "Listings", icon: List, path: "/buyer/listings" },
  { id: "orders", label: "Orders", icon: Package, path: "/buyer/orders" },
  { id: "analytics", label: "Analytics", icon: BarChart3, path: "/buyer/analytics" },
  { id: "messages", label: "Messages", icon: MessageCircle, path: "/buyer/messages" },
  { id: "payments", label: "Payments", icon: CreditCard, path: "/buyer/payments" },
  { id: "profile", label: "Profile", icon: User, path: "/buyer/profile" },
];

const pickerNav: NavItem[] = [
  { id: "map", label: "Dashboard", icon: MapPin, path: "/picker/dashboard" },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const isBuyer = location.pathname.startsWith("/buyer");
  const isPicker = location.pathname.startsWith("/picker");
  const navigationItems: NavItem[] = isBuyer ? buyerNav : isPicker ? pickerNav : [];

  return (
    <div className="h-screen w-80 bg-slate-50 flex flex-col border-r border-slate-200 overflow-hidden text-slate-900">
      {/* Logo Section */}
      <div className="px-6 py-8 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="relative bg-emerald-600 p-2 rounded-lg">
              <Sprout className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-900 font-display">EcoSync</h1>
            <p className="text-xs text-slate-500">Green Loop</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <p className="text-sm font-semibold text-slate-500 px-2 mb-4">Navigation</p>
        {navigationItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150 ${
                active ? "bg-emerald-100/80 text-slate-900" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0 text-slate-700" />
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-200 text-center text-xs text-slate-500">
        <p className="text-slate-500 font-semibold">v2.1.0</p>
      </div>
    </div>
  );
}
