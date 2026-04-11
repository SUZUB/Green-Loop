import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BroadcastPayload {
  lat: number;
  lng: number;
  address: string;
  weight_kg: number;
  notes?: string;
}

export interface BroadcastResult {
  id: string;
  status: "AVAILABLE" | "ASSIGNED" | "COMPLETED";
}

export function usePickupBroadcast() {
  const [broadcasting, setBroadcasting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const broadcast = async (payload: BroadcastPayload): Promise<BroadcastResult | null> => {
    setBroadcasting(true);
    setError(null);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setError("Not authenticated");
      setBroadcasting(false);
      return null;
    }

    const { data, error: insertError } = await supabase
      .from("pickups")
      .insert({
        recycler_id: auth.user.id,
        lat: payload.lat,
        lng: payload.lng,
        address: payload.address,
        weight_kg: payload.weight_kg,
        notes: payload.notes ?? null,
        status: "AVAILABLE",
      })
      .select("id, status")
      .single();

    if (insertError) {
      setError(insertError.message);
      setBroadcasting(false);
      return null;
    }

    const pickupId = (data as any).id;

    // Pre-generate the verification token so the recycler's QR is ready immediately
    await supabase.rpc("generate_pickup_token", { p_pickup_id: pickupId });

    setBroadcasting(false);
    return data as BroadcastResult;
  };

  return { broadcast, broadcasting, error };
}
