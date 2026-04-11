import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface PulseEffectProps {
  trigger?: number;
  color?: string;
  intensity?: number;
}

export function PulseEffect({ trigger = 0, color = "rgba(76, 175, 125, 0.6)", intensity = 1 }: PulseEffectProps) {
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    setPulseKey((prev) => prev + 1);
  }, [trigger]);

  return (
    <motion.div
      key={pulseKey}
      initial={{ scale: 0.8, opacity: 1 }}
      animate={{
        scale: [0.8, 1.2],
        opacity: [1, 0],
      }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
        times: [0, 1],
      }}
      className="absolute inset-0 rounded-xl"
      style={{
        boxShadow: `0 0 ${20 * intensity}px ${color}`,
        pointerEvents: "none",
      }}
    />
  );
}
