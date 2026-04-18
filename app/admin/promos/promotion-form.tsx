import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { deletePromotion, savePromotion } from "@/app/admin/promos/actions";
import { PromotionTargetFields } from "@/app/admin/promos/promotion-target-fields";

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
        description="Código, vigencia y alcance en una sola pasada."
      />
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{promotion ? "Editar promo" : "Nueva promo"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={savePromotion} className="space-y-6">
            <input type="hidden" name="id" value={promotion?.id ?? ""} />
            <section className="space-y-4 rounded-[22px] border border-border bg-white/80 p-4">
              <SectionHeading title="Datos básicos" description="Primero definí la promo y cuándo corre." />
              <div className="grid gap-4 md:grid-cols-2">
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
                <select id="type" name="type" defaultValue={promotion?.type ?? "percentage"} className="flex min-h-11 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15">
                  <option value="percentage">Porcentaje</option>
                  <option value="fixed">Monto fijo</option>
                </select>
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
              </div>
            </section>

            <PromotionTargetFields
              products={products}
              categories={categories}
              initialScope={promotion?.scope ?? "order"}
              initialProductIds={promotion?.products.map((item) => item.id) ?? []}
              initialCategoryIds={promotion?.categories.map((item) => item.id) ?? []}
            />

            <label className="flex min-h-11 items-center gap-3 rounded-[22px] border border-border bg-white/80 px-4 py-3 text-sm font-medium">
              <input className="size-5 rounded border-border" type="checkbox" name="isActive" defaultChecked={promotion?.isActive ?? true} /> Activa
            </label>
            <div className="sticky bottom-20 z-10 flex flex-col gap-3 rounded-[22px] border border-border bg-[rgba(255,250,244,0.96)] p-3 shadow-[0_18px_40px_rgba(87,52,22,0.08)] backdrop-blur md:static md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none">
              <Button className="w-full md:w-auto">Guardar promo</Button>
              <Link href="/admin/promos" className={buttonVariants({ variant: "secondary", className: "w-full md:w-auto" })}>
                Volver
              </Link>
              {promotion ? (
                <button formAction={deletePromotion} name="id" value={promotion.id} className="min-h-11 rounded-2xl border border-red-300 px-4 text-sm font-semibold text-red-700">
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

function toDateInput(value?: Date) {
  return value ? new Date(value).toISOString().slice(0, 16) : undefined;
}
