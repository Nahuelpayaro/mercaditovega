import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { getCategoryPageDataMock } = vi.hoisted(() => ({
  getCategoryPageDataMock: vi.fn(async () => ({
    id: "cat-1",
    name: "Bebidas",
    description: "Todo para tomar",
    currentPage: 1,
    totalPages: 3,
    totalProducts: 50,
    products: [{ id: "prod-1", name: "Yerba", slug: "yerba", shortDescription: null, priceCents: 2500, stockMode: "in_stock", category: { id: "cat-1", name: "Bebidas" }, images: [] }],
  })),
}));

vi.mock("@/lib/storefront", () => ({
  STOREFRONT_PRODUCTS_PER_PAGE: 24,
  getCategoryPageData: getCategoryPageDataMock,
}));
vi.mock("@/components/storefront/product-card", () => ({
  ProductCard: ({ product }: { product: { name: string } }) => <article>{product.name}</article>,
}));

import CategoryPage from "@/app/(storefront)/categoria/[slug]/page";

describe("CategoryPage", () => {
  it("renders a paginated category summary instead of dumping giant HTML", async () => {
    const markup = renderToStaticMarkup(
      await CategoryPage({ params: Promise.resolve({ slug: "bebidas" }), searchParams: Promise.resolve({ page: "2" }) }),
    );

    expect(getCategoryPageDataMock).toHaveBeenCalledWith("bebidas", 2);
    expect(markup).toContain("Mostrando 1-1 de 50 productos");
    expect(markup).toContain("Página 1 de 3");
  });
});
