import { useState } from "react";
import { motion } from "framer-motion";

import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { CertificateModal } from "@/components/recycler/CertificateModal";
import { useUserStats } from "@/hooks/useUserStats";
import { Download, Share2, Leaf, Droplets, Fish, TreePine, Fuel, Award } from "lucide-react";

const milestones = [
  { weight: 10, label: "10 kg", reached: true },
  { weight: 50, label: "50 kg", reached: false },
  { weight: 100, label: "100 kg", reached: false },
  { weight: 500, label: "500 kg", reached: false },
];

const Impact = () => {
  const [certOpen, setCertOpen] = useState(false);
  const stats = useUserStats();

  const impactMetrics = [
    { icon: Leaf, label: "Plastic Recycled", value: `${stats.totalRecycledKg} kg`, target: "100 kg", progress: Math.min(stats.totalRecycledKg / 100 * 100, 100), color: "text-[#14532D]" },
    { icon: Droplets, label: "CO₂ Saved", value: `${stats.co2Saved.toFixed(1)} kg`, target: "1,000 kg", progress: Math.min(stats.co2Saved / 1000 * 100, 100), color: "text-[#14532D]" },
    { icon: Fish, label: "Sea Animals Saved", value: `~${stats.animalsSaved}`, target: "100", progress: Math.min(stats.animalsSaved / 100 * 100, 100), color: "text-secondary" },
    { icon: TreePine, label: "Trees Equivalent", value: (stats.totalRecycledKg * 0.184).toFixed(1), target: "50", progress: Math.min((stats.totalRecycledKg * 0.184) / 50 * 100, 100), color: "text-leaf" },
    { icon: Fuel, label: "Oil Barrels Saved", value: (stats.totalRecycledKg * 0.064).toFixed(1), target: "10", progress: Math.min((stats.totalRecycledKg * 0.064) / 10 * 100, 100), color: "text-[#065F46]" },
    { icon: Droplets, label: "Water Saved", value: `${Math.round(stats.totalRecycledKg * 300).toLocaleString()} L`, target: "100,000 L", progress: Math.min((stats.totalRecycledKg * 300) / 100000 * 100, 100), color: "text-[#14532D]" },
  ];

  const handleShare = async () => {
    const text = `I've recycled ${stats.totalRecycledKg} kg of plastic with GREEN LOOP, saving ${stats.co2Saved.toFixed(1)} kg of CO₂ and protecting ~${stats.animalsSaved} sea animals! 🌍🐬 Join me! #GreenLoop`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // Permission denied or user cancelled — fallback to clipboard
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // silently fail
      }
    }
  };

  return (
    <div className="min-h-screen">
      <PageBackground type="pollution" overlay="bg-[#F8FAF9]/65" />

      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Hero stat */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-hero-gradient p-6 rounded-2xl mb-6 text-center">
            <Leaf className="h-10 w-10 text-white mx-auto mb-3" />
            <div className="text-4xl font-display font-bold text-white">{stats.totalRecycledKg} kg</div>
            <p className="text-white/70 text-sm mt-1">Total Plastic Recycled</p>
            <div className="flex gap-2 justify-center mt-4">
              <Button size="sm" variant="secondary" className="gap-1.5" onClick={handleShare}>
                <Share2 className="h-3.5 w-3.5" /> Share
              </Button>
              <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => setCertOpen(true)}>
                <Download className="h-3.5 w-3.5" /> Certificate
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Impact metrics */}
        <h2 className="text-lg font-display font-bold mb-3">Environmental Impact</h2>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {impactMetrics.map((metric, i) => (
            <motion.div key={metric.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="p-4 h-full">
                <metric.icon className={`h-5 w-5 mb-2 ${metric.color}`} />
                <div className="text-xl font-display font-bold">{metric.value}</div>
                <p className="text-[10px] text-[#475569] mb-2">{metric.label}</p>
                <Progress value={metric.progress} className="h-1" />
                <p className="text-[10px] text-[#475569] mt-1">Goal: {metric.target}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Milestones */}
        <h2 className="text-lg font-display font-bold mb-3">Milestones</h2>
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            {milestones.map((m) => (
              <div key={m.weight} className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  m.reached ? "bg-[#10B981] text-white" : "bg-muted text-[#475569]"
                }`}>
                  {m.reached ? <Award className="h-4 w-4" /> : <span className="text-xs">{m.label}</span>}
                </div>
                {m.reached && <span className="text-[10px] text-[#14532D] font-medium">✓</span>}
              </div>
            ))}
          </div>
          <Progress value={stats.totalRecycledKg / 5} className="h-1.5 mt-4" />
        </Card>

        {/* Global impact */}
        <h2 className="text-lg font-display font-bold mb-3">Global Impact</h2>
        <Card className="p-5 bg-card-gradient">
          <p className="text-sm text-[#475569] mb-3">Together, the GREEN LOOP community has:</p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">♻️ Plastic recycled</span>
              <span className="font-display font-bold">2,450 tonnes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">🌿 CO₂ saved</span>
              <span className="font-display font-bold">9,800 tonnes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">🐬 Sea animals protected</span>
              <span className="font-display font-bold">~196,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">🌳 Trees equivalent</span>
              <span className="font-display font-bold">450,000</span>
            </div>
          </div>
        </Card>
      </div>

      <CertificateModal
        open={certOpen}
        onOpenChange={setCertOpen}
        userName={stats.fullName}
        totalRecycled={`${stats.totalRecycledKg} kg`}
        co2Saved={`${stats.co2Saved.toFixed(1)} kg`}
        animalsSaved={stats.animalsSaved}
        badges={stats.earnedBadges}
      />

    </div>
  );
};

export default Impact;
