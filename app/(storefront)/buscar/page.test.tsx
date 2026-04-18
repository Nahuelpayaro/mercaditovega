import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { searchProductsMock } = vi.hoisted(() => ({
  searchProductsMock: vi.fn(async () => ({ products: [], totalProducts: 0, normalizedQuery: "", currentPage: 1, totalPages: 1 })),
}));

vi.mock("@/lib/storefront", () => ({
  STOREFRONT_PRODUCTS_PER_PAGE: 24,
  STOREFRONT_SEARCH_MIN_QUERY_LENGTH: 2,
  searchProducts: searchProductsMock,
}));
vi.mock("@/components/storefront/product-card", () => ({
  ProductCard: ({ product }: { product: { name: string } }) => <article>{product.name}</article>,
}));

import SearchPage from "@/app/(storefront)/buscar/page";

describe("SearchPage", () => {
  it("renders the empty-state message when a search has no matches", async () => {
    searchProductsMock.mockResolvedValueOnce({ products: [], totalProducts: 0, normalizedQuery: "fideos", currentPage: 1, totalPages: 1 });

    const markup = renderToStaticMarkup(await SearchPage({ searchParams: Promise.resolve({ q: "fideos" }) }));

    expect(markup).toContain("No encontramos productos para “fideos”.");
    expect(searchProductsMock).toHaveBeenCalledWith("fideos", 1);
  });

  it("shows the minimum-query helper before hitting the database hard", async () => {
    searchProductsMock.mockResolvedValueOnce({ products: [], totalProducts: 0, normalizedQuery: "f", currentPage: 1, totalPages: 1 });

    const markup = renderToStaticMarkup(await SearchPage({ searchParams: Promise.resolve({ q: "f" }) }));

    expect(markup).toContain("Escribí al menos 2 letras para buscar");
  });
});
