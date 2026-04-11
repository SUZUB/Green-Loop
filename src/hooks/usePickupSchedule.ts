/**
 * usePickupSchedule
 * Shared state for the Recycler ↔ Picker scheduling + credit system.
 *
 * Credit formula: credits = weight_kg × 100
 *
 * Global event bus: _completionListeners
 *   Fired after every completeTransaction so useRecycleHub and picker
 *   dashboards can update their own state without polling.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PickupStatus = "scheduled" | "assigned" | "completed";

export interface ScheduledPickup {
  id: string;
  recycler_id: string;
  recycler_name: string;
  picker_id: string | null;
  picker_name: string | null;
  status: PickupStatus;
  date: string;
  time_slot: string;
  weight_kg: number;
  address: string;
  credits: number;
  completed_at: string | null;
  created_at: string;
}

/** Picker-side history entry written on every completed transaction */
export interface PickerTransaction {
  id: string;
  recycler_name: string;
  recycler_id: string;
  weight_kg: number;
  credits: number;
  address: string;
  completed_at: string;
}

/** Payload broadcast to all completion listeners */
export interface CompletionEvent {
  pickupId: string;
  recycler_id: string;
  recycler_name: string;
  picker_id: string;
  picker_name: string;
  weight_kg: number;
  credits: number;
  address: string;
  completed_at: string;
}

// ── storage keys ─────────────────────────────────────────────────────────────
const STORAGE_KEY    = "greenloop_pickup_schedule";
const WALLET_KEY     = "greenloop_recycler_wallet";
const PICKER_TX_KEY  = "greenloop_picker_transactions";

