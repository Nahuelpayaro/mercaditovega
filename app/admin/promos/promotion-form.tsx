import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { deletePromotion, savePromotion } from "@/app/admin/promos/actions";

export function PromotionForm({
  products,
  categories,
  promotion,
}: {
  products: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  promotion?: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    type: "percentage" | "fixed";
    scope: "order" | "category" | "product";
    amount: number;
    minSubtotalCents: number | null;
    startsAt: Date;
    endsAt: Date;
    isActive: boolean;
    products: { id: string }[];
    categories: { id: string }[];
  };
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Promo"
        title={promotion ? "Editar promo" : "Nueva promo"}
        description="Definí alcance, vigencia y vínculos sin mezclar reglas en lugares raros."
      />
      <Card>
        <CardHeader>
          <CardTitle>{promotion ? "Editar promo" : "Nueva promo"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={savePromotion} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="id" value={promotion?.id ?? ""} />
            <div>
              <Label htmlFor="code">Código</Label>
              <Input id="code" name="code" defaultValue={promotion?.code} required />
            </div>
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" defaultValue={promotion?.name} required />
            </div>
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select id="type" name="type" defaultValue={promotion?.type ?? "percentage"}>
                <option value="percentage">Porcentaje</option>
                <option value="fixed">Monto fijo</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="scope">Aplica a</Label>
              <Select id="scope" name="scope" defaultValue={promotion?.scope ?? "order"}>
                <option value="order">Pedido</option>
                <option value="category">Categorías</option>
                <option value="product">Productos</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Valor</Label>
              <Input id="amount" name="amount" type="number" defaultValue={promotion?.amount} required />
            </div>
            <div>
              <Label htmlFor="minSubtotalCents">Subtotal mínimo</Label>
              <Input id="minSubtotalCents" name="minSubtotalCents" type="number" defaultValue={promotion?.minSubtotalCents ?? undefined} />
            </div>
            <div>
              <Label htmlFor="startsAt">Inicio</Label>
              <Input id="startsAt" name="startsAt" type="datetime-local" defaultValue={toDateInput(promotion?.startsAt)} required />
            </div>
            <div>
              <Label htmlFor="endsAt">Fin</Label>
              <Input id="endsAt" name="endsAt" type="datetime-local" defaultValue={toDateInput(promotion?.endsAt)} required />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" name="description" defaultValue={promotion?.description ?? ""} />
            </div>
            <div>
              <Label>Productos vinculados</Label>
              <div className="max-h-48 space-y-2 overflow-auto rounded-[22px] border border-border bg-white/80 p-3">
                {products.map((product) => (
                  <label key={product.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="productIds" value={product.id} defaultChecked={promotion?.products.some((item) => item.id === product.id)} />
                    {product.name}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Categorías vinculadas</Label>
              <div className="max-h-48 space-y-2 overflow-auto rounded-[22px] border border-border bg-white/80 p-3">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="categoryIds" value={category.id} defaultChecked={promotion?.categories.some((item) => item.id === category.id)} />
                    {category.name}
                  </label>
                ))}
              </div>
            </div>
            <label className="text-sm md:col-span-2 flex items-center gap-2">
              <input type="checkbox" name="isActive" defaultChecked={promotion?.isActive ?? true} /> Activa
            </label>
            <div className="flex gap-3 md:col-span-2">
              <Button>Guardar promo</Button>
              <Link href="/admin/promos" className={buttonVariants({ variant: "secondary" })}>
                Volver
              </Link>
              {promotion ? (
                <button formAction={deletePromotion} name="id" value={promotion.id} className="rounded-xl border border-red-300 px-4 text-sm text-red-700">
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

function toDateInput(value?: Date) {
  return value ? new Date(value).toISOString().slice(0, 16) : undefined;
}
