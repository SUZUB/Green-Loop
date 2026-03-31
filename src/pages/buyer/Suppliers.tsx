import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BuyerBottomNav } from "@/components/BuyerNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRecycleHub } from "@/hooks/useRecycleHub";
import { SourcingForm, SourcingRequest } from "@/components/buyer/SourcingForm";
import {
  Factory, Star, MessageSquare, Heart, Shield, Bell, Package, Clock, TrendingUp,
} from "lucide-react";

const suppliers = [
  { id: 1, name: "ABC Recyclers", types: ["PET", "HDPE"], rating: 4.8, reviews: 24, orders: 15, onTime: 96, verified: true, location: "Mumbai", totalQty: "7,500 kg" },
  { id: 2, name: "XYZ Plastics", types: ["PET", "PP"], rating: 4.5, reviews: 16, orders: 8, onTime: 92, verified: true, location: "Pune", totalQty: "4,200 kg" },
  { id: 3, name: "Eco Solutions", types: ["Mixed", "HDPE"], rating: 4.2, reviews: 10, orders: 5, onTime: 88, verified: false, location: "Delhi", totalQty: "1,800 kg" },
  { id: 4, name: "Green Plastics Co", types: ["PP", "LDPE"], rating: 4.6, reviews: 19, orders: 11, onTime: 94, verified: true, location: "Chennai", totalQty: "5,500 kg" },
  { id: 5, name: "Recycle India", types: ["PET", "PS"], rating: 3.9, reviews: 7, orders: 3, onTime: 85, verified: false, location: "Bangalore", totalQty: "900 kg" },
];

const INITIAL_PENDING_APPLICATIONS = [
  { supplier: "ABC Recyclers", type: "PET", qty: "500 kg", price: "₹14/kg", delivery: "5 days", applied: "2 hrs ago" },
  { supplier: "XYZ Plastics", type: "PET", qty: "1,000 kg", price: "₹15/kg", delivery: "3 days", applied: "1 day ago" },
  { supplier: "Eco Solutions", type: "PET", qty: "300 kg", price: "₹16/kg", delivery: "7 days", applied: "2 days ago" },
];

const BuyerSuppliers = () => {
  const { toast } = useToast();
  const { supplierApplications, addSourcingRequest } = useRecycleHub();
  const [selectedSupplier, setSelectedSupplier] = useState<typeof suppliers[0] | null>(null);
  const [tab, setTab] = useState<"suppliers" | "applications">("suppliers");
  const [search, setSearch] = useState("");
  const pendingApplications = supplierApplications.filter((application) => application.status === "Pending");
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const stored = window.localStorage.getItem("buyer_supplier_notifications");
    if (stored) {
      setNotificationCount(Number(stored));
    }
  }, []);

  const filteredSuppliers = useMemo(
    () => suppliers.filter((supplier) =>
      supplier.name.toLowerCase().includes(search.toLowerCase()) ||
      supplier.types.join(" ").toLowerCase().includes(search.toLowerCase()) ||
      supplier.location.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  const handleNewRequest = (request: SourcingRequest) => {
    const newRequest = addSourcingRequest({
      materialType: request.material,
      quantity: `${request.quantity} ${request.unit}`,
      requestedBy: "Current Buyer",
      location: "Bangalore",
      requiredBy: request.timeline,
      status: "Active",
      applications: Math.floor(Math.random() * 15) + 5,
    });
    
    toast({
      title: "✅ Sourcing request posted",
      description: `${request.title} is now live in the marketplace.`,
      variant: "success",
    });

    // Simulate supplier acceptance
    setTimeout(() => {
      toast({
        title: "🎯 Supplier matched!",
        description: `${request.supplier} found your ${request.material} request. 12 applications received.`,
        variant: "success",
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background/40 pb-20">
      <PageBackground type="oceanPlastic" overlay="bg-foreground/50" />
      
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Factory className="h-6 w-6 text-earth" />
            <span className="font-display font-bold text-lg">Supplier Marketplace</span>
          </div>
          <button className="relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100">
            <Bell className="h-4 w-4" /> Notifications
            {notificationCount > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-500 text-[11px] text-white px-1.5">
                {notificationCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] bg-white/10 border border-white/20 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/75">Verified Suppliers</p>
                  <h1 className="mt-2 text-2xl font-semibold text-white">Supplier directory</h1>
                </div>
                <div className="flex items-center gap-3 rounded-full bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
                  <Shield className="h-4 w-4 text-emerald-300" /> Verified partners
                </div>
              </div>
              <div className="mt-5 flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search suppliers, materials, city"
                  className="bg-transparent text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredSuppliers.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card
                    className="p-4 cursor-pointer hover:shadow-soft transition-shadow"
                    onClick={() => setSelectedSupplier(s)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-white">{s.name}</h3>
                          {s.verified && (
                            <span className="flex items-center gap-0.5 text-xs text-primary">
                              <Shield className="h-3 w-3" /> Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.location} · {s.types.join(", ")}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold text-white">{s.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>{s.orders} orders</span>
                      <span>{s.onTime}% on-time</span>
                      <span>{s.totalQty} supplied</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="rounded-[32px] bg-slate-950/90 border border-white/10 p-6 shadow-2xl">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pending requests</p>
                  <h2 className="text-xl font-semibold text-white">Application queue</h2>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-2 text-xs text-slate-300">{pendingApplications.length} open</span>
              </div>
              <div className="space-y-3">
                {pendingApplications.map((app, i) => (
                  <Card key={`${app.supplier}-${i}`} className="p-3 bg-slate-950/80 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm text-white">{app.supplier}</p>
                        <p className="text-xs text-slate-400">{app.type} · {app.qty}</p>
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{app.applied}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{app.delivery} delivery</span>
                      <span>{app.price}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <SourcingForm onPostRequest={handleNewRequest} />
          </div>
        </div>
      </div>

      {/* Supplier Detail Dialog */}
      <Dialog open={!!selectedSupplier} onOpenChange={() => setSelectedSupplier(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              {selectedSupplier?.name}
              {selectedSupplier?.verified && <Shield className="h-4 w-4 text-primary" />}
            </DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-lg font-bold">{selectedSupplier.rating}</span>
                  <span className="text-sm text-muted-foreground">({selectedSupplier.reviews} reviews)</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Card className="p-3 text-center">
                  <Package className="h-4 w-4 mx-auto mb-1 text-earth" />
                  <p className="text-lg font-bold">{selectedSupplier.orders}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </Card>
                <Card className="p-3 text-center">
                  <Clock className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <p className="text-lg font-bold">{selectedSupplier.onTime}%</p>
                  <p className="text-xs text-muted-foreground">On-time</p>
                </Card>
                <Card className="p-3 text-center">
                  <TrendingUp className="h-4 w-4 mx-auto mb-1 text-ocean" />
                  <p className="text-lg font-bold">{selectedSupplier.totalQty}</p>
                  <p className="text-xs text-muted-foreground">Supplied</p>
                </Card>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Plastic Types</h4>
                <div className="flex gap-2">
                  {selectedSupplier.types.map(t => (
                    <span key={t} className="px-3 py-1 rounded-full bg-muted text-xs font-medium">{t}</span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Location</h4>
                <p className="text-sm text-muted-foreground">{selectedSupplier.location}</p>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 bg-earth text-earth-foreground hover:bg-earth/90 gap-1">
                  <MessageSquare className="h-4 w-4" /> Message
                </Button>
                <Button variant="outline" className="flex-1 gap-1">
                  <Heart className="h-4 w-4" /> Preferred
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BuyerBottomNav />
    </div>
  );
};

export default BuyerSuppliers;
