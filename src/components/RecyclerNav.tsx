import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import {
  Recycle,
  Home,
  Trophy,
  Leaf,
  Wallet,
  User,
  BookOpen,
  Users,
  ArrowLeft,
  CalendarPlus,
  Gift,
  Award,
  Share2,
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const allNavItems = [
  { path: "/recycler/dashboard", icon: Home, label: "Home" },
  { path: "/recycler/booking", icon: CalendarPlus, label: "Book Pickup" },
  { path: "/recycler/leaderboard", icon: Trophy, label: "Leaderboard" },
  { path: "/recycler/impact", icon: Leaf, label: "Impact" },
  { path: "/recycler/wallet", icon: Wallet, label: "Wallet" },
  { path: "/recycler/rewards", icon: Gift, label: "Rewards" },
  { path: "/recycler/achievements", icon: Award, label: "Achievements" },
  { path: "/recycler/referral", icon: Share2, label: "Referrals" },
  { path: "/education/knowledge-hub", icon: BookOpen, label: "Learn" },
  { path: "/community", icon: Users, label: "Community" },
  { path: "/recycler/profile", icon: User, label: "Profile" },
];

export function RecyclerTopNav({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center h-14 px-4 gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/recycler/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Logo />
          <span className="font-display font-semibold">{title}</span>
        </div>
      </div>
    </nav>
  );
}

export function RecyclerHorizontalNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border transition-shadow duration-200 ${scrolled ? "shadow-md" : ""}`}>
      <div className="container mx-auto flex items-center h-14 px-4 gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <Logo />
        </div>
        <ScrollArea className="flex-1">
          <div className="flex items-center gap-1 px-1 py-1">
            {allNavItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="h-1" />
        </ScrollArea>
      </div>
    </nav>
  );
}

export function RecyclerBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const bottomItems = allNavItems.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {bottomItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
}
