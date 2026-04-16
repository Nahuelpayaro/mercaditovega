import { beforeEach, describe, expect, it, vi } from "vitest";

const { dbMock } = vi.hoisted(() => ({
  dbMock: {
    category: { findMany: vi.fn(), findFirst: vi.fn() },
    product: { findMany: vi.fn(), findFirst: vi.fn() },
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
    await getProductsByCategory("bebidas");
    await searchProducts("yerba");

    expect(dbMock.category.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: "bebidas",
          isActive: true,
          products: { some: { isActive: true, isPublished: true, stockMode: "in_stock" } },
        },
        include: expect.objectContaining({
          products: expect.objectContaining({
            where: {
              isActive: true,
              isPublished: true,
              stockMode: "in_stock",
              category: { isActive: true },
            },
          }),
        }),
      }),
    );

    expect(dbMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
          isPublished: true,
          stockMode: "in_stock",
          category: { isActive: true },
        }),
      }),
    );
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
      include: { images: { orderBy: { position: "asc" } }, category: true },
    });
  });
});
