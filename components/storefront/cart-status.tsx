"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/storefront/cart-provider";
import { formatCurrency } from "@/lib/utils";

export function CartStatus() {
  const { itemCount, subtotalCents } = useCart();

  if (!itemCount) {
    return null;
  }

  return (
    <Link
      href="/carrito"
      className="fixed inset-x-4 bottom-20 z-50 flex items-center justify-between rounded-[24px] bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground shadow-[0_22px_45px_rgba(214,109,49,0.3)] md:bottom-6 md:left-auto md:right-6 md:w-80"
    >
      <span className="flex items-center gap-2">
        <ShoppingCart className="size-4" />
        {itemCount} producto{itemCount > 1 ? "s" : ""}
      </span>
      <span className="rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-[0.16em]">{formatCurrency(subtotalCents)}</span>
    </Link>
  );
}
