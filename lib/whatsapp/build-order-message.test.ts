import { describe, expect, it } from "vitest";
import { buildOrderMessage } from "@/lib/whatsapp/build-order-message";

describe("buildOrderMessage", () => {
  it("builds a wa.me url after persistence", () => {
    const url = buildOrderMessage({
      id: "1",
      code: "ALM-1234",
      channel: "storefront",
      status: "placed",
      fulfillmentType: "delivery",
      paymentMethod: "cash",
      customerId: "c1",
      promotionId: null,
      addressLine: "Calle 123",
      postalCode: null,
      notes: "Sin cebolla",
      internalNote: null,
      subtotalCents: 5000,
      discountCents: 0,
      deliveryFeeCents: 1000,
      totalCents: 6000,
      whatsappUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: { id: "c1", fullName: "Juan", phone: "54911", email: null, notes: null, createdAt: new Date(), updatedAt: new Date() },
      items: [
        { id: "i1", orderId: "1", productId: "p1", productName: "Yerba", productSlug: "yerba", unitPriceCents: 5000, quantity: 1, lineTotalCents: 5000 },
      ],
    });

    expect(url).toContain("https://wa.me/");
    expect(decodeURIComponent(url)).toContain("ALM-1234");
  });
});
