import { readFile } from "node:fs/promises";
import type { StockMode } from "@prisma/client";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

const EXPECTED_HEADERS = [
  "Codigo",
  "Descripcion",
  "Precio Costo",
  "Precio Venta",
  "Precio Mayoreo",
  "Inventario",
  "Inv. Minimo",
  "Departamento",
] as const;

const UNCATEGORIZED_DEPARTMENT = "Sin categoría";
// Los productos importados entran sin publicar para evitar exponer todo el inventario real por accidente.
const DEFAULT_IMPORTED_PRODUCT_PUBLICATION = false;

export type ImportedInventoryRow = {
  code: string;
  description: string;
  costCents: number;
  priceCents: number;
  wholesalePriceCents: number | null;
  stockQuantity: number;
  minimumStockQuantity: number;
  department: string;
};

type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
};

type CategoryDescriptor = {
  name: string;
  slug: string;
};

type ProductRecord = {
  id: string;
  sku: string | null;
};

type InventoryDb = {
  category: {
    findMany(args: { where: { slug: { in: string[] } }; select: { id: true; name: true; slug: true } }): Promise<CategoryRecord[]>;
    create(args: { data: { name: string; slug: string; description: string | null; isActive: boolean } }): Promise<CategoryRecord>;
  };
  product: {
    findMany(args: { where: { sku: { in: string[] } }; select: { id: true; sku: true } }): Promise<ProductRecord[]>;
    upsert(args: {
      where: { sku: string };
      update: {
        categoryId: string;
        name: string;
        priceCents: number;
        costCents: number;
        wholesalePriceCents: number | null;
        stockQuantity: number;
        minimumStockQuantity: number;
        stockMode: StockMode;
        isActive: boolean;
        isPublished?: boolean;
      };
      create: {
        categoryId: string;
        sku: string;
        name: string;
        slug: string;
        priceCents: number;
        costCents: number;
        wholesalePriceCents: number | null;
        stockQuantity: number;
        minimumStockQuantity: number;
        stockMode: StockMode;
        isActive: boolean;
        isPublished: boolean;
      };
    }): Promise<unknown>;
  };
};

export type InventoryImportSummary = {
  filePath: string;
  dryRun: boolean;
  totalRows: number;
  categoriesCreated: number;
  categoriesMatched: number;
  productsCreated: number;
  productsUpdated: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  categoryPreview: string[];
};

export async function readInventoryFile(filePath: string) {
  const content = await readFile(filePath, { encoding: "latin1" });
  return parseInventoryContent(content);
}

export function parseInventoryContent(content: string): ImportedInventoryRow[] {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("El archivo de inventario no tiene filas de datos.");
  }

  const headers = lines[0].split("\t").map((item) => item.trim());

  if (headers.length !== EXPECTED_HEADERS.length || headers.some((header, index) => header !== EXPECTED_HEADERS[index])) {
    throw new Error(`Encabezados inválidos. Esperados: ${EXPECTED_HEADERS.join(", ")}`);
  }

  return lines.slice(1).map((line, index) => parseInventoryLine(line, index + 2));
}

function parseInventoryLine(line: string, rowNumber: number): ImportedInventoryRow {
  const columns = line.split("\t");

  if (columns.length !== EXPECTED_HEADERS.length) {
    throw new Error(`La fila ${rowNumber} tiene ${columns.length} columnas y se esperaban ${EXPECTED_HEADERS.length}.`);
  }

  const [code, description, cost, price, wholesale, stock, minimumStock, department] = columns.map((item) => item.trim());

  if (!code) {
    throw new Error(`La fila ${rowNumber} no tiene Codigo.`);
  }

  if (!description) {
    throw new Error(`La fila ${rowNumber} no tiene Descripcion.`);
  }

  return {
    code,
    description: compactWhitespace(description),
    costCents: parseMoneyToCents(cost, rowNumber, "Precio Costo"),
    priceCents: parseMoneyToCents(price, rowNumber, "Precio Venta"),
    wholesalePriceCents: normalizeOptionalPrice(parseMoneyToCents(wholesale, rowNumber, "Precio Mayoreo")),
    stockQuantity: parseQuantity(stock, rowNumber, "Inventario"),
    minimumStockQuantity: parseQuantity(minimumStock, rowNumber, "Inv. Minimo"),
    department: normalizeDepartment(department),
  };
}

export function deriveStockMode(stockQuantity: number): StockMode {
  return stockQuantity > 0 ? "in_stock" : "out_of_stock";
}

