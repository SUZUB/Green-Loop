import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates the current picker's lat/lng in the profiles table every 10 seconds.
 * Only activates when the user is authenticated.
 */
export function usePickerGeolocation() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const updatePosition = () => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            if (cancelled) return;
            await supabase
              .from("profiles")
              .update({ lat: pos.coords.latitude, lng: pos.coords.longitude, updated_at: new Date().toISOString() } as any)
              .eq("id", user.id);
          },
          () => {}, // silently ignore errors
          { enableHighAccuracy: true, timeout: 8000 }
        );
      };

      // Initial update
      updatePosition();
      // Then every 10 seconds
      intervalRef.current = setInterval(updatePosition, 10000);
    };

    if ("geolocation" in navigator) {
      start();
    }

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
}
