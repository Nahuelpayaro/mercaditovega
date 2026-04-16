import { beforeEach, describe, expect, it, vi } from "vitest";

class RedirectSignal extends Error {
  constructor(readonly url: string) {
    super("NEXT_REDIRECT");
  }
}

const { dbMock, redirectMock, revalidatePathMock } = vi.hoisted(() => ({
  dbMock: {
    order: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
  redirectMock: vi.fn((url: string) => {
    throw new RedirectSignal(url);
  }),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ db: dbMock }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

import { updateOrderStatus } from "@/app/admin/pedidos/actions";

describe("updateOrderStatus", () => {
  beforeEach(() => {
    dbMock.order.findUnique.mockReset();
    dbMock.order.update.mockReset();
    redirectMock.mockClear();
    revalidatePathMock.mockClear();
  });

  it("redirects back with a clear error when the status transition is invalid", async () => {
    dbMock.order.findUnique.mockResolvedValue({ id: "ord-1", status: "ready", internalNote: null });

    const formData = new FormData();
    formData.set("orderId", "ord-1");
    formData.set("status", "confirmed");

    await expect(updateOrderStatus(formData)).rejects.toMatchObject({
      message: "NEXT_REDIRECT",
      url: "/admin/pedidos/ord-1?statusError=No%20se%20puede%20pasar%20de%20ready%20a%20confirmed.",
    });
    expect(dbMock.order.update).not.toHaveBeenCalled();
  });

  it("updates, revalidates, and redirects with success feedback for valid transitions", async () => {
    dbMock.order.findUnique.mockResolvedValue({ id: "ord-1", status: "placed", internalNote: "Llamar" });
    dbMock.order.update.mockResolvedValue({ id: "ord-1" });

    const formData = new FormData();
    formData.set("orderId", "ord-1");
    formData.set("status", "confirmed");
    formData.set("internalNote", "Avisar por WhatsApp");

    await expect(updateOrderStatus(formData)).rejects.toMatchObject({
      message: "NEXT_REDIRECT",
      url: "/admin/pedidos/ord-1?statusSuccess=Estado%20actualizado%20correctamente.",
    });
    expect(dbMock.order.update).toHaveBeenCalledWith({
      where: { id: "ord-1" },
      data: { status: "confirmed", internalNote: "Avisar por WhatsApp" },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/pedidos");
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/pedidos/ord-1");
  });
});
