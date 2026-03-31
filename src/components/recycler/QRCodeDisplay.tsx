import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { QrCode, Copy, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function QRCodeDisplay() {
  const [userId, setUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const qrValue = userId ? JSON.stringify({ type: "recycler", id: userId }) : "";

  const handleCopy = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
      setCopied(true);
      toast({ title: "ID copied to clipboard!" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!userId) {
    return (
      <Card className="p-6 text-center">
        <QrCode className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Please log in to see your QR code</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 text-center space-y-4">
      <div className="flex items-center justify-center gap-2 mb-2">
        <QrCode className="h-5 w-5 text-primary" />
        <h3 className="font-display font-bold text-lg">My Recycler QR</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Show this QR code to the picker during pickup
      </p>
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
      <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
        {copied ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied!" : "Copy ID"}
      </Button>
    </Card>
  );
}
