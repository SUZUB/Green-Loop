import { PageBackground } from "@/components/PageBackground";
import { BuyerBottomNav } from "@/components/BuyerNav";
import OrderTracker from "@/components/buyer/OrderTracker";
import { Factory } from "lucide-react";

const BuyerOrders = () => {
  return (
    <div className="min-h-screen pb-20">
      <PageBackground type="oceanPlastic" overlay="bg-[#F8FAF9]/65" />
      
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ background: "rgba(248,250,249,0.95)", borderColor: "#D1FAE5" }}>
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Factory className="h-6 w-6 text-[#065F46]" />
            <span className="font-display font-bold text-lg">Track Orders</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-7xl px-4 py-6">
        <OrderTracker />
      </div>

      <BuyerBottomNav />
    </div>
  );
};

export default BuyerOrders;
