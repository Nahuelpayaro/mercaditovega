import Link from "next/link";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TBody, TD, TH, THead } from "@/components/ui/table";
import { db } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Pedidos" title="Listado operativo" description="Escaneá código, cliente, estado y total sin perderte en una tabla cruda." />
      <Card>
        <CardHeader>
          <CardTitle>Pedidos</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
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
              {orders.map((order) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
