"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number; localPreview: string }
  | { status: "success" }
  | { status: "error"; message: string };

function uploadFile(
  file: File,
  productName: string,
  onProgress: (p: number) => void,
): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("productName", productName);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 90));
      }
    };

    xhr.onload = () => {
      try {
        const payload = JSON.parse(xhr.responseText) as {
          url?: string;
          message?: string;
        };
        if (xhr.status >= 200 && xhr.status < 300 && payload.url) {
          resolve({ url: payload.url });
        } else {
          reject(new Error(payload.message ?? "No se pudo subir la imagen."));
        }
      } catch {
        reject(new Error("Respuesta inesperada del servidor."));
      }
    };

    xhr.onerror = () => reject(new Error("Error de red al subir la imagen."));
    xhr.open("POST", "/api/uploads");
    xhr.send(formData);
  });
}

export function ProductImageFields({
  initialImageUrl,
  initialProductName,
}: {
  initialImageUrl?: string;
  initialProductName?: string;
}) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl ?? "");
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });

  const imageChanged = imageUrl !== (initialImageUrl ?? "");

  const previewUrl =
    uploadState.status === "uploading"
      ? uploadState.localPreview
      : imageUrl.trim();

  async function handleFileUpload(file: File | undefined) {
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setUploadState({ status: "uploading", progress: 0, localPreview });

    const productName =
      (document.getElementById("name") as HTMLInputElement | null)?.value ??
      initialProductName ??
      "";

    try {
      const { url } = await uploadFile(file, productName, (progress) => {
        setUploadState((prev) =>
          prev.status === "uploading" ? { ...prev, progress } : prev,
        );
      });

      URL.revokeObjectURL(localPreview);
      setImageUrl(url);
      setUploadState({ status: "success" });
    } catch (error) {
      URL.revokeObjectURL(localPreview);
      setUploadState({
        status: "error",
        message:
          error instanceof Error ? error.message : "No se pudo subir la imagen.",
      });
    }
  }

  function handleClear() {
    setImageUrl("");
    setUploadState({ status: "idle" });
  }

  return (
    <div className="space-y-4 md:col-span-2">
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="imageChanged" value={imageChanged ? "true" : "false"} />

      <div className="rounded-[24px] border border-border bg-muted/20 p-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Foto del producto</p>
          <p className="text-sm text-muted-foreground">
            Sacá o elegí una foto desde el celu, o pegá una URL directamente.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <Label htmlFor="productImageUpload">Subir foto</Label>
              <Input
                id="productImageUpload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                capture="environment"
                onChange={(e) => {
                  void handleFileUpload(e.target.files?.[0]);
                  e.currentTarget.value = "";
                }}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                JPG, PNG o WEBP · Máx. 10 MB
              </p>
            </div>

            {uploadState.status === "uploading" && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subiendo...</span>
                  <span>{uploadState.progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadState.progress}%` }}
                  />
                </div>
              </div>
            )}

            {uploadState.status === "success" && (
              <p className="text-sm text-green-700">
                Imagen lista. Guardá el producto para confirmar.
              </p>
            )}

            {uploadState.status === "error" && (
              <p className="text-sm text-red-700" role="alert">
                {uploadState.message}
              </p>
            )}

            {previewUrl && uploadState.status !== "uploading" && (
              <Button type="button" variant="outline" size="sm" onClick={handleClear}>
                Limpiar imagen
              </Button>
            )}

            <div>
              <Label htmlFor="imageUrlManual">O pegá una URL</Label>
              <Input
                id="imageUrlManual"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setUploadState({ status: "idle" });
                }}
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            {previewUrl ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Vista previa de la imagen del producto"
                  className={`h-56 w-full object-cover transition-opacity duration-300 ${
                    uploadState.status === "uploading" ? "opacity-50" : "opacity-100"
                  }`}
                />
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-border bg-background text-sm text-muted-foreground">
                La preview aparece acá
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
