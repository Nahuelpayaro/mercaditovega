import { z } from "zod";

export const ADMIN_SESSION_COOKIE_NAME = "negocio_admin_session";
export const ADMIN_LOGIN_ERROR_MESSAGE = "Credenciales inválidas. Revisá el email/usuario y la contraseña.";
export const ADMIN_SESSION_DURATION_SECONDS = 60 * 60 * 12;

const adminAuthSchema = z.object({
  ADMIN_AUTH_LOGIN: z.string().trim().min(1),
  ADMIN_AUTH_PASSWORD: z.string().min(1),
  ADMIN_SESSION_SECRET: z.string().min(16),
});

export function getAdminAuthConfig() {
  return adminAuthSchema.parse({
    ADMIN_AUTH_LOGIN: process.env.ADMIN_AUTH_LOGIN,
    ADMIN_AUTH_PASSWORD: process.env.ADMIN_AUTH_PASSWORD,
    ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
  });
}

export function validateAdminCredentials(login: string, password: string) {
  const { ADMIN_AUTH_LOGIN, ADMIN_AUTH_PASSWORD } = getAdminAuthConfig();

  return login.trim().toLowerCase() === ADMIN_AUTH_LOGIN.trim().toLowerCase() && password === ADMIN_AUTH_PASSWORD;
}

export function hasValidAdminSession(sessionCookie: string | null | undefined) {
  if (!sessionCookie) {
    return false;
  }

  return sessionCookie === getAdminAuthConfig().ADMIN_SESSION_SECRET;
}

export function sanitizeAdminNextPath(nextPath: string | null | undefined) {
  if (!nextPath || !nextPath.startsWith("/admin") || nextPath.startsWith("/admin/login")) {
    return "/admin";
  }

  return nextPath;
}

export function getAdminLoginRedirectPath(
  pathname: string,
  search = "",
  sessionCookie: string | null | undefined,
) {
  if (!pathname.startsWith("/admin")) {
    return null;
  }

  if (pathname === "/admin/login") {
    return hasValidAdminSession(sessionCookie) ? "/admin" : null;
  }

  if (hasValidAdminSession(sessionCookie)) {
    return null;
  }

  const nextPath = sanitizeAdminNextPath(`${pathname}${search}`);
  return `/admin/login?next=${encodeURIComponent(nextPath)}`;
}
