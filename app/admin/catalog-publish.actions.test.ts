import { beforeEach, describe, expect, it, vi } from "vitest";

const { dbMock, redirectMock, revalidatePathMock } = vi.hoisted(() => ({
  dbMock: {
    product: {
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    productImage: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    promotion: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
  redirectMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ db: dbMock }));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { saveProduct, setCategoryPublished, setProductPublished, setSelectedProductsPublished } from "@/app/admin/productos/actions";
import { savePromotion } from "@/app/admin/promos/actions";

describe("admin publish propagation", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    revalidatePathMock.mockClear();
    Object.values(dbMock).forEach((model) => Object.values(model).forEach((fn) => fn.mockReset()));
    dbMock.product.create.mockResolvedValue({ id: "prod-1" });
    dbMock.promotion.create.mockResolvedValue({ id: "promo-1" });
  });

  it("revalidates storefront listing paths after saving a product", async () => {
    const formData = new FormData();
    formData.set("categoryId", "cat-1");
    formData.set("name", "Yerba");
    formData.set("slug", "yerba");
    formData.set("priceCents", "2500");
    formData.set("stockMode", "in_stock");
    formData.set("isPublished", "on");
    formData.set("isActive", "on");

    await saveProduct(formData);

    expect(dbMock.product.create).toHaveBeenCalled();
    expect(dbMock.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isPublished: true }),
      }),
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/productos");
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/buscar");
    expect(revalidatePathMock).toHaveBeenCalledWith("/categoria/[slug]", "page");
    expect(revalidatePathMock).toHaveBeenCalledWith("/producto/[slug]", "page");
  });

  it("toggles product publication from the quick action", async () => {
    const formData = new FormData();
    formData.set("id", "prod-1");
    formData.set("isPublished", "true");
    formData.set("redirectTo", "/admin/productos?categoryId=cat-1#items");

    await setProductPublished(formData);

    expect(dbMock.product.update).toHaveBeenCalledWith({
      where: { id: "prod-1" },
      data: { isPublished: true },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/productos");
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/buscar");
    expect(redirectMock).toHaveBeenCalledWith("/admin/productos?categoryId=cat-1#items");
  });

  it("publishes every product in a category from the batch action", async () => {
    const formData = new FormData();
    formData.set("categoryId", "cat-1");
    formData.set("isPublished", "true");
    formData.set("redirectTo", "/admin/productos?publication=unpublished#items");

    await setCategoryPublished(formData);

    expect(dbMock.product.updateMany).toHaveBeenCalledWith({
      where: { categoryId: "cat-1" },
      data: { isPublished: true },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/productos");
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/buscar");
    expect(revalidatePathMock).toHaveBeenCalledWith("/categoria/[slug]", "page");
    expect(revalidatePathMock).toHaveBeenCalledWith("/producto/[slug]", "page");
    expect(redirectMock).toHaveBeenCalledWith("/admin/productos?publication=unpublished#items");
  });

  it("publishes the manually selected products from the current filtered view", async () => {
    const formData = new FormData();
    formData.append("productIds", "prod-1");
    formData.append("productIds", "prod-2");
    formData.append("productIds", "prod-2");
    formData.set("isPublished", "false");
    formData.set("redirectTo", "/admin/productos?categoryId=cat-1&publication=published#items");

    await setSelectedProductsPublished(formData);

    expect(dbMock.product.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["prod-1", "prod-2"] } },
      data: { isPublished: false },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/productos");
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/buscar");
    expect(revalidatePathMock).toHaveBeenCalledWith("/categoria/[slug]", "page");
    expect(revalidatePathMock).toHaveBeenCalledWith("/producto/[slug]", "page");
    expect(redirectMock).toHaveBeenCalledWith("/admin/productos?categoryId=cat-1&publication=published#items");
  });

  it("revalidates storefront and checkout promo surfaces after saving a promotion", async () => {
    const formData = new FormData();
    formData.set("code", "BARRIO10");
    formData.set("name", "Promo barrio");
    formData.set("type", "percentage");
    formData.set("scope", "order");
    formData.set("amount", "10");
    formData.set("startsAt", "2026-01-01T00:00");
    formData.set("endsAt", "2026-12-31T23:59");
    formData.set("isActive", "on");

    await savePromotion(formData);

    expect(dbMock.promotion.create).toHaveBeenCalled();
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/promos");
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/carrito");
    expect(revalidatePathMock).toHaveBeenCalledWith("/checkout");
  });
});
