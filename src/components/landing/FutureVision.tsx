import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  ArrowRight, CheckCircle2, MapPin, QrCode, Gift, Coins,
  Building2, Train, ShoppingBag, Bus, Landmark,
  Shield, BarChart3, Rocket, Clock, Zap, Globe, Lock, Smartphone,
} from "lucide-react";

import visionRoadsBg from "@/assets/vision-plastic-roads.jpg";
import visionBricksBg from "@/assets/vision-plastic-bricks.jpg";
import visionRvmBg from "@/assets/vision-rvm.jpg";
import visionFutureBg from "@/assets/vision-future-city.jpg";

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

const VisionCounter = ({ end, suffix, label }: { end: number; suffix: string; label: string }) => {
  const { count, ref } = useCountUp(end, 2500);
  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-4xl font-display font-bold text-primary-foreground">
        {count.toLocaleString()}{suffix}
      </div>
      <p className="text-xs md:text-sm text-primary-foreground/70 mt-1">{label}</p>
    </div>
  );
};

const benefitItem = (text: string, i: number) => (
  <motion.li
    key={i}
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay: i * 0.1, duration: 0.4 }}
    className="flex items-start gap-2 text-sm"
    style={{ color: "#F4FDFA" }}
  >
    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#A7F3D0" }} />
    <span>{text}</span>
  </motion.li>
);

