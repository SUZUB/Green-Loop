import { motion } from "framer-motion";
import { Sprout } from "lucide-react";

interface EcoLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

export function EcoLogo({ size = "md", className = "", showLabel = false }: EcoLogoProps) {
  const sizeMap = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const iconSizeMap = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-7 w-7",
  };

  const containerClass = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-16 w-16",
  };

  return (
    <motion.div
      className={`relative inline-flex items-center ${showLabel ? "gap-3" : ""} ${className}`}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Glassmorphic background circle */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute ${containerClass[size]} rounded-full backdrop-blur-md bg-gradient-to-br from-emerald-400/10 to-lime-400/5 blur-xl`}
      />

      {/* Main icon container with glow */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          filter: [
            "drop-shadow(0 0 12px rgba(52, 211, 153, 0.6))",
            "drop-shadow(0 0 18px rgba(52, 211, 153, 0.8))",
            "drop-shadow(0 0 12px rgba(52, 211, 153, 0.6))",
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`relative z-10 flex items-center justify-center ${containerClass[size]} rounded-full bg-gradient-to-br from-emerald-400 to-lime-400 shadow-lg`}
        style={{
          boxShadow: "0 0 20px rgba(52, 211, 153, 0.8), inset 0 -2px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Sprout 
          className={`${iconSizeMap[size]} text-slate-950 font-bold`} 
          fill="currentColor" 
          strokeWidth={1.5}
        />
      </motion.div>

      {/* Optional label */}
      {showLabel && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg font-bold text-[#1E293B] tracking-widest"
        >
          ECOSYNC
        </motion.span>
      )}
    </motion.div>
  );
}

