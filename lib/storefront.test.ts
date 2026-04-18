import { beforeEach, describe, expect, it, vi } from "vitest";

const { dbMock } = vi.hoisted(() => ({
  dbMock: {
    category: { findMany: vi.fn(), findFirst: vi.fn() },
    product: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() },
    promotion: { findMany: vi.fn() },
    order: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/db", () => ({ db: dbMock }));

import { getHomeData, getProductBySlug, getProductsByCategory, searchProducts } from "@/lib/storefront";

describe("storefront publication filters", () => {
  beforeEach(() => {
    dbMock.category.findMany.mockReset().mockResolvedValue([]);
    dbMock.category.findFirst.mockReset().mockResolvedValue(null);
    dbMock.product.count.mockReset().mockResolvedValue(0);
    dbMock.product.findMany.mockReset().mockResolvedValue([]);
    dbMock.product.findFirst.mockReset().mockResolvedValue(null);
    dbMock.promotion.findMany.mockReset().mockResolvedValue([]);
    dbMock.order.findUnique.mockReset().mockResolvedValue(null);
  });

  it("loads home catalog using only published active in-stock products", async () => {
    await getHomeData();

    expect(dbMock.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          products: { some: { isActive: true, isPublished: true, stockMode: "in_stock" } },
        }),
      }),
    );

    expect(dbMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isActive: true,
          isPublished: true,
          stockMode: "in_stock",
          category: { isActive: true },
        },
      }),
    );
  });

  it("filters category navigation and search results by storefront visibility", async () => {
    dbMock.category.findFirst.mockResolvedValueOnce({ id: "cat-1", name: "Bebidas", description: null });

    await getProductsByCategory("bebidas");
    await searchProducts("yerba", 1);

    expect(dbMock.category.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: "bebidas",
          isActive: true,
          products: { some: { isActive: true, isPublished: true, stockMode: "in_stock" } },
        },
        select: {
          id: true,
          name: true,
          description: true,
        },
      }),
    );

    expect(dbMock.product.count).toHaveBeenCalledWith({
      where: {
        isActive: true,
        isPublished: true,
        stockMode: "in_stock",
        category: { isActive: true },
        categoryId: "cat-1",
      },
    });

    expect(dbMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
          isPublished: true,
          stockMode: "in_stock",
          category: { isActive: true },
        }),
        take: 24,
      }),
    );
  });

  it("skips database search when the query is too short", async () => {
    const result = await searchProducts("y", 1);

    expect(result).toEqual({ currentPage: 1, normalizedQuery: "y", products: [], totalPages: 1, totalProducts: 0 });
    expect(dbMock.product.count).not.toHaveBeenCalled();
    expect(dbMock.product.findMany).not.toHaveBeenCalled();
  });

  it("hides products from inactive categories in detail pages", async () => {
    await getProductBySlug("yerba");

    expect(dbMock.product.findFirst).toHaveBeenCalledWith({
      where: {
        slug: "yerba",
        isActive: true,
        isPublished: true,
        stockMode: "in_stock",
        category: { isActive: true },
      },
      include: { images: { orderBy: { position: "asc" } }, category: { select: { id: true, name: true } } },
    });
  });
});
