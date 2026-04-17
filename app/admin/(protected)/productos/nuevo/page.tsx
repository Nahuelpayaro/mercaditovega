import { ProductForm } from "@/app/admin/productos/product-form";
import { db } from "@/lib/db";
import { SearchPageProps } from "@/lib/next-page-props";

type NewProductPageProps = SearchPageProps<{ statusError?: string; statusSuccess?: string }>;

export default async function NewProductPage({ searchParams }: NewProductPageProps) {
  const { statusError, statusSuccess } = await searchParams;
  const categories = await db.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  return <ProductForm categories={categories} statusError={statusError} statusSuccess={statusSuccess} />;
}
