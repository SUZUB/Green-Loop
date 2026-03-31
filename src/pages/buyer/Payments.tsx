import { useState } from "react";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BuyerBottomNav } from "@/components/BuyerNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Factory, IndianRupee, Download, FileText, CheckCircle2,
  Clock, CreditCard, AlertCircle, Receipt, Send, Eye,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface Invoice {
  id: string;
  supplier: string;
  amount: number;
  gst: number;
  total: number;
  status: "paid" | "pending" | "overdue";
  date: string;
  dueDate: string;
  items: { desc: string; qty: string; rate: number; amount: number }[];
}

const invoices: Invoice[] = [
  {
    id: "INV-2026-001", supplier: "ABC Recyclers", amount: 7000, gst: 1260, total: 8260,
    status: "pending", date: "Mar 5, 2026", dueDate: "Mar 15, 2026",
    items: [{ desc: "PET Bottles (Clear) - Clean & Dry", qty: "500 kg", rate: 14, amount: 7000 }],
  },
  {
    id: "INV-2026-002", supplier: "XYZ Plastics", amount: 15000, gst: 2700, total: 17700,
    status: "pending", date: "Mar 4, 2026", dueDate: "Mar 14, 2026",
    items: [{ desc: "PET Bottles (Mixed) - Reasonably Clean", qty: "1,000 kg", rate: 15, amount: 15000 }],
  },
  {
    id: "INV-2026-003", supplier: "Eco Solutions", amount: 3600, gst: 648, total: 4248,
    status: "paid", date: "Mar 1, 2026", dueDate: "Mar 10, 2026",
    items: [{ desc: "HDPE Film Bales", qty: "300 kg", rate: 12, amount: 3600 }],
  },
  {
    id: "INV-2026-004", supplier: "Green Plastics Co", amount: 36000, gst: 6480, total: 42480,
    status: "overdue", date: "Feb 20, 2026", dueDate: "Mar 2, 2026",
    items: [{ desc: "PP Granules - Industrial Grade", qty: "2,000 kg", rate: 18, amount: 36000 }],
  },
  {
    id: "INV-2026-005", supplier: "ABC Recyclers", amount: 10500, gst: 1890, total: 12390,
    status: "paid", date: "Feb 15, 2026", dueDate: "Feb 25, 2026",
    items: [{ desc: "PET Bottles (Clear)", qty: "750 kg", rate: 14, amount: 10500 }],
  },
];

const paymentMethods = [
  { id: "bank", label: "Bank Transfer (NEFT/RTGS)", icon: CreditCard },
  { id: "upi", label: "UPI Payment", icon: IndianRupee },
  { id: "cheque", label: "Cheque", icon: FileText },
];

const statusConfig = {
  paid: { color: "bg-primary/10 text-primary", icon: CheckCircle2, label: "Paid" },
  pending: { color: "bg-warning/10 text-warning", icon: Clock, label: "Pending" },
  overdue: { color: "bg-destructive/10 text-destructive", icon: AlertCircle, label: "Overdue" },
};

