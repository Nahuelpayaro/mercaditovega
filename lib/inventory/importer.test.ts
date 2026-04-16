import { describe, expect, it, vi } from "vitest";
import { deriveStockMode, formatImportSummary, importInventoryRows, parseInventoryContent } from "@/lib/inventory/importer";

describe("inventory importer", () => {
  it("parses the local tab-delimited export format", () => {
    const rows = parseInventoryContent([
      "Codigo\tDescripcion\tPrecio Costo\tPrecio Venta\tPrecio Mayoreo\tInventario\tInv. Minimo\tDepartamento",
      " 7792798013951\t1890 Lata 473cc\t$1237.88\t$1600.00\t$1362.50\t62.00\t0.000\tBEBIDAS",
    ].join("\r\n"));

    expect(rows).toEqual([
      {
        code: "7792798013951",
        description: "1890 Lata 473cc",
        costCents: 123788,
        priceCents: 160000,
        wholesalePriceCents: 136250,
        stockQuantity: 62,
        minimumStockQuantity: 0,
        department: "Bebidas",
      },
    ]);
  });

  it("derives stock mode from quantity", () => {
    expect(deriveStockMode(4)).toBe("in_stock");
    expect(deriveStockMode(0)).toBe("out_of_stock");
    expect(deriveStockMode(-2)).toBe("out_of_stock");
  });

  it("simulates category creation and product upserts in dry-run mode", async () => {
    const categoryFindMany = vi.fn().mockResolvedValue([{ id: "cat-1", name: "Bebidas", slug: "bebidas" }]);
    const categoryCreate = vi.fn();
    const productFindMany = vi.fn().mockResolvedValue([{ id: "prod-1", sku: "7792798013951" }]);
    const productUpsert = vi.fn();

    const summary = await importInventoryRows(
      [
        {
          code: "7792798013951",
          description: "1890 Lata 473cc",
          costCents: 123788,
          priceCents: 160000,
          wholesalePriceCents: 136250,
          stockQuantity: 62,
          minimumStockQuantity: 0,
          department: "Bebidas",
        },
        {
          code: "7790310983461",
          description: "3 D Original 23gr",
          costCents: 73214,
          priceCents: 100000,
          wholesalePriceCents: null,
          stockQuantity: 0,
          minimumStockQuantity: 2,
          department: "SNACKS",
        },
      ],
      {
        filePath: "/tmp/inventario.xls",
        dryRun: true,
        database: {
          category: {
            findMany: categoryFindMany,
            create: categoryCreate,
          },
          product: {
            findMany: productFindMany,
            upsert: productUpsert,
          },
        },
      },
    );

    expect(summary).toMatchObject({
      totalRows: 2,
      categoriesCreated: 1,
      categoriesMatched: 1,
      productsCreated: 1,
      productsUpdated: 1,
      outOfStockProducts: 1,
      lowStockProducts: 1,
      categoryPreview: ["Snacks"],
    });
    expect(categoryCreate).not.toHaveBeenCalled();
    expect(productUpsert).not.toHaveBeenCalled();
  });

  it("creates imported products unpublished and preserves publish state on updates", async () => {
    const productUpsert = vi.fn();

    await importInventoryRows(
      [
        {
          code: "SKU-EXISTENTE",
          description: "Yerba existente",
          costCents: 1000,
          priceCents: 1500,
          wholesalePriceCents: null,
          stockQuantity: 5,
          minimumStockQuantity: 0,
          department: "Almacen",
        },
        {
          code: "SKU-NUEVO",
          description: "Yerba nueva",
          costCents: 1000,
          priceCents: 1500,
          wholesalePriceCents: null,
          stockQuantity: 5,
          minimumStockQuantity: 0,
          department: "Almacen",
        },
      ],
      {
        filePath: "/tmp/inventario.xls",
        database: {
          category: {
            findMany: vi.fn().mockResolvedValue([{ id: "cat-1", name: "Almacen", slug: "almacen" }]),
            create: vi.fn(),
          },
          product: {
            findMany: vi.fn().mockResolvedValue([{ id: "prod-1", sku: "SKU-EXISTENTE" }]),
            upsert: productUpsert,
          },
        },
      },
    );

    expect(productUpsert).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        update: expect.not.objectContaining({ isPublished: expect.anything() }),
        create: expect.objectContaining({ isPublished: false }),
      }),
    );

    expect(productUpsert).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        update: expect.not.objectContaining({ isPublished: expect.anything() }),
        create: expect.objectContaining({ isPublished: false }),
      }),
    );
  });

  it("formats a human-readable summary", () => {
    expect(
      formatImportSummary({
        filePath: "/tmp/inventario.xls",
        dryRun: true,
        totalRows: 10,
        categoriesCreated: 2,
        categoriesMatched: 4,
        productsCreated: 3,
        productsUpdated: 7,
        outOfStockProducts: 1,
        lowStockProducts: 2,
        categoryPreview: ["Bebidas", "Snacks"],
      }),
    ).toContain("Modo: dry-run");
  });
});
