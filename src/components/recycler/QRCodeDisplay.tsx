/**
 * QRCodeDisplay — Recycler's unique identity QR.
 *
 * The QR encodes:
 *   { type: "recycler_identity", recycler_id, recycler_name, pickup_id? }
 *
 * When a Picker scans this, the app:
 *   1. Reads recycler_id from the QR
 *   2. Finds the active pickup for that recycler
 *   3. Prompts for weight confirmation
 *   4. Completes the transaction and credits both wallets
 *
 * onPickupCompleted — called when a completion event fires for this recycler's
 * active pickup, so the parent can switch tabs to History automatically.
 */

import { useEffect, useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { usePickupSchedule, subscribeToCompletions } from "@/hooks/usePickupSchedule";
import { QrCode, RefreshCw, Loader2, CalendarDays, Weight, MapPin, User } from "lucide-react";

interface Props {
  /** If provided, show QR for a specific pickup instead of the latest active one */
  pickupId?: string;
  /** Called when the active pickup is completed — parent can switch to History tab */
  onPickupCompleted?: () => void;
}

export function QRCodeDisplay({ pickupId, onPickupCompleted }: Props) {
  const { pickups } = usePickupSchedule();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Recycler");
  const [loading, setLoading] = useState(true);
  const [qrSeed, setQrSeed] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
        setUserName((data as any)?.full_name ?? user.email ?? "Recycler");
      } else {
        // Offline fallback — use stored name from schedule
        setUserId("local");
      }
      setLoading(false);
    });
  }, []);

  // Subscribe to completion events — when THIS recycler's pickup is completed,
  // notify the parent so it can switch to the History tab.
  useEffect(() => {
    if (!userId) return;
    const unsub = subscribeToCompletions((e) => {
      if (e.recycler_id === userId || e.recycler_id === "local") {
        onPickupCompleted?.();
      }
    });
    return unsub;
  }, [userId, onPickupCompleted]);

  // Find the active pickup for this recycler
  const activePickup = pickupId
    ? pickups.find((p) => p.id === pickupId)
    : pickups.find(
        (p) =>
          (p.recycler_id === userId || p.recycler_id === "local") &&
          (p.status === "scheduled" || p.status === "assigned")
      );

  // Derive display name from schedule if Supabase not available
  const displayName = activePickup?.recycler_name ?? userName;

  // QR payload — encodes recycler identity + active pickup reference
  const qrPayload = userId
    ? JSON.stringify({
        type: "recycler_identity",
        recycler_id: userId,
        recycler_name: displayName,
        ...(activePickup ? { pickup_id: activePickup.id } : {}),
        _seed: qrSeed,
      })
    : null;

  const handleRefresh = useCallback(() => setQrSeed((k) => k + 1), []);

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-[#14532D] mb-2" />
        <p className="text-sm text-[#475569]">Loading your QR…</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active pickup info banner */}
      {activePickup ? (
        <Card className="p-4 bg-[#10B981] text-[#1E293B] border-0 space-y-2 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1E293B]/80">Active Pickup</span>
            <Badge className="bg-white/20 text-[#1E293B] border-0 text-xs">
              {activePickup.status === "assigned" ? "🚴 Picker Assigned" : "📅 Scheduled"}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="flex items-center gap-1.5 text-[#1E293B]/90">
              <Weight className="h-3.5 w-3.5 shrink-0" /> {Number(activePickup.weight_kg).toFixed(1)} kg
            </span>
            <span className="flex items-center gap-1.5 text-[#1E293B]/90">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" /> {String(activePickup.date)}
            </span>
            <span className="flex items-center gap-1.5 text-[#1E293B]/90 col-span-2 truncate">
              <MapPin className="h-3.5 w-3.5 shrink-0" /> {String(activePickup.address)}
            </span>
          </div>
          {activePickup.picker_name && (
            <p className="text-xs text-[#1E293B]/80 flex items-center gap-1">
              <User className="h-3 w-3" /> Picker: {String(activePickup.picker_name)}
            </p>
          )}
        </Card>
      ) : (
        <Card className="p-4 bg-muted/60 border-dashed space-y-1">
          <p className="text-sm font-semibold text-[#475569]">No active pickup</p>
          <p className="text-xs text-[#475569]">
            Book a pickup first. Your QR still works — the picker will be matched to your next booking.
          </p>
        </Card>
      )}

      {/* QR Code */}
      <Card className="p-6 text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <QrCode className="h-5 w-5 text-[#14532D]" />
          <h3 className="font-display font-bold text-lg">My Unique QR</h3>
        </div>

        <p className="text-sm text-[#475569]">
          Show this to the picker when they arrive. They scan it to confirm the pickup and release your credits.
        </p>

        {qrPayload ? (
          <div className="flex justify-center">
            <div className="bg-white p-5 rounded-2xl shadow-md inline-block border border-slate-100">
              <QRCodeSVG
                value={qrPayload}
                size={220}
                bgColor="#ffffff"
                fgColor="#111827"
                level="H"
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#475569]" />
          </div>
        )}

        {/* Recycler ID preview */}
        <p className="text-[10px] font-mono text-[#475569] break-all px-2">
          ID: {userId?.slice(0, 20)}…
        </p>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 mx-auto"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" /> Refresh QR
        </Button>

        <p className="text-xs text-[#475569]">
          Show in person only — do not share digitally.
        </p>
      </Card>
    </div>
  );
}
