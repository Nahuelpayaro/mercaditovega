import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getOrderByCodeMock, notFoundMock } = vi.hoisted(() => ({
  getOrderByCodeMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

vi.mock("@/lib/storefront", () => ({ getOrderByCode: getOrderByCodeMock }));
vi.mock("@/components/storefront/order-success-client", () => ({ OrderSuccessClient: () => null }));
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import OrderConfirmationPage from "@/app/(storefront)/pedido/[code]/page";

describe("OrderConfirmationPage", () => {
  beforeEach(() => {
    getOrderByCodeMock.mockReset();
  });

  it("shows the WhatsApp CTA only after a persisted WhatsApp URL exists", async () => {
    getOrderByCodeMock.mockResolvedValue({
      code: "ALM-TEST1",
      totalCents: 5200,
      whatsappUrl: "https://wa.me/5491122334455?text=pedido",
      items: [{ id: "item-1", productName: "Yerba", quantity: 2, lineTotalCents: 5000 }],
    });

    const markup = renderToStaticMarkup(await OrderConfirmationPage({ params: Promise.resolve({ code: "ALM-TEST1" }) }));

    expect(markup).toContain("Pedido confirmado");
    expect(markup).toContain("Ya está guardado");
    expect(markup).toContain("Continuar en WhatsApp");
  });

  it("does not render the WhatsApp CTA prematurely when no handoff URL was persisted", async () => {
    getOrderByCodeMock.mockResolvedValue({
      code: "ALM-TEST1",
      totalCents: 5200,
      whatsappUrl: null,
      items: [{ id: "item-1", productName: "Yerba", quantity: 2, lineTotalCents: 5000 }],
    });

    const markup = renderToStaticMarkup(await OrderConfirmationPage({ params: Promise.resolve({ code: "ALM-TEST1" }) }));

    expect(markup).not.toContain("Continuar en WhatsApp");
  });
});
