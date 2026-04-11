import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AvailablePickup {
  id: string
  recycler_id: string
  lat: number
  lng: number
  address: string
  weight_kg: number
  notes: string | null
  created_at: string
  recycler_name?: string
}

export function useAvailablePickups() {
  const [pickups, setPickups] = useState<AvailablePickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchAvailable = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("pickups")
      .select("id, recycler_id, lat, lng, address, weight_kg, notes, created_at")
      .eq("status", "AVAILABLE")
      .order("created_at", { ascending: false });

    setLoading(false);

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    const rows = data ?? [];

    // Fetch recycler names in one batch query
    const recyclerIds = [...new Set(rows.map((r: any) => r.recycler_id))];
    const nameMap: Record<string, string> = {};
    if (recyclerIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", recyclerIds);
      (profiles ?? []).forEach((p: any) => { nameMap[p.id] = p.full_name; });
    }

    setPickups(
      rows.map((row: any) => ({
        id: row.id,
        recycler_id: row.recycler_id,
        lat: row.lat,
        lng: row.lng,
        address: row.address,
        weight_kg: row.weight_kg,
        notes: row.notes,
        created_at: row.created_at,
        recycler_name: nameMap[row.recycler_id] ?? "Recycler",
      }))
    );
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAvailable();
  }, [fetchAvailable]);

  // Real-time subscription — INSERT adds to list, UPDATE removes if no longer AVAILABLE
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      channel = supabase
        .channel("available-pickups-feed")
        .on(
          "postgres_changes" as any,
          { event: "INSERT", schema: "public", table: "pickups", filter: "status=eq.AVAILABLE" },
          async (payload: any) => {
            const row = payload.new;
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", row.recycler_id)
              .maybeSingle();

            setPickups((prev) => {
              if (prev.some((p) => p.id === row.id)) return prev;
              return [
                {
                  id: row.id,
                  recycler_id: row.recycler_id,
                  lat: row.lat,
                  lng: row.lng,
                  address: row.address,
                  weight_kg: row.weight_kg,
                  notes: row.notes,
                  created_at: row.created_at,
                  recycler_name: (profile as any)?.full_name ?? "Recycler",
                },
                ...prev,
              ];
            });
          }
        )
        .on(
          "postgres_changes" as any,
          { event: "UPDATE", schema: "public", table: "pickups" },
          (payload: any) => {
            const row = payload.new;
            if (row.status !== "AVAILABLE") {
              setPickups((prev) => prev.filter((p) => p.id !== row.id));
            }
          }
        )
        .subscribe();

      channelRef.current = channel;
    });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const accept = async (pickupId: string): Promise<boolean> => {
    setAccepting(pickupId);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc("accept_pickup", {
      p_pickup_id: pickupId,
    });

    setAccepting(null);

    if (rpcError) {
      setError(
        rpcError.message.includes("pickup_not_available")
          ? "This pickup was already claimed."
          : rpcError.message
      );
      return false;
    }

    // Optimistically remove from list — the realtime UPDATE will also fire
    setPickups((prev) => prev.filter((p) => p.id !== pickupId));
    return true;
  };

  const complete = async (pickupId: string): Promise<boolean> => {
    const { error: rpcError } = await supabase.rpc("complete_pickup", {
      p_pickup_id: pickupId,
    });

    if (rpcError) {
      setError(rpcError.message);
      return false;
    }

    return true;
  };

  return { pickups, loading, accepting, error, accept, complete, refresh: fetchAvailable };
}
