import type { Order, OrderItem, Customer } from "@prisma/client";
import { publicEnv } from "@/lib/env";
import { formatCurrency, formatPaymentMethod } from "@/lib/utils";

type OrderWithContext = Order & {
  customer: Customer;
  items: OrderItem[];
};

export function buildOrderMessage(order: OrderWithContext) {
  const lines = [
    `Hola 👋 Soy ${order.customer.fullName}.`,
    `Te paso mi pedido ${order.code}:`,
    ...order.items.map((item) => `- ${item.quantity} x ${item.productName} (${formatCurrency(item.lineTotalCents)})`),
    `Subtotal: ${formatCurrency(order.subtotalCents)}`,
  ];

  if (order.discountCents > 0) {
    lines.push(`Descuento: -${formatCurrency(order.discountCents)}`);
  }

  if (order.deliveryFeeCents > 0) {
    lines.push(`Envío: ${formatCurrency(order.deliveryFeeCents)}`);
  }

  lines.push(`Total: ${formatCurrency(order.totalCents)}`);
  lines.push(`Pago: ${formatPaymentMethod(order.paymentMethod)}`);

  if (order.fulfillmentType === "delivery") {
    lines.push(`Entrega: ${order.addressLine}`);
  } else {
    lines.push("Retiro por el local");
  }

  if (order.notes) {
    lines.push(`Notas: ${order.notes}`);
  }

  return `https://wa.me/${publicEnv.NEXT_PUBLIC_STORE_WHATSAPP_PHONE}?text=${encodeURIComponent(lines.join("\n"))}`;
}
