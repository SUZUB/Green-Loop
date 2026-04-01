import { Sprout, LayoutDashboard, List, Package, BarChart3, MessageCircle, CreditCard, User, MapPin, ScanLine } from "lucide-react";
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
  { id: "aiCamera", label: "AI Scanner", icon: ScanLine, path: "/picker/ai-camera" },
  { id: "profile", label: "Profile", icon: User, path: "/picker/profile" },
];

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const isBuyer = location.pathname.startsWith("/buyer");
  const isPicker = location.pathname.startsWith("/picker");
  const navigationItems: NavItem[] = isBuyer ? buyerNav : isPicker ? pickerNav : [];

  return (
    <div className={`h-screen ${collapsed ? "w-20" : "w-80"} bg-slate-50 flex flex-col border-r border-slate-200 overflow-hidden text-slate-900 transition-[width] duration-200`}>
      {/* Logo Section */}
      <div className={`${collapsed ? "px-2 py-6" : "px-6 py-8"} border-b border-slate-200`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="relative">
            <div className="relative bg-emerald-600 p-2 rounded-lg">
              <Sprout className="h-6 w-6 text-white" />
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-slate-900 font-display">GREEN LOOP</h1>
              <p className="text-xs text-slate-500">Picker · Buyer hub</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className={`flex-1 ${collapsed ? "px-2 py-4" : "px-4 py-6"} space-y-2 overflow-y-auto`}>
        {!collapsed && <p className="text-sm font-semibold text-slate-500 px-2 mb-4">Navigation</p>}
        {navigationItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-xl transition-colors duration-150 ${
                active ? "bg-emerald-100/80 text-slate-900" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0 text-slate-700" />
              {!collapsed && <span className="text-sm font-semibold">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className={`${collapsed ? "px-2 py-3" : "px-4 py-4"} border-t border-slate-200 text-center text-xs text-slate-500`}>
        <p className="text-slate-500 font-semibold">{collapsed ? "v2.1" : "v2.1.0"}</p>
      </div>
    </div>
  );
}
