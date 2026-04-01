import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RecyclerSidebar } from "@/components/RecyclerSidebar";
import { useState } from "react";

export function RecyclerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <SidebarProvider>
      <div className="flex flex-row h-screen w-screen overflow-hidden bg-background text-foreground relative">
        {/* Master Sidebar */}
        <div
          className={`fixed left-0 top-0 h-screen shrink-0 z-[100] overflow-y-auto transition-[width,transform] duration-200 ease-out ${
            sidebarOpen ? "w-80 translate-x-0" : "w-80 -translate-x-full"
          }`}
        >
          <RecyclerSidebar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        </div>
        
        {/* Main Content Area with Background */}
        <main
          className={`flex-1 h-screen w-full overflow-hidden relative z-0 transition-[margin-left] duration-200 ease-out ${
            sidebarOpen ? "ml-80" : "ml-0"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
