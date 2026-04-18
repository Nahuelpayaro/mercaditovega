import Link from "next/link";
import { Clock3, ShoppingBag, Truck } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TBody, TD, TH, THead } from "@/components/ui/table";
import { db } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/utils";

async function getAdminOrders() {
  return db.order.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });
}

type OrdersPageData = Awaited<ReturnType<typeof getAdminOrders>>;
type OrderRow = OrdersPageData[number];

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();
  const typedOrders: OrderRow[] = orders;
  const newOrders = typedOrders.filter((order) => order.status === "placed").length;
  const inProgressOrders = typedOrders.filter((order) => ["confirmed", "preparing", "ready"].includes(order.status)).length;
  const deliveryOrders = typedOrders.filter((order) => order.fulfillmentType === "delivery").length;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Pedidos" title="Listado operativo" description="Primero lo urgente: pedidos nuevos, en preparación y entregas." />

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryPill icon={ShoppingBag} label="Nuevos" value={String(newOrders)} />
        <SummaryPill icon={Clock3} label="En curso" value={String(inProgressOrders)} />
        <SummaryPill icon={Truck} label="Con delivery" value={String(deliveryOrders)} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Pedidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 overflow-x-auto">
          <div className="grid gap-3 md:hidden">
            {typedOrders.map((order) => (
              <article key={order.id} className="admin-soft-panel rounded-[22px] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/admin/pedidos/${order.id}`} className="text-base font-bold text-brand">
                      {order.code}
                    </Link>
                    <p className="mt-1 text-sm font-semibold text-foreground">{order.customer.fullName}</p>
                    <p className="text-xs text-muted-foreground">{order.customer.phone ?? "No informado"}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="mt-4 grid gap-3 rounded-[20px] border border-border/70 bg-background-muted/60 p-3">
                  <InfoRow label="Total" value={formatCurrency(order.totalCents)} />
                  <InfoRow label="Fecha" value={formatDateTime(order.createdAt)} />
                </div>
                <Link href={`/admin/pedidos/${order.id}`} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-brand">
                  Ver detalle
                </Link>
              </article>
            ))}
          </div>

          <div className="hidden md:block">
            <Table>
            <THead>
              <tr>
                <TH>Código</TH>
                <TH>Cliente</TH>
                <TH>Estado</TH>
                <TH>Total</TH>
                <TH>Fecha</TH>
              </tr>
            </THead>
            <TBody>
              {typedOrders.map((order) => (
                <tr key={order.id}>
                  <TD>
                    <Link href={`/admin/pedidos/${order.id}`} className="font-semibold text-brand">
                      {order.code}
                    </Link>
                  </TD>
                  <TD>
                    <div>
                      <p className="font-semibold text-foreground">{order.customer.fullName}</p>
                      <p className="text-xs text-muted-foreground">{order.customer.phone ?? "No informado"}</p>
                    </div>
                  </TD>
                  <TD>
                    <StatusBadge status={order.status} />
                  </TD>
                  <TD>{formatCurrency(order.totalCents)}</TD>
                  <TD>{formatDateTime(order.createdAt)}</TD>
                </tr>
              ))}
            </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryPill({ icon: Icon, label, value }: { icon: typeof ShoppingBag; label: string; value: string }) {
  return (
    <div className="admin-section-note flex items-center gap-3 rounded-[22px] px-4 py-3">
      <span className="rounded-2xl bg-white p-2 text-brand shadow-[0_8px_20px_rgba(87,52,22,0.08)]">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        <p className="text-lg font-black text-foreground">{value}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold text-foreground">{value}</span>
    </div>
  );
}
