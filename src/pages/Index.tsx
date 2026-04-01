import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useEco } from "@/context/EcoContext";
import {
  Leaf, ArrowRight, Recycle, Users, Factory, Fish, Star, TreePine
} from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import FutureVision from "@/components/landing/FutureVision";
import heroIntroPollutionBg from "@/assets/hero-intro-pollution-bg.jpg";
import heroRecyclingBg from "@/assets/hero-recycling-process-bg.jpg";
import heroWasteBg from "@/assets/hero-plastic-waste-bg.jpg";
import heroPollutionBg from "@/assets/hero-pollution-bg.jpg";

// ── Parallax background with framer-motion scroll transform ──
const ParallaxBg = ({
  src,
  speed = 0.3,
  overlay = "bg-foreground/50",
}: {
  src: string;
  speed?: number;
  overlay?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${speed * 100}px`, `${speed * 100}px`]);
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden -z-10 pointer-events-none" aria-hidden="true">
      <motion.img
        src={src}
        alt=""
        className="absolute -top-[10%] h-[120%] w-full object-cover"
        style={{ y }}
      />
      <div className={`absolute inset-0 ${overlay}`} />
    </div>
  );
};

// ── Animated counter card ──
const LiveCounter = ({
  end,
  suffix,
  label,
  icon: Icon,
  color,
}: {
  end: number;
  suffix: string;
  label: string;
  icon: React.ElementType;
  color: string;
}) => {
  const { count, ref } = useCountUp(end, 2200);
  return (
    <div
      ref={ref}
      className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-card border border-border"
    >
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

// ── Why Recycle section ──
const WhyRecycleSection = () => {
  const { state } = useEco();
  const cards = [
    { icon: Users,    value: state.globalUsersActive,                        suffix: "+", label: "Recyclers Active",    color: "bg-leaf" },
    { icon: Recycle,  value: Math.floor(state.globalPlasticCollected / 1000), suffix: "+", label: "Tons Recycled",       color: "bg-primary" },
    { icon: Star,     value: state.globalPointsDistributed,                   suffix: "",  label: "Points Distributed",  color: "bg-secondary" },
    { icon: TreePine, value: Math.floor(state.globalPlasticCollected / 100),  suffix: "+", label: "Trees Equivalent",    color: "bg-earth" },
  ];

  return (
    <section id="why-recycle" className="relative py-20 overflow-hidden">
      <ParallaxBg src={heroPollutionBg} speed={0.25} overlay="bg-foreground/70" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground">
            Why Recycle With GREEN LOOP?
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm p-4"
            >
              <LiveCounter end={c.value} suffix={c.suffix} label={c.label} icon={c.icon} color={c.color} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── Main landing page ──
const Index = () => {
  const navigate = useNavigate();
  const { state } = useEco();

  if (!state) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading GREEN LOOP...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Recycle className="h-7 w-7 text-primary" />
            <span className="text-xl font-display font-bold text-foreground">GREEN LOOP</span>
          </div>
          <Button variant="default" size="sm" onClick={() => navigate("/role-select")}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-20 overflow-hidden min-h-[90vh] flex items-center">
        <ParallaxBg src={heroIntroPollutionBg} speed={0.4} overlay="bg-foreground/40" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-leaf/20 text-leaf-foreground text-sm font-medium mb-6 border border-leaf/30"
            >
              <Leaf className="h-4 w-4" /> Making recycling effortless
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6 text-primary-foreground"
            >
              Turn Your Plastic Into{" "}
              <span className="text-leaf">Points &amp; Purpose</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto"
            >
              Recycle plastic from home, earn rewards, and save our planet. Every gram makes a difference.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              <Button
                size="lg"
                className="gap-2 text-lg px-10 shadow-elevated"
                onClick={() => navigate("/role-select")}
              >
                Get Started <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                className="gap-2 text-lg px-8 bg-leaf text-leaf-foreground hover:bg-leaf/90"
                onClick={() => document.getElementById("why-recycle")?.scrollIntoView({ behavior: "smooth" })}
              >
                Learn More
              </Button>
            </motion.div>
          </div>

          {/* Live Impact Counters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto"
          >
            <LiveCounter end={state.globalPlasticCollected} suffix=" kg" label="Plastic recycled today" icon={Recycle} color="bg-leaf" />
            <LiveCounter end={state.globalCO2Saved}         suffix=" kg" label="CO₂ saved today"        icon={Factory} color="bg-primary" />
            <LiveCounter end={Math.floor(state.globalPlasticCollected / 10)} suffix="" label="Animals protected" icon={Fish} color="bg-ocean" />
          </motion.div>
        </div>
      </section>

      {/* ── Why Recycle ── */}
      <WhyRecycleSection />

      {/* ── How It Works ── */}
      <section className="relative py-20 overflow-hidden">
        <ParallaxBg src={heroRecyclingBg} speed={0.3} overlay="bg-foreground/70" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 text-primary-foreground">
              How It Works
            </h2>
            <p className="text-primary-foreground/70 text-lg">Three simple steps to start making a difference</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Schedule a Pickup", desc: "Choose a date, time slot, and tell us how much plastic you have.", icon: "📦" },
              { step: "2", title: "We Collect It",     desc: "A verified picker arrives at your doorstep to collect your plastic.", icon: "🚛" },
              { step: "3", title: "Earn Rewards",      desc: "Get points for every gram recycled and redeem exciting offers.", icon: "🎁" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center"
              >
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

      {/* ── Future Vision ── */}
      <FutureVision />

      {/* ── CTA ── */}
      <section className="relative py-24 overflow-hidden">
        <ParallaxBg src={heroWasteBg} speed={0.3} overlay="bg-foreground/65" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
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

      {/* ── Footer ── */}
      <footer className="py-10 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Recycle className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold text-foreground">GREEN LOOP</span>
          </div>
          <p className="text-sm">© 2026 GREEN LOOP. Making the world cleaner, one pickup at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
