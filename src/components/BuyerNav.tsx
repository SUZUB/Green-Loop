import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Package, MessageSquare, IndianRupee } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Home", path: "/buyer/dashboard" },
  { icon: ClipboardList, label: "Listings", path: "/buyer/listings" },
  { icon: Package, label: "Orders", path: "/buyer/orders" },
  { icon: MessageSquare, label: "Messages", path: "/buyer/messages" },
  { icon: IndianRupee, label: "Payments", path: "/buyer/payments" },
];

export const BuyerBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 transition-colors ${
                active ? "text-earth" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
