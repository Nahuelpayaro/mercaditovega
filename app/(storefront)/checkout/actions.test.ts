import { beforeEach, describe, expect, it, vi } from "vitest";

class RedirectSignal extends Error {
  constructor(readonly url: string) {
    super("NEXT_REDIRECT");
  }
}

const { createOrderMock, redirectMock } = vi.hoisted(() => ({
  createOrderMock: vi.fn(),
  redirectMock: vi.fn((url: string) => {
    throw new RedirectSignal(url);
  }),
}));

vi.mock("@/lib/orders/create-order", () => ({ createOrder: createOrderMock }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { submitCheckout } from "@/app/(storefront)/checkout/actions";

describe("submitCheckout", () => {
  beforeEach(() => {
    createOrderMock.mockReset();
    redirectMock.mockClear();
  });

  it("redirige a la página del pedido después de crear la orden", async () => {
    createOrderMock.mockResolvedValue({ code: "PED-123" });

    const formData = new FormData();
    formData.set("fullName", "Nahuel Payaro");
    formData.set("email", "");
    formData.set("fulfillmentType", "pickup");
    formData.set("paymentMethod", "cash");
    formData.set("items", JSON.stringify([{ productId: "prod-1", name: "Yerba", slug: "yerba", priceCents: 2500, quantity: 1 }]));

    await expect(submitCheckout({ status: "idle" }, formData)).rejects.toMatchObject({
      message: "NEXT_REDIRECT",
      url: "/pedido/PED-123",
    });
  });

  it("devuelve error de negocio si createOrder falla", async () => {
    createOrderMock.mockRejectedValue(new Error("La promo no aplica a este pedido."));

    const formData = new FormData();
    formData.set("fullName", "Nahuel Payaro");
    formData.set("email", "");
    formData.set("fulfillmentType", "pickup");
    formData.set("paymentMethod", "cash");
    formData.set("items", JSON.stringify([{ productId: "prod-1", name: "Yerba", slug: "yerba", priceCents: 2500, quantity: 1 }]));

    await expect(submitCheckout({ status: "idle" }, formData)).resolves.toEqual({
      status: "error",
      message: "La promo no aplica a este pedido.",
    });
  });
});
