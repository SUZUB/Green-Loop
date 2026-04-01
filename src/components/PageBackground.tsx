import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import heroOceanBg from "@/assets/hero-ocean-bg.jpg";
import heroPollutionBg from "@/assets/hero-pollution-bg.jpg";
import heroRecyclingBg from "@/assets/hero-recycling-process-bg.jpg";
import heroWasteBg from "@/assets/hero-plastic-waste-bg.jpg";
import heroOceanPlasticBg from "@/assets/hero-ocean-plastic-bg.jpg";

export const backgrounds = {
  ocean: heroOceanBg,
  pollution: heroPollutionBg,
  recycling: heroRecyclingBg,
  waste: heroWasteBg,
  oceanPlastic: heroOceanPlasticBg,
} as const;

export type BgType = keyof typeof backgrounds;

export const PageBackground = ({
  type,
  overlay = "bg-slate-950/50",
  speed = 0.3,
}: {
  type: BgType;
  overlay?: string;
  speed?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${speed * 100}px`, `${speed * 100}px`]);

  return (
    <div
      ref={ref}
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <motion.img
        src={backgrounds[type]}
        alt=""
        decoding="async"
        fetchPriority="high"
        onLoad={() => setLoaded(true)}
        className="w-full h-[120%] object-cover absolute -top-[10%] transition-opacity duration-500"
        style={{ y, opacity: loaded ? 1 : 0 }}
      />
      <div className={`absolute inset-0 ${overlay}`} />
    </div>
  );
};
