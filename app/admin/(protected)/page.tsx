import Link from "next/link";
import { ArrowRight, Megaphone, Package, ShoppingBag, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

async function getDashboardRecentOrders() {
  return db.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { customer: true } });
}

type DashboardOrders = Awaited<ReturnType<typeof getDashboardRecentOrders>>;
type DashboardOrder = DashboardOrders[number];

export default async function AdminDashboardPage() {
  const [orders, products, promos, customers] = await Promise.all([
    getDashboardRecentOrders(),
    db.product.count(),
    db.promotion.count(),
    db.customer.count(),
  ]);
  const typedOrders: DashboardOrder[] = orders;

  const todayRevenue = typedOrders.reduce((total, order) => total + order.totalCents, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Resumen operativo"
        description="Lo urgente primero: pedidos nuevos, catálogo y promos activas."
        actions={<Link href="/admin/pedidos" className={buttonVariants({ className: "w-full sm:w-auto" })}>Ver pedidos</Link>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Pedidos" value={String(typedOrders.length)} helper="ingresaron hoy" />
        <MetricCard title="Productos" value={String(products)} helper="en catálogo" />
        <MetricCard title="Promos" value={String(promos)} helper="configuradas" />
        <MetricCard title="Clientes" value={String(customers)} helper="guardados" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Ir directo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickAction href="/admin/pedidos" label="Revisar pedidos" helper="Estado y detalle" icon={ShoppingBag} primary />
          <QuickAction href="/admin/productos" label="Productos" helper="Stock y publicación" icon={Package} />
          <QuickAction href="/admin/promos" label="Promos" helper="Altas y pausas" icon={Megaphone} />
          <QuickAction href="/admin/clientes" label="Clientes" helper="Contacto rápido" icon={Users} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Últimos pedidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {typedOrders.map((order) => (
              <div key={order.id} className="admin-soft-panel flex flex-col gap-3 rounded-[22px] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-foreground">{order.code}</p>
                  <p className="text-sm text-muted-foreground">{order.customer.fullName} · {order.status}</p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:block">
                  <span className="font-black text-foreground">{formatCurrency(order.totalCents)}</span>
                  <Link href={`/admin/pedidos/${order.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand">Abrir <ArrowRight className="size-4" /></Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Hoy</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <QuickInfo title="Facturación visible" value={formatCurrency(todayRevenue)} />
            <QuickInfo title="Clientes cargados" value={String(customers)} />
            <QuickInfo title="Siguiente foco" value="Pedidos nuevos y stock bajo" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <Card>
      <CardContent className="space-y-1.5 p-4 md:p-5">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-black text-foreground">{value}</p>
        <p className="text-xs uppercase tracking-[0.14em] text-brand">{helper}</p>
      </CardContent>
    </Card>
  );
}

function QuickInfo({ title, value }: { title: string; value: string }) {
  return (
    <div className="admin-soft-panel rounded-[22px] p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
      <p className="mt-2 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

function QuickAction({
  href,
  label,
  helper,
  icon: Icon,
  primary = false,
}: {
  href: string;
  label: string;
  helper: string;
  icon: typeof ShoppingBag;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={primary ? buttonVariants({ className: "h-auto w-full justify-between rounded-[22px] px-4 py-4" }) : buttonVariants({ variant: "outline", className: "h-auto w-full justify-between rounded-[22px] px-4 py-4" })}
    >
      <span className="flex items-center gap-3 text-left">
        <span className={primary ? "rounded-2xl bg-white/15 p-2" : "rounded-2xl bg-background-muted p-2 text-brand"}>
          <Icon className="size-4" />
        </span>
        <span>
          <span className="block">{label}</span>
          <span className={primary ? "block text-xs font-medium text-white/80" : "block text-xs font-medium text-muted-foreground"}>{helper}</span>
        </span>
      </span>
      <ArrowRight className="size-4 shrink-0" />
    </Link>
  );
}
