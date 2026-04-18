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
    compareAtCents?: number | null;
    stockMode?: "in_stock" | "out_of_stock";
    category: { id: string; name: string };
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
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted/30">
              <svg className="size-10 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5A.75.75 0 0121 3.75v16.5a.75.75 0 01-.75.75H3.75A.75.75 0 013 20.25V3.75A.75.75 0 013.75 3z" />
              </svg>
            </div>
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
              {product.compareAtCents && product.compareAtCents > product.priceCents ? (
                <p className="text-xs text-muted-foreground line-through">{formatCurrency(product.compareAtCents)}</p>
              ) : null}
              <p className="text-lg font-black text-foreground">{formatCurrency(product.priceCents)}</p>
            </div>
          </div>
          <AddToCartButton
            compact
              product={{
                id: product.id,
                categoryId: product.category.id,
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
