import type { PromotionScope, PromotionType } from "@prisma/client";

export type PricingCartItem = {
  productId: string;
  categoryId: string;
  quantity: number;
  unitPriceCents: number;
};

export type PromotionSnapshot = {
  id: string;
  code: string;
  type: PromotionType;
  scope: PromotionScope;
  amount: number;
  minSubtotalCents: number | null;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  productIds: string[];
  categoryIds: string[];
};

export function validatePromotion({
  promoCode,
  promotions,
  items,
  subtotalCents,
  now = new Date(),
}: {
  promoCode?: string;
  promotions: PromotionSnapshot[];
  items: PricingCartItem[];
  subtotalCents: number;
  now?: Date;
}) {
  if (!promoCode) {
    return { promotion: null, discountCents: 0, message: null };
  }

  const promotion = promotions.find((item) => item.code.toUpperCase() === promoCode.toUpperCase());

  if (!promotion || !promotion.isActive || promotion.startsAt > now || promotion.endsAt < now) {
    return { promotion: null, discountCents: 0, message: "Ese promo ya no está disponible." };
  }

  if (promotion.minSubtotalCents && subtotalCents < promotion.minSubtotalCents) {
    return { promotion: null, discountCents: 0, message: "Ese promo requiere un subtotal mayor." };
  }

  const eligibleTotal = items.reduce((acc, item) => {
    const productMatch = promotion.scope === "product" && promotion.productIds.includes(item.productId);
    const categoryMatch = promotion.scope === "category" && promotion.categoryIds.includes(item.categoryId);
    const orderMatch = promotion.scope === "order";

    if (productMatch || categoryMatch || orderMatch) {
      return acc + item.unitPriceCents * item.quantity;
    }

    return acc;
  }, 0);

  if (!eligibleTotal) {
    return { promotion: null, discountCents: 0, message: "Ese promo no aplica a tu carrito." };
  }

  const discountCents =
    promotion.type === "percentage"
      ? Math.floor((eligibleTotal * promotion.amount) / 100)
      : Math.min(promotion.amount, eligibleTotal);

  return { promotion, discountCents, message: null };
}
