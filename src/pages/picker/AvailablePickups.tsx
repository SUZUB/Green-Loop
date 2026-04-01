import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAvailablePickups } from "@/hooks/useAvailablePickups";
import { useToast } from "@/hooks/use-toast";
import { QRScannerModal } from "@/components/picker/QRScannerModal";
import {
  MapPin, Weight, RefreshCw, Navigation, Loader2, Package, ScanLine,
} from "lucide-react";

function openMaps(lat: number, lng: number) {
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
    "_blank",
    "noopener,noreferrer"
  );
}

export default function AvailablePickups() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [acceptedId, setAcceptedId] = useState<string | null>(null);
  const { toast } = useToast();
  const { pickups, loading, accepting, error, accept, refresh } = useAvailablePickups();

  const handleAccept = async (id: string, address: string) => {
    const ok = await accept(id);
    if (ok) {
      setAcceptedId(id);
      toast({
        title: "Pickup accepted!",
        description: `Navigate to ${address}, collect the items, then scan the recycler's QR to confirm receipt and trigger payment.`,
      });
    } else {
      toast({
        title: "Could not accept pickup",
        description: error ?? "It may have been taken by another picker.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background/40">
      <PageBackground type="recycling" overlay="bg-foreground/50" />

      <div className="container mx-auto px-4 py-6 max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold">Available Pickups</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Live feed — updates in real-time
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {loading && pickups.length === 0 ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : pickups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
            <p className="font-semibold text-muted-foreground">No pickups available right now</p>
            <p className="text-sm text-muted-foreground mt-1">New requests appear here instantly when recyclers post them.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            <div className="space-y-3">
              {pickups.map((pickup, i) => (
                <motion.div
                  key={pickup.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <Card className="p-4 border border-border hover:shadow-soft transition-shadow">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{pickup.recycler_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{pickup.address || `${pickup.lat.toFixed(4)}, ${pickup.lng.toFixed(4)}`}</span>
                        </p>
                      </div>
                      <Badge className="bg-emerald/10 text-emerald border-0 shrink-0">AVAILABLE</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Weight className="h-3.5 w-3.5" /> {pickup.weight_kg} kg
                      </span>
                      <span className="text-xs">
                        {new Date(pickup.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {pickup.notes && (
                      <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 mb-3">
                        {pickup.notes}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={accepting === pickup.id}
                        onClick={() => handleAccept(pickup.id, pickup.address)}
                      >
                        {accepting === pickup.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : "Accept Pickup"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => openMaps(pickup.lat, pickup.lng)}
                      >
                        <Navigation className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Sticky scan banner — shown after picker accepts a pickup */}
      <AnimatePresence>
        {acceptedId && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-primary shadow-elevated"
          >
            <div className="container mx-auto max-w-lg flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-primary-foreground text-sm">Pickup accepted</p>
                <p className="text-primary-foreground/80 text-xs">
                  Arrive at the recycler, collect items, then scan their QR to confirm receipt and release payment.
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="gap-2 shrink-0"
                onClick={() => setScannerOpen(true)}
              >
                <ScanLine className="h-4 w-4" /> Scan QR
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <QRScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onSuccess={(result) => {
          setAcceptedId(null);
          toast({
            title: "Receipt confirmed ✓",
            description: `${result.weight_kg} kg received. ${result.points} points credited to your wallet.`,
          });
        }}
      />
    </div>
  );
}
