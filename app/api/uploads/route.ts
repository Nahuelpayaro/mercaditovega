import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      enabled: false,
      message: "MVP stub: la firma de uploads todavía no está conectada a un storage provider.",
      expectedPayload: {
        filename: "string",
        contentType: "image/jpeg | image/png | image/webp",
      },
      nextStep: "Conectar S3/R2/GCS y devolver URL firmada + URL pública.",
    },
    { status: 501 },
  );
}
