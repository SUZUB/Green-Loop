import { PageBackground } from "@/components/PageBackground";
import { BuyerBottomNav } from "@/components/BuyerNav";
import OrderTracker from "@/components/buyer/OrderTracker";
import { Factory } from "lucide-react";

const BuyerOrders = () => {
  return (
    <div className="min-h-screen bg-background/40 pb-20">
      <PageBackground type="oceanPlastic" overlay="bg-foreground/50" />
      
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Factory className="h-6 w-6 text-earth" />
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
