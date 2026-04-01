import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Leaf, Droplets, Fish, Factory, ArrowRight, Shield, Recycle,
  TrendingUp, Award, Flame, Star, Users, TreePine, Zap, Globe, CheckCircle2
} from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import FutureVision from "@/components/landing/FutureVision";
import heroOceanBg from "@/assets/hero-ocean-bg.jpg";
import heroIntroPollutionBg from "@/assets/hero-intro-pollution-bg.jpg";
import heroPollutionBg from "@/assets/hero-pollution-bg.jpg";
import heroRecyclingBg from "@/assets/hero-recycling-process-bg.jpg";
import heroWasteBg from "@/assets/hero-plastic-waste-bg.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const },
  }),
};

const LiveCounter = ({ end, suffix, label, icon: Icon, color }: {
  end: number; suffix: string; label: string; icon: React.ElementType; color: string;
}) => {
  const { count, ref } = useCountUp(end, 2200);
  return (
    <div ref={ref} className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-card border border-border">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
      <div>
        <div className="text-lg font-display font-bold text-foreground">
          {count.toLocaleString()}{suffix}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
};

const achievements = [
  { icon: Award, title: "Eco Warrior", desc: "100kg recycled", emoji: "🏅", color: "bg-leaf" },
  { icon: Star, title: "Green Champion", desc: "500kg recycled", emoji: "🏆", color: "bg-primary" },
  { icon: Zap, title: "Plastic Saver", desc: "First recycling", emoji: "⭐", color: "bg-secondary" },
  { icon: Flame, title: "Consistency King", desc: "10 consecutive pickups", emoji: "🔥", color: "bg-earth" },
];

const Index = () => {
  const navigate = useNavigate();
  const { state } = useEco();

  const impactCards = [
    { icon: Users, value: state.globalUsersActive, suffix: "+", label: "Recyclers Active", badge: "Growing Community", color: "bg-leaf" },
    { icon: Recycle, value: Math.floor(state.globalPlasticCollected / 1000), suffix: "+", label: "Tons Recycled", badge: "Massive Impact", color: "bg-primary" },
    { icon: Star, value: state.globalPointsDistributed, suffix: "", label: "Points Distributed", badge: "Rewarding Community", color: "bg-secondary" },
    { icon: TreePine, value: Math.floor(state.globalPlasticCollected / 100), suffix: "+", label: "Trees Planted Equivalent", badge: "Planet Saver", color: "bg-earth" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Recycle className="h-7 w-7 text-primary" />
            <span className="text-xl font-display font-bold text-foreground">RecycleHub</span>
          </div>
          <Button variant="default" size="sm" onClick={() => navigate("/role-select")}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden min-h-[90vh] flex items-center">
        {/* Plastic pollution background image */}
        <ParallaxBg src={heroIntroPollutionBg} speed={0.4} overlay="bg-foreground/40" />
        <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-leaf/20 text-leaf-foreground text-sm font-medium mb-6 border border-leaf-foreground/20">
                <Leaf className="h-4 w-4" /> Making recycling effortless
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6 text-primary-foreground"
            >
              Turn Your Plastic Into{" "}
              <span className="text-leaf">Points & Purpose</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto"
            >
              Recycle plastic from home, earn rewards, and save our planet. Every gram makes a difference.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              <Button size="lg" className="gap-2 text-lg px-10 shadow-elevated" onClick={() => navigate("/role-select")}>
                Get Started <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="lg" className="gap-2 text-lg px-8 bg-leaf text-leaf-foreground hover:bg-leaf/90" onClick={() => {
                document.getElementById("why-recycle")?.scrollIntoView({ behavior: "smooth" });
              }}>
                Learn More
              </Button>
            </motion.div>
          </div>

          {/* Live Impact Counters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto"
          >
            <LiveCounter end={state.globalPlasticCollected} suffix=" kg" label="Plastic recycled today" icon={Recycle} color="bg-leaf" />
            <LiveCounter end={state.globalCO2Saved} suffix=" kg" label="CO₂ saved today" icon={Factory} color="bg-primary" />
            <LiveCounter end={Math.floor(state.globalPlasticCollected / 10)} suffix="" label="Animals protected" icon={Fish} color="bg-ocean" />
          </motion.div>

          {/* Key Messaging */}
          <div className="mt-14 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Environmental Impact */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-card"
            >
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-leaf" />
                <h3 className="font-display font-semibold text-foreground">Environmental Impact</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 100g plastic = 50g CO₂ prevented</li>
                <li>• 1kg plastic = 1 sea animal saved</li>
                <li>• Real-time impact tracking</li>
              </ul>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-card"
            >
              <div className="flex items-center gap-2 mb-4">
                <Droplets className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">Benefits of Recycling</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Earn ₹1 for every 100g of plastic</li>
                <li>• Exclusive rewards & discounts</li>
                <li>• Join 50,000+ eco-warriors</li>
              </ul>
            </motion.div>

            {/* Safety */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-card"
            >
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-secondary" />
                <h3 className="font-display font-semibold text-foreground">Safety Assurances</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {safetyPoints.map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 1: Why Recycle? Stats & Achievements */}
      <WhyRecycleSection />

      {/* How it Works */}
      <section className="relative py-20 overflow-hidden">
        <ParallaxBg src={heroRecyclingBg} speed={0.3} overlay="bg-foreground/70" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 text-primary-foreground">How It Works</h2>
            <p className="text-primary-foreground/70 text-lg">Three simple steps to start making a difference</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Schedule a Pickup", desc: "Choose a date, time slot, and tell us how much plastic you have.", icon: "📦" },
              { step: "2", title: "We Collect It", desc: "A verified picker arrives at your doorstep to collect your plastic.", icon: "🚛" },
              { step: "3", title: "Earn Rewards", desc: "Get points for every gram recycled and redeem exciting offers.", icon: "🎁" },
            ].map((item, i) => (
              <motion.div key={item.step} custom={i + 1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
                <div className="w-20 h-20 rounded-full bg-hero-gradient flex items-center justify-center mx-auto mb-5 shadow-elevated">
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <h3 className="text-xl font-display font-semibold mb-2 text-primary-foreground">{item.title}</h3>
                <p className="text-primary-foreground/70">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 9: Our Vision for the Future */}
      <FutureVision />

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <ParallaxBg src={heroWasteBg} speed={0.3} overlay="bg-foreground/65" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of recyclers turning waste into rewards while saving our planet.
            </p>
            <Button
              size="lg"
              className="text-lg px-10 gap-2 shadow-elevated"
              onClick={() => navigate("/role-select")}
            >
              Start Recycling Now <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Recycle className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold text-foreground">RecycleHub</span>
          </div>
          <p className="text-sm">© 2026 RecycleHub. Making the world cleaner, one pickup at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
