import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [orders, products, promos, customers] = await Promise.all([
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { customer: true } }),
    db.product.count(),
    db.promotion.count(),
    db.customer.count(),
  ]);

  const todayRevenue = orders.reduce((total, order) => total + order.totalCents, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Resumen operativo"
        description="Lo importante del día, sin vueltas: pedidos recientes, catálogo publicado y qué revisar primero."
        actions={<Link href="/admin/pedidos" className={buttonVariants()}>Ver pedidos</Link>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="Pedidos recientes" value={String(orders.length)} helper="Últimos ingresos" />
        <MetricCard title="Productos" value={String(products)} helper="Catálogo activo + oculto" />
        <MetricCard title="Promos" value={String(promos)} helper="Campañas configuradas" />
        <MetricCard title="Clientes" value={String(customers)} helper="Base acumulada" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Últimos pedidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="flex flex-col gap-3 rounded-[24px] border border-border bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-foreground">{order.code}</p>
                  <p className="text-sm text-muted-foreground">{order.customer.fullName} · {order.status}</p>
                </div>
                <span className="font-black text-foreground">{formatCurrency(order.totalCents)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vista rápida</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <QuickInfo title="Facturación visible" value={formatCurrency(todayRevenue)} />
            <QuickInfo title="Clientes cargados" value={String(customers)} />
            <QuickInfo title="Próxima acción" value="Revisar pedidos nuevos y stock" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <Card>
      <CardContent className="space-y-1 p-5">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-black text-foreground">{value}</p>
        <p className="text-xs uppercase tracking-[0.16em] text-brand">{helper}</p>
      </CardContent>
    </Card>
  );
}

function QuickInfo({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-border bg-white/80 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
      <p className="mt-2 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}
