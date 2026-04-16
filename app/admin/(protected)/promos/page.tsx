import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TBody, TD, TH, THead } from "@/components/ui/table";
import { db } from "@/lib/db";

export default async function AdminPromotionsPage() {
  const promos = await db.promotion.findMany({ orderBy: { startsAt: "desc" } });
  const now = new Date();
  const activePromos = promos.filter((promo) => promo.isActive).length;
  const scheduledPromos = promos.filter((promo) => promo.startsAt > now).length;
  const homeVisiblePromos = promos.filter((promo) => promo.isActive && promo.startsAt <= now && promo.endsAt >= now).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Promociones"
        title="Promos"
        description="Gestioná desde acá las promos que impactan home, carrito y checkout, sin cambiar el modelo ni agregar reglas raras."
        actions={<Link href="/admin/promos/nuevo" className={buttonVariants()}>Nueva promo</Link>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Promos visibles en home" value={String(homeVisiblePromos)} helper="Activas y dentro de vigencia ahora" />
        <MetricCard title="Promos activas" value={String(activePromos)} helper="Listas para aplicar si cumplen vigencia" />
        <MetricCard title="Promos programadas" value={String(scheduledPromos)} helper="Ya cargadas para próximas fechas" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cómo se publica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Lo que esté activo y vigente aparece en home. Si no hay promos activas en ese rango, home no muestra la sección.</p>
          <p>Usá esta vista para crear, pausar o editar promos sin tocar el comportamiento actual del checkout.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 overflow-x-auto">
          {promos.length > 0 ? (
            <Table>
              <THead>
                <tr>
                  <TH>Código</TH>
                  <TH>Nombre</TH>
                  <TH>Tipo</TH>
                  <TH>Estado</TH>
                  <TH>Impacto</TH>
                  <TH></TH>
                </tr>
              </THead>
              <TBody>
                {promos.map((promo) => {
                  const isVisibleInHome = promo.isActive && promo.startsAt <= now && promo.endsAt >= now;

                  return (
                    <tr key={promo.id}>
                      <TD>{promo.code}</TD>
                      <TD>{promo.name}</TD>
                      <TD>{promo.type}</TD>
                      <TD>
                        <Badge className={promo.isActive ? "border-cyan-200 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-slate-100 text-slate-700"}>
                          {promo.isActive ? "Activa" : "Pausada"}
                        </Badge>
                      </TD>
                      <TD>{isVisibleInHome ? "Visible en home" : "No visible en home"}</TD>
                      <TD>
                        <Link href={`/admin/promos/${promo.id}`} className="font-semibold text-brand">
                          Editar
                        </Link>
                      </TD>
                    </tr>
                  );
                })}
              </TBody>
            </Table>
          ) : (
            <div className="rounded-[24px] border border-dashed border-border bg-background-muted/70 p-5">
              <p className="font-semibold text-foreground">Todavía no hay promos cargadas.</p>
              <p className="mt-1 text-sm text-muted-foreground">Cuando crees una promo activa y vigente, desde acá mismo pasa a quedar disponible para home y checkout.</p>
              <Link href="/admin/promos/nuevo" className={buttonVariants({ className: "mt-4" })}>
                Crear primera promo
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
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
