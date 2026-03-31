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
  { icon: Award, title: "Eco Warrior", desc: "100kg recycled", emoji: "🏅", color: "bg-primary" },
  { icon: Star, title: "Green Champion", desc: "500kg recycled", emoji: "🏆", color: "bg-secondary" },
  { icon: Zap, title: "Plastic Saver", desc: "First recycling", emoji: "⭐", color: "bg-leaf" },
  { icon: Flame, title: "Consistency King", desc: "10 consecutive pickups", emoji: "🔥", color: "bg-earth" },
];

const impactCards = [
  { icon: Users, value: 50000, suffix: "+", label: "Recyclers Active", badge: "Growing Community", color: "bg-primary" },
  { icon: Recycle, value: 500, suffix: "+", label: "Tons Recycled", badge: "Massive Impact", color: "bg-secondary" },
  { icon: Star, value: 1000000, suffix: "", label: "Points Distributed", badge: "Rewarding Community", color: "bg-leaf" },
  { icon: TreePine, value: 10000, suffix: "+", label: "Trees Planted Equivalent", badge: "Planet Saver", color: "bg-earth" },
];

const safetyPoints = [
  "100% Safe & Certified Recycling Process",
  "All our recyclers are trained & verified",
  "Your plastic is handled with care",
  "Transparent tracking from pickup to recycling",
];

const ImpactCard = ({ card, i }: { card: typeof impactCards[0]; i: number }) => {
  const { count, ref } = useCountUp(card.value, 2500);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
      className="relative group p-6 rounded-2xl bg-card shadow-card border border-border hover:shadow-elevated transition-all duration-300"
    >
      <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mb-4`}>
        <card.icon className="h-6 w-6 text-primary-foreground" />
      </div>
      <div className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1">
        {count.toLocaleString()}{card.suffix}
      </div>
      <p className="text-sm text-muted-foreground mb-3">{card.label}</p>
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
        <Award className="h-3 w-3" /> {card.badge}
      </span>
    </motion.div>
  );
};

const ParallaxBg = ({ src, speed = 0.3, overlay }: { src: string; speed?: number; overlay: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${speed * 100}px`, `${speed * 100}px`]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.img src={src} alt="" className="w-full h-[120%] object-cover absolute -top-[10%]" style={{ y }} />
      <div className={`absolute inset-0 ${overlay}`} />
    </div>
  );
};

const WhyRecycleSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const orbY1 = useTransform(scrollYProgress, [0, 1], [-60, 80]);
  const orbY2 = useTransform(scrollYProgress, [0, 1], [40, -100]);

  return (
    <section id="why-recycle" ref={sectionRef} className="relative py-28 overflow-hidden">
      <ParallaxBg src={heroPollutionBg} speed={0.5} overlay="bg-foreground/70" />
      <motion.div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" style={{ y: orbY1 }} />
      <motion.div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-secondary/10 blur-3xl pointer-events-none" style={{ y: orbY2 }} />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-display font-bold mb-4 text-primary-foreground"
          >
            Why Recycle?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-primary-foreground/70 max-w-2xl mx-auto text-lg"
          >
            Join a growing movement. See the impact our community is making together.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
          {impactCards.map((card, i) => (
            <ImpactCard key={card.label} card={card} i={i + 1} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-display font-bold mb-2 text-primary-foreground">Unlock Achievements</h3>
            <p className="text-primary-foreground/60">Start recycling and earn badges for your contributions!</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {achievements.map((a, i) => (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, y: 40, scale: 0.85, rotateX: 20 }}
                whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative text-center p-5 rounded-2xl bg-card/90 backdrop-blur-md border border-border/50 shadow-elevated transition-all duration-300 group"
              >
                <motion.div
                  className={`w-14 h-14 rounded-2xl ${a.color} flex items-center justify-center mx-auto mb-3`}
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="text-2xl">{a.emoji}</span>
                </motion.div>
                <h4 className="font-display font-semibold text-foreground text-sm mb-1">{a.title}</h4>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center text-sm text-primary-foreground/60 mt-6"
          >
            Start recycling and unlock achievements! 🌱
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

const Index = () => {
  const navigate = useNavigate();

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
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-secondary/10 blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary-foreground text-sm font-medium mb-6 border border-primary-foreground/20">
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
              <span className="text-primary">Points & Purpose</span>
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
              <Button size="lg" className="gap-2 text-lg px-8 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => {
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
            <LiveCounter end={12450} suffix=" kg" label="Plastic recycled today" icon={Recycle} color="bg-primary" />
            <LiveCounter end={6225} suffix=" kg" label="CO₂ saved today" icon={Factory} color="bg-secondary" />
            <LiveCounter end={1245} suffix="" label="Animals protected" icon={Fish} color="bg-ocean" />
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
                <Globe className="h-5 w-5 text-primary" />
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
                <Droplets className="h-5 w-5 text-secondary" />
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
                <Shield className="h-5 w-5 text-leaf" />
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
