import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { ListPagination } from "@/components/storefront/list-pagination";
import { ProductCard } from "@/components/storefront/product-card";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { publicEnv } from "@/lib/env";
import { SearchPageProps } from "@/lib/next-page-props";
import { searchProducts, STOREFRONT_PRODUCTS_PER_PAGE, STOREFRONT_SEARCH_MIN_QUERY_LENGTH } from "@/lib/storefront";

type SearchProduct = Parameters<typeof ProductCard>[0]["product"];
type StorefrontSearchPageProps = SearchPageProps<{ page?: string; q?: string }>;

export const revalidate = 120;

export async function generateMetadata({ searchParams }: StorefrontSearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const storeName = publicEnv.NEXT_PUBLIC_STORE_NAME;

  if (!q?.trim()) {
    return {
      title: "Buscar productos",
      description: `Buscá por nombre o descripción entre todos los productos de ${storeName}.`,
    };
  }

  const query = q.trim();
  return {
    title: `Resultados para "${query}"`,
    description: `Encontrá "${query}" entre todos los productos disponibles en ${storeName}.`,
  };
}

function parsePage(value?: string) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function buildSearchHref(query: string, page: number) {
  const searchParams = new URLSearchParams();

  if (query) {
    searchParams.set("q", query);
  }

  if (page > 1) {
    searchParams.set("page", page.toString());
  }

  const serialized = searchParams.toString();
  return `/buscar${serialized ? `?${serialized}` : ""}`;
}

export default async function SearchPage({ searchParams }: StorefrontSearchPageProps) {
  const { q: rawQuery = "", page: rawPage } = await searchParams;
  const page = parsePage(rawPage);
  const result = rawQuery
    ? await searchProducts(rawQuery, page)
    : { products: [], totalProducts: 0, normalizedQuery: "", currentPage: 1, totalPages: 1 };
  const { products, totalProducts, normalizedQuery } = result;
  const currentPage = result.currentPage ?? 1;
  const totalPages = result.totalPages ?? 1;
  const typedProducts: SearchProduct[] = products;
  const listStart = totalProducts === 0 ? 0 : (currentPage - 1) * STOREFRONT_PRODUCTS_PER_PAGE + 1;
  const listEnd = totalProducts === 0 ? 0 : listStart + typedProducts.length - 1;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Búsqueda"
        title="Encontrá productos sin perder tiempo"
        description="Buscá por nombre o descripción. Si no aparece, podés volver al inicio y entrar por categorías."
      />

      <form className="section-shell flex gap-2 rounded-[28px] p-3 md:p-4">
        <Input name="q" defaultValue={normalizedQuery} placeholder="Yerba, galletitas, limpieza..." className="border-0 bg-transparent shadow-none" />
      </form>

      {normalizedQuery && normalizedQuery.length < STOREFRONT_SEARCH_MIN_QUERY_LENGTH ? (
        <div className="rounded-[24px] border border-border bg-white/80 p-4 text-sm text-muted-foreground">
          Escribí al menos {STOREFRONT_SEARCH_MIN_QUERY_LENGTH} letras para buscar sin castigar la base al divino botón.
        </div>
      ) : null}

      {normalizedQuery && totalProducts > 0 ? (
        <div className="rounded-[24px] border border-border bg-white/80 p-4 text-sm text-muted-foreground">
          Mostrando {listStart}-{listEnd} de {totalProducts} resultados para <span className="font-semibold text-foreground">“{normalizedQuery}”</span>.
        </div>
      ) : null}

      {normalizedQuery && !typedProducts.length && normalizedQuery.length >= STOREFRONT_SEARCH_MIN_QUERY_LENGTH ? (
        <EmptyState
          icon={<SearchX className="size-6" />}
          title={`No encontramos productos para “${normalizedQuery}”.`}
          description="Probá con otra palabra, buscá por categoría o volvé al catálogo principal para seguir comprando."
          action={<Link href="/" className={buttonVariants({ variant: "outline" })}>Volver al inicio</Link>}
        />
      ) : null}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {typedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <ListPagination
        currentPage={currentPage}
        totalPages={totalPages}
        previousHref={currentPage > 1 ? buildSearchHref(normalizedQuery, currentPage - 1) : undefined}
        nextHref={currentPage < totalPages ? buildSearchHref(normalizedQuery, currentPage + 1) : undefined}
        summary={`Resultados paginados de a ${STOREFRONT_PRODUCTS_PER_PAGE} productos para mantener la búsqueda rápida en SSR.`}
      />
    </div>
  );
}
