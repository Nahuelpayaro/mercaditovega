import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { dbMock } = vi.hoisted(() => ({
  dbMock: {
    promotion: {
      findMany: vi.fn(async () => [
        {
          id: "promo-1",
          code: "BARRIO10",
          name: "Descuento de barrio",
          type: "percentage",
          isActive: true,
          startsAt: new Date("2026-01-01T00:00:00.000Z"),
          endsAt: new Date("2026-12-31T23:59:59.000Z"),
        },
        {
          id: "promo-2",
          code: "FINDE",
          name: "Promo programada",
          type: "fixed",
          isActive: true,
          startsAt: new Date("2099-01-01T00:00:00.000Z"),
          endsAt: new Date("2099-01-31T23:59:59.000Z"),
        },
        {
          id: "promo-3",
          code: "PAUSA",
          name: "Promo pausada",
          type: "percentage",
          isActive: false,
          startsAt: new Date("2026-01-01T00:00:00.000Z"),
          endsAt: new Date("2026-12-31T23:59:59.000Z"),
        },
      ]),
    },
  },
}));

vi.mock("@/lib/db", () => ({ db: dbMock }));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import AdminPromotionsPage from "@/app/admin/(protected)/promos/page";

describe("AdminPromotionsPage", () => {
  it("clarifies promo management and visibility from admin", async () => {
    const markup = renderToStaticMarkup(await AdminPromotionsPage());

    expect(markup).toContain("Promos visibles en home");
    expect(markup).toContain("Promos activas");
    expect(markup).toContain("Promos programadas");
    expect(markup).toContain("Lo que esté activo y vigente aparece en home");
    expect(markup).toContain("Visible en home");
    expect(markup).toContain("No visible en home");
    expect(markup).toContain("/admin/promos/nuevo");
  });
});
