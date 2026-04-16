import { beforeEach, describe, expect, it, vi } from "vitest";

const { addItemMock, useCartMock } = vi.hoisted(() => ({
  addItemMock: vi.fn(),
  useCartMock: vi.fn(() => ({ addItem: addItemMock })),
}));

vi.mock("@/components/storefront/cart-provider", () => ({ useCart: useCartMock }));
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}));

import { AddToCartButton } from "@/components/storefront/add-to-cart-button";

describe("AddToCartButton", () => {
  beforeEach(() => {
    addItemMock.mockClear();
  });

  it("adds one unit from the listing card with immediate cart payload data", () => {
    const button = AddToCartButton({
      product: {
        id: "prod-1",
        slug: "yerba",
        name: "Yerba",
        priceCents: 2500,
        imageUrl: "/yerba.jpg",
        isAvailable: true,
      },
    });

    expect(button.props.disabled).toBe(false);
    expect(button.props.children).toBe("Agregar");

    button.props.onClick();

    expect(addItemMock).toHaveBeenCalledWith({
      productId: "prod-1",
      slug: "yerba",
      name: "Yerba",
      priceCents: 2500,
      imageUrl: "/yerba.jpg",
      quantity: 1,
      isAvailable: true,
    });
  });

  it("blocks unavailable products from the listing card", () => {
    const button = AddToCartButton({
      product: {
        id: "prod-2",
        slug: "sin-stock",
        name: "Sin stock",
        priceCents: 1800,
        isAvailable: false,
      },
    });

    expect(button.props.disabled).toBe(true);
    expect(button.props.children).toBe("No disponible");
    expect(addItemMock).not.toHaveBeenCalled();
  });
});
