import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { formatCurrency } from "@/lib/utils";

type ProductCardProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    shortDescription: string | null;
    priceCents: number;
    stockMode?: "in_stock" | "out_of_stock";
    category: { name: string };
    images: { url: string; alt: string }[];
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0];
  const available = product.stockMode !== "out_of_stock";

  return (
    <Card className="group overflow-hidden border-white/60 bg-white/92 transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(87,52,22,0.12)]">
      <Link href={`/producto/${product.slug}`}>
        <div className="relative aspect-square bg-background-muted">
          {image ? (
            <Image src={image.url} alt={image.alt} fill className="object-cover transition duration-300 group-hover:scale-[1.03]" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sin imagen</div>
          )}
          <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
            <Badge className="px-2 py-0.5 text-[10px]">{product.category.name}</Badge>
            <Badge className={`px-2 py-0.5 text-[10px] ${available ? "border-success/15 bg-success/10 text-success" : "border-destructive/15 bg-destructive/10 text-destructive"}`}>
              {available ? "Disponible" : "Sin stock"}
            </Badge>
          </div>
        </div>
      </Link>
      <CardContent className="space-y-3 p-3.5">
        <div className="space-y-1.5">
          <Link href={`/producto/${product.slug}`} className="block text-sm font-bold leading-snug text-foreground md:text-[15px]">
            {product.name}
          </Link>
          <p className="line-clamp-2 min-h-9 text-xs leading-5 text-muted-foreground md:text-sm">
            {product.shortDescription || "Ideal para sumar al pedido del día sin perder tiempo."}
          </p>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Precio</p>
              <p className="text-lg font-black text-foreground">{formatCurrency(product.priceCents)}</p>
            </div>
          </div>
          <AddToCartButton
            compact
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              priceCents: product.priceCents,
              imageUrl: image?.url,
              isAvailable: available,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
