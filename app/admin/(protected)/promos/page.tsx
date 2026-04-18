import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TBody, TD, TH, THead } from "@/components/ui/table";
import { db } from "@/lib/db";

type PromotionRow = {
  id: string;
  code: string;
  name: string;
  type: string;
  isActive: boolean;
  startsAt: Date;
  endsAt: Date;
};

export default async function AdminPromotionsPage() {
  const promos = await db.promotion.findMany({
    orderBy: { startsAt: "desc" },
    select: {
      id: true,
      code: true,
      name: true,
      type: true,
      isActive: true,
      startsAt: true,
      endsAt: true,
    },
  });
  const typedPromos: PromotionRow[] = promos;
  const now = new Date();
  const activePromos = typedPromos.filter((promo) => promo.isActive).length;
  const scheduledPromos = typedPromos.filter((promo) => promo.startsAt > now).length;
  const homeVisiblePromos = typedPromos.filter((promo) => promo.isActive && promo.startsAt <= now && promo.endsAt >= now).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Promociones"
        title="Promos"
        description="Cargá, pausá y revisá promos activas sin ruido extra."
        actions={<Link href="/admin/promos/nuevo" className={buttonVariants({ className: "w-full sm:w-auto" })}>Nueva promo</Link>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard title="Promos visibles en home" value={String(homeVisiblePromos)} helper="se muestran ahora" />
        <MetricCard title="Promos activas" value={String(activePromos)} helper="listas para aplicar" />
        <MetricCard title="Promos programadas" value={String(scheduledPromos)} helper="arrancan después" />
      </div>

      <div className="admin-section-note rounded-[22px] px-4 py-3 text-sm text-muted-foreground">
        Lo que esté activo y vigente aparece en home. Si no está en rango, no se muestra.
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Listado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 overflow-x-auto">
          {typedPromos.length > 0 ? (
            <>
              <div className="grid gap-3 md:hidden">
                {typedPromos.map((promo) => {
                  const isVisibleInHome = promo.isActive && promo.startsAt <= now && promo.endsAt >= now;

                  return (
                    <article key={promo.id} className="admin-soft-panel rounded-[22px] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">{promo.code}</p>
                          <p className="mt-1 text-base font-bold text-foreground">{promo.name}</p>
                        </div>
                        <Badge className={promo.isActive ? "border-cyan-200 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-slate-100 text-slate-700"}>
                          {promo.isActive ? "Activa" : "Pausada"}
                        </Badge>
                      </div>
                      <div className="mt-4 grid gap-3 rounded-[20px] border border-border/70 bg-background-muted/60 p-3 text-sm">
                        <InfoRow label="Tipo" value={promo.type} />
                        <InfoRow label="Impacto" value={isVisibleInHome ? "Visible en home" : "No visible en home"} />
                      </div>
                      <Link href={`/admin/promos/${promo.id}`} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-brand">
                        Editar promo
                      </Link>
                    </article>
                  );
                })}
              </div>

              <div className="hidden md:block">
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
                {typedPromos.map((promo) => {
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
              </div>
            </>
          ) : (
            <div className="rounded-[24px] border border-dashed border-border bg-background-muted/70 p-5">
              <p className="font-semibold text-foreground">Todavía no hay promos cargadas.</p>
              <p className="mt-1 text-sm text-muted-foreground">Cuando crees una promo activa y vigente, desde acá mismo pasa a quedar disponible para home y checkout.</p>
              <Link href="/admin/promos/nuevo" className={buttonVariants({ className: "mt-4 w-full sm:w-auto" })}>
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
      <CardContent className="space-y-1.5 p-4 md:p-5">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-black text-foreground">{value}</p>
        <p className="text-xs uppercase tracking-[0.14em] text-brand">{helper}</p>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold text-foreground">{value}</span>
    </div>
  );
}
