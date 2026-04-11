/**
 * useRVMData
 * ──────────
 * Shared singleton store for Reverse Vending Machine (RVM) state.
 * Simulates real-time fill levels that drift upward over time.
 * Pickers can mark an RVM as collected (resets fill to 0).
 */

import { useEffect, useState } from "react";

export type RVMLocationType = "bus_stand" | "hospital" | "metro_station" | "mall" | "public_place";

export interface RVM {
  id: string;
  name: string;
  address: string;
  locationType: RVMLocationType;
  lat: number;
  lng: number;
  fillPct: number;          // 0–100
  lastCollectedAt: string;  // ISO string
  minutesFull: number | null; // how long it's been ≥90%
  distanceKm: number;       // from user (static mock)
  estimatedEarnings: number; // credits for collecting
}

const LOCATION_LABELS: Record<RVMLocationType, string> = {
  bus_stand:      "Bus Stand",
  hospital:       "Hospital",
  metro_station:  "Metro Station",
  mall:           "Mall",
  public_place:   "Public Place",
};
export { LOCATION_LABELS };

const INITIAL_RVMS: RVM[] = [
  { id: "rvm-1",  name: "Majestic Metro RVM",       address: "Majestic Metro Station, Bengaluru",       locationType: "metro_station", lat: 12.9767, lng: 77.5713, fillPct: 97, lastCollectedAt: new Date(Date.now() - 3 * 3600000).toISOString(), minutesFull: 42, distanceKm: 0.4, estimatedEarnings: 180 },
  { id: "rvm-2",  name: "Indiranagar Bus Stand RVM", address: "Indiranagar Bus Stand, Bengaluru",        locationType: "bus_stand",     lat: 12.9784, lng: 77.6408, fillPct: 100, lastCollectedAt: new Date(Date.now() - 5 * 3600000).toISOString(), minutesFull: 78, distanceKm: 1.2, estimatedEarnings: 220 },
  { id: "rvm-3",  name: "Manipal Hospital RVM",      address: "Manipal Hospital, Old Airport Rd",        locationType: "hospital",      lat: 12.9591, lng: 77.6474, fillPct: 83, lastCollectedAt: new Date(Date.now() - 1 * 3600000).toISOString(), minutesFull: null, distanceKm: 2.1, estimatedEarnings: 140 },
  { id: "rvm-4",  name: "Phoenix Mall RVM",          address: "Phoenix Marketcity, Whitefield",          locationType: "mall",          lat: 12.9958, lng: 77.6961, fillPct: 61, lastCollectedAt: new Date(Date.now() - 2 * 3600000).toISOString(), minutesFull: null, distanceKm: 3.8, estimatedEarnings: 90  },
  { id: "rvm-5",  name: "Koramangala Park RVM",      address: "Koramangala 5th Block, Bengaluru",        locationType: "public_place",  lat: 12.9352, lng: 77.6245, fillPct: 100, lastCollectedAt: new Date(Date.now() - 6 * 3600000).toISOString(), minutesFull: 110, distanceKm: 0.9, estimatedEarnings: 200 },
  { id: "rvm-6",  name: "Jayanagar Metro RVM",       address: "Jayanagar 4th Block Metro, Bengaluru",    locationType: "metro_station", lat: 12.9250, lng: 77.5938, fillPct: 74, lastCollectedAt: new Date(Date.now() - 90 * 60000).toISOString(), minutesFull: null, distanceKm: 2.6, estimatedEarnings: 110 },
  { id: "rvm-7",  name: "Forum Mall RVM",            address: "Forum Mall, Koramangala, Bengaluru",      locationType: "mall",          lat: 12.9341, lng: 77.6101, fillPct: 55, lastCollectedAt: new Date(Date.now() - 4 * 3600000).toISOString(), minutesFull: null, distanceKm: 1.5, estimatedEarnings: 80  },
  { id: "rvm-8",  name: "Victoria Hospital RVM",     address: "Victoria Hospital, Bengaluru",            locationType: "hospital",      lat: 12.9634, lng: 77.5855, fillPct: 91, lastCollectedAt: new Date(Date.now() - 2.5 * 3600000).toISOString(), minutesFull: 15, distanceKm: 1.8, estimatedEarnings: 160 },
];

// ── Singleton store ───────────────────────────────────────────────────────────
const _g = globalThis as any;
if (!_g.__gl_rvms__)           _g.__gl_rvms__           = INITIAL_RVMS.map((r) => ({ ...r }));
if (!_g.__gl_rvmListeners__)   _g.__gl_rvmListeners__   = new Set<() => void>();

let _rvms: RVM[] = _g.__gl_rvms__;
const _listeners: Set<() => void> = _g.__gl_rvmListeners__;

function notify() { _listeners.forEach((fn) => fn()); }

function setRVMs(updater: (prev: RVM[]) => RVM[]) {
  _rvms = updater(_rvms);
  _g.__gl_rvms__ = _rvms;
  notify();
}

// Drift fill levels upward every 30 s (simulation)
if (!_g.__gl_rvmDriftStarted__) {
  _g.__gl_rvmDriftStarted__ = true;
  setInterval(() => {
    setRVMs((prev) =>
      prev.map((rvm) => {
        if (rvm.fillPct >= 100) {
          return {
            ...rvm,
            fillPct: 100,
            minutesFull: (rvm.minutesFull ?? 0) + 0.5,
          };
        }
        const delta = Math.random() * 1.5;
        const next = Math.min(100, rvm.fillPct + delta);
        return {
          ...rvm,
          fillPct: Math.round(next * 10) / 10,
          minutesFull: next >= 90 ? (rvm.minutesFull ?? 0) + 0.5 : null,
        };
      })
    );
  }, 30_000);
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useRVMData() {
  const [rvms, setLocal] = useState<RVM[]>(_rvms);

  useEffect(() => {
    const fn = () => setLocal([..._rvms]);
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  }, []);

  /** Picker marks an RVM as collected — resets fill to 0 */
  const markCollected = (rvmId: string, pickerCredits: number, depositFn?: (pts: number, note?: string) => void) => {
    setRVMs((prev) =>
      prev.map((r) =>
        r.id === rvmId
          ? { ...r, fillPct: 0, minutesFull: null, lastCollectedAt: new Date().toISOString() }
          : r
      )
    );
    depositFn?.(pickerCredits, `RVM collection — ${_rvms.find((r) => r.id === rvmId)?.name ?? rvmId}`);
  };

  const fullAlerts = rvms.filter((r) => r.fillPct >= 90).sort((a, b) => b.fillPct - a.fillPct);
  const available  = rvms.filter((r) => r.fillPct < 90).sort((a, b) => a.distanceKm - b.distanceKm);

  return { rvms, fullAlerts, available, markCollected };
}

export { INITIAL_RVMS };
