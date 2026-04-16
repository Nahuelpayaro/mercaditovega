"use server";

import { redirect } from "next/navigation";
import { createOrder } from "@/lib/orders/create-order";
import { checkoutSchema } from "@/lib/validators/checkout";

export type CheckoutActionState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string>;
};

export async function submitCheckout(_: CheckoutActionState, formData: FormData): Promise<CheckoutActionState> {
  const itemsRaw = formData.get("items")?.toString() || "[]";

  const parsed = checkoutSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email"),
    fulfillmentType: formData.get("fulfillmentType"),
    addressLine: formData.get("addressLine") || undefined,
    postalCode: formData.get("postalCode") || undefined,
    notes: formData.get("notes") || undefined,
    paymentMethod: formData.get("paymentMethod"),
    promoCode: formData.get("promoCode") || undefined,
    items: JSON.parse(itemsRaw),
  });

  if (!parsed.success) {
    const errors = Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0].toString(), issue.message]));
    return { status: "error", message: "Revisá los campos marcados.", errors };
  }

  let orderCode: string;

  try {
    const order = await createOrder(parsed.data);
    orderCode = order.code;
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "No pudimos crear el pedido.",
    };
  }

  redirect(`/pedido/${orderCode}`);
}
