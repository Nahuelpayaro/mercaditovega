import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { searchProductsMock } = vi.hoisted(() => ({
  searchProductsMock: vi.fn(async () => []),
}));

vi.mock("@/lib/storefront", () => ({ searchProducts: searchProductsMock }));
vi.mock("@/components/storefront/product-card", () => ({
  ProductCard: ({ product }: { product: { name: string } }) => <article>{product.name}</article>,
}));

import SearchPage from "@/app/(storefront)/buscar/page";

describe("SearchPage", () => {
  it("renders the empty-state message when a search has no matches", async () => {
    const markup = renderToStaticMarkup(await SearchPage({ searchParams: Promise.resolve({ q: "fideos" }) }));

    expect(markup).toContain("No encontramos productos para “fideos”.");
    expect(searchProductsMock).toHaveBeenCalledWith("fideos");
  });
});
