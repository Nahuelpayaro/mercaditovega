import { NextResponse } from "next/server";
import {
  buildProductImageAlt,
  isSupportedProductImageType,
  PRODUCT_IMAGE_MAX_SIZE_BYTES,
  PRODUCT_IMAGE_MIME_TYPES,
  uploadProductImage,
} from "@/lib/cloudinary";
import { hasCloudinaryEnv } from "@/lib/env";

export async function POST(request: Request) {
  if (!hasCloudinaryEnv()) {
    return NextResponse.json(
      {
        enabled: false,
        message: "Faltan variables de entorno de Cloudinary para habilitar uploads.",
      },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      {
        message: "Tenés que seleccionar una imagen antes de subirla.",
      },
      { status: 400 },
    );
  }

  if (!isSupportedProductImageType(file.type)) {
    return NextResponse.json(
      {
        message: "Formato no soportado. Usá JPG, PNG o WEBP.",
        acceptedTypes: PRODUCT_IMAGE_MIME_TYPES,
      },
      { status: 415 },
    );
  }

  if (file.size > PRODUCT_IMAGE_MAX_SIZE_BYTES) {
    return NextResponse.json(
      {
        message: "La imagen es demasiado pesada para este MVP. Probá con una de hasta 10 MB.",
        maxSizeBytes: PRODUCT_IMAGE_MAX_SIZE_BYTES,
      },
      { status: 413 },
    );
  }

  try {
    const uploaded = await uploadProductImage(file);
    const alt = buildProductImageAlt({
      alt: formData.get("alt")?.toString(),
      productName: formData.get("productName")?.toString(),
      filename: file.name,
    });

    return NextResponse.json({
      enabled: true,
      ...uploaded,
      alt,
      secureUrl: uploaded.url,
    });
  } catch (error) {
    console.error("Cloudinary product upload failed", error);

    return NextResponse.json(
      {
        message: "No se pudo subir la imagen en este momento.",
      },
      { status: 500 },
    );
  }
}
