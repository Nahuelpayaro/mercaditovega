import { describe, expect, it } from "vitest";
import { buildProductImageAlt, isSupportedProductImageType, PRODUCT_IMAGE_MIME_TYPES } from "@/lib/cloudinary";

describe("cloudinary helpers", () => {
  it("accepts the configured product image mime types", () => {
    PRODUCT_IMAGE_MIME_TYPES.forEach((type) => {
      expect(isSupportedProductImageType(type)).toBe(true);
    });

    expect(isSupportedProductImageType("image/gif")).toBe(false);
  });

  it("builds alt text preferring explicit alt and then product name", () => {
    expect(buildProductImageAlt({ alt: "Foto frontal", productName: "Yerba", filename: "yerba-playadito.jpg" })).toBe("Foto frontal");
    expect(buildProductImageAlt({ alt: "   ", productName: "Yerba Playadito 1kg", filename: "yerba-playadito.jpg" })).toBe("Yerba Playadito 1kg");
    expect(buildProductImageAlt({ filename: "yerba-playadito_1kg.jpg" })).toBe("yerba playadito 1kg");
  });
});
