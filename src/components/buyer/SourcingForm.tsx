import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, CheckCircle2, MapPin, Shield, Truck } from "lucide-react";

export interface SourcingRequest {
  id: string;
  title: string;
  material: string;
  quantity: number;
  unit: string;
  location: string;
  supplier: string;
  timeline: string;
  delivery: string;
  notes: string;
  status: "Pending" | "Accepted" | "Rejected";
  createdAt: string;
}

const SUPPLIER_OPTIONS = [
  "ABC Recyclers",
  "XYZ Plastics",
  "Green Plastics Co",
  "Eco Solutions",
];

const materials = ["HDPE", "PET", "PP", "LDPE", "Mixed Plastic", "Aluminum"];
const timeFrames = ["3 days", "1 week", "2 weeks", "1 month"];
const deliveryOptions = ["Delivery to my address", "Self-pickup", "Partner transport"];

export function SourcingForm({ onPostRequest }: { onPostRequest: (request: SourcingRequest) => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [material, setMaterial] = useState("HDPE");
  const [quantity, setQuantity] = useState(5);
  const [unit, setUnit] = useState("tons");
  const [location, setLocation] = useState("Mumbai Collection Center");
  const [supplier, setSupplier] = useState(SUPPLIER_OPTIONS[0]);
  const [timeline, setTimeline] = useState(timeFrames[1]);
  const [delivery, setDelivery] = useState(deliveryOptions[0]);
  const [notes, setNotes] = useState("");
  const [recentRequests, setRecentRequests] = useState<SourcingRequest[]>([]);
  const stepLabels = ["Request", "Supplier", "Confirm"];

  const handlePostRequest = () => {
    const request: SourcingRequest = {
      id: `REQ-${Date.now()}`,
      title: `Need ${quantity} ${unit} of ${material}`,
      material,
      quantity,
      unit,
      location,
      supplier,
      timeline,
      delivery,
      notes,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    onPostRequest(request);
    setRecentRequests((prev) => [request, ...prev].slice(0, 8));
    setStep(1);
    setQuantity(5);
    setNotes("");
    toast({
      title: "Sourcing request posted",
      description: `Your request for ${quantity} ${unit} of ${material} is now pending supplier review.`,
      variant: "success",
    });
  };

  return (
    <Card className="rounded-[28px] bg-white border border-[#D1FAE5] shadow-card p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#475569]">Sourcing Request</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#1E293B]">Post a new request</h2>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-800">Live pipeline</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.28em] text-[#475569]">
          {stepLabels.map((label, index) => (
            <div key={label} className={`rounded-full px-3 py-2 ${step === index + 1 ? "bg-emerald-100 text-emerald-800" : "bg-[#F0FDF4] text-[#475569]"}`}>
              {label}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label>Material</Label>
            <select
              value={material}
              onChange={(event) => setMaterial(event.target.value)}
              className="w-full rounded-xl border border-[#D1FAE5] bg-white px-3 py-2 text-sm text-[#1E293B]"
            >
              {materials.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
              />
            </div>
            <div>
              <Label>Unit</Label>
              <select
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                className="w-full rounded-xl border border-[#D1FAE5] bg-white px-3 py-2 text-sm text-[#1E293B]"
              >
                <option value="kg">kg</option>
                <option value="tons">tons</option>
              </select>
            </div>
          </div>
          <div>
            <Label>Need by</Label>
            <select
              value={timeline}
              onChange={(event) => setTimeline(event.target.value)}
              className="w-full rounded-xl border border-[#D1FAE5] bg-white px-3 py-2 text-sm text-[#1E293B]"
            >
              {timeFrames.map((frame) => (
                <option key={frame} value={frame}>{frame}</option>
              ))}
            </select>
          </div>
          <Button type="button" className="w-full bg-[#10B981] text-[#1E293B] hover:bg-[#10B981]" onClick={() => setStep(2)}>
            Continue to supplier details <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <Label>Preferred supplier</Label>
            <select
              value={supplier}
              onChange={(event) => setSupplier(event.target.value)}
              className="w-full rounded-xl border border-[#D1FAE5] bg-white px-3 py-2 text-sm text-[#1E293B]"
            >
              {SUPPLIER_OPTIONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Collection location</Label>
            <select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="w-full rounded-xl border border-[#D1FAE5] bg-white px-3 py-2 text-sm text-[#1E293B]"
            >
              <option value="Mumbai Collection Center">Mumbai Collection Center</option>
              <option value="Bangalore Sorting Hub">Bangalore Sorting Hub</option>
              <option value="Chennai Coastal Depot">Chennai Coastal Depot</option>
            </select>
          </div>
          <div>
            <Label>Delivery mode</Label>
            <select
              value={delivery}
              onChange={(event) => setDelivery(event.target.value)}
              className="w-full rounded-xl border border-[#D1FAE5] bg-white px-3 py-2 text-sm text-[#1E293B]"
            >
              {deliveryOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Additional notes</Label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Enter sorting, contamination, or pickup instructions" />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button className="flex-1 bg-[#10B981] text-[#1E293B] hover:bg-[#10B981]" onClick={() => setStep(3)}>
              Review Request
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-[#F8FAF9] p-4 border border-[#D1FAE5]">
            <div className="flex items-center justify-between text-sm text-[#475569]">
              <span>Request</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-[#1E293B]">{quantity} {unit} of {material}</h3>
            <p className="mt-2 text-sm text-[#475569]">Supplier: {supplier}</p>
            <p className="text-sm text-[#475569]">Location: {location}</p>
            <p className="text-sm text-[#475569]">Need by: {timeline}</p>
            <p className="text-sm text-[#475569]">Delivery: {delivery}</p>
            {notes && <p className="mt-3 text-sm text-[#475569]">Notes: {notes}</p>}
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm text-[#065F46]">
            <div className="rounded-3xl bg-emerald-50 border border-emerald-100 p-4">
              <CheckCircle2 className="h-5 w-5 text-[#14532D]" />
              <p className="mt-2">Pending supplier review</p>
            </div>
            <div className="rounded-3xl bg-sky-50 border border-sky-100 p-4">
              <MapPin className="h-5 w-5 text-[#14532D]" />
              <p className="mt-2">Live sourcing route</p>
            </div>
            <div className="rounded-3xl bg-[#F8FAF9] border border-[#D1FAE5] p-4">
              <Truck className="h-5 w-5 text-[#475569]" />
              <p className="mt-2">Local network fulfillment</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
              Edit
            </Button>
            <Button className="flex-1 bg-[#10B981] text-[#1E293B] hover:bg-[#10B981]" onClick={handlePostRequest}>
              Post Request
            </Button>
          </div>
        </div>
      )}

      {recentRequests.length > 0 && (
        <div className="mt-6 rounded-3xl bg-white/95 p-4 border border-[#D1FAE5] backdrop-blur">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-[0.28em] text-[#475569]">Recent requests</span>
            <span className="text-xs text-emerald">{recentRequests.length} saved</span>
          </div>
          <div className="space-y-3">
            {recentRequests.slice(0, 3).map((request) => (
              <div key={request.id} className="rounded-2xl border border-[#D1FAE5] bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{request.title}</p>
                  <span className="text-[11px] uppercase tracking-[0.24em] text-[#475569]">{request.status}</span>
                </div>
                <p className="text-xs text-[#475569]">Supplier: {request.supplier}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
