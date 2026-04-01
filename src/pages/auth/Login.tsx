import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Mail, ArrowRight, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "recycler";
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length >= 6;

  const handleLogin = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully.",
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
        title: "Login failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background/40 flex flex-col isolate">
      <PageBackground type="pollution" overlay="bg-foreground/50" />
      <nav className="relative z-10 p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/role-select")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </nav>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground text-sm">
              Sign in as a {role === "picker" ? "Plastic Collector" : role === "buyer" ? "Plastic Buyer" : "Plastic Recycler"}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-card p-6 md:p-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleLogin}
              disabled={!isValid || loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                onClick={() => navigate(`/auth/signup?role=${role}`)}
                className="text-primary font-medium hover:underline"
              >
                Sign up here
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
