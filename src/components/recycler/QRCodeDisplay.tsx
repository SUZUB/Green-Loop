import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { QrCode, Loader2, Coins } from "lucide-react";

interface RecyclerQRData {
  userId: string;
  name: string;
  coinBalance: number;
}

export function QRCodeDisplay() {
  const [data, setData] = useState<RecyclerQRData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, coin_balance")
        .eq("id", auth.user.id)
        .maybeSingle();

      if (!cancelled) {
        setData({
          userId: auth.user.id,
          name: (profile as any)?.full_name ?? "Recycler",
          coinBalance: (profile as any)?.coin_balance ?? 0,
        });
        setLoading(false);
      }
    }

    load();

    // Subscribe to real-time balance updates
    let channel: ReturnType<typeof supabase.channel> | null = null;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      channel = supabase
        .channel("recycler-qr-balance")
        .on(
          "postgres_changes" as any,
          { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
          (payload: any) => {
            if (!cancelled) {
              setData((prev) => prev
                ? { ...prev, coinBalance: payload.new.coin_balance ?? prev.coinBalance }
                : prev
              );
            }
          }
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <Card className="p-6 text-center">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Loading your QR code…</p>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-6 text-center space-y-2">
        <QrCode className="h-8 w-8 mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Please log in to see your QR code.</p>
      </Card>
    );
  }

  const qrValue = JSON.stringify({ type: "recycler", id: data.userId });

  return (
    <Card className="p-6 text-center space-y-4">
      <div className="flex items-center justify-center gap-2">
        <QrCode className="h-5 w-5 text-primary" />
        <h3 className="font-display font-bold text-lg">My Recycler QR</h3>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Coins className="h-4 w-4 text-primary" />
        <span>Current balance: <span className="font-bold text-foreground">{data.coinBalance} credits</span></span>
      </div>

      <p className="text-sm text-muted-foreground">
        Show this to the picker. They will scan it to link your account before verifying your items.
      </p>

      <div className="bg-white p-4 rounded-xl inline-block mx-auto">
        <QRCodeSVG
          value={qrValue}
          size={200}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
        />
      </div>

      <div className="rounded-lg bg-muted/50 px-4 py-2 text-xs text-muted-foreground space-y-0.5">
        <p><span className="font-medium">Name:</span> {data.name}</p>
        <p><span className="font-medium">ID:</span> {data.userId.slice(0, 16)}…</p>
      </div>

      <p className="text-xs text-muted-foreground">
        Balance updates automatically after each verified transaction.
      </p>
    </Card>
  );
}
