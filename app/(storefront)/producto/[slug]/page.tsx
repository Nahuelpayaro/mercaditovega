import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { ProductImageGallery } from "@/components/storefront/product-image-gallery";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { publicEnv } from "@/lib/env";
import { ParamsPageProps } from "@/lib/next-page-props";
import { getProductBySlug } from "@/lib/storefront";
import { formatCurrency } from "@/lib/utils";

type ProductPageProps = ParamsPageProps<{ slug: string }>;

export const revalidate = 120;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return {};

  const storeName = publicEnv.NEXT_PUBLIC_STORE_NAME;
  const description =
    product.shortDescription ??
    product.description ??
    `${formatCurrency(product.priceCents)} · Disponible en ${storeName}.`;
  const image = product.images[0];

  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} — ${storeName}`,
      description,
      type: "website",
      ...(image ? { images: [{ url: image.url, alt: image.alt }] } : {}),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.isActive) notFound();

  return (
    <div className="space-y-5">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Volver al catálogo
      </Link>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <ProductImageGallery images={product.images} />
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{product.category.name}</Badge>
            <Badge className={product.stockMode === "in_stock" ? "border-success/15 bg-success/10 text-success" : "border-destructive/15 bg-destructive/10 text-destructive"}>
              {product.stockMode === "in_stock" ? "Listo para sumar" : "Sin stock"}
            </Badge>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">{product.name}</h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground">{product.description}</p>
          </div>
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Precio</p>
                  {product.compareAtCents && product.compareAtCents > product.priceCents ? (
                    <p className="text-sm text-muted-foreground line-through">{formatCurrency(product.compareAtCents)}</p>
                  ) : null}
                  <p className="text-3xl font-black text-foreground">{formatCurrency(product.priceCents)}</p>
                </div>
                <p className="max-w-32 text-right text-xs text-muted-foreground">Compra simple, total claro y confirmación por WhatsApp.</p>
              </div>
              <AddToCartButton
                product={{
                  id: product.id,
                  categoryId: product.category.id,
                  slug: product.slug,
                  name: product.name,
                  priceCents: product.priceCents,
                  imageUrl: product.images[0]?.url,
                  isAvailable: product.stockMode === "in_stock",
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
