"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  categorySchema,
  normalizeCategoryInput,
  normalizeProductInput,
  productSchema,
} from "@/lib/validators/product";

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function isNonEmptyString(value: string): value is string {
  return value.length > 0;
}

function revalidateCatalogSurfaces() {
  revalidatePath("/admin/productos");
  revalidatePath("/");
  revalidatePath("/buscar");
  revalidatePath("/categoria/[slug]", "page");
  revalidatePath("/producto/[slug]", "page");
}

function getAdminProductsRedirectPath(formData: FormData) {
  const redirectTo = formData.get("redirectTo")?.toString();

  if (redirectTo?.startsWith("/admin/productos")) {
    return redirectTo;
  }

  return "/admin/productos";
}

export async function saveProduct(formData: FormData) {
  const parsed = productSchema.parse({
    id: formData.get("id") || undefined,
    categoryId: formData.get("categoryId"),
    sku: formData.get("sku") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
    shortDescription: formData.get("shortDescription") || undefined,
    priceCents: formData.get("priceCents"),
    costCents: formData.get("costCents") || undefined,
    wholesalePriceCents: formData.get("wholesalePriceCents") || undefined,
    compareAtCents: formData.get("compareAtCents") || undefined,
    unitLabel: formData.get("unitLabel") || undefined,
    stockQuantity: formData.get("stockQuantity") || 0,
    minimumStockQuantity: formData.get("minimumStockQuantity") || 0,
    stockMode: formData.get("stockMode"),
    isFeatured: parseBoolean(formData.get("isFeatured")),
    isPublished: parseBoolean(formData.get("isPublished")),
    isActive: parseBoolean(formData.get("isActive")),
    imageUrl: formData.get("imageUrl") || undefined,
    imageAlt: formData.get("imageAlt") || undefined,
  });

  const input = normalizeProductInput(parsed);

  const data = {
    categoryId: input.categoryId,
    sku: input.sku,
    name: input.name,
    slug: input.slug,
    description: input.description,
    shortDescription: input.shortDescription,
    priceCents: input.priceCents,
    costCents: input.costCents,
    wholesalePriceCents: input.wholesalePriceCents,
    compareAtCents: input.compareAtCents,
    unitLabel: input.unitLabel,
    stockQuantity: input.stockQuantity,
    minimumStockQuantity: input.minimumStockQuantity,
    stockMode: input.stockMode,
    isFeatured: input.isFeatured,
    isPublished: input.isPublished,
    isActive: input.isActive,
  };

  if (input.id) {
    await db.product.update({ where: { id: input.id }, data });

    if (input.imageUrl) {
      await db.productImage.deleteMany({ where: { productId: input.id } });
      await db.productImage.create({ data: { productId: input.id, url: input.imageUrl, alt: input.imageAlt ?? input.name } });
    }
  } else {
    const product = await db.product.create({ data });
    if (input.imageUrl) {
      await db.productImage.create({ data: { productId: product.id, url: input.imageUrl, alt: input.imageAlt ?? input.name } });
    }
  }

  revalidateCatalogSurfaces();
}

export async function setProductPublished(formData: FormData) {
  const id = formData.get("id")?.toString();
  const isPublished = parseBoolean(formData.get("isPublished"));
  const redirectTo = getAdminProductsRedirectPath(formData);

  if (!id) {
    redirect(redirectTo);
  }

  await db.product.update({
    where: { id },
    data: { isPublished },
  });

  revalidateCatalogSurfaces();
  redirect(redirectTo);
}

export async function setCategoryPublished(formData: FormData) {
  const categoryId = formData.get("categoryId")?.toString();
  const isPublished = parseBoolean(formData.get("isPublished"));
  const redirectTo = getAdminProductsRedirectPath(formData);

  if (!categoryId) {
    redirect(redirectTo);
  }

  await db.product.updateMany({
    where: { categoryId },
    data: { isPublished },
  });

  revalidateCatalogSurfaces();
  redirect(redirectTo);
}

export async function setSelectedProductsPublished(formData: FormData) {
  const productIds = Array.from(
    new Set(
      formData
        .getAll("productIds")
        .map((value) => value.toString())
        .filter(isNonEmptyString),
    ),
  );
  const isPublished = parseBoolean(formData.get("isPublished"));
  const redirectTo = getAdminProductsRedirectPath(formData);

  if (productIds.length === 0) {
    redirect(redirectTo);
  }

  await db.product.updateMany({
    where: { id: { in: productIds } },
    data: { isPublished },
  });

  revalidateCatalogSurfaces();
  redirect(redirectTo);
}

export async function deleteProduct(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;
  await db.product.delete({ where: { id } });
  revalidateCatalogSurfaces();
}

export async function saveCategory(formData: FormData) {
  const parsed = categorySchema.parse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
    isActive: parseBoolean(formData.get("isActive")),
  });

  const input = normalizeCategoryInput(parsed);

  if (input.id) {
    await db.category.update({
      where: { id: input.id },
      data: { name: input.name, slug: input.slug, description: input.description, isActive: input.isActive },
    });
  } else {
    await db.category.create({
      data: { name: input.name, slug: input.slug, description: input.description, isActive: input.isActive },
    });
  }

  revalidatePath("/admin/productos");
  revalidatePath("/");
}

export async function deleteCategory(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;
  await db.category.delete({ where: { id } });
  revalidatePath("/admin/productos");
  revalidatePath("/");
}
