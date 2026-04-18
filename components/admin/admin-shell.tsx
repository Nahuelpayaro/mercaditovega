"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, LogOut, Megaphone, Package, ShoppingBag, Users } from "lucide-react";
import { logoutAdmin } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Resumen", icon: LayoutGrid },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/promos", label: "Promos", icon: Megaphone },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
];

function isLinkActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

export function AdminShell({ children, adminContactName }: { children: React.ReactNode; adminContactName: string }) {
  const pathname = usePathname();
  const activeLink = links.find((link) => isLinkActive(pathname, link.href));

  return (
    <div className="min-h-screen overflow-x-clip bg-[linear-gradient(180deg,#241b15_0%,#171310_100%)] text-white">
      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#171310]/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-200/70">Admin</p>
            <h1 className="truncate text-lg font-black tracking-tight">{activeLink?.label ?? "Panel"}</h1>
          </div>
          <form action={logoutAdmin}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="border-white/14 bg-white/10 text-white hover:border-white/20 hover:bg-white/14 hover:text-white"
            >
              <LogOut className="size-4" />
              Salir
            </Button>
          </form>
        </div>
      </div>

      <div className="mx-auto grid min-h-screen max-w-7xl min-w-0 gap-5 p-4 pb-28 lg:grid-cols-[248px_minmax(0,1fr)] lg:p-6 lg:pb-6">
        <aside className="surface-dark hidden rounded-[30px] border border-white/8 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.28)] lg:block">
          <div className="mb-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-200/70">Admin</p>
            <h1 className="text-2xl font-black tracking-tight">Panel Almacén</h1>
            <p className="text-sm text-white/62">Operación clara, rápida y sin ruido.</p>
          </div>
          <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {links.map((link) => {
              const isActive = isLinkActive(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                    isActive
                      ? "border-brand/35 bg-brand text-brand-foreground shadow-[0_14px_34px_rgba(214,109,49,0.22)]"
                      : "border-transparent text-white/78 hover:border-white/10 hover:bg-white/8 hover:text-white",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <link.icon className="size-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/15 p-4 text-sm text-white/72">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/70">Sesión</p>
            <p className="mt-2 font-bold text-white">{adminContactName}</p>
            <form action={logoutAdmin} className="mt-4">
              <Button type="submit" variant="outline" className="w-full border-white/14 bg-white/10 text-white hover:border-white/20 hover:bg-white/14 hover:text-white">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </aside>
        <main className="min-w-0 overflow-x-clip rounded-[28px] bg-[linear-gradient(180deg,rgba(255,250,244,0.98),rgba(255,245,236,0.96))] p-4 text-foreground shadow-[0_22px_60px_rgba(0,0,0,0.18)] lg:rounded-[32px] lg:p-6">
          {children}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 w-full max-w-[100vw] overflow-x-hidden border-t border-white/10 bg-[#171310]/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-18px_40px_rgba(0,0,0,0.32)] backdrop-blur lg:hidden">
        <div className="grid w-full max-w-[100vw] grid-cols-5 gap-1 overflow-x-hidden">
          {links.map((link) => {
            const isActive = isLinkActive(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2 text-center text-[11px] font-semibold transition",
                  isActive
                    ? "border-brand/30 bg-brand text-brand-foreground shadow-[0_12px_24px_rgba(214,109,49,0.22)]"
                    : "border-transparent text-white/74 hover:border-white/12 hover:bg-white/8 hover:text-white",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <link.icon className="size-4" />
                <span className="min-w-0 truncate leading-none">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
