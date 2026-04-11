import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RecyclerSidebar } from "@/components/RecyclerSidebar";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

export function RecyclerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    try { return window.localStorage.getItem("recycler_sidebar_open") !== "false"; }
    catch { return true; }
  });

  useEffect(() => {
    try { window.localStorage.setItem("recycler_sidebar_open", String(sidebarOpen)); }
    catch { /* ignore */ }
  }, [sidebarOpen]);

  return (
    <SidebarProvider>
      <div className="flex flex-row min-h-screen w-screen relative" style={{ background: "#F9FAFB" }}>
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          className="fixed top-3 left-3 z-[140] rounded-lg p-2 transition-colors duration-150 hover:bg-[#DCFCE7]"
          style={{ background: "#F0FDF4", border: "1px solid #D1FAE5", color: "#14532D" }}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Sidebar — sticky, not fixed, so it doesn't break document flow */}
        <div className={`sticky top-0 h-screen shrink-0 z-[100] overflow-y-auto transition-[width] duration-200 ease-out ${sidebarOpen ? "w-72" : "w-20"}`}>
          <RecyclerSidebar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        </div>

        {/* Main content — natural document flow, window scrolls */}
        <main className="flex-1 min-h-screen overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
