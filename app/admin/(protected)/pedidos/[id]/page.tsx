import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/db";
import { ParamsAndSearchPageProps } from "@/lib/next-page-props";
import { getAllowedTransitions } from "@/lib/orders/status-machine";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { updateOrderStatus } from "@/app/admin/pedidos/actions";

type AdminOrderDetailPageProps = ParamsAndSearchPageProps<{ id: string }, { statusError?: string; statusSuccess?: string }>;
async function getAdminOrderDetail(id: string) {
  return db.order.findUnique({
    where: { id },
    include: { customer: true, items: true, promotion: true },
  });
}

type AdminOrderDetail = NonNullable<Awaited<ReturnType<typeof getAdminOrderDetail>>>;
type AdminOrderItem = AdminOrderDetail["items"][number];

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: AdminOrderDetailPageProps) {
  const { id } = await params;
  const { statusError, statusSuccess } = await searchParams;
  const order = await getAdminOrderDetail(id);

  if (!order) notFound();

  const items: AdminOrderItem[] = order.items;
  const allowedTransitions = getAllowedTransitions(order.status);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Detalle de pedido" title={order.code} description="Estado, cliente y próxima acción en una sola vista." />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Resumen del pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusError ? <FeedbackMessage tone="error" message={statusError} /> : null}
            {statusSuccess ? <FeedbackMessage tone="success" message={statusSuccess} /> : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <StatusBadge status={order.status} />
              <span className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</span>
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col gap-2 rounded-[20px] border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium text-foreground">
                    {item.quantity} x {item.productName}
                  </span>
                  <span className="font-semibold text-foreground">{formatCurrency(item.lineTotalCents)}</span>
                </div>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <InfoCard label="Cliente" value={order.customer.fullName} />
              <InfoCard label="WhatsApp" value={order.customer.phone ?? "No informado"} />
              <InfoCard label="Entrega" value={order.fulfillmentType === "delivery" ? order.addressLine ?? "Sin dirección" : "Retiro"} />
              <InfoCard label="Total" value={formatCurrency(order.totalCents)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Actualizar estado</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateOrderStatus} className="space-y-4">
              <input type="hidden" name="orderId" value={order.id} />
              <div>
                <Label htmlFor="status">Siguiente estado</Label>
                <Select id="status" name="status" defaultValue={allowedTransitions[0] ?? order.status} disabled={!allowedTransitions.length}>
                  {allowedTransitions.length ? (
                    allowedTransitions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))
                  ) : (
                    <option value={order.status}>Sin transiciones disponibles</option>
                  )}
                </Select>
              </div>
              <div>
                <Label htmlFor="internalNote">Nota interna</Label>
                <Textarea id="internalNote" name="internalNote" defaultValue={order.internalNote ?? ""} />
              </div>
              <div className="rounded-[22px] border border-border/70 bg-background-muted/60 p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Se puede pasar a</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {allowedTransitions.length ? (
                    allowedTransitions.map((status) => (
                      <span key={status} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]", status === order.status ? "border-brand/30 bg-brand/10 text-brand" : "border-border bg-white text-foreground")}>
                        {status}
                      </span>
                    ))
                  ) : (
                    <span>Este pedido no tiene cambios de estado disponibles.</span>
                  )}
                </div>
              </div>
              <Button className="w-full sm:w-auto" disabled={!allowedTransitions.length}>Guardar</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FeedbackMessage({ message, tone }: { message: string; tone: "error" | "success" }) {
  return (
    <div
      className={
        tone === "error"
          ? "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          : "rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
      }
    >
      {message}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-border bg-white/80 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-bold text-foreground">{value}</p>
    </div>
  );
}