export async function importInventoryRows(
  rows: ImportedInventoryRow[],
  options: {
    filePath: string;
    dryRun?: boolean;
    database?: InventoryDb;
  },
) {
  const database = options.database ?? (db as unknown as InventoryDb);
  const dryRun = options.dryRun ?? false;
  const categoryDescriptors = collectCategories(rows);
  const categorySlugs = categoryDescriptors.map((item) => item.slug);
  const skuList = rows.map((row) => row.code);

  const [existingCategories, existingProducts] = await Promise.all([
    database.category.findMany({
      where: { slug: { in: categorySlugs } },
      select: { id: true, name: true, slug: true },
    }),
    database.product.findMany({
      where: { sku: { in: skuList } },
      select: { id: true, sku: true },
    }),
  ]);

  const categoriesBySlug = new Map(existingCategories.map((category) => [category.slug, category]));
  const existingProductSkus = new Set(existingProducts.flatMap((product) => (product.sku ? [product.sku] : [])));

  let categoriesCreated = 0;
  let productsCreated = 0;
  let productsUpdated = 0;
  let outOfStockProducts = 0;
  let lowStockProducts = 0;
  const categoryPreview: string[] = [];

  for (const descriptor of categoryDescriptors) {
    if (categoriesBySlug.has(descriptor.slug)) continue;

    categoriesCreated += 1;
    categoryPreview.push(descriptor.name);

    if (!dryRun) {
      const category = await database.category.create({
        data: {
          name: descriptor.name,
          slug: descriptor.slug,
          description: null,
          isActive: true,
        },
      });

      categoriesBySlug.set(category.slug, category);
    } else {
      categoriesBySlug.set(descriptor.slug, {
        id: descriptor.slug,
        name: descriptor.name,
        slug: descriptor.slug,
      });
    }
  }

  for (const row of rows) {
    const categorySlug = slugify(normalizeDepartment(row.department));
    const category = categoriesBySlug.get(categorySlug);

    if (!category) {
      throw new Error(`No se pudo resolver la categoría ${row.department} (${categorySlug}).`);
    }

    const stockMode = deriveStockMode(row.stockQuantity);

    if (stockMode === "out_of_stock") {
      outOfStockProducts += 1;
    }

    if (row.minimumStockQuantity > 0 && row.stockQuantity <= row.minimumStockQuantity) {
      lowStockProducts += 1;
    }

    if (existingProductSkus.has(row.code)) {
      productsUpdated += 1;
    } else {
      productsCreated += 1;
    }

    if (dryRun) continue;

    await database.product.upsert({
      where: { sku: row.code },
      update: {
        categoryId: category.id,
        name: row.description,
        priceCents: row.priceCents,
        costCents: row.costCents,
        wholesalePriceCents: row.wholesalePriceCents,
        stockQuantity: row.stockQuantity,
        minimumStockQuantity: row.minimumStockQuantity,
        stockMode,
        isActive: true,
      },
      create: {
        categoryId: category.id,
        sku: row.code,
        name: row.description,
        slug: buildImportedProductSlug(row.description, row.code),
        priceCents: row.priceCents,
        costCents: row.costCents,
        wholesalePriceCents: row.wholesalePriceCents,
        stockQuantity: row.stockQuantity,
        minimumStockQuantity: row.minimumStockQuantity,
        stockMode,
        isPublished: DEFAULT_IMPORTED_PRODUCT_PUBLICATION,
        isActive: true,
      },
    });
  }

  return {
    filePath: options.filePath,
    dryRun,
    totalRows: rows.length,
    categoriesCreated,
    categoriesMatched: categoryDescriptors.length - categoriesCreated,
    productsCreated,
    productsUpdated,
    outOfStockProducts,
    lowStockProducts,
    categoryPreview,
  } satisfies InventoryImportSummary;
}

export async function importInventoryFile(options: { filePath: string; dryRun?: boolean; database?: InventoryDb }) {
  const rows = await readInventoryFile(options.filePath);
  return importInventoryRows(rows, options);
}

export function formatImportSummary(summary: InventoryImportSummary) {
  return [
    `Archivo: ${summary.filePath}`,
    `Modo: ${summary.dryRun ? "dry-run" : "import"}`,
    `Filas procesadas: ${summary.totalRows}`,
    `Categorías nuevas: ${summary.categoriesCreated}`,
    `Categorías existentes: ${summary.categoriesMatched}`,
    `Productos creados: ${summary.productsCreated}`,
    `Productos actualizados: ${summary.productsUpdated}`,
    `Productos sin stock: ${summary.outOfStockProducts}`,
    `Productos en/bajo mínimo: ${summary.lowStockProducts}`,
  ].join("\n");
}

function collectCategories(rows: ImportedInventoryRow[]): CategoryDescriptor[] {
  return Array.from(
    new Map(
      rows.map((row) => {
        const name = normalizeDepartment(row.department);
        return [slugify(name), { name, slug: slugify(name) }];
      }),
    ).values(),
  ).sort((left, right) => left.name.localeCompare(right.name, "es-AR"));
}

function parseMoneyToCents(rawValue: string, rowNumber: number, column: string) {
  const normalized = rawValue.replace(/\$/g, "").replace(/,/g, "").replace(/\s+/g, "");
  const value = Number.parseFloat(normalized);

  if (Number.isNaN(value)) {
    throw new Error(`No pude parsear ${column} en la fila ${rowNumber}: ${rawValue}`);
  }

  return Math.round(value * 100);
}

function parseQuantity(rawValue: string, rowNumber: number, column: string) {
  const normalized = rawValue.replace(/,/g, "").trim();
  const value = Number.parseFloat(normalized);

  if (Number.isNaN(value)) {
    throw new Error(`No pude parsear ${column} en la fila ${rowNumber}: ${rawValue}`);
  }

  return value;
}

function normalizeOptionalPrice(value: number) {
  return value <= 0 ? null : value;
}

function normalizeDepartment(value: string) {
  const normalized = compactWhitespace(value || UNCATEGORIZED_DEPARTMENT);
  const department = normalized || UNCATEGORIZED_DEPARTMENT;

  return department
    .toLocaleLowerCase("es-AR")
    .replace(/(^|\s)(\p{L})/gu, (_match, prefix: string, letter: string) => `${prefix}${letter.toLocaleUpperCase("es-AR")}`);
}

function compactWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function buildImportedProductSlug(name: string, code: string) {
  return slugify(`${name}-${code}`);
}
