import { useState } from "react";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BuyerBottomNav } from "@/components/BuyerNav";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Factory, ArrowLeft, Save, Shield, CheckCircle2, Upload,
  Building2, FileText, User, Phone, Mail, MapPin,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const plasticTypes = [
  { id: "pet", label: "PET (#1)" },
  { id: "hdpe", label: "HDPE (#2)" },
  { id: "pvc", label: "PVC (#3)" },
  { id: "ldpe", label: "LDPE (#4)" },
  { id: "pp", label: "PP (#5)" },
  { id: "ps", label: "PS (#6)" },
  { id: "mixed", label: "Mixed Plastics" },
];

const BuyerProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    businessName: "Greenway Industries Pvt Ltd",
    registrationNumber: "U25200MH2020PTC123456",
    gstin: "27AADCG1234F1ZH",
    industryType: "manufacturing",
    address: "Plot 42, MIDC Industrial Area, Andheri East, Mumbai 400093",
    contactPerson: "Rajesh Kumar",
    designation: "Procurement Manager",
    phone: "+91 98765 43210",
    email: "procurement@greenwayindustries.com",
    minOrderQty: "500",
    budgetMin: "10",
    budgetMax: "20",
    deliveryMethod: "delivery",
    selectedPlastics: ["pet", "hdpe", "pp"],
  });

  const [documents, setDocuments] = useState([
    { name: "Business Registration.pdf", status: "verified", date: "Jan 15, 2026" },
    { name: "GSTIN Certificate.pdf", status: "verified", date: "Jan 15, 2026" },
    { name: "Company PAN Card.pdf", status: "pending", date: "Mar 1, 2026" },
  ]);

  const handleChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const togglePlastic = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      selectedPlastics: prev.selectedPlastics.includes(id)
        ? prev.selectedPlastics.filter((p) => p !== id)
        : [...prev.selectedPlastics, id],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    toast({ title: "Profile Updated!", description: "Your business profile has been saved." });
  };

  return (
    <div className="min-h-screen bg-background/40 pb-20">
      <PageBackground type="oceanPlastic" overlay="bg-foreground/50" />

      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/buyer/dashboard")} className="p-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="font-display font-bold text-lg">Business Profile</span>
          </div>
          <div className="flex items-center gap-1 text-xs bg-warning/10 text-warning px-2 py-1 rounded-full">
            <Shield className="h-3 w-3" /> Verified
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Business Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-earth" /> Business Details
          </h2>
          <Card className="p-5 space-y-4 mb-6">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input value={profile.businessName} onChange={(e) => handleChange("businessName", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Registration No.</Label>
                <Input value={profile.registrationNumber} onChange={(e) => handleChange("registrationNumber", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>GSTIN</Label>
                <div className="relative">
                  <Input value={profile.gstin} onChange={(e) => handleChange("gstin", e.target.value)} />
                  <CheckCircle2 className="absolute right-2 top-2.5 h-4 w-4 text-primary" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Industry Type</Label>
              <Select value={profile.industryType} onValueChange={(v) => handleChange("industryType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="construction">Construction (bricks, roads)</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing (pellets, granules)</SelectItem>
                  <SelectItem value="textiles">Textiles (recycled fibers)</SelectItem>
                  <SelectItem value="automotive">Automotive (components)</SelectItem>
                  <SelectItem value="electronics">Electronics (recycled materials)</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Headquarters Address</Label>
              <Textarea value={profile.address} onChange={(e) => handleChange("address", e.target.value)} rows={2} />
            </div>
          </Card>
        </motion.div>

        {/* Contact Person */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2">
            <User className="h-5 w-5 text-earth" /> Contact Person
          </h2>
          <Card className="p-5 space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={profile.contactPerson} onChange={(e) => handleChange("contactPerson", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input value={profile.designation} onChange={(e) => handleChange("designation", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</Label>
                <Input value={profile.phone} onChange={(e) => handleChange("phone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Mail className="h-3 w-3" /> Email</Label>
                <Input value={profile.email} onChange={(e) => handleChange("email", e.target.value)} />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Buying Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2">
            <Factory className="h-5 w-5 text-earth" /> Buying Preferences
          </h2>
          <Card className="p-5 space-y-4 mb-6">
            <div className="space-y-2">
              <Label>Plastic Types You Buy</Label>
              <div className="grid grid-cols-2 gap-2">
                {plasticTypes.map((pt) => (
                  <label key={pt.id} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                    <Checkbox
                      checked={profile.selectedPlastics.includes(pt.id)}
                      onCheckedChange={() => togglePlastic(pt.id)}
                    />
                    <span className="text-sm">{pt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Min Order (kg)</Label>
                <Input type="number" value={profile.minOrderQty} onChange={(e) => handleChange("minOrderQty", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Min ₹/kg</Label>
                <Input type="number" value={profile.budgetMin} onChange={(e) => handleChange("budgetMin", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Max ₹/kg</Label>
                <Input type="number" value={profile.budgetMax} onChange={(e) => handleChange("budgetMax", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Preferred Delivery Method</Label>
              <Select value={profile.deliveryMethod} onValueChange={(v) => handleChange("deliveryMethod", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="self-pickup">Self-pickup</SelectItem>
                  <SelectItem value="delivery">Delivery to my address</SelectItem>
                  <SelectItem value="bulk-transport">Bulk transport arrangement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </motion.div>

        {/* Verification Documents */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-earth" /> Verification Documents
          </h2>
          <Card className="p-5 space-y-3 mb-6">
            {documents.map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">Uploaded {doc.date}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  doc.status === "verified" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                }`}>
                  {doc.status === "verified" ? "✓ Verified" : "⏳ Pending"}
                </span>
              </div>
            ))}
            <Button variant="outline" className="w-full gap-2 mt-2">
              <Upload className="h-4 w-4" /> Upload New Document
            </Button>
          </Card>
        </motion.div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full gap-2 bg-earth text-earth-foreground hover:bg-earth/90"
          size="lg"
        >
          {saving ? "Saving..." : <><Save className="h-4 w-4" /> Save Profile</>}
        </Button>
      </div>

      <BuyerBottomNav />
    </div>
  );
};

export default BuyerProfile;
