import { useState } from "react";
import { Sprout, LayoutDashboard, List, Package, BarChart3, MessageCircle, CreditCard, User, MapPin, ScanLine, History } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRScannerModal } from "@/components/picker/QRScannerModal";
import { useToast } from "@/hooks/use-toast";

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
  { id: "pickups", label: "Pickups", icon: Package, path: "/picker/available-pickups" },
  { id: "history", label: "History", icon: History, path: "/picker/history" },
  { id: "profile", label: "Profile", icon: User, path: "/picker/profile" },
];

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scannerOpen, setScannerOpen] = useState(false);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const isBuyer = location.pathname.startsWith("/buyer");
  const isPicker = location.pathname.startsWith("/picker");
  const navigationItems: NavItem[] = isBuyer ? buyerNav : isPicker ? pickerNav : [];

  return (
    <>
      <div className={`h-screen ${collapsed ? "w-20" : "w-80"} flex flex-col overflow-hidden text-[#1E293B] transition-[width] duration-200`} style={{ background: "#F9FAFB", borderRight: "1px solid #D1FAE5" }}>
        {/* Logo */}
        <div className={`${collapsed ? "px-2 py-6" : "px-6 py-8"} border-b border-[#D1FAE5]`}>
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
            <div className="relative bg-[#10B981] p-2 rounded-lg">
              <Sprout className="h-6 w-6 text-[#1E293B]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-[#14532D] font-display">GREEN LOOP</h1>
                <p className="text-xs text-[#475569]">Picker · Buyer hub</p>
              </div>
            )}
          </div>
        </div>

        {/* Scan QR — picker only, prominent CTA */}
        {isPicker && (
          <div className={`${collapsed ? "px-2 py-3" : "px-4 py-4"} border-b border-[#D1FAE5]`}>
            <button
              onClick={() => setScannerOpen(true)}
              title={collapsed ? "Scan QR" : undefined}
              className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#1E293B] transition-colors duration-150 font-semibold`}
            >
              <ScanLine className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm">Scan Recycler QR</span>}
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className={`flex-1 ${collapsed ? "px-2 py-4" : "px-4 py-6"} space-y-2 overflow-y-auto`}>
          {!collapsed && <p className="text-sm font-semibold text-[#475569] px-2 mb-4">Navigation</p>}
          {navigationItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-xl transition-colors duration-150 ${
                  active
                    ? "text-[#14532D]"
                    : "text-[#475569] hover:text-[#14532D] hover:bg-[#DCFCE7]"
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${active ? "text-[#14532D]" : "text-[#475569]"}`} />
                {!collapsed && <span className="text-sm font-semibold">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className={`${collapsed ? "px-2 py-3" : "px-4 py-4"} border-t border-[#D1FAE5] text-center text-xs text-[#475569]`}>
          <p className="text-[#475569] font-semibold">{collapsed ? "v2.1" : "v2.1.0"}</p>
        </div>
      </div>

      {/* QR Scanner modal — triggered from sidebar */}
      <QRScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onSuccess={(result) => {
          setScannerOpen(false);
          toast({
            title: "Pickup complete ✓",
            description: `${result.weight_kg} kg collected · ${result.points} credits added to your wallet.`,
          });
        }}
      />
    </>
  );
}