// ── storage helpers ───────────────────────────────────────────────────────────
function loadPickups(): ScheduledPickup[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
}
function savePickups(p: ScheduledPickup[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
}
function loadPickerTx(): Record<string, PickerTransaction[]> {
  try { return JSON.parse(localStorage.getItem(PICKER_TX_KEY) ?? "{}"); } catch { return {}; }
}
function savePickerTx(m: Record<string, PickerTransaction[]>) {
  try { localStorage.setItem(PICKER_TX_KEY, JSON.stringify(m)); } catch {}
}

export function getRecyclerWallet(recyclerId: string): number {
  try {
    const m: Record<string, number> = JSON.parse(localStorage.getItem(WALLET_KEY) ?? "{}");
    return m[recyclerId] ?? 0;
  } catch { return 0; }
}
export function addToRecyclerWallet(recyclerId: string, credits: number): number {
  try {
    const m: Record<string, number> = JSON.parse(localStorage.getItem(WALLET_KEY) ?? "{}");
    m[recyclerId] = (m[recyclerId] ?? 0) + credits;
    localStorage.setItem(WALLET_KEY, JSON.stringify(m));
    return m[recyclerId];
  } catch { return credits; }
}

// ── singleton stores (guarded for HMR — prevents "already declared" errors) ───
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _g = globalThis as any;
if (!_g.__greenloop_pickups__)    _g.__greenloop_pickups__    = loadPickups();
if (!_g.__greenloop_pickerTxMap__) _g.__greenloop_pickerTxMap__ = loadPickerTx();
if (!_g.__greenloop_pickupListeners__)    _g.__greenloop_pickupListeners__    = new Set<() => void>();
if (!_g.__greenloop_pickerTxListeners__)  _g.__greenloop_pickerTxListeners__  = new Set<() => void>();
if (!_g.__greenloop_completionListeners__) _g.__greenloop_completionListeners__ = new Set<(e: CompletionEvent) => void>();

let _pickups: ScheduledPickup[]                          = _g.__greenloop_pickups__;
let _pickerTxMap: Record<string, PickerTransaction[]>    = _g.__greenloop_pickerTxMap__;

const _pickupListeners     = _g.__greenloop_pickupListeners__    as Set<() => void>;
const _pickerTxListeners   = _g.__greenloop_pickerTxListeners__  as Set<() => void>;
/** Global event bus — any module can subscribe to pickup completions */
const _completionListeners = _g.__greenloop_completionListeners__ as Set<(e: CompletionEvent) => void>;

function notifyPickups()   { _pickupListeners.forEach((fn) => fn()); }
function notifyPickerTx()  { _pickerTxListeners.forEach((fn) => fn()); }
function notifyCompletion(e: CompletionEvent) { _completionListeners.forEach((fn) => fn(e)); }

function setPickups(updater: (prev: ScheduledPickup[]) => ScheduledPickup[]) {
  _pickups = updater(_pickups);
  _g.__greenloop_pickups__ = _pickups;
  savePickups(_pickups);
  notifyPickups();
}
function addPickerTx(pickerId: string, tx: PickerTransaction) {
  const list = _pickerTxMap[pickerId] ?? [];
  if (list.some((t) => t.id === tx.id)) return;
  _pickerTxMap = { ..._pickerTxMap, [pickerId]: [tx, ...list] };
  _g.__greenloop_pickerTxMap__ = _pickerTxMap;
  savePickerTx(_pickerTxMap);
  notifyPickerTx();
}

// ── public subscription helper (used by useRecycleHub) ───────────────────────
export function subscribeToCompletions(fn: (e: CompletionEvent) => void): () => void {
  _completionListeners.add(fn);
  return () => _completionListeners.delete(fn);
}

// ── hook ─────────────────────────────────────────────────────────────────────
export function usePickupSchedule() {
  const [pickups, setLocalPickups]         = useState<ScheduledPickup[]>(_pickups);
  const [pickerTxMap, setLocalPickerTxMap] = useState<Record<string, PickerTransaction[]>>(_pickerTxMap);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const a = () => setLocalPickups([..._pickups]);
    const b = () => setLocalPickerTxMap({ ..._pickerTxMap });
    _pickupListeners.add(a);
    _pickerTxListeners.add(b);
    return () => { _pickupListeners.delete(a); _pickerTxListeners.delete(b); };
  }, []);

  // Supabase real-time sync
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const ch = supabase
        .channel("pickup-schedule-sync")
        .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "pickups" }, (payload: any) => {
          const row = payload.new;
          if (row.status === "COMPLETED") {
            setPickups((prev) => prev.map((p) =>
              p.id === row.id
                ? { ...p, status: "completed", credits: Math.round(row.weight_kg * 100), completed_at: row.updated_at ?? new Date().toISOString() }
                : p
            ));
          } else if (row.status === "ASSIGNED") {
            setPickups((prev) => prev.map((p) =>
              p.id === row.id ? { ...p, status: "assigned", picker_id: row.picker_id } : p
            ));
          }
        })
        .subscribe();
      channelRef.current = ch;
    });
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, []);

  // ── schedulePickup ──────────────────────────────────────────────────────────
  const schedulePickup = useCallback((payload: {
    id: string; recycler_id: string; recycler_name: string;
    date: string; time_slot: string; weight_kg: number; address: string;
  }) => {
    const pickup: ScheduledPickup = {
      ...payload, picker_id: null, picker_name: null,
      status: "scheduled", credits: 0, completed_at: null,
      created_at: new Date().toISOString(),
    };
    setPickups((prev) => {
      if (prev.some((p) => p.id === payload.id)) return prev;
      return [pickup, ...prev];
    });
    return pickup;
  }, []);

  // ── acceptPickup ────────────────────────────────────────────────────────────
  const acceptPickup = useCallback((pickupId: string, pickerId: string, pickerName: string) => {
    setPickups((prev) => prev.map((p) =>
      p.id === pickupId && p.status === "scheduled"
        ? { ...p, status: "assigned", picker_id: pickerId, picker_name: pickerName }
        : p
    ));
  }, []);

  /**
   * completeTransaction — atomic handshake
   *
   * 1. Marks pickup → completed in schedule store
   * 2. Credits recycler wallet (localStorage)
   * 3. Writes PickerTransaction entry
   * 4. Fires CompletionEvent to ALL listeners (useRecycleHub, dashboards, etc.)
   */
  const completeTransaction = useCallback((
    pickupId: string,
    confirmedWeightKg: number,
    pickerId = "local",
    pickerName = "Picker",
  ): { credits: number; newRecyclerBalance: number } => {
    const credits      = Math.round(confirmedWeightKg * 100);
    const completedAt  = new Date().toISOString();
    let recyclerId     = "local";
    let recyclerName   = "Recycler";
    let address        = "";

    setPickups((prev) => prev.map((p) => {
      if (p.id !== pickupId) return p;
      recyclerId   = p.recycler_id;
      recyclerName = p.recycler_name;
      address      = p.address;
      return {
        ...p,
        status: "completed",
        weight_kg: confirmedWeightKg,
        credits,
        picker_id:   pickerId,
        picker_name: pickerName,
        completed_at: completedAt,
      };
    }));

    const newRecyclerBalance = addToRecyclerWallet(recyclerId, credits);

    // Write picker-side transaction
    if (pickerId && pickerId !== "local") {
      addPickerTx(pickerId, {
        id: pickupId, recycler_name: recyclerName, recycler_id: recyclerId,
        weight_kg: confirmedWeightKg, credits, address, completed_at: completedAt,
      });
    }

    // Broadcast to all global listeners
    notifyCompletion({
      pickupId, recycler_id: recyclerId, recycler_name: recyclerName,
      picker_id: pickerId, picker_name: pickerName,
      weight_kg: confirmedWeightKg, credits, address, completed_at: completedAt,
    });

    return { credits, newRecyclerBalance };
  }, []);

  /** Legacy alias */
  const completePickup = useCallback((pickupId: string, actualWeightKg?: number): number => {
    const weight = actualWeightKg ?? (_pickups.find((p) => p.id === pickupId)?.weight_kg ?? 1);
    return completeTransaction(pickupId, weight).credits;
  }, [completeTransaction]);

  const findActivePickupByRecycler = useCallback((recyclerId: string): ScheduledPickup | null =>
    _pickups.find((p) =>
      p.recycler_id === recyclerId && (p.status === "scheduled" || p.status === "assigned")
    ) ?? null
  , []);

  const getPickerTransactions = useCallback(
    (pickerId: string): PickerTransaction[] => pickerTxMap[pickerId] ?? [],
    [pickerTxMap]
  );

  const scheduledForPickers = pickups.filter((p) => p.status === "scheduled" || p.status === "assigned");

  const recyclerHistory = useCallback(
    (recyclerId: string) => pickups.filter((p) => p.recycler_id === recyclerId),
    [pickups]
  );

  const pickerHistory = useCallback(
    (pickerId: string) => pickups.filter((p) => p.picker_id === pickerId && p.status === "completed"),
    [pickups]
  );

  return {
    pickups,
    scheduledForPickers,
    schedulePickup,
    acceptPickup,
    completePickup,
    completeTransaction,
    findActivePickupByRecycler,
    getPickerTransactions,
    recyclerHistory,
    pickerHistory,
  };
}
