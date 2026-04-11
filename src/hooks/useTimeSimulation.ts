import { useEffect, useMemo, useState } from "react";

export type TimePhase = "Morning" | "Evening" | "Night" | "Day";

export interface SimulationPoint {
  id: string;
  label: string;
  left: string;
  top: string;
  type: "picker" | "supplier" | "center";
}

export interface TimeSimulationState {
  currentHour: number;
  phase: TimePhase;
  mapStyle: {
    background: string;
    accent: string;
    text: string;
    border: string;
  };
  livePickers: SimulationPoint[];
  activeSuppliers: SimulationPoint[];
}

const morningPickers: SimulationPoint[] = [
  { id: "picker-1", label: "Coastal Patrol", left: "18%", top: "34%", type: "picker" },
  { id: "picker-2", label: "Forest Sweep", left: "42%", top: "22%", type: "picker" },
  { id: "picker-3", label: "River Drive", left: "63%", top: "45%", type: "picker" },
];

const eveningPickers: SimulationPoint[] = [
  { id: "picker-4", label: "Center Shift", left: "30%", top: "60%", type: "picker" },
  { id: "picker-5", label: "Drop-Off Team", left: "55%", top: "70%", type: "picker" },
  { id: "picker-6", label: "Hub Pickup", left: "72%", top: "58%", type: "picker" },
];

const nightPickers: SimulationPoint[] = [
  { id: "center-1", label: "Sorting Center", left: "48%", top: "40%", type: "center" },
  { id: "center-2", label: "Automated Dock", left: "25%", top: "52%", type: "center" },
  { id: "center-3", label: "Night Hub", left: "70%", top: "30%", type: "center" },
];

const morningSuppliers: SimulationPoint[] = [
  { id: "supplier-1", label: "Coastal Supplier", left: "12%", top: "18%", type: "supplier" },
  { id: "supplier-2", label: "Forest Recycler", left: "58%", top: "24%", type: "supplier" },
];

const eveningSuppliers: SimulationPoint[] = [
  { id: "supplier-3", label: "Collection Center A", left: "34%", top: "68%", type: "supplier" },
  { id: "supplier-4", label: "Collection Center B", left: "68%", top: "62%", type: "supplier" },
];

const nightSuppliers: SimulationPoint[] = [
  { id: "supplier-5", label: "Automated Plant", left: "40%", top: "36%", type: "supplier" },
  { id: "supplier-6", label: "Sorting Bay", left: "72%", top: "54%", type: "supplier" },
];

const getPhase = (hour: number): TimePhase => {
  if (hour >= 6 && hour < 12) return "Morning";
  if (hour >= 18 || hour < 0) return "Evening";
  if (hour >= 0 && hour < 6) return "Night";
  return "Day";
};

const getMapStyle = (phase: TimePhase) => {
  if (phase === "Night") {
    return {
      background: "bg-slate-950",
      accent: "bg-emerald-400/20",
      text: "text-slate-100",
      border: "border-slate-700",
    };
  }

  if (phase === "Evening") {
    return {
      background: "bg-slate-900",
      accent: "bg-emerald-300/15",
      text: "text-slate-100",
      border: "border-slate-600",
    };
  }

  return {
    background: "bg-emerald-100/10",
    accent: "bg-emerald-500/15",
    text: "text-slate-900",
    border: "border-emerald-200",
  };
};

export function useTimeSimulation(): TimeSimulationState {
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());

  useEffect(() => {
    const tick = () => setCurrentHour(new Date().getHours());
    const interval = window.setInterval(tick, 30000);
    return () => window.clearInterval(interval);
  }, []);

  const phase = useMemo(() => getPhase(currentHour), [currentHour]);

  const livePickers = useMemo(() => {
    if (phase === "Morning") return morningPickers;
    if (phase === "Evening") return eveningPickers;
    if (phase === "Night") return nightPickers;
    return morningPickers;
  }, [phase]);

  const activeSuppliers = useMemo(() => {
    if (phase === "Morning") return morningSuppliers;
    if (phase === "Evening") return eveningSuppliers;
    if (phase === "Night") return nightSuppliers;
    return morningSuppliers;
  }, [phase]);

  return {
    currentHour,
    phase,
    mapStyle: getMapStyle(phase),
    livePickers,
    activeSuppliers,
  };
}
