import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QrCode, RefreshCw, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  pickupId?: string;
}

export function QRCodeDisplay({ pickupId }: Props) {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [noPickup, setNoPickup] = useState(false);

  const generateToken = async (id: string) => {
    setLoading(true);
    const { data, error } = await supabase.rpc("generate_pickup_token", {
      p_pickup_id: id,
    });
    setLoading(false);
    if (error || !data) {
      toast({ title: "Could not generate QR", description: error?.message, variant: "destructive" });
      return;
    }
    setToken(data as string);
  };

  useEffect(() => {
    if (pickupId) {
      generateToken(pickupId);
      return;
    }

    async function findLatestPickup() {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { setLoading(false); return; }

      const { data } = await supabase
        .from("pickups")
        .select("id, verification_token, status")
        .eq("recycler_id", auth.user.id)
        .in("status", ["AVAILABLE", "ASSIGNED"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setLoading(false);

      if (!data) { setNoPickup(true); return; }

      if ((data as any).verification_token) {
        setToken((data as any).verification_token);
      } else {
        await generateToken((data as any).id);
      }
    }

    findLatestPickup();
  }, [pickupId]);

  const qrValue = token
    ? JSON.stringify({ type: "pickup_verify", token })
    : "";

  if (loading) {
    return (
      <Card className="p-6 text-center">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Generating verification QR…</p>
      </Card>
    );
  }

  if (noPickup) {
    return (
      <Card className="p-6 text-center space-y-2">
        <QrCode className="h-8 w-8 mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No active pickup found.</p>
        <p className="text-xs text-muted-foreground">Book a pickup first, then your QR will appear here.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 text-center space-y-4">
      <div className="flex items-center justify-center gap-2">
        <QrCode className="h-5 w-5 text-primary" />
        <h3 className="font-display font-bold text-lg">Pickup Verification QR</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Show this to the picker when they arrive. Do not share the token digitally.
      </p>
      {token && (
        <div className="bg-white p-4 rounded-xl inline-block mx-auto">
          <QRCodeSVG
            value={qrValue}
            size={200}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            includeMargin
          />
        </div>
      )}
      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => pickupId ? generateToken(pickupId) : setToken(null)}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" /> Regenerate
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Token refreshes on each regeneration. Old tokens are invalidated automatically.
      </p>
    </Card>
  );
}
