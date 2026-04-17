import { beforeEach, describe, expect, it, vi } from "vitest";

const { hasCloudinaryEnvMock, uploadProductImageMock } = vi.hoisted(() => ({
  hasCloudinaryEnvMock: vi.fn(),
  uploadProductImageMock: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  hasCloudinaryEnv: hasCloudinaryEnvMock,
}));

vi.mock("@/lib/cloudinary", () => ({
  PRODUCT_IMAGE_MAX_SIZE_BYTES: 10 * 1024 * 1024,
  PRODUCT_IMAGE_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"],
  isSupportedProductImageType: (type: string) => ["image/jpeg", "image/png", "image/webp"].includes(type),
  buildProductImageAlt: ({ alt, productName, filename }: { alt?: string; productName?: string; filename?: string }) => alt || productName || filename || "Imagen del producto",
  uploadProductImage: uploadProductImageMock,
}));

import { POST } from "@/app/api/uploads/route";

describe("POST /api/uploads", () => {
  beforeEach(() => {
    hasCloudinaryEnvMock.mockReset();
    uploadProductImageMock.mockReset();
    hasCloudinaryEnvMock.mockReturnValue(true);
  });

  it("rejects requests when Cloudinary env vars are missing", async () => {
    hasCloudinaryEnvMock.mockReturnValue(false);

    const response = await POST(new Request("http://localhost/api/uploads", { method: "POST", body: new FormData() }));

    expect(response.status).toBe(503);
  });

  it("rejects unsupported image types", async () => {
    const formData = new FormData();
    formData.set("file", new File([new Uint8Array([1, 2, 3])], "producto.gif", { type: "image/gif" }));

    const response = await POST(new Request("http://localhost/api/uploads", { method: "POST", body: formData }));
    const payload = await response.json();

    expect(response.status).toBe(415);
    expect(payload.message).toContain("Formato no soportado");
  });

  it("returns the uploaded image metadata", async () => {
    uploadProductImageMock.mockResolvedValue({
      url: "https://res.cloudinary.com/demo/image/upload/v1/mercadito-vega/products/yerba.jpg",
      publicId: "mercadito-vega/products/yerba",
      width: 800,
      height: 800,
      format: "jpg",
      bytes: 12345,
      originalFilename: "yerba.jpg",
      folder: "mercadito-vega/products",
    });

    const formData = new FormData();
    formData.set("file", new File([new Uint8Array([1, 2, 3])], "yerba.jpg", { type: "image/jpeg" }));
    formData.set("productName", "Yerba Playadito 1kg");

    const response = await POST(new Request("http://localhost/api/uploads", { method: "POST", body: formData }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.url).toBe("https://res.cloudinary.com/demo/image/upload/v1/mercadito-vega/products/yerba.jpg");
    expect(payload.alt).toBe("Yerba Playadito 1kg");
    expect(uploadProductImageMock).toHaveBeenCalledOnce();
  });
});
