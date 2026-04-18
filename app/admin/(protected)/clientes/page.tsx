import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TBody, TD, TH, THead } from "@/components/ui/table";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

async function getAdminCustomers() {
  return db.customer.findMany({
    include: { orders: { orderBy: { createdAt: "desc" }, take: 3 } },
    orderBy: { updatedAt: "desc" },
  });
}

type CustomersPageData = Awaited<ReturnType<typeof getAdminCustomers>>;
type CustomerRow = CustomersPageData[number];
type CustomerOrderRow = CustomerRow["orders"][number];

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();
  const typedCustomers: CustomerRow[] = customers;
  const customersWithPhone = typedCustomers.filter((customer) => Boolean(customer.phone)).length;
  const customersWithRecentOrders = typedCustomers.filter((customer) => (customer.orders as CustomerOrderRow[]).length > 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Clientes"
        title="Clientes"
        description="Contacto claro y últimos movimientos en una sola vista."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Clientes" value={String(typedCustomers.length)} />
        <StatCard label="Con teléfono" value={String(customersWithPhone)} />
        <StatCard label="Con pedidos recientes" value={String(customersWithRecentOrders)} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Clientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 overflow-x-auto">
          <div className="grid gap-3 md:hidden">
            {typedCustomers.map((customer) => (
              <article key={customer.id} className="admin-soft-panel rounded-[22px] p-4">
                <p className="text-base font-bold text-foreground">{customer.fullName}</p>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="font-medium text-foreground">{customer.phone ?? "No informado"}</p>
                  <p className="text-muted-foreground">{customer.email ?? "Sin email"}</p>
                </div>
                <div className="mt-4 rounded-[20px] border border-border/70 bg-background-muted/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Últimos pedidos</p>
                  <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                    {(customer.orders as CustomerOrderRow[]).length ? (
                      (customer.orders as CustomerOrderRow[]).map((order) => (
                        <p key={order.id}>
                          <span className="font-semibold text-foreground">{order.code}</span> · {order.status} · {formatDateTime(order.createdAt)}
                        </p>
                      ))
                    ) : (
                      <p>Sin pedidos recientes.</p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden md:block">
            <Table>
            <THead>
              <tr>
                <TH>Nombre</TH>
                <TH>Contacto</TH>
                <TH>Últimos pedidos</TH>
              </tr>
            </THead>
            <TBody>
              {typedCustomers.map((customer) => (
                <tr key={customer.id}>
                  <TD>{customer.fullName}</TD>
                  <TD>
                    <div>
                      <p>{customer.phone ?? "No informado"}</p>
                      <p className="text-xs text-muted-foreground">{customer.email ?? "Sin email"}</p>
                    </div>
                  </TD>
                  <TD>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {(customer.orders as CustomerOrderRow[]).map((order) => (
                        <p key={order.id}>
                          {order.code} · {order.status} · {formatDateTime(order.createdAt)}
                        </p>
                      ))}
                    </div>
                  </TD>
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-section-note rounded-[22px] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-black text-foreground">{value}</p>
    </div>
  );
}
