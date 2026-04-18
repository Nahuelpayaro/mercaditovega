import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { formatCurrency } from "@/lib/utils";

const { useCartMock } = vi.hoisted(() => ({
  useCartMock: vi.fn(),
}));

vi.mock("@/components/storefront/cart-provider", () => ({ useCart: useCartMock }));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { CartPage } from "@/components/storefront/cart-page";

describe("CartPage", () => {
  it("keeps totals unchanged and shows a clear message when the applied promo is invalid", () => {
    useCartMock.mockReturnValue({
      items: [{ productId: "prod-1", categoryId: "cat-1", name: "Yerba", priceCents: 2500, quantity: 2 }],
      promoCode: "PROMO-VENCIDA",
      applyPromoCode: vi.fn(),
      subtotalCents: 5000,
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
      message: undefined,
    });

    const markup = renderToStaticMarkup(<CartPage promotions={[]} />);

    expect(markup).toContain("Ese promo ya no está disponible.");
    expect(markup).toContain(formatCurrency(5000));
    expect(markup).toContain(`-${formatCurrency(0)}`);
  });
});
