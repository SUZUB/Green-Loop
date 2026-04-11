import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 0.6,
  decimals = 0,
  suffix = "",
  prefix = "",
  className = "",
}: AnimatedCounterProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef(0);

  useEffect(() => {
    const target = Math.floor(value);
    
    if (countRef.current === target) return;

    const node = nodeRef.current;
    if (!node) return;

    const startValue = countRef.current;
    const diff = target - startValue;
    const duration_ms = duration * 1000;
    const startTime = Date.now();

    const updateCounter = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration_ms, 1);
      const current = startValue + diff * progress;

      node.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        countRef.current = target;
      }
    };

    updateCounter();
  }, [value, duration, decimals, suffix, prefix]);

  return (
    <motion.span
      ref={nodeRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {prefix}
      {countRef.current.toFixed(decimals)}
      {suffix}
    </motion.span>
  );
}
