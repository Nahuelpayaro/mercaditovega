import { z } from "zod";
import { slugify } from "@/lib/utils";

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().optional().transform((value) => value?.trim() || undefined),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const productSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1),
  sku: z.string().trim().optional().or(z.literal("")),
  name: z.string().min(2),
  slug: z.string().optional().transform((value) => value?.trim() || undefined),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  priceCents: z.coerce.number().int().positive(),
  costCents: z.coerce.number().int().nonnegative().optional().nullable(),
  wholesalePriceCents: z.coerce.number().int().nonnegative().optional().nullable(),
  compareAtCents: z.coerce.number().int().positive().optional().nullable(),
  unitLabel: z.string().optional(),
  stockQuantity: z.coerce.number().nonnegative().default(0),
  minimumStockQuantity: z.coerce.number().nonnegative().default(0),
  stockMode: z.enum(["in_stock", "out_of_stock"]),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  isActive: z.boolean().default(true),
  imageUrl: z.string().url().optional().or(z.literal("")),
  imageAlt: z.string().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;

export function normalizeProductInput(input: ProductInput) {
  return {
    ...input,
    sku: input.sku || undefined,
    slug: input.slug || slugify(input.name),
    costCents: input.costCents ?? null,
    wholesalePriceCents: input.wholesalePriceCents ?? null,
    compareAtCents: input.compareAtCents ?? null,
    imageUrl: input.imageUrl || undefined,
    imageAlt: input.imageAlt || input.name,
  };
}

export function normalizeCategoryInput(input: CategoryInput) {
  return {
    ...input,
    slug: input.slug || slugify(input.name),
  };
}