/* ── Section 9.1 + 9.2: Plastic Roads & Bricks Combined ── */
const PlasticRoadsAndBricks = () => {
  const [roadsOpen, setRoadsOpen] = useState(false);
  const [bricksOpen, setBricksOpen] = useState(false);

  return (
    <section className="relative py-24 overflow-hidden">
      <ParallaxBg src={visionRoadsBg} speed={0.4} overlay="bg-slate-900/70" />
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Title */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <span className="text-5xl mb-4 block">🚀</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
            Our Project
          </h2>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto text-lg">
            Innovative solutions making recycling easier, faster, and more rewarding
          </p>
        </motion.div>

        {/* Plastic Roads */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-12">
          <span className="text-4xl mb-4 block">♻️</span>
          <h3 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-3">Building Better Roads with Plastic</h3>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto text-lg">We're transforming recycled plastic into durable road surfaces</p>
        </motion.div>
        <div className="max-w-3xl mx-auto mb-16">
          <ul className="grid sm:grid-cols-2 gap-3 mb-10">
            {["Reduces landfill waste by 50%", "Creates longer-lasting, maintenance-free roads", "Lowers construction costs", "Prevents plastic from reaching oceans"].map(benefitItem)}
          </ul>
          <div className="grid grid-cols-3 gap-6 mb-10">
            <VisionCounter end={10} suffix=" km" label="Plastic roads built" />
            <VisionCounter end={500} suffix=" tons" label="Plastic reused" />
            <VisionCounter end={25000} suffix="+" label="Lives impacted" />
          </div>
          <div className="text-center">
            <Button onClick={() => setRoadsOpen(true)} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-elevated">
              Learn More About Plastic Roads <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="max-w-xl mx-auto mb-16">
          <div className="h-px bg-primary-foreground/20" />
        </div>

        {/* Plastic Bricks */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-12">
          <span className="text-4xl mb-4 block">🧱</span>
          <h3 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-3">Building Homes, Saving the Planet</h3>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto text-lg">Eco-friendly building materials from your recycled plastic</p>
        </motion.div>
        <div className="max-w-3xl mx-auto">
          <ul className="grid sm:grid-cols-2 gap-3 mb-10">
            {["Lightweight & durable building blocks", "Affordable alternative to cement bricks", "Waterproof & weather-resistant", "Reduces plastic pollution & construction emissions"].map(benefitItem)}
          </ul>
          <div className="grid grid-cols-3 gap-6 mb-10">
            <VisionCounter end={5000} suffix="+" label="Bricks manufactured" />
            <VisionCounter end={12} suffix="" label="Homes built" />
            <VisionCounter end={200} suffix=" tons" label="Plastic diverted" />
          </div>
          <div className="text-center">
            <Button onClick={() => setBricksOpen(true)} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-elevated">
              Discover Plastic Brick Technology <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Plastic Roads Dialog */}
      <Dialog open={roadsOpen} onOpenChange={setRoadsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display flex items-center gap-2">♻️ Plastic Roads Technology</DialogTitle>
            <DialogDescription>How recycled plastic is revolutionizing road construction</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div>
              <h4 className="font-bold mb-2" style={{ color: "#0B221E" }}>What Are Plastic Roads?</h4>
              <p className="text-sm" style={{ color: "#0B221E", opacity: 0.75 }}>Plastic roads are built by mixing shredded recycled plastic waste with bitumen and asphalt. The plastic replaces up to 10% of the bitumen traditionally used, creating a stronger, more flexible road surface that lasts 2–3 times longer than conventional roads.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2" style={{ color: "#0B221E" }}>How It Works</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span>Collected plastic waste is cleaned, shredded, and melted at controlled temperatures</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span>The molten plastic is blended with hot bitumen to create a composite binder</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span>This mixture is laid on roads using standard road-building equipment</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span>Each kilometer of plastic road uses approximately 50 tons of recycled plastic</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2" style={{ color: "#0B221E" }}>Key Benefits</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span><strong>Durability:</strong> 2–3x longer lifespan compared to traditional asphalt roads</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span><strong>Water Resistance:</strong> Better resistance to potholes and water damage</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span><strong>Cost Savings:</strong> Reduces road construction costs by 15–20%</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span><strong>Eco-Friendly:</strong> Diverts plastic from landfills and oceans while reducing CO₂ emissions</span></li>
              </ul>
            </div>
            <div className="p-4 rounded-xl" style={{ background: "#F4FDFA", border: "1px solid #0B221E22" }}>
              <h4 className="font-bold mb-2" style={{ color: "#0B221E" }}>🌍 Our Impact So Far</h4>
              <p className="text-sm" style={{ color: "#0B221E", opacity: 0.75 }}>We've built over <strong>10 km</strong> of plastic roads, reusing <strong>500+ tons</strong> of plastic waste and impacting <strong>25,000+ lives</strong> across multiple communities. Our goal is to reach 100 km by 2027.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Plastic Bricks Dialog */}
      <Dialog open={bricksOpen} onOpenChange={setBricksOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display flex items-center gap-2">🧱 Plastic Brick Technology</DialogTitle>
            <DialogDescription>Turning waste plastic into affordable, sustainable building materials</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div>
              <h4 className="font-bold mb-2" style={{ color: "#0B221E" }}>What Are Plastic Bricks?</h4>
              <p className="text-sm" style={{ color: "#0B221E", opacity: 0.75 }}>Plastic bricks are eco-friendly building blocks made by compressing recycled plastic waste with sand and binding agents. They are stronger, lighter, and cheaper than traditional cement bricks — and they help keep plastic out of our environment.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2" style={{ color: "#0B221E" }}>Manufacturing Process</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span>Plastic waste is sorted, cleaned, and shredded into small flakes</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span>Flakes are heated and mixed with sand at precise ratios</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span>The mixture is compressed into molds under high pressure</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span>Cooled bricks are cured and tested for load-bearing capacity</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2" style={{ color: "#0B221E" }}>Why Plastic Bricks?</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span><strong>5x Stronger:</strong> Higher compressive strength than conventional clay bricks</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span><strong>40% Lighter:</strong> Easier to transport and handle during construction</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span><strong>Waterproof:</strong> Naturally resistant to water, mold, and insect damage</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span><strong>Affordable:</strong> Costs up to 30% less than cement bricks</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span><strong>Thermal Insulation:</strong> Better heat insulation, keeping homes cooler</span></li>
              </ul>
            </div>
            <div className="p-4 rounded-xl" style={{ background: "#F4FDFA", border: "1px solid #0B221E22" }}>
              <h4 className="font-bold mb-2" style={{ color: "#0B221E" }}>🏠 Our Impact So Far</h4>
              <p className="text-sm" style={{ color: "#0B221E", opacity: 0.75 }}>We've manufactured over <strong>5,000 plastic bricks</strong>, built <strong>12 homes</strong> for underserved communities, and diverted <strong>200+ tons</strong> of plastic from landfills. Each brick contains the equivalent of 200 plastic bags.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

/* ── Section 9.3: Reverse Vending Machines ── */
const rvmLocations = [
  { icon: Building2, emoji: "🏥", label: "Hospitals", count: "50+", desc: "Collect plastic from public areas inside hospitals" },
  { icon: Train, emoji: "🚂", label: "Railway Stations", count: "100+", desc: "Recycle at major railway stations" },
  { icon: ShoppingBag, emoji: "🛍️", label: "Shopping Malls", count: "75+", desc: "Convenient collection points in malls" },
  { icon: Bus, emoji: "🚌", label: "Transport Hubs", count: "200+", desc: "Bus stations, metro stations, auto stands" },
  { icon: Landmark, emoji: "🏢", label: "Community Centers", count: "150+", desc: "Local centers, schools, markets & bazaars" },
];

const rvmSteps = [
  { emoji: "📍", icon: MapPin, title: "Locate Nearby RVM", desc: "Use our app to find nearest RVM" },
  { emoji: "♻️", icon: ArrowRight, title: "Insert Plastic", desc: "Drop clean, dry plastic into machine" },
  { emoji: "📱", icon: QrCode, title: "Scan QR Code", desc: "Automatic weight detection & verification" },
  { emoji: "💰", icon: Coins, title: "Get Instant Points", desc: "100g plastic = 10 points = ₹1" },
  { emoji: "🎁", icon: Gift, title: "Claim Rewards", desc: "Redeem for cash, discounts, or donations" },
];

const rvmBenefits = [
  { icon: Clock, emoji: "🚫", title: "No Home Visits Required", desc: "Recycle without waiting for scheduled pickups" },
  { icon: Zap, emoji: "⚡", title: "Instant Gratification", desc: "See points credited immediately" },
  { icon: Globe, emoji: "🌍", title: "Smart Placement", desc: "Recycling near places you already visit" },
  { icon: Lock, emoji: "🔒", title: "Safe & Secure", desc: "Transparent weight measurement with CCTV" },
  { icon: BarChart3, emoji: "📊", title: "Better Data", desc: "Track exactly when & where you recycled" },
];

const ReverseVendingMachines = () => (
  <section className="relative py-16 overflow-hidden">
    <ParallaxBg src={visionRvmBg} speed={0.3} overlay="bg-foreground/75" />
    <div className="container mx-auto px-4 relative z-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-10">
        <span className="text-3xl mb-3 block">🚀</span>
        <h3 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-2">Our Project</h3>
        <p className="text-primary-foreground/70 max-w-xl mx-auto text-sm">
          Smart Reverse Vending Machines (RVMs) — automated 24/7 plastic collection points at hospitals, malls, and railway stations. Insert plastic, scan QR, earn instant points.
        </p>
      </motion.div>

      {/* Compact grid: locations + how it works */}
      <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4">
        {/* Locations */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="p-5 rounded-2xl border"
          style={{ background: "#F4FDFA", borderColor: "#0B221E22" }}
        >
          <h4 className="font-display font-bold text-sm mb-3" style={{ color: "#0B221E" }}>📍 Planned Locations</h4>
          <div className="grid grid-cols-2 gap-2">
            {rvmLocations.map((loc) => (
              <div key={loc.label} className="flex items-center gap-2 text-xs" style={{ color: "#0B221E" }}>
                <span className="text-base">{loc.emoji}</span>
                <span className="font-medium">{loc.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="p-5 rounded-2xl border"
          style={{ background: "#F4FDFA", borderColor: "#0B221E22" }}
        >
          <h4 className="font-display font-bold text-sm mb-3" style={{ color: "#0B221E" }}>⚙️ How It Works</h4>
          <div className="space-y-2">
            {rvmSteps.map((step, i) => (
              <div key={step.title} className="flex items-start gap-2">
                <span
                  className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "#0B221E", color: "#F4FDFA" }}
                >
                  {i + 1}
                </span>
                <p className="text-xs" style={{ color: "#0B221E" }}>
                  <strong>{step.title}</strong> — {step.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const FutureVision = () => (
  <>
    <PlasticRoadsAndBricks />
    <ReverseVendingMachines />
  </>
);

export default FutureVision;
