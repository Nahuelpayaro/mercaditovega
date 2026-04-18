import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { db } from "@/lib/db";
import { SearchPageProps } from "@/lib/next-page-props";
import { cn } from "@/lib/utils";
import { deleteCategory, saveCategory, setCategoryPublished } from "@/app/admin/productos/actions";
import { ProductSelectionTable } from "@/app/admin/productos/product-selection-table";

const PRODUCTS_PER_PAGE = 50;

type AdminProductsPageProps = SearchPageProps<{ categoryId?: string; publication?: string; page?: string; q?: string; statusSuccess?: string }>;
type ProductListItem = Awaited<ReturnType<typeof getAdminProductsPageItems>>[number];

function parsePage(value?: string) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function buildAdminProductsHref({
  categoryId = "all",
  publication = "all",
  page,
  q,
  hash,
}: {
  categoryId?: string;
  publication?: string;
  page?: number;
  q?: string;
  hash?: string;
}) {
  const searchParams = new URLSearchParams();

  if (categoryId !== "all") {
    searchParams.set("categoryId", categoryId);
  }

  if (publication !== "all") {
    searchParams.set("publication", publication);
  }

  if (q) {
    searchParams.set("q", q);
  }

  if (page && page > 1) {
    searchParams.set("page", page.toString());
  }

  const query = searchParams.toString();

  return `/admin/productos${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

function getAdminProductsWhere({
  categoryId,
  publication,
  q,
}: {
  categoryId: string;
  publication: string;
  q: string;
}): Prisma.ProductWhereInput {
  return {
    ...(categoryId !== "all" ? { categoryId } : {}),
    ...(publication === "published" ? { isPublished: true } : {}),
    ...(publication === "unpublished" ? { isPublished: false } : {}),
    ...(q
      ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
        ],
      }
      : {}),
  };
}

async function getAdminProductsPageItems(where: Prisma.ProductWhereInput, page: number) {
  return db.product.findMany({
    where,
    select: {
      id: true,
      sku: true,
      name: true,
      priceCents: true,
      stockQuantity: true,
      isPublished: true,
      isActive: true,
      stockMode: true,
      category: { select: { name: true } },
      images: { select: { url: true }, take: 1 },
    },
    orderBy: [{ isPublished: "desc" }, { name: "asc" }],
    skip: (page - 1) * PRODUCTS_PER_PAGE,
    take: PRODUCTS_PER_PAGE,
  });
}

async function getAdminProductCategories() {
  return db.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      isActive: true,
      _count: { select: { products: true } },
    },
  });
}

async function getPublishedCategoryCounts() {
  return db.product.groupBy({
    by: ["categoryId"],
    where: { isPublished: true },
    _count: { _all: true },
  });
}

type AdminCategoryList = Awaited<ReturnType<typeof getAdminProductCategories>>;
type AdminCategory = AdminCategoryList[number];
type CategorySummary = AdminCategory & {
  totalProducts: number;
  publishedProducts: number;
  unpublishedProducts: number;
};

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const {
    categoryId = "all",
    publication = "all",
    page: pageParam,
    q: rawQuery = "",
    statusSuccess,
  } = await searchParams;
  const q = rawQuery.trim();
  const requestedPage = parsePage(pageParam);
  const productWhere = getAdminProductsWhere({ categoryId, publication, q });

  const [categories, publishedCategoryCounts, filteredTotalProducts] = await Promise.all([
    getAdminProductCategories(),
    getPublishedCategoryCounts(),
    db.product.count({ where: productWhere }),
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredTotalProducts / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);
  const products = await getAdminProductsPageItems(productWhere, currentPage);
  const typedProducts: ProductListItem[] = products;
  const typedCategories: AdminCategory[] = categories;
  const publishedCategoryCountById = new Map(
    publishedCategoryCounts.map((entry) => [entry.categoryId, entry._count._all]),
  );

  const categorySummaries: CategorySummary[] = typedCategories.map((category) => {
    const totalProducts = category._count.products;
    const publishedProducts = publishedCategoryCountById.get(category.id) ?? 0;

    return {
      ...category,
      totalProducts,
      publishedProducts,
      unpublishedProducts: totalProducts - publishedProducts,
    };
  });

  const totalProducts = categorySummaries.reduce((total, category) => total + category.totalProducts, 0);
  const totalPublishedProducts = categorySummaries.reduce((total, category) => total + category.publishedProducts, 0);
  const activeFilterLabel = publication === "published" ? "publicados" : publication === "unpublished" ? "sin publicar" : "totales";
  const selectedCategory = categorySummaries.find((category) => category.id === categoryId) ?? null;
  const filteredPublishedProducts = typedProducts.filter((product) => product.isPublished).length;
  const filteredUnpublishedProducts = typedProducts.length - filteredPublishedProducts;
  const listStart = filteredTotalProducts === 0 ? 0 : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
  const listEnd = filteredTotalProducts === 0 ? 0 : listStart + typedProducts.length - 1;
  const redirectTo = buildAdminProductsHref({ categoryId, publication, q, page: currentPage, hash: "items" });
  const resetFiltersHref = buildAdminProductsHref({ hash: "items" });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catálogo"
        title="Productos"
        description="Stock, publicación y categorías con foco en decidir rápido."
        actions={<Link href="/admin/productos/nuevo" className={buttonVariants({ className: "w-full sm:w-auto" })}>Nuevo producto</Link>}
      />

      {statusSuccess ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {statusSuccess}
        </div>
      ) : null}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Resumen por categoría</CardTitle>
          <p className="text-sm text-muted-foreground">
            {totalPublishedProducts} publicados de {totalProducts} productos.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {categorySummaries.map((category) => (
            <div
              key={category.id}
              className={cn(
                "admin-soft-panel space-y-4 overflow-hidden rounded-[22px] p-4",
                selectedCategory?.id === category.id && "border-brand/40 bg-brand/5 shadow-[0_18px_45px_rgba(214,109,49,0.12)]",
              )}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="break-words text-lg font-semibold leading-6 text-foreground [overflow-wrap:anywhere]">{category.name}</p>
                     <p className="break-words text-sm leading-5 text-muted-foreground [overflow-wrap:anywhere]">{category.description || "Sin descripción"}</p>
                   </div>
                  <Badge className={cn("shrink-0 whitespace-nowrap", category.isActive ? "border-cyan-200 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-slate-100 text-slate-700")}>
                    {category.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm min-[420px]:grid-cols-3">
                  <div className="min-w-0 rounded-2xl border border-border/70 bg-background-muted/80 p-3">
                    <p className="text-[11px] font-medium leading-4 text-muted-foreground">Total</p>
                    <p className="mt-1 text-xl font-black text-foreground">{category.totalProducts}</p>
                  </div>
                  <div className="min-w-0 rounded-2xl border border-green-100 bg-green-50/70 p-3">
                    <p className="text-[11px] font-medium leading-4 text-green-700">Publicados</p>
                    <p className="mt-1 text-xl font-black text-green-700">{category.publishedProducts}</p>
                  </div>
                  <div className="min-w-0 rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
                    <p className="text-[11px] font-medium leading-4 text-amber-700">Sin publicar</p>
                    <p className="mt-1 text-xl font-black text-amber-700">{category.unpublishedProducts}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <form action={setCategoryPublished}>
                  <input type="hidden" name="categoryId" value={category.id} />
                  <input type="hidden" name="isPublished" value="true" />
                  <input type="hidden" name="redirectTo" value={redirectTo} />
                  <Button className="w-full whitespace-nowrap" type="submit" size="sm" disabled={category.totalProducts === 0 || category.unpublishedProducts === 0}>
                    Publicar todo
                  </Button>
                </form>
                <form action={setCategoryPublished}>
                  <input type="hidden" name="categoryId" value={category.id} />
                  <input type="hidden" name="isPublished" value="false" />
                  <input type="hidden" name="redirectTo" value={redirectTo} />
                  <Button className="w-full whitespace-nowrap" type="submit" size="sm" variant="outline" disabled={category.totalProducts === 0 || category.publishedProducts === 0}>
                    Despublicar todo
                  </Button>
                </form>
                <Link href={buildAdminProductsHref({ categoryId: category.id, publication, q, hash: "items" })} className={cn(buttonVariants({ variant: selectedCategory?.id === category.id ? "outline" : "ghost", size: "sm" }), "w-full") }>
                  {selectedCategory?.id === category.id ? "Viendo ítems" : "Ver ítems"}
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card id="items">
        <CardHeader className="pb-3">
          <CardTitle>{selectedCategory ? selectedCategory.name : "Listado"}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {filteredTotalProducts} {activeFilterLabel}{selectedCategory ? ` en ${selectedCategory.name}` : ""} · página {currentPage} de {totalPages}
          </p>
        </CardHeader>
        <CardContent className="space-y-4 overflow-x-auto">

          {/* Pills de categoría */}
          <div className="admin-chip-scroll flex gap-2 overflow-x-auto pb-1">
            <Link
              href={buildAdminProductsHref({ publication, q, hash: "items" })}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition-all duration-200",
                categoryId === "all"
                  ? "bg-brand text-white shadow-[0_16px_30px_rgba(214,109,49,0.26)]"
                  : "text-muted-foreground hover:bg-background-muted hover:text-foreground",
              )}
            >
              Todas
            </Link>
            {categorySummaries.map((category) => (
              <Link
                key={category.id}
                href={buildAdminProductsHref({ categoryId: category.id, publication, q, hash: "items" })}
                className={cn(
                  "inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition-all duration-200",
                  category.id === categoryId
                    ? "bg-brand text-white shadow-[0_16px_30px_rgba(214,109,49,0.26)]"
                    : "text-muted-foreground hover:bg-background-muted hover:text-foreground",
                )}
              >
                {category.name}
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", category.id === categoryId ? "bg-white/20 text-white" : "bg-black/8 text-current")}>{category.totalProducts}</span>
              </Link>
            ))}
          </div>

          {/* Toolbar: búsqueda + publicación + paginación en una línea */}
          <form className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="categoryId" value={categoryId} />
            <div className="min-w-44 flex-1">
              <Input name="q" defaultValue={q} placeholder="Nombre o SKU..." />
            </div>
            <Select name="publication" defaultValue={publication} className="w-40">
              <option value="all">Publicación</option>
              <option value="published">Publicados</option>
              <option value="unpublished">Sin publicar</option>
            </Select>
            <Button type="submit" size="sm">Buscar</Button>
            {(q || publication !== "all") && (
              <Link href={resetFiltersHref} className={buttonVariants({ variant: "outline", size: "sm" })}>
                Limpiar
              </Link>
            )}
            <div className="ml-auto flex items-center gap-1.5">
              <span className="hidden text-xs text-muted-foreground sm:inline">{listStart}–{listEnd} de {filteredTotalProducts}</span>
              <Link
                href={buildAdminProductsHref({ categoryId, publication, q, page: Math.max(1, currentPage - 1), hash: "items" })}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), currentPage === 1 && "pointer-events-none opacity-40")}
              >
                ‹
              </Link>
              <span className="min-w-12 rounded-2xl border border-border bg-background px-2 py-1.5 text-center text-sm font-medium">
                {currentPage}/{totalPages}
              </span>
              <Link
                href={buildAdminProductsHref({ categoryId, publication, q, page: Math.min(totalPages, currentPage + 1), hash: "items" })}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), currentPage === totalPages && "pointer-events-none opacity-40")}
              >
                ›
              </Link>
            </div>
          </form>

          <ProductSelectionTable products={products} redirectTo={redirectTo} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Categorías</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={saveCategory} className="grid gap-3 rounded-[22px] border border-border bg-white/80 p-4 md:grid-cols-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" name="description" />
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
              <label className="flex min-h-11 items-center gap-3 text-sm">
                <input className="size-5 rounded border-border" type="checkbox" name="isActive" defaultChecked /> Activa
              </label>
              <Button className="w-full sm:w-auto">Guardar</Button>
            </div>
          </form>

          {typedCategories.map((category) => (
            <form key={category.id} action={saveCategory} className="grid gap-3 rounded-[22px] border border-border bg-white/80 p-4 md:grid-cols-5">
              <input type="hidden" name="id" value={category.id} />
              <Input name="name" defaultValue={category.name} required />
              <Input name="slug" defaultValue={category.slug} />
              <Input name="description" defaultValue={category.description ?? ""} />
              <label className="flex min-h-11 items-center gap-3 text-sm">
                <input className="size-5 rounded border-border" type="checkbox" name="isActive" defaultChecked={category.isActive} /> Activa
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button className="w-full sm:w-auto">Guardar</Button>
                <button formAction={deleteCategory} className="min-h-11 rounded-2xl border px-4 text-sm font-semibold">
                  Eliminar
                </button>
              </div>
            </form>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
