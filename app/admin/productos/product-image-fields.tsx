"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UploadState = {
  status: "idle" | "uploading" | "success" | "error";
  message?: string;
};

export function ProductImageFields({
  initialImageUrl,
  initialImageAlt,
  initialProductName,
}: {
  initialImageUrl?: string;
  initialImageAlt?: string;
  initialProductName?: string;
}) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl ?? "");
  const [imageAlt, setImageAlt] = useState(initialImageAlt ?? "");
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });

  const previewUrl = useMemo(() => imageUrl.trim(), [imageUrl]);

  async function handleFileUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    setUploadState({ status: "uploading", message: "Subiendo imagen..." });

    const formData = new FormData();
    formData.set("file", file);
    formData.set("alt", imageAlt);
    const currentProductName = (document.getElementById("name") as HTMLInputElement | null)?.value ?? initialProductName ?? "";
    formData.set("productName", currentProductName);

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { url?: string; alt?: string; message?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.message || "No se pudo subir la imagen.");
      }

      setImageUrl(payload.url);
      setImageAlt((current) => current.trim() || payload.alt || current);
      setUploadState({ status: "success", message: "Imagen subida. Ya quedó lista para guardar el producto." });
    } catch (error) {
      setUploadState({
        status: "error",
        message: error instanceof Error ? error.message : "No se pudo subir la imagen.",
      });
    }
  }

  return (
    <div className="space-y-4 md:col-span-2">
      <div className="rounded-[24px] border border-border bg-muted/20 p-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Foto del producto</p>
          <p className="text-sm text-muted-foreground">Podés sacar/elegir una foto desde el celu o seguir pegando la URL manualmente.</p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <Label htmlFor="productImageUpload">Subir desde el celular</Label>
              <Input
                id="productImageUpload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                capture="environment"
                onChange={(event) => {
                  void handleFileUpload(event.target.files?.[0]);
                  event.currentTarget.value = "";
                }}
              />
              <p className="mt-2 text-xs text-muted-foreground">Acepta JPG, PNG o WEBP. Máximo 10 MB.</p>
            </div>

            {uploadState.status !== "idle" ? (
              <p
                className={uploadState.status === "error" ? "text-sm text-red-700" : "text-sm text-muted-foreground"}
                role={uploadState.status === "error" ? "alert" : "status"}
              >
                {uploadState.message}
              </p>
            ) : null}

            {previewUrl ? (
              <Button type="button" variant="outline" onClick={() => setImageUrl("")}>
                Limpiar imagen
              </Button>
            ) : null}
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="imageUrl">Imagen URL</Label>
              <Input id="imageUrl" name="imageUrl" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="imageAlt">Alt imagen</Label>
              <Input id="imageAlt" name="imageAlt" value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} placeholder="Descripción breve de la foto" />
            </div>

            {previewUrl ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt={imageAlt || "Vista previa de la imagen del producto"} className="h-56 w-full object-cover" />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-10 text-center text-sm text-muted-foreground">
                Cuando subas o pegues una URL vas a ver la preview acá.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
