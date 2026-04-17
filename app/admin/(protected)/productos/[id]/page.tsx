import { notFound } from "next/navigation";
import { ProductForm } from "@/app/admin/productos/product-form";
import { ParamsAndSearchPageProps } from "@/lib/next-page-props";
import { db } from "@/lib/db";

type EditProductPageProps = ParamsAndSearchPageProps<{ id: string }, { statusError?: string; statusSuccess?: string }>;

export default async function EditProductPage({ params, searchParams }: EditProductPageProps) {
  const { id } = await params;
  const { statusError, statusSuccess } = await searchParams;
  const [product, categories] = await Promise.all([
    db.product.findUnique({ include: { images: true }, where: { id } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return <ProductForm categories={categories} product={product} statusError={statusError} statusSuccess={statusSuccess} />;
}
