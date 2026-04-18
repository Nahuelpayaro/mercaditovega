import { CartPage } from "@/components/storefront/cart-page";
import { PageHeader } from "@/components/ui/page-header";
import { getActivePromotions } from "@/lib/storefront";

export const revalidate = 120;

export default async function CartRoute() {
  const promotions = await getActivePromotions();

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Carrito" title="Tu pedido en curso" description="Se guarda en este dispositivo para que sigas después, sin volver a empezar." />
      <CartPage promotions={promotions} />
    </div>
  );
}
