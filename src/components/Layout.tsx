import { ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";

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

  return (
    <div className="h-screen w-screen overflow-hidden bg-background relative">
      <div className="relative z-10 h-screen flex overflow-hidden">
        {!innerRecycler && (
          <div className="fixed left-0 top-0 h-screen w-80 z-50 border-r border-slate-200">
            <Sidebar />
          </div>
        )}

        <div
          className={`flex-1 overflow-y-auto overflow-x-hidden z-40 min-w-0 ${innerRecycler ? "" : "ml-80"}`}
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