import { useState } from "react";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "recycler";
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    address: "",
    vehicleType: "",
    capacity: "",
    serviceRadius: "",
    businessName: "",
    industryType: "",
    gstin: "",
  });

  const isPicker = role === "picker";
  const isBuyer = role === "buyer";

  const isValid =
    form.name.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.password.length >= 6 &&
    (!isPicker || (form.vehicleType && form.capacity));

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.name, role },
        },
      });

      if (error) throw error;

      // Update profile with full name
      if (data.user) {
        await supabase
          .from("profiles")
          .update({
            full_name: form.name,
            role,
            coin_balance: 0,
            total_pickups: 0,
            total_points: 0,
            total_recycled_kg: 0,
            referral_count: 0,
            consecutive_weeks: 0,
          })
          .eq("id", data.user.id);
      }

      toast({
        title: "Account Created!",
        description: "You are now logged in.",
      });

      if (role === "picker") {
        navigate("/picker/dashboard");
      } else if (role === "buyer") {
        navigate("/buyer/dashboard");
      } else {
        navigate("/recycler/dashboard");
      }
    } catch (err: any) {
      toast({
        title: "Signup failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background/40 flex flex-col isolate overflow-y-auto">
      <PageBackground type="recycling" overlay="bg-foreground/50" />
      <nav className="relative z-10 p-4 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/auth/login?role=${role}`)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </Button>
      </nav>

      <div className="relative z-10 flex-1 flex items-start justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground text-sm">
              Sign up as a {isPicker ? "Plastic Collector" : isBuyer ? "Plastic Buyer" : "Plastic Recycler"}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-card p-6 md:p-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Your full name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} maxLength={100} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => handleChange("email", e.target.value)} maxLength={255} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input id="signup-password" type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => handleChange("password", e.target.value)} maxLength={100} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-mobile">Mobile Number (optional)</Label>
              <Input id="signup-mobile" type="tel" placeholder="Enter mobile number" value={form.mobile} onChange={(e) => handleChange("mobile", e.target.value.replace(/\D/g, ""))} maxLength={15} />
            </div>

            {isPicker && (
              <>
                <div className="space-y-2">
                  <Label>Vehicle Type</Label>
                  <Select value={form.vehicleType} onValueChange={(v) => handleChange("vehicleType", v)}>
                    <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bicycle">Bicycle</SelectItem>
                      <SelectItem value="motorcycle">Motorcycle</SelectItem>
                      <SelectItem value="auto">Auto Rickshaw</SelectItem>
                      <SelectItem value="van">Van / Tempo</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Transport Capacity (kg)</Label>
                  <Input id="capacity" type="number" placeholder="e.g. 50" value={form.capacity} onChange={(e) => handleChange("capacity", e.target.value)} />
                </div>
              </>
            )}

            {isBuyer && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input id="businessName" placeholder="Your company name" value={form.businessName} onChange={(e) => handleChange("businessName", e.target.value)} maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label>Industry Type</Label>
                  <Select value={form.industryType} onValueChange={(v) => handleChange("industryType", v)}>
                    <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="textiles">Textiles</SelectItem>
                      <SelectItem value="automotive">Automotive</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN (optional)</Label>
                  <Input id="gstin" placeholder="e.g. 22AAAAA0000A1Z5" value={form.gstin} onChange={(e) => handleChange("gstin", e.target.value)} maxLength={20} />
                </div>
              </>
            )}

            <Button className="w-full gap-2 mt-2" size="lg" onClick={handleSubmit} disabled={!isValid || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowRight className="h-4 w-4" /> Create Account</>}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button onClick={() => navigate(`/auth/login?role=${role}`)} className="text-primary font-medium hover:underline">Log in</button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
