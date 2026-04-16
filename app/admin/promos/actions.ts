"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { promotionSchema } from "@/lib/validators/promotion";

function readIds(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => value.toString())
    .filter(Boolean);
}

export async function savePromotion(formData: FormData) {
  const parsed = promotionSchema.parse({
    id: formData.get("id") || undefined,
    code: formData.get("code"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    scope: formData.get("scope"),
    amount: formData.get("amount"),
    minSubtotalCents: formData.get("minSubtotalCents") || undefined,
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    isActive: formData.get("isActive") === "on",
    productIds: readIds(formData, "productIds"),
    categoryIds: readIds(formData, "categoryIds"),
  });

  const baseData = {
    code: parsed.code,
    name: parsed.name,
    description: parsed.description,
    type: parsed.type,
    scope: parsed.scope,
    amount: parsed.amount,
    minSubtotalCents: parsed.minSubtotalCents,
    startsAt: new Date(parsed.startsAt),
    endsAt: new Date(parsed.endsAt),
    isActive: parsed.isActive,
  };

  if (parsed.id) {
    await db.promotion.update({
      where: { id: parsed.id },
      data: {
        ...baseData,
        products: { set: parsed.productIds.map((id) => ({ id })) },
        categories: { set: parsed.categoryIds.map((id) => ({ id })) },
      },
    });
  } else {
    await db.promotion.create({
      data: {
        ...baseData,
        products: { connect: parsed.productIds.map((id) => ({ id })) },
        categories: { connect: parsed.categoryIds.map((id) => ({ id })) },
      },
    });
  }

  revalidatePath("/admin/promos");
  revalidatePath("/");
  revalidatePath("/carrito");
  revalidatePath("/checkout");
}

export async function deletePromotion(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;
  await db.promotion.delete({ where: { id } });
  revalidatePath("/admin/promos");
  revalidatePath("/");
  revalidatePath("/carrito");
  revalidatePath("/checkout");
}
