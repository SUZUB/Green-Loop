import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ScanLine, CheckCircle2, Loader2, RefreshCw, Weight,
  MapPin, Package, AlertTriangle, ClipboardList,
} from "lucide-react";

const PLASTIC_TYPES = ["PET", "HDPE", "PVC", "LDPE", "PP", "PS", "Mixed"];
const QUALITY_GRADES = ["A", "B", "C", "D"];

interface PendingPickup {
  id: string
  recycler_id: string
  recycler_name: string
  address: string
  weight_kg: number
  notes: string | null
  created_at: string
}

interface ScanForm {
  weight_kg: string
  plastic_type: string
  quality_grade: string
  notes: string
}

const EMPTY_FORM: ScanForm = { weight_kg: "", plastic_type: "PET", quality_grade: "A", notes: "" };

export default function ScannerDashboard() {
  const { toast } = useToast();
  const [pickups, setPickups] = useState<PendingPickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PendingPickup | null>(null);
  const [form, setForm] = useState<ScanForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pickups")
      .select(`
        id, recycler_id, address, weight_kg, notes, created_at,
        profiles!pickups_recycler_id_fkey(full_name)
      `)
      .eq("status", "PENDING_SCAN")
      .order("created_at", { ascending: true });

    setLoading(false);
    if (error) { toast({ title: "Load failed", description: error.message, variant: "destructive" }); return; }

    setPickups(
      (data ?? []).map((r: any) => ({
        id: r.id,
        recycler_id: r.recycler_id,
        recycler_name: r.profiles?.full_name ?? "Recycler",
        address: r.address,
        weight_kg: r.weight_kg,
        notes: r.notes,
        created_at: r.created_at,
      }))
    );
  }, [toast]);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      channelRef.current = supabase
        .channel("scanner-pending-feed")
        .on("postgres_changes" as any,
          { event: "UPDATE", schema: "public", table: "pickups" },
          (payload: any) => {
            const row = payload.new;
            if (row.status === "PENDING_SCAN") {
              setPickups((prev) => {
                if (prev.some((p) => p.id === row.id)) return prev;
                return [...prev, {
                  id: row.id, recycler_id: row.recycler_id,
                  recycler_name: "Recycler", address: row.address,
                  weight_kg: row.weight_kg, notes: row.notes, created_at: row.created_at,
                }];
              });
            } else {
              setPickups((prev) => prev.filter((p) => p.id !== row.id));
            }
          }
        )
        .subscribe();
    });
    return () => {
      if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }
    };
  }, []);

  const handleValidate = async () => {
    if (!selected) return;
    const w = parseFloat(form.weight_kg);
    if (!w || w <= 0) { toast({ title: "Enter a valid weight", variant: "destructive" }); return; }
    if (!form.plastic_type) { toast({ title: "Select plastic type", variant: "destructive" }); return; }
    if (!form.quality_grade) { toast({ title: "Select quality grade", variant: "destructive" }); return; }

    setSubmitting(true);
    const { data, error } = await supabase.rpc("scanner_validate", {
      p_pickup_id:     selected.id,
      p_weight_kg:     w,
      p_plastic_type:  form.plastic_type,
      p_quality_grade: form.quality_grade,
      p_notes:         form.notes || null,
    });
    setSubmitting(false);

    if (error) {
      toast({
        title: "Validation failed",
        description: error.message.includes("scanner_role_required")
          ? "Your account does not have the scanner role."
          : error.message,
        variant: "destructive",
      });
      return;
    }

    const res = data as any;
    setCompletedIds((prev) => new Set([...prev, selected.id]));
    setPickups((prev) => prev.filter((p) => p.id !== selected.id));
    setSelected(null);
    setForm(EMPTY_FORM);

    toast({
      title: "Item validated ✓",
      description: `${res.weight_kg} kg ${res.plastic_type} (Grade ${res.quality_grade}) — ${res.points} pts generated. Now visible to pickers.`,
    });
  };

  return (
    <div className="min-h-screen bg-background/40">
      <PageBackground type="recycling" overlay="bg-foreground/50" />
      <div className="container mx-auto px-4 py-6 max-w-4xl">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold">Scanner Station</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Validate items before they reach pickers. No scan = no payment.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchPending} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">

          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-sm">Pending Scan Queue</h2>
              <Badge variant="secondary">{pickups.length}</Badge>
            </div>

            {loading && pickups.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : pickups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="h-10 w-10 text-muted-foreground opacity-40 mb-3" />
                <p className="text-muted-foreground text-sm">No items pending scan.</p>
                <p className="text-xs text-muted-foreground mt-1">Items appear here when recyclers submit them.</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {pickups.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card
                      className={`p-4 cursor-pointer transition-all border-2 ${
                        selected?.id === p.id
                          ? "border-primary bg-primary/5"
                          : "border-transparent hover:border-border"
                      }`}
                      onClick={() => { setSelected(p); setForm({ ...EMPTY_FORM, weight_kg: String(p.weight_kg) }); }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{p.recycler_name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{p.address || "No address"}</span>
                          </p>
                        </div>
                        <Badge variant="outline" className="text-amber-600 border-amber-300 shrink-0">
                          PENDING SCAN
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Weight className="h-3 w-3" /> {p.weight_kg} kg (declared)
                        </span>
                        <span>{new Date(p.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      {p.notes && (
                        <p className="text-xs text-muted-foreground mt-2 bg-muted/50 rounded px-2 py-1">{p.notes}</p>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <div>
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div key={selected.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <Card className="p-5 space-y-4 sticky top-6">
                    <div className="flex items-center gap-2">
                      <ScanLine className="h-5 w-5 text-primary" />
                      <h3 className="font-display font-bold">Validate Item</h3>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                      <p><span className="text-muted-foreground">Recycler:</span> <span className="font-medium">{selected.recycler_name}</span></p>
                      <p><span className="text-muted-foreground">Declared weight:</span> <span className="font-medium">{selected.weight_kg} kg</span></p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label>Actual Weight (kg) <span className="text-destructive">*</span></Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          placeholder="Weigh the items"
                          value={form.weight_kg}
                          onChange={(e) => setForm((f) => ({ ...f, weight_kg: e.target.value }))}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Plastic Type <span className="text-destructive">*</span></Label>
                        <Select value={form.plastic_type} onValueChange={(v) => setForm((f) => ({ ...f, plastic_type: v }))}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {PLASTIC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Quality Grade <span className="text-destructive">*</span></Label>
                        <Select value={form.quality_grade} onValueChange={(v) => setForm((f) => ({ ...f, quality_grade: v }))}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {QUALITY_GRADES.map((g) => (
                              <SelectItem key={g} value={g}>
                                Grade {g} — {g === "A" ? "Clean, sorted" : g === "B" ? "Minor contamination" : g === "C" ? "Mixed/dirty" : "Reject"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Scanner Notes (optional)</Label>
                        <Input
                          placeholder="Any observations..."
                          value={form.notes}
                          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {form.weight_kg && parseFloat(form.weight_kg) > 0 && (
                      <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
                        <p className="text-muted-foreground">Payment credits generated:</p>
                        <p className="text-xl font-display font-bold text-primary">
                          {Math.round(parseFloat(form.weight_kg) * 100)} pts
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">Locked until picker completes delivery</p>
                      </div>
                    )}

                    {form.quality_grade === "D" && (
                      <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>Grade D items are rejected. No payment will be generated.</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 gap-2"
                        onClick={handleValidate}
                        disabled={submitting || form.quality_grade === "D"}
                      >
                        {submitting
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <CheckCircle2 className="h-4 w-4" />}
                        {submitting ? "Validating…" : "Validate & Release"}
                      </Button>
                      <Button variant="outline" onClick={() => { setSelected(null); setForm(EMPTY_FORM); }}>
                        Cancel
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card className="p-8 text-center border-dashed">
                    <ScanLine className="h-10 w-10 text-muted-foreground opacity-40 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Select an item from the queue to validate it.</p>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
