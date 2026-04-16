import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { getHomeDataMock } = vi.hoisted(() => ({
  getHomeDataMock: vi.fn(async () => ({
    categories: [{ id: "cat-1", name: "Almacén", slug: "almacen" }],
    products: [{ id: "prod-1", name: "Yerba", slug: "yerba" }],
    promotions: [{ id: "promo-1", code: "BARRIO10", name: "10% off", description: "Promo del barrio" }],
  })),
}));

vi.mock("@/lib/storefront", () => ({ getHomeData: getHomeDataMock }));
vi.mock("@/components/storefront/product-card", () => ({
  ProductCard: ({ product }: { product: { name: string } }) => <article>{product.name}</article>,
}));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import HomePage from "@/app/(storefront)/page";

describe("HomePage", () => {
  it("renders promos, categories, and featured products for browse discovery", async () => {
    getHomeDataMock.mockResolvedValueOnce({
      categories: [{ id: "cat-1", name: "Almacén", slug: "almacen" }],
      products: [{ id: "prod-1", name: "Yerba", slug: "yerba" }],
      promotions: [{ id: "promo-1", code: "BARRIO10", name: "10% off", description: "Promo del barrio" }],
    });

    const markup = renderToStaticMarkup(await HomePage());

    expect(markup).toContain("Combos para hoy");
    expect(markup).toContain("Combo sugerido");
    expect(markup).toContain("Almacén");
    expect(markup).toContain("Yerba");
    expect(getHomeDataMock).toHaveBeenCalledTimes(1);
  });

  it("does not render the promotions section when there are no active promos", async () => {
    getHomeDataMock.mockResolvedValueOnce({
      categories: [{ id: "cat-1", name: "Almacén", slug: "almacen" }],
      products: [{ id: "prod-1", name: "Yerba", slug: "yerba" }],
      promotions: [],
    });

    const markup = renderToStaticMarkup(await HomePage());

    expect(markup).not.toContain("Combos para hoy");
    expect(markup).not.toContain("Promociones");
    expect(markup).not.toContain("No hay promociones activas");
  });
});
