import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useRecycleHub } from "@/hooks/useRecycleHub";
import { generateInvoice, InvoiceOrder } from "@/utils/generateInvoice";
import { useTimeSimulation } from "@/hooks/useTimeSimulation";
import { Download, ArrowRight, Shield, MapPin, Clock, CheckCircle2 } from "lucide-react";

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
    buyerName: "Green Loop buyer",
  },
  {
    orderId: "ORD-002",
    supplier: "XYZ Plastics",
    material: "HDPE",
    quantity: "1,000 kg",
    totalCredits: 150,
    status: "Delivered",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    buyerName: "Green Loop buyer",
  },
  {
    orderId: "ORD-003",
    supplier: "Green Plastics Co",
    material: "PP",
    quantity: "2,000 kg",
    totalCredits: 240,
    status: "Completed",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    buyerName: "Green Loop buyer",
  },
];

const statusSequence: Record<OrderStatus, OrderStatus> = {
  Sourcing: "In Transit",
  "In Transit": "Delivered",
  Delivered: "Completed",
  Completed: "Completed",
};

const statusColor: Record<OrderStatus, string> = {
  Sourcing: "bg-[#f6ad55]/10 text-[#065F46] border border-[#f6ad55]/20",
  "In Transit": "bg-[#10B981]/10 text-sky-300 border border-sky-500/20",
  Delivered: "bg-[#10B981]/10 text-[#065F46] border border-emerald-500/20",
  Completed: "bg-[#10B981]/15 text-emerald-200 border border-emerald-500/20",
};

const statuses: OrderStatus[] = ["Sourcing", "In Transit", "Delivered", "Completed"];

export default function OrderTracker() {
  const { toast } = useToast();
  const simulation = useTimeSimulation();
  const { trackOrders, updateTrackOrderStatus } = useRecycleHub();
  const [orders, setOrders] = useState<BuyerOrder[]>([]);

  useEffect(() => {
    setOrders(
      trackOrders.map((item) => ({
        orderId: item.id,
        supplier: item.supplier,
        material: item.materialType,
        quantity: item.quantity,
        totalCredits: Math.max(1, Math.round(Number(item.totalAmount.replace(/[^0-9]/g, "")) / 10)),
        status: item.status,
        createdAt: new Date().toISOString(),
        buyerName: "Green Loop buyer",
      }))
    );
  }, [trackOrders]);

  const groupedOrders = useMemo(
    () => statuses.map((status) => ({ status, items: orders.filter((order) => order.status === status) })),
    [orders]
  );

  const advanceOrder = (orderId: string) => {
    setOrders((prev) => {
      const next = prev.map((order) =>
        order.orderId === orderId ? { ...order, status: statusSequence[order.status] } : order
      );
      const updated = next.find((o) => o.orderId === orderId);
      if (updated) updateTrackOrderStatus(orderId, updated.status);
      return next;
    });
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
      <Card className="rounded-[32px] bg-white/10 border border-[#D1FAE5] backdrop-blur-xl shadow-2xl shadow-emerald-900/20 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/75">Track Orders</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#1E293B]">Order pipeline & live simulation</h2>
          </div>
          <div className="rounded-full bg-white/95 px-4 py-2 text-sm text-[#475569]">
            Current shift: <span className="font-semibold text-emerald-200">{simulation.phase}</span> • {simulation.currentHour}:00 hrs
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {groupedOrders.map((group) => (
            <div key={group.status} className="rounded-3xl bg-white/95 p-4 border border-[#D1FAE5]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-[0.3em] text-[#475569]">{group.status}</span>
                <Badge className="bg-white/5 text-[#1E293B]">{group.items.length}</Badge>
              </div>
              <p className="text-2xl font-semibold text-[#1E293B]">{group.items.length}</p>
              <p className="text-sm text-[#475569] mt-2">Orders in this stage</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6">
        <Card className="rounded-[32px] bg-white/10 border border-[#D1FAE5] backdrop-blur-xl p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#475569]">Order timeline</p>
              <h3 className="text-xl font-semibold text-[#1E293B]">Order detail board</h3>
            </div>
            <Badge className="bg-[#10B981]/15 text-emerald-200">{orders.length} total</Badge>
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.orderId} className="bg-white/95 border border-[#D1FAE5] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-[#1E293B]">{order.orderId}</span>
                      <Badge className={statusColor[order.status]}>{order.status}</Badge>
                    </div>
                    <p className="text-sm text-[#14532D]">{order.material} • {order.quantity}</p>
                    <p className="text-xs text-[#475569]">Supplier: {order.supplier}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-semibold text-[#1E293B]">{order.totalCredits} credits</p>
                    <p className="text-xs text-[#475569]">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#475569]">
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
