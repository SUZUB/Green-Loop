import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useRecycleHub } from "@/hooks/useRecycleHub";
import { generateInvoice, InvoiceOrder } from "@/utils/generateInvoice";
import { useTimeSimulation } from "@/hooks/useTimeSimulation";
import { Download, ArrowRight, Shield, MapPin, Clock, CheckCircle2 } from "lucide-react";

const ORDER_STORAGE_KEY = "buyer_order_tracker_orders";

export type OrderStatus = "Sourcing" | "In Transit" | "Delivered" | "Completed";

export interface BuyerOrder {
  orderId: string;
  supplier: string;
  material: string;
  quantity: string;
  totalCredits: number;
  status: OrderStatus;
  createdAt: string;
  buyerName: string;
}

const initialOrders: BuyerOrder[] = [
  {
    orderId: "ORD-001",
    supplier: "ABC Recyclers",
    material: "PET",
    quantity: "500 kg",
    totalCredits: 70,
    status: "In Transit",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    buyerName: "RecycleHub Buyer",
  },
  {
    orderId: "ORD-002",
    supplier: "XYZ Plastics",
    material: "HDPE",
    quantity: "1,000 kg",
    totalCredits: 150,
    status: "Delivered",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    buyerName: "RecycleHub Buyer",
  },
  {
    orderId: "ORD-003",
    supplier: "Green Plastics Co",
    material: "PP",
    quantity: "2,000 kg",
    totalCredits: 240,
    status: "Completed",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    buyerName: "RecycleHub Buyer",
  },
];

const statusSequence: Record<OrderStatus, OrderStatus> = {
  Sourcing: "In Transit",
  "In Transit": "Delivered",
  Delivered: "Completed",
  Completed: "Completed",
};

const statusColor: Record<OrderStatus, string> = {
  Sourcing: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  "In Transit": "bg-sky-500/10 text-sky-300 border border-sky-500/20",
  Delivered: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
  Completed: "bg-emerald-600/15 text-emerald-200 border border-emerald-500/20",
};

const statuses: OrderStatus[] = ["Sourcing", "In Transit", "Delivered", "Completed"];

export default function OrderTracker() {
  const { toast } = useToast();
  const simulation = useTimeSimulation();
  const { trackOrders } = useRecycleHub();
  const [orders, setOrders] = useState<BuyerOrder[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(ORDER_STORAGE_KEY);
    if (stored) {
      try {
        setOrders(JSON.parse(stored));
        return;
      } catch {
        // fall through
      }
    }
    setOrders(
      trackOrders.map((item) => ({
        orderId: item.id,
        supplier: item.supplier,
        material: item.materialType,
        quantity: item.quantity,
        totalCredits: Math.max(1, Math.round(Number(item.totalAmount.replace(/[^0-9]/g, "")) / 10)),
        status: item.status,
        createdAt: new Date().toISOString(),
        buyerName: "RecycleHub Buyer",
      }))
    );
  }, [trackOrders]);

  useEffect(() => {
    window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const groupedOrders = useMemo(
    () => statuses.map((status) => ({ status, items: orders.filter((order) => order.status === status) })),
    [orders]
  );

  const advanceOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.orderId === orderId
          ? { ...order, status: statusSequence[order.status] }
          : order
      )
    );
  };

  const downloadInvoice = (order: BuyerOrder) => {
    const invoice: InvoiceOrder = {
      orderId: order.orderId,
      buyerName: order.buyerName,
      supplier: order.supplier,
      material: order.material,
      quantity: order.quantity,
      totalCredits: order.totalCredits,
      status: order.status,
      createdAt: order.createdAt,
    };
    generateInvoice(invoice);
    toast({
      title: "Invoice generated",
      description: `Invoice for ${order.orderId} downloaded.`,
      variant: "default",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px] bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl shadow-emerald-900/20 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/75">Track Orders</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Order pipeline & live simulation</h2>
          </div>
          <div className="rounded-full bg-slate-900/80 px-4 py-2 text-sm text-slate-200">
            Current shift: <span className="font-semibold text-emerald-200">{simulation.phase}</span> • {simulation.currentHour}:00 hrs
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {groupedOrders.map((group) => (
            <div key={group.status} className="rounded-3xl bg-slate-950/80 p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{group.status}</span>
                <Badge className="bg-white/5 text-slate-100">{group.items.length}</Badge>
              </div>
              <p className="text-2xl font-semibold text-white">{group.items.length}</p>
              <p className="text-sm text-slate-400 mt-2">Orders in this stage</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card className="rounded-[32px] bg-slate-950/90 border border-white/10 p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live Operations Map</p>
              <h3 className="text-xl font-semibold text-white">Dynamic picker & supplier flow</h3>
            </div>
            <div className="rounded-full bg-emerald-900/80 px-3 py-2 text-xs text-emerald-100">{simulation.phase} mode</div>
          </div>

          <div className={`relative overflow-hidden rounded-[28px] border ${simulation.mapStyle.border} ${simulation.mapStyle.background} py-10`}>
            <div className="absolute inset-x-0 top-4 flex items-center justify-between px-6 text-xs font-medium text-slate-400">
              <span>Center</span>
              <span>Live dispatch zones</span>
            </div>
            <div className="relative h-[300px]">
              {simulation.livePickers.map((point) => (
                <div
                  key={point.id}
                  className="absolute flex flex-col items-center gap-2 text-[11px]"
                  style={{ left: point.left, top: point.top }}
                >
                  <div className="h-3.5 w-3.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(34,197,94,0.35)]" />
                  <span className="rounded-full bg-slate-950/80 px-2 py-1 text-white">{point.label}</span>
                </div>
              ))}
              {simulation.activeSuppliers.map((point) => (
                <div
                  key={point.id}
                  className="absolute flex flex-col items-center gap-2 text-[11px]"
                  style={{ left: point.left, top: point.top }}
                >
                  <div className="h-3.5 w-3.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.35)]" />
                  <span className="rounded-full bg-slate-950/80 px-2 py-1 text-white">{point.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-900/80 p-4">
              <div className="flex items-center gap-2 text-slate-300">
                <Shield className="h-4 w-4 text-emerald-300" />
                Verified network
              </div>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-4">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="h-4 w-4 text-cyan-300" />
                Adaptive map style
              </div>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-4">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="h-4 w-4 text-amber-300" />
                Shift-driven routes
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-[32px] bg-white/10 border border-white/20 backdrop-blur-xl p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Order timeline</p>
              <h3 className="text-xl font-semibold text-white">Order detail board</h3>
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-200">{orders.length} total</Badge>
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.orderId} className="bg-slate-950/95 border border-white/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-white">{order.orderId}</span>
                      <Badge className={statusColor[order.status]}>{order.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-300">{order.material} • {order.quantity}</p>
                    <p className="text-xs text-slate-500">Supplier: {order.supplier}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-semibold text-white">{order.totalCredits} credits</p>
                    <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ArrowRight className="h-3.5 w-3.5" /> Stage ready: {statusSequence[order.status]}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.status !== "Completed" ? (
                      <Button size="sm" onClick={() => advanceOrder(order.orderId)}>
                        Move to {statusSequence[order.status]}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => downloadInvoice(order)} className="gap-2">
                        <Download className="h-4 w-4" /> Download Invoice
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
