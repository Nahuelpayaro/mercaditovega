import { CartPage } from "@/components/storefront/cart-page";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { getActivePromotions } from "@/lib/storefront";

export default async function CartRoute() {
  const [promotions, products] = await Promise.all([
    getActivePromotions(),
    db.product.findMany({ select: { id: true, categoryId: true } }),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Carrito" title="Tu pedido en curso" description="Se guarda en este dispositivo para que sigas después, sin volver a empezar." />
      <CartPage promotions={promotions} productCategories={Object.fromEntries(products.map((item) => [item.id, item.categoryId]))} />
    </div>
  );
}
