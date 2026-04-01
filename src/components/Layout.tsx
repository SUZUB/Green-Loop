import { ReactNode, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { PageBackground } from "./PageBackground";

interface LayoutProps {
  /** e.g. floating widgets (AIChatBot) rendered above the route outlet */
  children?: ReactNode;
}

/** Routes that use `RecyclerLayout` (own sidebar) — hide outer nav to avoid two sidebars */
function routeUsesRecyclerInnerChrome(pathname: string) {
  return (
    pathname.startsWith("/recycler") ||
    pathname.startsWith("/education") ||
    pathname.startsWith("/community") ||
    pathname.startsWith("/partners")
  );
}

export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const innerRecycler = routeUsesRecyclerInnerChrome(pathname);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const stored = window.localStorage.getItem("layout_sidebar_collapsed");
      return stored === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("layout_sidebar_collapsed", String(sidebarCollapsed));
    } catch {
      // ignore
    }
  }, [sidebarCollapsed]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-background relative">
      <PageBackground type="oceanPlastic" overlay="bg-foreground/35" />
      {!innerRecycler && (
        <button
          type="button"
          onClick={() => setSidebarCollapsed((v) => !v)}
          className="fixed top-3 left-3 z-[120] rounded-lg border border-slate-200 bg-white/90 p-2 text-slate-700 backdrop-blur hover:bg-white"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
      <div className="relative z-10 h-screen flex overflow-hidden">
        {!innerRecycler && (
          <div className={`fixed left-0 top-0 h-screen ${sidebarCollapsed ? "w-20" : "w-80"} z-50 border-r border-slate-200 transition-[width] duration-200`}>
            <Sidebar collapsed={sidebarCollapsed} />
          </div>
        )}

        <div
          className={`flex-1 overflow-y-auto overflow-x-hidden z-40 min-w-0 transition-[margin-left] duration-200 ${innerRecycler ? "" : sidebarCollapsed ? "ml-20" : "ml-80"}`}
        >
          <div className="min-h-screen">
            <Outlet />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}