const BuyerPayments = () => {
  const { toast } = useToast();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tab, setTab] = useState<"all" | "pending" | "paid">("all");

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const filtered = invoices.filter((inv) => {
    if (tab === "pending") return inv.status === "pending" || inv.status === "overdue";
    if (tab === "paid") return inv.status === "paid";
    return true;
  });

  const selectedTotal = invoices
    .filter((inv) => selectedIds.includes(inv.id))
    .reduce((sum, inv) => sum + inv.total, 0);

  const handlePay = (label: string) => {
    toast({ title: "Payment Initiated", description: `${label} for ₹${selectedTotal.toLocaleString()} has been initiated.` });
    setSelectedIds([]);
    setBulkMode(false);
  };

  const pendingTotal = invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + i.total, 0);
  const paidTotal = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);

  return (
    <div className="min-h-screen bg-background/40 pb-20">
      <PageBackground type="oceanPlastic" overlay="bg-foreground/50" />

      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Factory className="h-6 w-6 text-earth" />
            <span className="font-display font-bold text-lg">Payments</span>
          </div>
          <Button
            variant={bulkMode ? "default" : "outline"}
            size="sm"
            onClick={() => { setBulkMode(!bulkMode); setSelectedIds([]); }}
            className={bulkMode ? "bg-earth text-earth-foreground" : ""}
          >
            {bulkMode ? "Cancel" : "Bulk Pay"}
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-lg font-display font-bold text-warning">₹{pendingTotal.toLocaleString()}</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="text-lg font-display font-bold text-primary">₹{paidTotal.toLocaleString()}</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Total GST</p>
            <p className="text-lg font-display font-bold">₹{invoices.reduce((s, i) => s + i.gst, 0).toLocaleString()}</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(["all", "pending", "paid"] as const).map((t) => (
            <Button
              key={t}
              variant={tab === t ? "default" : "outline"}
              size="sm"
              onClick={() => setTab(t)}
              className={tab === t ? "bg-earth text-earth-foreground" : ""}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>

        {/* Invoices */}
        <div className="space-y-3 mb-6">
          {filtered.map((inv, i) => {
            const config = statusConfig[inv.status];
            return (
              <motion.div key={inv.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    {bulkMode && inv.status !== "paid" && (
                      <Checkbox
                        checked={selectedIds.includes(inv.id)}
                        onCheckedChange={() => toggleSelect(inv.id)}
                        className="mt-1"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <span className="font-semibold text-sm">{inv.id}</span>
                          <p className="text-xs text-muted-foreground">{inv.supplier}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${config.color}`}>
                          <config.icon className="h-3 w-3" /> {config.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <p>Subtotal: ₹{inv.amount.toLocaleString()}</p>
                          <p>GST (18%): ₹{inv.gst.toLocaleString()}</p>
                        </div>
                        <p className="font-display font-bold text-lg">₹{inv.total.toLocaleString()}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>Date: {inv.date}</span>
                        <span>Due: {inv.dueDate}</span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setSelectedInvoice(inv)}>
                          <Eye className="h-3 w-3" /> View
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs"
                          onClick={() => toast({ title: "Downloading...", description: `${inv.id}.pdf` })}
                        >
                          <Download className="h-3 w-3" /> PDF
                        </Button>
                        {inv.status !== "paid" && (
                          <Button size="sm" className="h-7 gap-1 text-xs bg-earth text-earth-foreground hover:bg-earth/90 ml-auto"
                            onClick={() => { setSelectedIds([inv.id]); setBulkMode(true); }}
                          >
                            <Send className="h-3 w-3" /> Pay
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bulk Pay Bar */}
        {bulkMode && selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-16 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border p-4 z-40"
          >
            <div className="max-w-lg mx-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">{selectedIds.length} invoice(s) selected</span>
                <span className="font-display font-bold text-lg">₹{selectedTotal.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map((pm) => (
                  <Button
                    key={pm.id}
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs h-9"
                    onClick={() => handlePay(pm.label)}
                  >
                    <pm.icon className="h-3 w-3" /> {pm.label.split(" ")[0]}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Receipt className="h-5 w-5 text-earth" /> {selectedInvoice?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-5 pt-2">
              {/* Header info */}
              <div className="flex justify-between text-sm">
                <div>
                  <p className="font-semibold">From: {selectedInvoice.supplier}</p>
                  <p className="text-xs text-muted-foreground">Date: {selectedInvoice.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">To: Greenway Industries</p>
                  <p className="text-xs text-muted-foreground">GSTIN: 27AADCG1234F1ZH</p>
                </div>
              </div>

              {/* Items table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-1 p-3 bg-muted/50 text-xs font-semibold">
                  <span className="col-span-5">Description</span>
                  <span className="col-span-2 text-right">Qty</span>
                  <span className="col-span-2 text-right">Rate</span>
                  <span className="col-span-3 text-right">Amount</span>
                </div>
                {selectedInvoice.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-1 p-3 text-xs border-t border-border">
                    <span className="col-span-5">{item.desc}</span>
                    <span className="col-span-2 text-right">{item.qty}</span>
                    <span className="col-span-2 text-right">₹{item.rate}</span>
                    <span className="col-span-3 text-right font-medium">₹{item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <Card className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{selectedInvoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CGST (9%)</span>
                  <span>₹{(selectedInvoice.gst / 2).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SGST (9%)</span>
                  <span>₹{(selectedInvoice.gst / 2).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-border pt-2 mt-2">
                  <span>Total (incl. GST)</span>
                  <span className="font-display text-lg">₹{selectedInvoice.total.toLocaleString()}</span>
                </div>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-1"
                  onClick={() => toast({ title: "Downloading...", description: `${selectedInvoice.id}.pdf` })}
                >
                  <Download className="h-4 w-4" /> Download PDF
                </Button>
                {selectedInvoice.status !== "paid" && (
                  <Button className="flex-1 gap-1 bg-earth text-earth-foreground hover:bg-earth/90">
                    <Send className="h-4 w-4" /> Pay Now
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BuyerBottomNav />
    </div>
  );
};

export default BuyerPayments;
