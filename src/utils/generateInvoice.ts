import { jsPDF } from "jspdf";

export interface InvoiceOrder {
  orderId: string;
  buyerName: string;
  supplier: string;
  material: string;
  quantity: string;
  totalCredits: number;
  status: string;
  createdAt: string;
}

export function generateInvoice(order: InvoiceOrder) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const titleY = 60;

  doc.setFontSize(18);
  doc.text("GREEN LOOP invoice", margin, titleY);
  doc.setFontSize(10);
  doc.text(`Order ID: ${order.orderId}`, margin, titleY + 30);
  doc.text(`Buyer: ${order.buyerName}`, margin, titleY + 45);
  doc.text(`Supplier: ${order.supplier}`, margin, titleY + 60);
  doc.text(`Created: ${new Date(order.createdAt).toLocaleString()}`, margin, titleY + 75);

  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(1);
  doc.line(margin, titleY + 90, 555, titleY + 90);

  doc.setFontSize(12);
  doc.text("Order Summary", margin, titleY + 120);
  doc.setFontSize(10);
  doc.text(`Material: ${order.material}`, margin, titleY + 145);
  doc.text(`Quantity: ${order.quantity}`, margin, titleY + 160);
  doc.text(`Status: ${order.status}`, margin, titleY + 175);
  doc.text(`Total Credits Spent: ${order.totalCredits}`, margin, titleY + 190);

  doc.setFontSize(9);
  doc.text("Thank you for using GREEN LOOP. This invoice confirms the completed order and is part of your enterprise procurement record.", margin, titleY + 240, { maxWidth: 520 });

  doc.save(`${order.orderId}-invoice.pdf`);
}
