import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { deleteProduct, saveProduct } from "@/app/admin/productos/actions";
import { ProductImageFields } from "@/app/admin/productos/product-image-fields";
import { PriceInput } from "@/app/admin/productos/price-input";

export function ProductForm({
  categories,
  product,
  statusError,
  statusSuccess,
}: {
  categories: { id: string; name: string }[];
  product?: {
    id: string;
    categoryId: string;
    sku: string | null;
    name: string;
    slug: string;
    description: string | null;
    shortDescription: string | null;
    priceCents: number;
    costCents: number | null;
    wholesalePriceCents: number | null;
    compareAtCents: number | null;
    unitLabel: string | null;
    stockQuantity: number;
    minimumStockQuantity: number;
    stockMode: "in_stock" | "out_of_stock";
    isFeatured: boolean;
    isPublished: boolean;
    isActive: boolean;
    images: { url: string; alt: string }[];
  };
  statusError?: string;
  statusSuccess?: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Producto"
        title={product ? "Editar producto" : "Nuevo producto"}
        description="Primero lo esencial: nombre, precio, stock y publicación."
      />
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{product ? "Editar producto" : "Nuevo producto"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {statusError ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {statusError}
            </div>
          ) : null}
          {statusSuccess ? (
            <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {statusSuccess}
            </div>
          ) : null}
          <form action={saveProduct} className="space-y-6">
            <input type="hidden" name="id" value={product?.id ?? ""} />
            <section className="space-y-4 rounded-[22px] border border-border bg-white/80 p-4">
              <SectionHeading title="Datos básicos" description="Lo mínimo para identificar el producto." />
              <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="categoryId">Categoría</Label>
                <Select id="categoryId" name="categoryId" defaultValue={product?.categoryId ?? categories[0]?.id}>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="sku">Código / SKU</Label>
                <Input id="sku" name="sku" defaultValue={product?.sku ?? ""} />
              </div>
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" defaultValue={product?.name} required />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" defaultValue={product?.slug} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="shortDescription">Bajada</Label>
                <Input id="shortDescription" name="shortDescription" defaultValue={product?.shortDescription ?? ""} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" name="description" defaultValue={product?.description ?? ""} />
              </div>
              </div>
            </section>

            <section className="space-y-4 rounded-[22px] border border-border bg-white/80 p-4">
              <SectionHeading title="Precios" description="Cargá en pesos. Sólo lo que realmente usás." />
              <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="priceCents">Precio ($)</Label>
                <PriceInput name="priceCents" defaultCents={product?.priceCents} required />
              </div>
              <div>
                <Label htmlFor="costCents">Costo ($)</Label>
                <PriceInput name="costCents" defaultCents={product?.costCents} />
              </div>
              <div>
                <Label htmlFor="wholesalePriceCents">Precio mayorista ($)</Label>
                <PriceInput name="wholesalePriceCents" defaultCents={product?.wholesalePriceCents} />
              </div>
              <div>
                <Label htmlFor="compareAtCents">Precio tachado ($)</Label>
                <PriceInput name="compareAtCents" defaultCents={product?.compareAtCents} />
              </div>
              <div>
                <Label htmlFor="unitLabel">Unidad</Label>
                <Input id="unitLabel" name="unitLabel" defaultValue={product?.unitLabel ?? "u."} />
              </div>
              </div>
            </section>

            <section className="space-y-4 rounded-[22px] border border-border bg-white/80 p-4">
              <SectionHeading title="Stock" description="Disponibilidad y mínimos para operar." />
              <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="stockQuantity">Stock actual</Label>
                <Input id="stockQuantity" name="stockQuantity" type="number" step="0.001" defaultValue={product?.stockQuantity ?? 0} />
              </div>
              <div>
                <Label htmlFor="minimumStockQuantity">Stock mínimo</Label>
                <Input id="minimumStockQuantity" name="minimumStockQuantity" type="number" step="0.001" defaultValue={product?.minimumStockQuantity ?? 0} />
              </div>
              <div>
                <Label htmlFor="stockMode">Stock</Label>
                <Select id="stockMode" name="stockMode" defaultValue={product?.stockMode ?? "in_stock"}>
                  <option value="in_stock">Disponible</option>
                  <option value="out_of_stock">Sin stock</option>
                </Select>
              </div>
              </div>
            </section>

            <section className="space-y-4 rounded-[22px] border border-border bg-white/80 p-4">
              <SectionHeading title="Imagen" description="Una sola imagen clara ya resuelve la operación." />
              <ProductImageFields
                initialImageUrl={product?.images[0]?.url ?? ""}
                initialProductName={product?.name}
              />
            </section>

            <section className="space-y-4 rounded-[22px] border border-border bg-white/80 p-4">
              <SectionHeading title="Estado" description="Marcá sólo lo necesario para publicar." />
              <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex min-h-11 items-center gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium">
                <input className="size-5 rounded border-border" type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured} /> Destacado
              </label>
              <label className="flex min-h-11 items-center gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium">
                <input className="size-5 rounded border-border" type="checkbox" name="isPublished" defaultChecked={product?.isPublished ?? false} /> Publicado
              </label>
              <label className="flex min-h-11 items-center gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium">
                <input className="size-5 rounded border-border" type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} /> Activo
              </label>
              </div>
            </section>

            <div className="sticky bottom-20 z-10 flex flex-col gap-3 rounded-[22px] border border-border bg-[rgba(255,250,244,0.96)] p-3 shadow-[0_18px_40px_rgba(87,52,22,0.08)] backdrop-blur md:static md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none">
              <Button className="w-full md:w-auto">Guardar producto</Button>
              <Link href="/admin/productos" className={buttonVariants({ variant: "secondary", className: "w-full md:w-auto" })}>
                Volver
              </Link>
              {product ? (
                <button formAction={deleteProduct} className="min-h-11 rounded-2xl border border-red-300 px-4 text-sm font-semibold text-red-700">
                  Eliminar
                </button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
