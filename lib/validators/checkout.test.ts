import { describe, expect, it } from "vitest";
import { checkoutSchema } from "@/lib/validators/checkout";

const base = {
  fullName: "Ana Pérez",
  phone: "11 5555 1234",
  email: "ana@example.com",
  paymentMethod: "cash" as const,
  promoCode: undefined,
  items: [{ productId: "1", name: "Yerba", slug: "yerba", priceCents: 5000, quantity: 1 }],
};

describe("checkoutSchema", () => {
  it("requires delivery fields for delivery", () => {
    const result = checkoutSchema.safeParse({ ...base, fulfillmentType: "delivery" });
    expect(result.success).toBe(false);
  });

  it("does not require delivery fields for pickup", () => {
    const result = checkoutSchema.safeParse({ ...base, fulfillmentType: "pickup" });
    expect(result.success).toBe(true);
  });
});
