"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/components/storefront/cart-provider";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    priceCents: number;
    imageUrl?: string;
    isAvailable: boolean;
  };
  compact?: boolean;
};

export function AddToCartButton({ product, compact = false }: Props) {
  const { addItem } = useCart();

  return (
    <Button
      size={compact ? "sm" : "default"}
      className="w-full"
      disabled={!product.isAvailable}
      onClick={() =>
        addItem({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          priceCents: product.priceCents,
          imageUrl: product.imageUrl,
          quantity: 1,
          isAvailable: product.isAvailable,
        })
      }
    >
      {product.isAvailable ? "Agregar" : "No disponible"}
    </Button>
  );
}
