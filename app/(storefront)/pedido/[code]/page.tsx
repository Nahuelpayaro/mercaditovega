import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { OrderSuccessClient } from "@/components/storefront/order-success-client";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParamsPageProps } from "@/lib/next-page-props";
import { getOrderByCode } from "@/lib/storefront";
import { formatCurrency } from "@/lib/utils";

type OrderConfirmationPageProps = ParamsPageProps<{ code: string }>;
type OrderData = NonNullable<Awaited<ReturnType<typeof getOrderByCode>>>;
type OrderItem = OrderData["items"][number];

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { code } = await params;
  const order = await getOrderByCode(code);

  if (!order) notFound();

  const items: OrderItem[] = order.items;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <OrderSuccessClient />
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <CardTitle>Pedido confirmado</CardTitle>
              <p className="text-sm text-muted-foreground">Ya está guardado. Ahora podés seguir la conversación con el local.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[22px] bg-background-muted p-4">
            <p className="text-sm text-muted-foreground">Código</p>
            <p className="text-3xl font-black text-foreground">{order.code}</p>
          </div>
          <div className="space-y-2 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 rounded-[18px] border border-border bg-white/80 px-3 py-3">
                <span>
                  {item.quantity} x {item.productName}
                </span>
                <span>{formatCurrency(item.lineTotalCents)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-border pt-4 font-semibold">
            <span>Total</span>
            <span>{formatCurrency(order.totalCents)}</span>
          </div>
          {order.whatsappUrl ? (
            <Link href={order.whatsappUrl} target="_blank" className={buttonVariants({ className: "w-full", size: "lg" })}>
              Continuar en WhatsApp
            </Link>
          ) : null}
          <Link href="/" className={buttonVariants({ variant: "outline", className: "w-full" })}>
            Volver al inicio
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
