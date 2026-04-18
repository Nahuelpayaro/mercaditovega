import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { getHomeData } from "@/lib/storefront";

export const revalidate = 120;

type HomeData = Awaited<ReturnType<typeof getHomeData>>;
type HomeCategory = HomeData["categories"][number];
type HomePromotion = HomeData["promotions"][number];
type HomeProduct = Parameters<typeof ProductCard>[0]["product"];

export default async function HomePage() {
  const { categories, products, promotions } = await getHomeData();
  const typedCategories: HomeCategory[] = categories;
  const typedProducts: HomeProduct[] = products;
  const typedPromotions: HomePromotion[] = promotions;

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="section-shell overflow-hidden rounded-[32px] p-6 md:p-8">
        <div className="space-y-5">
          <div className="space-y-3">
            <h1 className="max-w-2xl text-4xl font-black tracking-tight text-foreground md:text-5xl">
              Productos para tu compra de hoy.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
              Buscá, elegí y agregá al carrito sin vueltas.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="#destacados" className={buttonVariants({ size: "lg" })}>
              Ver productos <ArrowRight className="size-4" />
            </Link>
            <Link href="/buscar" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Buscar
            </Link>
          </div>
        </div>
      </section>

      {typedPromotions.length > 0 ? (
        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Promociones</p>
            <h2 className="text-2xl font-black tracking-tight text-foreground">Combos para hoy</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {typedPromotions.map((promotion) => (
              <Card key={promotion.id} className="overflow-hidden border-transparent bg-[linear-gradient(135deg,#d66d31_0%,#bf541b_100%)] text-brand-foreground">
                <CardContent className="space-y-3 p-5 md:p-6">
                  <Badge className="w-fit border-white/20 bg-white/15 text-white">Combo sugerido</Badge>
                  <div>
                    <p className="text-2xl font-black">{promotion.name}</p>
                    <p className="mt-2 text-sm leading-6 text-white/80">{promotion.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Categorías</p>
            <h2 className="text-2xl font-black tracking-tight text-foreground">Explorá por categoría</h2>
          </div>
          <Link href="/buscar" className="text-sm font-semibold text-brand">
            Buscar
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {typedCategories.map((category) => (
            <Link key={category.id} href={`/categoria/${category.slug}`} className="whitespace-nowrap rounded-full border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground shadow-[0_10px_24px_rgba(87,52,22,0.06)] transition hover:-translate-y-0.5 hover:bg-background-muted">
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section id="destacados" className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Catálogo</p>
          <h2 className="text-2xl font-black tracking-tight text-foreground">Productos destacados</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
          {typedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
