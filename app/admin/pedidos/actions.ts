"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { assertValidStatusTransition, type OrderStatus } from "@/lib/orders/status-machine";

export async function updateOrderStatus(formData: FormData) {
  const orderId = formData.get("orderId")?.toString();
  const nextStatus = formData.get("status")?.toString() as OrderStatus | undefined;
  const internalNote = formData.get("internalNote")?.toString();

  if (!orderId || !nextStatus) {
    redirect("/admin/pedidos?statusError=Faltan+datos+para+actualizar+el+pedido.");
  }

  const order = await db.order.findUnique({ where: { id: orderId } });

  if (!order) {
    redirect("/admin/pedidos?statusError=Pedido+no+encontrado.");
  }

  try {
    assertValidStatusTransition(order.status, nextStatus);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No pudimos actualizar el pedido.";
    redirect(`/admin/pedidos/${orderId}?statusError=${encodeURIComponent(message)}`);
  }

  await db.order.update({
    where: { id: orderId },
    data: { status: nextStatus, internalNote: internalNote || order.internalNote },
  });

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  redirect(`/admin/pedidos/${orderId}?statusSuccess=${encodeURIComponent("Estado actualizado correctamente.")}`);
}
