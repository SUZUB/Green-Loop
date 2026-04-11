import { useEffect, useMemo, useState } from "react";

export interface HeatmapPoint {
  id: string;
  lat: number;
  lng: number;
  intensity: number;
  kg: number;
  label: string;
  description: string;
  createdAt: string;
}

type HeatmapRole = "picker" | "recycler";

const BASE_ZONES: Record<HeatmapRole, { lat: number; lng: number }> = {
  picker: { lat: 12.9352, lng: 77.6245 },
  recycler: { lat: 12.9661, lng: 77.6077 },
};

const SEED_EVENTS: Record<HeatmapRole, HeatmapPoint[]> = {
  picker: [
    {
      id: "picker-1",
      lat: 12.9389,
      lng: 77.6194,
      intensity: 0.7,
      kg: 4.2,
      label: "HSR Layout Hotspot",
      description: "Heavy plastic pick-up reported",
      createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    },
    {
      id: "picker-2",
      lat: 12.9312,
      lng: 77.6350,
      intensity: 0.55,
      kg: 3.0,
      label: "Koramangala Cluster",
      description: "Multiple pickers active in the area",
      createdAt: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
    },
    {
      id: "picker-3",
      lat: 12.9440,
      lng: 77.6276,
      intensity: 0.4,
      kg: 1.8,
      label: "Jayanagar Sweep",
      description: "Recent collection of plastic waste",
      createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    },
  ],
  recycler: [
    {
      id: "recycler-1",
      lat: 12.9678,
      lng: 77.6112,
      intensity: 0.8,
      kg: 5.4,
      label: "Rajajinagar Request",
      description: "High giver demand in this sector",
      createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    },
    {
      id: "recycler-2",
      lat: 12.9615,
      lng: 77.6021,
      intensity: 0.5,
      kg: 2.6,
      label: "Malleshwaram Zone",
      description: "New recycle request added",
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      id: "recycler-3",
      lat: 12.9730,
      lng: 77.6110,
      intensity: 0.35,
      kg: 1.3,
      label: "Sampige Road Alert",
      description: "Giver concentration growing",
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
  ],
};

const getRandomOffset = () => (Math.random() - 0.5) * 0.02;
const getRandomIntensity = () => Number((0.35 + Math.random() * 0.65).toFixed(2));
const getRandomKg = () => Number((1 + Math.random() * 5).toFixed(1));

const generateLabel = (role: HeatmapRole) => {
  const pickerLabels = ["Inner Ring Road", "Electronic City", "Banashankari", "Domlur", "Richmond Road"];
  const recyclerLabels = ["Seshadripuram", "Jayanagar", "Bangalore East", "Sadashivanagar", "Ulsoor"];
  const labels = role === "picker" ? pickerLabels : recyclerLabels;
  return labels[Math.floor(Math.random() * labels.length)];
};

const generateDescription = (role: HeatmapRole, kg: number) => {
  if (role === "picker") {
    return `New recycled report of ${kg} kg plastic collected.`;
  }
  return `New giver request added for ${kg} kg plastic.`;
};

const createHeatmapPoint = (role: HeatmapRole, index: number): HeatmapPoint => {
  const base = BASE_ZONES[role];
  const kg = getRandomKg();
  return {
    id: `${role}-${Date.now()}-${index}`,
    lat: Number((base.lat + getRandomOffset()).toFixed(5)),
    lng: Number((base.lng + getRandomOffset()).toFixed(5)),
    intensity: getRandomIntensity(),
    kg,
    label: generateLabel(role),
    description: generateDescription(role, kg),
    createdAt: new Date().toISOString(),
  };
};

export function useHeatmapData(role: HeatmapRole = "picker") {
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>(SEED_EVENTS[role]);
  const [latestPoint, setLatestPoint] = useState<HeatmapPoint>(SEED_EVENTS[role][0]);
  const [coinBalanceDelta, setCoinBalanceDelta] = useState(0);

  useEffect(() => {
    setHeatmapData(SEED_EVENTS[role]);
    setLatestPoint(SEED_EVENTS[role][0]);
    setCoinBalanceDelta(0);
    const interval = window.setInterval(() => {
      const nextPoint = createHeatmapPoint(role, heatmapData.length + 1);
      setHeatmapData((prev) => [nextPoint, ...prev].slice(0, 12));
      setLatestPoint(nextPoint);
      setCoinBalanceDelta((prev) => prev + Math.max(1, Math.floor(nextPoint.kg / 2)));
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [role]);

  const heatmapPoints = useMemo(
    () => heatmapData.map((point) => [point.lat, point.lng, point.intensity] as [number, number, number]),
    [heatmapData]
  );

  return {
    heatmapData,
    heatmapPoints,
    latestPoint,
    liveCount: heatmapData.length,
    coinBalanceDelta,
  };
}
