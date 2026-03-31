import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RecyclerSidebar } from "@/components/RecyclerSidebar";

export function RecyclerLayout() {
  return (
    <SidebarProvider>
      <div className="flex flex-row h-screen w-screen overflow-hidden bg-[#020617] text-white relative">
        {/* Master Sidebar */}
        <div className="fixed left-0 top-0 h-screen w-80 shrink-0 border-r border-white/10 bg-[#020617] z-[100] overflow-y-auto">
          <RecyclerSidebar />
        </div>
        
        {/* Main Content Area with Background */}
        <main className="ml-80 flex-1 h-screen w-full overflow-hidden relative z-0">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
