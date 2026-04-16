"use client";

import { useActionState, useMemo, useState } from "react";
import { useCart } from "@/components/storefront/cart-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { submitCheckout, type CheckoutActionState } from "@/app/(storefront)/checkout/actions";

const initialState: CheckoutActionState = { status: "idle" };

export function CheckoutForm({}: Record<string, never>) {
  const { items, promoCode, subtotalCents } = useCart();
  const [state, formAction, pending] = useActionState(submitCheckout, initialState);
  const [fulfillmentType, setFulfillmentType] = useState<"delivery" | "pickup">("delivery");
  const itemCount = useMemo(() => items.reduce((total, item) => total + item.quantity, 0), [items]);

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
      <Card>
        <CardContent className="grid gap-5 p-5 md:p-6">
          <input type="hidden" name="items" value={JSON.stringify(items)} />
          <input type="hidden" name="promoCode" value={promoCode ?? ""} />

          <div>
            <Label htmlFor="fullName">Nombre y apellido</Label>
            <Input id="fullName" name="fullName" required placeholder="Ej: María González" />
            <FieldError value={state.errors?.fullName} />
          </div>
          <div>
            <Label htmlFor="email">Email (opcional)</Label>
            <Input id="email" name="email" type="email" placeholder="maria@gmail.com" />
          </div>
          <div>
            <Label htmlFor="fulfillmentType">¿Cómo querés recibirlo?</Label>
            <Select id="fulfillmentType" name="fulfillmentType" defaultValue="delivery" onChange={(event) => setFulfillmentType(event.target.value as "delivery" | "pickup")}>
              <option value="delivery">Envío</option>
              <option value="pickup">Retiro</option>
            </Select>
          </div>

          {fulfillmentType === "delivery" ? (
            <>
              <div>
                <Label htmlFor="addressLine">Dirección</Label>
                <Input id="addressLine" name="addressLine" placeholder="Calle y altura" />
                <FieldError value={state.errors?.addressLine} />
              </div>
              <div>
                <Label htmlFor="postalCode">Código postal (opcional)</Label>
                <Input id="postalCode" name="postalCode" placeholder="Ej: 1408" />
              </div>
            </>
          ) : (
            <div className="rounded-[22px] border border-success/15 bg-success/10 p-4 text-sm text-success md:col-span-2">
              Elegiste retiro. Buenísimo: no te vamos a pedir dirección ni datos extra innecesarios.
            </div>
          )}

          <div>
            <Label htmlFor="paymentMethod">Pago</Label>
            <Select id="paymentMethod" name="paymentMethod" defaultValue="cash">
              <option value="cash">Efectivo</option>
              <option value="transfer">Transferencia</option>
              <option value="mercado_pago_link">Link Mercado Pago</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" name="notes" placeholder="Aclaraciones para el pedido, timbre, referencia, etc." />
          </div>
          {state.status === "error" ? <p className="rounded-[22px] border border-destructive/15 bg-destructive/10 p-4 text-sm font-medium text-destructive">{state.message}</p> : null}
        </CardContent>
      </Card>

      <Card className="h-fit lg:sticky lg:top-28">
        <CardContent className="space-y-4 p-5">
          <div className="rounded-[22px] bg-background-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Resumen del pedido</p>
            <p className="mt-1 text-2xl font-black text-foreground">{itemCount} producto{itemCount > 1 ? "s" : ""}</p>
            <p className="text-sm text-muted-foreground">Revisá cantidades antes de confirmar.</p>
          </div>
          <div className="space-y-2 text-sm">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between gap-3 rounded-[18px] border border-border bg-white/80 px-3 py-3">
                <span>
                  {item.quantity} x {item.name}
                </span>
                <span>{formatCurrency(item.quantity * item.priceCents)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-border pt-4 text-base font-semibold">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotalCents)}</span>
          </div>
          <div className="rounded-[22px] bg-secondary p-4 text-sm text-secondary-foreground">
            Confirmás acá y recién después aparece el handoff a WhatsApp. Nada de pasos falsos.
          </div>
          <Button disabled={pending || !items.length} className="w-full" size="lg">
            {pending ? "Confirmando..." : "Confirmar pedido"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

function FieldError({ value }: { value?: string }) {
  if (!value) return null;
  return <p className="mt-1 text-xs font-medium text-destructive">{value}</p>;
}
