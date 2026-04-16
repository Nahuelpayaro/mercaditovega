import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { useCartMock } = vi.hoisted(() => ({
  useCartMock: vi.fn(() => ({
    items: [{ productId: "prod-1", name: "Yerba", quantity: 1, priceCents: 2500 }],
    promoCode: undefined,
    subtotalCents: 2500,
  })),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useActionState: () => [{ status: "idle" }, vi.fn(), false] as const,
  };
});

vi.mock("@/components/storefront/cart-provider", () => ({ useCart: useCartMock }));
vi.mock("@/app/(storefront)/checkout/actions", () => ({ submitCheckout: vi.fn() }));

import { CheckoutForm } from "@/components/storefront/checkout-form";

describe("CheckoutForm", () => {
  it("no muestra selector de zona y mantiene dirección para envíos", () => {
    const markup = renderToStaticMarkup(<CheckoutForm />);

    expect(markup).toContain("Dirección");
    expect(markup).not.toContain("Zona de entrega");
  });
});
