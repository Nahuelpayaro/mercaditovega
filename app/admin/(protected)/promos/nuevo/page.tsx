import { PromotionForm } from "@/app/admin/promos/promotion-form";
import { db } from "@/lib/db";

export default async function NewPromoPage() {
  const [products, categories] = await Promise.all([
    db.product.findMany({ orderBy: { name: "asc" } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <PromotionForm products={products} categories={categories} />;
}
