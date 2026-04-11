import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, List, Package, BarChart3, MessageCircle,
  CreditCard, User, Leaf, Sprout, Menu,
} from "lucide-react";

const buyerNav = [
  { id: "dashboard",     label: "Dashboard",       icon: LayoutDashboard, path: "/buyer/dashboard" },
  { id: "carbon-market", label: "Carbon Market",   icon: Leaf,            path: "/buyer/carbon-market" },
  { id: "listings",      label: "Listings",         icon: List,            path: "/buyer/listings" },
  { id: "orders",        label: "Orders",           icon: Package,         path: "/buyer/orders" },
  { id: "suppliers",     label: "Suppliers",        icon: BarChart3,       path: "/buyer/suppliers" },
  { id: "analytics",     label: "Analytics",        icon: BarChart3,       path: "/buyer/analytics" },
  { id: "messages",      label: "Messages",         icon: MessageCircle,   path: "/buyer/messages" },
  { id: "payments",      label: "Payments",         icon: CreditCard,      path: "/buyer/payments" },
  { id: "profile",       label: "Profile",          icon: User,            path: "/buyer/profile" },
];

function BuyerSidebar({ collapsed }: { collapsed: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden transition-[width] duration-200 ${collapsed ? "w-20" : "w-64"}`}
      style={{ background: "#F9FAFB", borderRight: "1px solid #D1FAE5" }}
    >
      {/* Brand */}
      <div className={`${collapsed ? "px-2 py-6" : "px-5 py-6"} border-b border-[#D1FAE5]`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="bg-[#10B981] p-2 rounded-lg shrink-0">
            <Sprout className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold text-[#14532D] font-display">GREEN LOOP</p>
              <p className="text-[10px] text-[#475569] font-medium uppercase tracking-widest">Buyer</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className={`flex-1 ${collapsed ? "px-2 py-4" : "px-3 py-5"} space-y-1 overflow-y-auto`}>
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8] px-3 mb-3">Navigation</p>
        )}
        {buyerNav.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
                active
                  ? "bg-[#DCFCE7] text-[#14532D]"
                  : "text-[#475569] hover:bg-[#F0FDF4] hover:text-[#14532D]"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#10B981]" : "text-[#94A3B8]"}`} />
              {!collapsed && item.label}
            </button>
          );
        })}
      </nav>

      <div className={`${collapsed ? "px-2 py-3" : "px-4 py-4"} border-t border-[#D1FAE5]`}>
        <p className="text-[10px] text-center text-[#94A3B8] font-medium">v2.1.0</p>
      </div>
    </div>
  );
}

export function BuyerLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return window.localStorage.getItem("buyer_sidebar_collapsed") === "true"; }
    catch { return false; }
  });

  useEffect(() => {
    try { window.localStorage.setItem("buyer_sidebar_collapsed", String(collapsed)); }
    catch { /* ignore */ }
  }, [collapsed]);

  return (
    <div className="flex min-h-screen w-screen" style={{ background: "#F9FAFB" }}>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="fixed top-3 left-3 z-[120] rounded-lg p-2 transition-colors hover:bg-[#DCFCE7]"
        style={{ background: "#F0FDF4", border: "1px solid #D1FAE5", color: "#14532D" }}
        title={collapsed ? "Expand" : "Collapse"}
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Sidebar */}
      <div className={`sticky top-0 h-screen shrink-0 z-50 transition-[width] duration-200 ${collapsed ? "w-20" : "w-64"}`}>
        <BuyerSidebar collapsed={collapsed} />
      </div>

      {/* Page content */}
      <main className="flex-1 min-h-screen overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
