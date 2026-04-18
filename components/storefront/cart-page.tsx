"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ShoppingBasket } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/storefront/cart-provider";
import { priceCart } from "@/lib/pricing/cart-pricing";
import { formatCurrency } from "@/lib/utils";

type Props = {
  promotions: {
    id: string;
    code: string;
    type: "percentage" | "fixed";
    scope: "order" | "category" | "product";
    amount: number;
    minSubtotalCents: number | null;
    startsAt: Date;
    endsAt: Date;
    isActive: boolean;
    products: { id: string }[];
    categories: { id: string }[];
  }[];
};

export function CartPage({ promotions }: Props) {
  const { items, promoCode, applyPromoCode, subtotalCents, updateQuantity, removeItem, message } = useCart();
  const [promoInput, setPromoInput] = useState(promoCode ?? "");

  const pricing = useMemo(
    () =>
      priceCart({
        items: items.map((item) => ({
          productId: item.productId,
          categoryId: item.categoryId ?? "",
          quantity: item.quantity,
          unitPriceCents: item.priceCents,
        })),
        promotions: promotions.map((promotion) => ({
          id: promotion.id,
          code: promotion.code,
          type: promotion.type,
          scope: promotion.scope,
          amount: promotion.amount,
          minSubtotalCents: promotion.minSubtotalCents,
          startsAt: new Date(promotion.startsAt),
          endsAt: new Date(promotion.endsAt),
          isActive: promotion.isActive,
          productIds: promotion.products.map((item) => item.id),
          categoryIds: promotion.categories.map((item) => item.id),
        })),
        promoCode,
      }),
    [items, promoCode, promotions],
  );

  if (!items.length) {
    return (
      <EmptyState
        icon={<ShoppingBasket className="size-6" />}
        title="Tu carrito está vacío."
        description="Cuando sumes productos, vas a ver acá el resumen con cantidades, promo y total estimado."
        action={<Link href="/" className={buttonVariants({ variant: "outline" })}>Volver al catálogo</Link>}
      />
    );
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        <div className="space-y-4">
          {message ? (
            <p className="rounded-[22px] border border-success/15 bg-success/10 p-4 text-sm font-medium text-success">
              {message}
            </p>
          ) : null}

          {items.map((item) => (
            <Card key={item.productId} className="bg-white/90">
              <CardContent className="flex gap-4 p-4">
                {item.imageUrl ? (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-muted">
                    <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
                  </div>
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-muted/40">
                    <ShoppingBasket className="size-5 text-muted-foreground/40" />
                  </div>
                )}

                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-0.5">
                    <p className="text-base font-bold text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(item.priceCents)} c/u</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                      Subtotal {formatCurrency(item.quantity * item.priceCents)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1) updateQuantity(item.productId, val);
                      }}
                      className="w-14 rounded-full border-0 bg-background-muted px-2 py-2 text-center text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      +
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeItem(item.productId)}>
                      Quitar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit bg-white/95 lg:sticky lg:top-28">
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[22px] bg-background-muted p-4">
              <p className="text-sm font-bold text-foreground">Promo</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Aplicamos una sola promo válida por pedido.
              </p>
              <div className="mt-3 flex gap-2">
                <Input
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Ej: BARRIO10"
                  className="bg-white"
                />
                <Button type="button" variant="secondary" onClick={() => applyPromoCode(promoInput)}>
                  Aplicar
                </Button>
              </div>
              {pricing.promoMessage ? (
                <p className="mt-2 text-xs font-medium text-warning">{pricing.promoMessage}</p>
              ) : null}
            </div>

            <div className="space-y-3 rounded-[22px] border border-border bg-white p-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotalCents)}</span>
              </div>
              <div className="flex justify-between">
                <span>Descuento</span>
                <span>-{formatCurrency(pricing.discountCents)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total estimado</span>
                <span>{formatCurrency(pricing.totalCents)}</span>
              </div>
            </div>

            <div className="rounded-[22px] bg-secondary p-4 text-secondary-foreground">
              <p className="text-sm font-bold">Siguiente paso</p>
              <p className="mt-1 text-sm text-secondary-foreground/80">
                Completás tus datos, revisás el resumen y confirmás por WhatsApp.
              </p>
            </div>

            <Link href="/checkout" className={buttonVariants({ className: "w-full", size: "lg" })}>
              Continuar al checkout
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Mobile floating checkout — sits above the bottom nav */}
      <div className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] z-30 flex items-center gap-3 rounded-[28px] border border-border bg-white/95 p-3 shadow-[0_18px_40px_rgba(87,52,22,0.15)] backdrop-blur lg:hidden">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">Total estimado</p>
          <p className="text-base font-black text-foreground">{formatCurrency(pricing.totalCents)}</p>
        </div>
        <Link href="/checkout" className={buttonVariants({ size: "sm", className: "shrink-0" })}>
          Ir al checkout →
        </Link>
      </div>
    </>
  );
}
