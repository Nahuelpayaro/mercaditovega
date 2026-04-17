import { v2 as cloudinary } from "cloudinary";
import { getCloudinaryEnv } from "@/lib/env";

export const PRODUCT_IMAGE_FOLDER = "mercadito-vega/products";
export const PRODUCT_IMAGE_MAX_SIZE_BYTES = 10 * 1024 * 1024;
export const PRODUCT_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

type ProductImageMimeType = (typeof PRODUCT_IMAGE_MIME_TYPES)[number];

export type UploadedProductImage = {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  originalFilename: string;
  folder: string;
};

function configureCloudinary() {
  const env = getCloudinaryEnv();

  if (!env) {
    throw new Error("Cloudinary env vars are not configured.");
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export function isSupportedProductImageType(type: string): type is ProductImageMimeType {
  return PRODUCT_IMAGE_MIME_TYPES.includes(type as ProductImageMimeType);
}

export function buildProductImageAlt(params: { alt?: string | null; productName?: string | null; filename?: string | null }) {
  const explicitAlt = params.alt?.trim();

  if (explicitAlt) {
    return explicitAlt;
  }

  const productName = params.productName?.trim();

  if (productName) {
    return productName;
  }

  const filename = params.filename?.trim().replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");

  return filename || "Imagen del producto";
}

export async function uploadProductImage(file: File): Promise<UploadedProductImage> {
  configureCloudinary();

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: PRODUCT_IMAGE_FOLDER,
    resource_type: "image",
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    originalFilename: file.name,
    folder: PRODUCT_IMAGE_FOLDER,
  };
}
