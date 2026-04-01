import { useEffect, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import {
  Factory, ArrowLeft, Save, Shield, CheckCircle2, Upload,
  Building2, FileText, User, Phone, Mail, Loader2,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const plasticTypes = [
  { id: "pet",   label: "PET (#1)" },
  { id: "hdpe",  label: "HDPE (#2)" },
  { id: "pvc",   label: "PVC (#3)" },
  { id: "ldpe",  label: "LDPE (#4)" },
  { id: "pp",    label: "PP (#5)" },
  { id: "ps",    label: "PS (#6)" },
  { id: "mixed", label: "Mixed Plastics" },
];

interface BuyerProfileState {
  businessName: string;
  registrationNumber: string;
  gstin: string;
  industryType: string;
  address: string;
  contactPerson: string;
  designation: string;
  phone: string;
  email: string;
  minOrderQty: string;
  budgetMin: string;
  budgetMax: string;
  deliveryMethod: string;
  selectedPlastics: string[];
}

const EMPTY_PROFILE: BuyerProfileState = {
  businessName: "", registrationNumber: "", gstin: "",
  industryType: "", address: "", contactPerson: "",
  designation: "", phone: "", email: "",
  minOrderQty: "", budgetMin: "", budgetMax: "",
  deliveryMethod: "delivery", selectedPlastics: [],
};

const BuyerProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<BuyerProfileState>(EMPTY_PROFILE);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) { setLoading(false); return; }
      if (!cancelled) setUserId(user.id);

      const { data: row } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .maybeSingle();

      if (!cancelled) {
        // Pre-fill what we have from the profiles table; rest starts empty for new users
        setProfile((prev) => ({
          ...prev,
          contactPerson: (row as any)?.full_name ?? "",
          email: user.email ?? "",
        }));
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleChange = (field: keyof BuyerProfileState, value: string) => {
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
    if (!userId) return;
    setSaving(true);
    // Save the fields we can persist to the profiles table
    const { error } = await supabase.from("profiles")
      .update({ full_name: profile.contactPerson })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile Updated!", description: "Your business profile has been saved." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background/40 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              <Input value={profile.businessName} onChange={(e) => handleChange("businessName", e.target.value)} placeholder="Your company name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Registration No.</Label>
                <Input value={profile.registrationNumber} onChange={(e) => handleChange("registrationNumber", e.target.value)} placeholder="CIN / Reg. no." />
              </div>
              <div className="space-y-2">
                <Label>GSTIN</Label>
                <div className="relative">
                  <Input value={profile.gstin} onChange={(e) => handleChange("gstin", e.target.value)} placeholder="22AAAAA0000A1Z5" />
                  {profile.gstin.length === 15 && (
                    <CheckCircle2 className="absolute right-2 top-2.5 h-4 w-4 text-primary" />
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Industry Type</Label>
              <Select value={profile.industryType} onValueChange={(v) => handleChange("industryType", v)}>
                <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
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
              <Textarea value={profile.address} onChange={(e) => handleChange("address", e.target.value)} placeholder="Full business address" rows={2} />
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
                <Input value={profile.contactPerson} onChange={(e) => handleChange("contactPerson", e.target.value)} placeholder="Contact name" />
              </div>
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input value={profile.designation} onChange={(e) => handleChange("designation", e.target.value)} placeholder="e.g. Procurement Manager" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</Label>
                <Input value={profile.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Mail className="h-3 w-3" /> Email</Label>
                <Input value={profile.email} disabled className="opacity-60" />
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
                <Input type="number" value={profile.minOrderQty} onChange={(e) => handleChange("minOrderQty", e.target.value)} placeholder="500" />
              </div>
              <div className="space-y-2">
                <Label>Min ₹/kg</Label>
                <Input type="number" value={profile.budgetMin} onChange={(e) => handleChange("budgetMin", e.target.value)} placeholder="10" />
              </div>
              <div className="space-y-2">
                <Label>Max ₹/kg</Label>
                <Input type="number" value={profile.budgetMax} onChange={(e) => handleChange("budgetMax", e.target.value)} placeholder="20" />
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
          <Card className="p-5 mb-6">
            <p className="text-sm text-muted-foreground mb-3">Upload your business registration and compliance documents.</p>
            <Button variant="outline" className="w-full gap-2">
              <Upload className="h-4 w-4" /> Upload Document
            </Button>
          </Card>
        </motion.div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full gap-2 bg-earth text-earth-foreground hover:bg-earth/90"
          size="lg"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>

      <BuyerBottomNav />
    </div>
  );
};

export default BuyerProfile;
