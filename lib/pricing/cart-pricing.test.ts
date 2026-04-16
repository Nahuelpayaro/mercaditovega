import { describe, expect, it } from "vitest";
import { priceCart } from "@/lib/pricing/cart-pricing";

describe("priceCart", () => {
  it("applies a single valid promotion", () => {
    const result = priceCart({
      items: [{ productId: "1", categoryId: "c1", quantity: 2, unitPriceCents: 5000 }],
      promotions: [
        {
          id: "promo",
          code: "BARRIO10",
          type: "percentage",
          scope: "order",
          amount: 10,
          minSubtotalCents: 5000,
          startsAt: new Date("2026-01-01"),
          endsAt: new Date("2026-12-31"),
          isActive: true,
          productIds: [],
          categoryIds: [],
        },
      ],
      promoCode: "BARRIO10",
    });

    expect(result.discountCents).toBe(1000);
    expect(result.totalCents).toBe(9000);
  });

  it("does not add delivery fees when zones are no longer part of pricing", () => {
    const result = priceCart({
      items: [{ productId: "1", categoryId: "c1", quantity: 1, unitPriceCents: 3000 }],
      promotions: [],
    });

    expect(result.deliveryMessage).toBeNull();
    expect(result.deliveryFeeCents).toBe(0);
    expect(result.totalCents).toBe(3000);
  });
});
