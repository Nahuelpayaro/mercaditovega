import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { deleteProduct, saveProduct } from "@/app/admin/productos/actions";

export function ProductForm({
  categories,
  product,
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
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Producto"
        title={product ? "Editar producto" : "Nuevo producto"}
        description="Mantené nombre, precio, disponibilidad e imagen en un único formulario claro."
      />
      <Card>
        <CardHeader>
          <CardTitle>{product ? "Editar producto" : "Nuevo producto"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveProduct} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="id" value={product?.id ?? ""} />
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
            <div>
              <Label htmlFor="priceCents">Precio en centavos</Label>
              <Input id="priceCents" name="priceCents" type="number" defaultValue={product?.priceCents} required />
            </div>
            <div>
              <Label htmlFor="costCents">Costo en centavos</Label>
              <Input id="costCents" name="costCents" type="number" defaultValue={product?.costCents ?? undefined} />
            </div>
            <div>
              <Label htmlFor="wholesalePriceCents">Precio mayorista</Label>
              <Input id="wholesalePriceCents" name="wholesalePriceCents" type="number" defaultValue={product?.wholesalePriceCents ?? undefined} />
            </div>
            <div>
              <Label htmlFor="compareAtCents">Precio tachado</Label>
              <Input id="compareAtCents" name="compareAtCents" type="number" defaultValue={product?.compareAtCents ?? undefined} />
            </div>
            <div>
              <Label htmlFor="unitLabel">Unidad</Label>
              <Input id="unitLabel" name="unitLabel" defaultValue={product?.unitLabel ?? "u."} />
            </div>
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
            <div className="md:col-span-2">
              <Label htmlFor="shortDescription">Bajada</Label>
              <Input id="shortDescription" name="shortDescription" defaultValue={product?.shortDescription ?? ""} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" name="description" defaultValue={product?.description ?? ""} />
            </div>
            <div>
              <Label htmlFor="imageUrl">Imagen URL</Label>
              <Input id="imageUrl" name="imageUrl" defaultValue={product?.images[0]?.url ?? ""} />
            </div>
            <div>
              <Label htmlFor="imageAlt">Alt imagen</Label>
              <Input id="imageAlt" name="imageAlt" defaultValue={product?.images[0]?.alt ?? ""} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured} /> Destacado
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isPublished" defaultChecked={product?.isPublished ?? false} /> Publicado
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} /> Activo
            </label>

            <div className="flex gap-3 md:col-span-2">
              <Button>Guardar producto</Button>
              <Link href="/admin/productos" className={buttonVariants({ variant: "secondary" })}>
                Volver
              </Link>
              {product ? (
                <button formAction={deleteProduct} className="rounded-xl border border-red-300 px-4 text-sm text-red-700">
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
