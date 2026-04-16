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

type AdminProductsPageProps = SearchPageProps<{ categoryId?: string; publication?: string }>;

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const { categoryId = "all", publication = "all" } = await searchParams;

  const productWhere = {
    ...(categoryId !== "all" ? { categoryId } : {}),
    ...(publication === "published" ? { isPublished: true } : {}),
    ...(publication === "unpublished" ? { isPublished: false } : {}),
  };

  const [products, categories] = await Promise.all([
    db.product.findMany({ where: productWhere, include: { category: true }, orderBy: [{ isPublished: "desc" }, { name: "asc" }] }),
    db.category.findMany({
      orderBy: { name: "asc" },
      include: { products: { select: { id: true, isPublished: true } } },
    }),
  ]);

  const categorySummaries = categories.map((category) => {
    const totalProducts = category.products.length;
    const publishedProducts = category.products.filter((product) => product.isPublished).length;

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
  const filteredPublishedProducts = products.filter((product) => product.isPublished).length;
  const filteredUnpublishedProducts = products.length - filteredPublishedProducts;
  const redirectToSearchParams = new URLSearchParams();

  if (categoryId !== "all") {
    redirectToSearchParams.set("categoryId", categoryId);
  }

  if (publication !== "all") {
    redirectToSearchParams.set("publication", publication);
  }

  const redirectTo = `/admin/productos${redirectToSearchParams.toString() ? `?${redirectToSearchParams.toString()}` : ""}#items`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catálogo"
        title="Productos"
        description="Gestioná catálogo y categorías con más contexto visual y menos fricción operativa."
        actions={<Link href="/admin/productos/nuevo" className={buttonVariants()}>Nuevo producto</Link>}
      />

      <Card>
        <CardHeader>
          <CardTitle>Resumen por categoría</CardTitle>
          <p className="text-sm text-muted-foreground">
            {totalPublishedProducts} publicados de {totalProducts} productos. Usá acciones masivas para destrabar carga real sin entrar ítem por ítem.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {categorySummaries.map((category) => (
            <div
              key={category.id}
              className={cn(
                "space-y-4 overflow-hidden rounded-[24px] border border-border bg-white/80 p-4 shadow-[0_12px_28px_rgba(87,52,22,0.06)]",
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
                <Link href={`/admin/productos?categoryId=${category.id}#items`} className={cn(buttonVariants({ variant: selectedCategory?.id === category.id ? "outline" : "ghost", size: "sm" }), "w-full") }>
                  {selectedCategory?.id === category.id ? "Viendo ítems" : "Ver ítems"}
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card id="items">
        <CardHeader>
          <CardTitle>{selectedCategory ? `Ítems de ${selectedCategory.name}` : "Listado"}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Mostrando {products.length} {activeFilterLabel} {categoryId === "all" ? "del catálogo completo" : "de la categoría seleccionada"}.
            {selectedCategory ? ` Desde acá decidís producto por producto sin perder la acción masiva de ${selectedCategory.name}.` : " Elegí una categoría para bajar del resumen al detalle sin perder contexto."}
          </p>
        </CardHeader>
        <CardContent className="space-y-4 overflow-x-auto">
          <div className="space-y-3 rounded-[24px] border border-border bg-white/80 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/productos#items"
                className={buttonVariants({ variant: categoryId === "all" ? "secondary" : "ghost", size: "sm" })}
              >
                Todas las categorías
              </Link>
              {categorySummaries.map((category) => (
                <Link
                  key={category.id}
                  href={`/admin/productos?categoryId=${category.id}#items`}
                  className={buttonVariants({ variant: category.id === categoryId ? "secondary" : "ghost", size: "sm" })}
                >
                  {category.name}
                  <span className="rounded-full bg-black/8 px-2 py-0.5 text-[11px] font-bold text-current">{category.totalProducts}</span>
                </Link>
              ))}
            </div>

            {selectedCategory ? (
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-background-muted p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Categoría activa</p>
                  <p className="text-lg font-bold text-foreground">{selectedCategory.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedCategory.description || "Sin descripción"}</p>
                </div>
                <div className="rounded-2xl border border-green-100 bg-green-50/70 p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-green-700">Publicados en vista</p>
                  <p className="text-lg font-bold text-green-700">{filteredPublishedProducts}</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-amber-700">Sin publicar en vista</p>
                  <p className="text-lg font-bold text-amber-700">{filteredUnpublishedProducts}</p>
                </div>
              </div>
            ) : null}
          </div>

          <form className="grid gap-3 rounded-[24px] border border-border bg-white/80 p-4 md:grid-cols-[1fr_220px_140px]">
            <div>
              <Label htmlFor="categoryId">Filtrar por categoría</Label>
              <Select id="categoryId" name="categoryId" defaultValue={categoryId}>
                <option value="all">Todas</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="publication">Publicación</Label>
              <Select id="publication" name="publication" defaultValue={publication}>
                <option value="all">Todos</option>
                <option value="published">Publicados</option>
                <option value="unpublished">No publicados</option>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit">Filtrar</Button>
              <Link href="/admin/productos" className={buttonVariants({ variant: "outline" })}>
                Limpiar
              </Link>
            </div>
          </form>

          <ProductSelectionTable products={products} redirectTo={redirectTo} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categorías</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={saveCategory} className="grid gap-3 rounded-[24px] border border-border bg-white/80 p-4 md:grid-cols-4">
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
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isActive" defaultChecked /> Activa
              </label>
              <Button>Guardar</Button>
            </div>
          </form>

          {categories.map((category) => (
            <form key={category.id} action={saveCategory} className="grid gap-3 rounded-[24px] border border-border bg-white/80 p-4 md:grid-cols-5">
              <input type="hidden" name="id" value={category.id} />
              <Input name="name" defaultValue={category.name} required />
              <Input name="slug" defaultValue={category.slug} />
              <Input name="description" defaultValue={category.description ?? ""} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isActive" defaultChecked={category.isActive} /> Activa
              </label>
              <div className="flex gap-2">
                <Button>Guardar</Button>
                <button formAction={deleteCategory} className="rounded-xl border px-4 text-sm">
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
