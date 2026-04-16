import Link from "next/link";
import { LayoutGrid, Megaphone, Package, ShoppingBag, Users } from "lucide-react";
import { logoutAdmin } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import { serverEnv } from "@/lib/env";

const links = [
  { href: "/admin", label: "Resumen", icon: LayoutGrid },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/promos", label: "Promos", icon: Megaphone },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#201915_0%,#171310_100%)] text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 p-4 lg:grid-cols-[260px_1fr] lg:p-6">
        <aside className="surface-dark rounded-[32px] border border-white/8 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
          <div className="mb-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-200/75">Operación diaria</p>
            <h1 className="text-2xl font-black tracking-tight">Panel Almacén</h1>
            <p className="text-sm text-white/65">Todo lo necesario para vender, responder y mantener el catálogo prolijo.</p>
          </div>
          <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/78 transition hover:bg-white/8 hover:text-white">
                <link.icon className="size-4" />
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 rounded-[24px] bg-white/6 p-4 text-sm text-white/70">
            <p className="font-bold text-white">Objetivo del panel</p>
            <p className="mt-1 leading-6">Escaneabilidad primero: menos tablas crudas, más contexto útil para decidir rápido.</p>
          </div>
          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/15 p-4 text-sm text-white/72">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/70">Sesión activa</p>
            <p className="mt-2 font-bold text-white">{serverEnv.ADMIN_CONTACT_NAME}</p>
            <form action={logoutAdmin} className="mt-4">
              <Button type="submit" variant="outline" className="w-full border-white/12 bg-white/8 text-white hover:bg-white/12 hover:text-white">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </aside>
        <main className="rounded-[32px] bg-[linear-gradient(180deg,rgba(255,250,244,0.97),rgba(255,245,236,0.96))] p-5 text-foreground shadow-[0_22px_60px_rgba(0,0,0,0.18)] lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
