import { beforeEach, describe, expect, it, vi } from "vitest";

class RedirectSignal extends Error {
  constructor(readonly url: string) {
    super("NEXT_REDIRECT");
  }
}

const { cookieStoreMock, cookiesMock, redirectMock } = vi.hoisted(() => ({
  cookieStoreMock: {
    set: vi.fn(),
  },
  cookiesMock: vi.fn(async () => cookieStoreMock),
  redirectMock: vi.fn((url: string) => {
    throw new RedirectSignal(url);
  }),
}));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { loginAdmin, logoutAdmin } from "@/app/admin/login/actions";
import { ADMIN_SESSION_COOKIE_NAME, ADMIN_SESSION_DURATION_SECONDS } from "@/lib/admin-auth";

describe("admin auth actions", () => {
  beforeEach(() => {
    process.env.ADMIN_AUTH_LOGIN = "mercaditovega@gmail.com";
    process.env.ADMIN_AUTH_PASSWORD = "enzototo2007";
    process.env.ADMIN_SESSION_SECRET = "negocio-admin-session-secret";
    vi.stubEnv("NODE_ENV", "test");
    cookieStoreMock.set.mockReset();
    cookiesMock.mockClear();
    redirectMock.mockClear();
  });

  it("redirects back to login with an explicit error when credentials are invalid", async () => {
    const formData = new FormData();
    formData.set("login", "otro@correo.com");
    formData.set("password", "mal");
    formData.set("next", "/admin/productos");

    await expect(loginAdmin(formData)).rejects.toMatchObject({
      message: "NEXT_REDIRECT",
      url: "/admin/login?next=%2Fadmin%2Fproductos&error=Credenciales+inv%C3%A1lidas.+Revis%C3%A1+el+email%2Fusuario+y+la+contrase%C3%B1a.",
    });
    expect(cookieStoreMock.set).not.toHaveBeenCalled();
  });

  it("creates the admin cookie and redirects into the admin when login succeeds", async () => {
    const formData = new FormData();
    formData.set("login", "mercaditovega@gmail.com");
    formData.set("password", "enzototo2007");
    formData.set("next", "/admin/pedidos");

    await expect(loginAdmin(formData)).rejects.toMatchObject({
      message: "NEXT_REDIRECT",
      url: "/admin/pedidos",
    });
    expect(cookieStoreMock.set).toHaveBeenCalledWith(ADMIN_SESSION_COOKIE_NAME, "negocio-admin-session-secret", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: ADMIN_SESSION_DURATION_SECONDS,
    });
  });

  it("clears the admin cookie and redirects to login on logout", async () => {
    await expect(logoutAdmin()).rejects.toMatchObject({
      message: "NEXT_REDIRECT",
      url: "/admin/login",
    });
    expect(cookieStoreMock.set).toHaveBeenCalledWith(ADMIN_SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 0,
    });
  });
});
