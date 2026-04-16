import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TBody, TD, TH, THead } from "@/components/ui/table";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const customers = await db.customer.findMany({
    include: { orders: { orderBy: { createdAt: "desc" }, take: 3 } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Clientes"
        title="Clientes guardados"
        description="Consulta rápida de contacto y últimos pedidos para responder mejor y más rápido."
      />
      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH>Nombre</TH>
                <TH>Contacto</TH>
                <TH>Últimos pedidos</TH>
              </tr>
            </THead>
            <TBody>
              {customers.map((customer) => (
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
                      {customer.orders.map((order) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
