import React from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { SearchPageProps } from "@/lib/next-page-props";
import { searchProducts } from "@/lib/storefront";

type SearchProduct = Parameters<typeof ProductCard>[0]["product"];
type StorefrontSearchPageProps = SearchPageProps<{ q?: string }>;

export default async function SearchPage({ searchParams }: StorefrontSearchPageProps) {
  const { q = "" } = await searchParams;
  const products: SearchProduct[] = q ? await searchProducts(q) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Búsqueda"
        title="Encontrá productos sin perder tiempo"
        description="Buscá por nombre o descripción. Si no aparece, podés volver al inicio y entrar por categorías."
      />

      <form className="section-shell flex gap-2 rounded-[28px] p-3 md:p-4">
        <Input name="q" defaultValue={q} placeholder="Yerba, galletitas, limpieza..." className="border-0 bg-transparent shadow-none" />
      </form>

      {q && !products.length ? (
        <EmptyState
          icon={<SearchX className="size-6" />}
          title={`No encontramos productos para “${q}”.`}
          description="Probá con otra palabra, buscá por categoría o volvé al catálogo principal para seguir comprando."
          action={<Link href="/" className={buttonVariants({ variant: "outline" })}>Volver al inicio</Link>}
        />
      ) : null}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
