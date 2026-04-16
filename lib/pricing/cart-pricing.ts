import { validatePromotion, type PricingCartItem, type PromotionSnapshot } from "@/lib/pricing/promotions";

export function calculateSubtotal(items: PricingCartItem[]) {
  return items.reduce((acc, item) => acc + item.unitPriceCents * item.quantity, 0);
}

export function priceCart({
  items,
  promotions,
  promoCode,
}: {
  items: PricingCartItem[];
  promotions: PromotionSnapshot[];
  promoCode?: string;
}) {
  const subtotalCents = calculateSubtotal(items);
  const promoResult = validatePromotion({ promoCode, promotions, items, subtotalCents });
  const discountedSubtotal = Math.max(subtotalCents - promoResult.discountCents, 0);

  return {
    subtotalCents,
    discountCents: promoResult.discountCents,
    deliveryFeeCents: 0,
    totalCents: discountedSubtotal,
    promotion: promoResult.promotion,
    promoMessage: promoResult.message,
    deliveryMessage: null,
  };
}
