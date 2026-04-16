import { beforeEach, describe, expect, it } from "vitest";
import {
  ADMIN_SESSION_COOKIE_NAME,
  getAdminLoginRedirectPath,
  hasValidAdminSession,
  sanitizeAdminNextPath,
  validateAdminCredentials,
} from "@/lib/admin-auth";

describe("admin auth helpers", () => {
  beforeEach(() => {
    process.env.ADMIN_AUTH_LOGIN = "mercaditovega@gmail.com";
    process.env.ADMIN_AUTH_PASSWORD = "enzototo2007";
    process.env.ADMIN_SESSION_SECRET = "negocio-admin-session-secret";
  });

  it("validates the configured admin credentials", () => {
    expect(validateAdminCredentials("  MercaditoVega@gmail.com ", "enzototo2007")).toBe(true);
    expect(validateAdminCredentials("mercaditovega@gmail.com", "otra-clave")).toBe(false);
  });

  it("accepts only the configured session cookie", () => {
    expect(hasValidAdminSession("negocio-admin-session-secret")).toBe(true);
    expect(hasValidAdminSession(null)).toBe(false);
    expect(hasValidAdminSession(`${ADMIN_SESSION_COOKIE_NAME}-fake`)).toBe(false);
  });

  it("sanitizes next paths to avoid escaping the admin area", () => {
    expect(sanitizeAdminNextPath("/admin/productos?publication=all")).toBe("/admin/productos?publication=all");
    expect(sanitizeAdminNextPath("/admin/login")).toBe("/admin");
    expect(sanitizeAdminNextPath("https://evil.example.com")).toBe("/admin");
  });

  it("redirects unauthenticated admin requests to login and lets valid sessions through", () => {
    expect(getAdminLoginRedirectPath("/admin/productos", "?publication=all", null)).toBe(
      "/admin/login?next=%2Fadmin%2Fproductos%3Fpublication%3Dall",
    );
    expect(getAdminLoginRedirectPath("/admin/login", "", null)).toBeNull();
    expect(getAdminLoginRedirectPath("/admin/login", "", "negocio-admin-session-secret")).toBe("/admin");
    expect(getAdminLoginRedirectPath("/admin/clientes", "", "negocio-admin-session-secret")).toBeNull();
  });
});
