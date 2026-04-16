import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/db";
import { getAllowedTransitions } from "@/lib/orders/status-machine";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { updateOrderStatus } from "@/app/admin/pedidos/actions";

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ statusError?: string; statusSuccess?: string }>;
}) {
  const { id } = await params;
  const { statusError, statusSuccess } = await searchParams;
  const order = await db.order.findUnique({
    where: { id },
    include: { customer: true, items: true, promotion: true },
  });

  if (!order) notFound();

  const allowedTransitions = getAllowedTransitions(order.status);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Detalle de pedido" title={order.code} description="Revisá el pedido, validá el contexto del cliente y avanzá solo con transiciones permitidas." />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Resumen del pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusError ? <FeedbackMessage tone="error" message={statusError} /> : null}
            {statusSuccess ? <FeedbackMessage tone="success" message={statusSuccess} /> : null}
            <div className="flex items-center gap-3">
              <StatusBadge status={order.status} />
              <span className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</span>
            </div>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between rounded-[22px] border border-border p-3">
                  <span>
                    {item.quantity} x {item.productName}
                  </span>
                  <span>{formatCurrency(item.lineTotalCents)}</span>
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
          <CardHeader>
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
              <Button disabled={!allowedTransitions.length}>Guardar</Button>
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
