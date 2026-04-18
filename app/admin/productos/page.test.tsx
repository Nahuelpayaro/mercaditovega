import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { dbMock } = vi.hoisted(() => {
  const products = [
    {
      id: "prod-1",
      sku: "SKU-1",
      name: "Yerba",
      priceCents: 2500,
      stockQuantity: 10,
      isPublished: true,
      isActive: true,
      stockMode: "in_stock",
      categoryId: "cat-1",
      category: { name: "Almacén" },
    },
    {
      id: "prod-2",
      sku: "SKU-2",
      name: "Azúcar",
      priceCents: 1800,
      stockQuantity: 4,
      isPublished: false,
      isActive: true,
      stockMode: "in_stock",
      categoryId: "cat-1",
      category: { name: "Almacén" },
    },
    {
      id: "prod-3",
      sku: "SKU-3",
      name: "Detergente",
      priceCents: 3200,
      stockQuantity: 2,
      isPublished: true,
      isActive: true,
      stockMode: "in_stock",
      categoryId: "cat-2",
      category: { name: "Limpieza" },
    },
  ];

  return {
    dbMock: {
    product: {
      findMany: vi.fn(async ({ where, skip = 0, take }: { where?: { categoryId?: string; isPublished?: boolean; OR?: Array<{ name?: { contains: string }; sku?: { contains: string } }> }; skip?: number; take?: number } = {}) => {
        const filtered = products.filter((product) => {
          if (where?.categoryId && product.categoryId !== where.categoryId) return false;
          if (typeof where?.isPublished === "boolean" && product.isPublished !== where.isPublished) return false;
          if (where?.OR?.length) {
            const searchNeedle = where.OR[0]?.name?.contains ?? where.OR[1]?.sku?.contains ?? "";
            const normalizedNeedle = searchNeedle.toLowerCase();
            const matchesName = product.name.toLowerCase().includes(normalizedNeedle);
            const matchesSku = product.sku?.toLowerCase().includes(normalizedNeedle) ?? false;

            if (!matchesName && !matchesSku) return false;
          }

          return true;
        });

        return filtered.slice(skip, typeof take === "number" ? skip + take : undefined);
      }),
      count: vi.fn(async ({ where }: { where?: { categoryId?: string; isPublished?: boolean; OR?: Array<{ name?: { contains: string }; sku?: { contains: string } }> } } = {}) => {
        const filtered = products.filter((product) => {
          if (where?.categoryId && product.categoryId !== where.categoryId) return false;
          if (typeof where?.isPublished === "boolean" && product.isPublished !== where.isPublished) return false;
          if (where?.OR?.length) {
            const searchNeedle = where.OR[0]?.name?.contains ?? where.OR[1]?.sku?.contains ?? "";
            const normalizedNeedle = searchNeedle.toLowerCase();
            const matchesName = product.name.toLowerCase().includes(normalizedNeedle);
            const matchesSku = product.sku?.toLowerCase().includes(normalizedNeedle) ?? false;

            if (!matchesName && !matchesSku) return false;
          }

          return true;
        });

        return filtered.length;
      }),
      groupBy: vi.fn(async () => [
        { categoryId: "cat-1", _count: { _all: 1 } },
        { categoryId: "cat-2", _count: { _all: 1 } },
      ]),
    },
    category: {
      findMany: vi.fn(async () => [
        {
          id: "cat-1",
          name: "Almacén",
          slug: "almacen",
          description: "Secos y almacén",
          isActive: true,
          _count: { products: 2 },
        },
        {
          id: "cat-2",
          name: "Limpieza institucional con nombres exageradamente largos para validar wrapping",
          slug: "limpieza",
          description: "Productos de limpieza con una descripción muy extensa y continua que no debería desbordar la card ni romper el layout visual del resumen.",
          isActive: true,
          _count: { products: 1 },
        },
      ]),
    },
    },
  };
});

vi.mock("@/lib/db", () => ({ db: dbMock }));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import AdminProductsPage from "@/app/admin/(protected)/productos/page";

describe("AdminProductsPage", () => {
  it("shows category publication summary and batch actions", async () => {
    const markup = renderToStaticMarkup(
      await AdminProductsPage({
        searchParams: Promise.resolve({ categoryId: "all", publication: "all" }),
      }),
    );

    expect(markup).toContain("Resumen por categoría");
    expect(markup).toContain("2 publicados de 3 productos");
    expect(markup).toContain("Publicar todo");
    expect(markup).toContain("Despublicar todo");
    expect(markup).toContain("Selección sobre esta vista");
    expect(markup).toContain("Seleccionar visibles");
    expect(markup).toContain("Publicar seleccionados");
    expect(markup).toContain("Despublicar seleccionados");
    expect(markup).toContain("Mostrando 3 de 3 totales del catálogo completo");
    expect(markup).toContain("Almacén");
    expect(markup).toContain("overflow-hidden");
    expect(markup).toContain("[overflow-wrap:anywhere]");
    expect(markup).toContain("Todas las categorías");
    expect(markup).toContain("Buscar por nombre o SKU");
    expect(markup).toContain("Paginación real del listado");
    expect(markup).toContain("/admin/productos?categoryId=cat-1#items");
  });

  it("shows category drill-down context when a category is selected", async () => {
    const markup = renderToStaticMarkup(
      await AdminProductsPage({
        searchParams: Promise.resolve({ categoryId: "cat-1", publication: "all" }),
      }),
    );

    expect(markup).toContain("Ítems de Almacén");
    expect(markup).toContain("Vista enfocada en Almacén");
    expect(markup).toContain("Categoría activa");
    expect(markup).toContain("Publicados en página");
    expect(markup).toContain("Sin publicar en página");
    expect(markup).toContain("Página actual");
    expect(markup).toContain("Viendo ítems");
    expect(markup).toContain("Mostrando 2 de 2 totales de la categoría seleccionada");
    expect(markup).toContain("/admin/productos?categoryId=cat-1#items");
  });

  it("preserves search context and clamps pagination when filters shrink the result", async () => {
    const markup = renderToStaticMarkup(
      await AdminProductsPage({
        searchParams: Promise.resolve({ categoryId: "all", publication: "all", q: "yer", page: "2" }),
      }),
    );

    expect(markup).toContain("Mostrando 1 de 1 totales del catálogo completo");
    expect(markup).toContain("value=\"yer\"");
    expect(markup).toContain("/admin/productos?q=yer#items");
    expect(markup).toContain("1 / 1");
  });
});
