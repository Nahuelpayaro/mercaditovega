import Link from "next/link";
import { House, Search, ShoppingBasket } from "lucide-react";
import { publicEnv } from "@/lib/env";
import { CartStatus } from "@/components/storefront/cart-status";

export function StoreShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-36 md:pb-28">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 md:px-6">
          <div className="min-w-0">
            <Link href="/" className="block truncate text-lg font-black tracking-tight text-foreground md:text-xl">
              {publicEnv.NEXT_PUBLIC_STORE_NAME}
            </Link>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/buscar" className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-background-muted">
              <Search className="size-4" /> Buscar
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">{children}</main>

      <nav className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+0.35rem)] z-40 flex items-center justify-around rounded-full border border-border bg-white/95 px-3 py-2 shadow-[0_18px_40px_rgba(87,52,22,0.15)] backdrop-blur md:hidden">
        <NavLink href="/" icon={<House className="size-4" />} label="Inicio" />
        <NavLink href="/buscar" icon={<Search className="size-4" />} label="Buscar" />
        <NavLink href="/carrito" icon={<ShoppingBasket className="size-4" />} label="Carrito" />
      </nav>

      <CartStatus />
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex min-w-20 flex-col items-center gap-1 rounded-full px-2 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-background-muted hover:text-foreground">
      {icon}
      <span>{label}</span>
    </Link>
  );
}
