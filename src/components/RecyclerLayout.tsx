import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RecyclerSidebar } from "@/components/RecyclerSidebar";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { PageBackground } from "@/components/PageBackground";

export function RecyclerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    try {
      const stored = window.localStorage.getItem("recycler_sidebar_open");
      return stored === null ? true : stored === "true";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("recycler_sidebar_open", String(sidebarOpen));
    } catch {
      // ignore
    }
  }, [sidebarOpen]);

  return (
    <SidebarProvider>
      <div className="flex flex-row h-screen w-screen overflow-hidden bg-background text-foreground relative">
        <PageBackground type="recycling" overlay="bg-foreground/35" />
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          className="fixed top-3 left-3 z-[140] rounded-lg border border-slate-200 bg-white/90 p-2 text-slate-700 backdrop-blur hover:bg-white"
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <Menu className="h-5 w-5" />
        </button>
        {/* Master Sidebar */}
        <div
          className={`fixed left-0 top-0 h-screen shrink-0 z-[100] overflow-y-auto transition-[width,transform] duration-200 ease-out ${
            sidebarOpen ? "w-80 translate-x-0" : "w-20 translate-x-0"
          }`}
        >
          <RecyclerSidebar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        </div>
        
        {/* Main Content Area with Background */}
        <main
          className={`flex-1 h-screen w-full overflow-hidden relative z-0 transition-[margin-left] duration-200 ease-out ${
            sidebarOpen ? "ml-80" : "ml-20"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
