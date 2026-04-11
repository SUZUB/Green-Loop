import { useState } from "react";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BuyerBottomNav } from "@/components/BuyerNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Factory, Plus, Edit, Trash2, Eye, Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRecycleHub } from "@/hooks/useRecycleHub";

const mockListings = [
  { id: 1, title: "PET Bottles (Clear)", type: "PET", qty: "5,000 kg", price: "₹15/kg", status: "Active", applications: 12 },
  { id: 2, title: "HDPE Film Bales", type: "HDPE", qty: "2,000 kg", price: "Quote", status: "Active", applications: 5 },
  { id: 3, title: "Mixed Plastic Mix", type: "Mixed", qty: "10,000 kg", price: "₹10/kg", status: "50% Fulfilled", applications: 23 },
  { id: 4, title: "PP Granules", type: "PP", qty: "1,500 kg", price: "₹18/kg", status: "Active", applications: 3 },
];

const plasticTypes = ["PET (#1)", "HDPE (#2)", "PVC (#3)", "LDPE (#4)", "PP (#5)", "PS (#6)", "Mixed"];
const plasticForms = ["Whole bottles", "Crushed/baled", "Shredded", "Pellets/granules", "Films/sheets", "Other"];

const BuyerListings = () => {
  const navigate = useNavigate();
  const { sourcingRequests } = useRecycleHub();
  const activeCount = sourcingRequests.filter((request) => request.status === "Active").length;
  const pendingCount = sourcingRequests.filter((request) => request.status === "Pending").length;
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="min-h-screen pb-20">
      <PageBackground type="oceanPlastic" overlay="bg-[#F8FAF9]/65" />
      
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ background: "rgba(248,250,249,0.95)", borderColor: "#D1FAE5" }}>
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Factory className="h-6 w-6 text-[#065F46]" />
            <span className="font-display font-bold text-lg">Buy Listings</span>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1 bg-[#10B981] text-white hover:bg-[#10B981]/90">
            <Plus className="h-4 w-4" /> New Listing
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Active", value: activeCount.toString() },
            { label: "Applications", value: pendingCount.toString() },
            { label: "Requests", value: sourcingRequests.length.toString() },
          ].map((s, i) => (
            <Card key={s.label} className="p-3 text-center">
              <p className="text-xl font-display font-bold">{s.value}</p>
              <p className="text-xs text-[#475569]">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Listings */}
        <div className="space-y-3">
          {sourcingRequests.map((listing, i) => (
            <motion.div key={listing.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{listing.materialType} Request</h3>
                    <p className="text-xs text-[#475569]">{listing.materialType} · {listing.quantity} · {listing.requestedBy}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    listing.status === "Active" ? "bg-[#DCFCE7] text-[#14532D]" : "bg-warning/10 text-warning"
                  }`}>
                    {listing.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-[#475569] flex items-center gap-1">
                    <Users className="h-3 w-3" /> {listing.applications} applications
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create Listing Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Post New Buy Listing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Listing Title</Label>
              <Input placeholder="e.g., Buying PET Bottles (Clear)" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Plastic Type</Label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  {plasticTypes.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label>Plastic Form</Label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  {plasticForms.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Quantity (kg)</Label>
                <Input type="number" placeholder="1000" />
              </div>
              <div>
                <Label>Price per kg (₹)</Label>
                <Input type="number" placeholder="15" />
              </div>
            </div>
            <div>
              <Label>Order Frequency</Label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option>One-time</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Ongoing contract</option>
              </select>
            </div>
            <div>
              <Label>Delivery Method</Label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option>Self-pickup</option>
                <option>Delivery to my address</option>
                <option>Bulk transport arrangement</option>
              </select>
            </div>
            <div>
              <Label>Special Requirements</Label>
              <Textarea placeholder="e.g., Need pre-washed and sorted, no contamination" rows={3} />
            </div>
            <div>
              <Label>Listing Duration</Label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option>7 days</option>
                <option>30 days</option>
                <option>90 days</option>
                <option>Until fulfilled</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button className="flex-1 bg-[#10B981] text-white hover:bg-[#10B981]/90">Post Listing</Button>
              <Button variant="outline" className="flex-1">Save as Draft</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BuyerBottomNav />
    </div>
  );
};

export default BuyerListings;
