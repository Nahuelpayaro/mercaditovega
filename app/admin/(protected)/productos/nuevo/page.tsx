import { ProductForm } from "@/app/admin/productos/product-form";
import { db } from "@/lib/db";

export default async function NewProductPage() {
  const categories = await db.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  return <ProductForm categories={categories} />;
}
