"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_LOGIN_ERROR_MESSAGE,
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_DURATION_SECONDS,
  getAdminAuthConfig,
  sanitizeAdminNextPath,
  validateAdminCredentials,
} from "@/lib/admin-auth";

function buildLoginRedirect(nextPath: string, errorMessage?: string) {
  const params = new URLSearchParams({ next: sanitizeAdminNextPath(nextPath) });

  if (errorMessage) {
    params.set("error", errorMessage);
  }

  return `/admin/login?${params.toString()}`;
}

export async function loginAdmin(formData: FormData) {
  const login = String(formData.get("login") ?? "");
  const password = String(formData.get("password") ?? "");
  const nextPath = sanitizeAdminNextPath(String(formData.get("next") ?? "/admin"));

  if (!validateAdminCredentials(login, password)) {
    redirect(buildLoginRedirect(nextPath, ADMIN_LOGIN_ERROR_MESSAGE));
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, getAdminAuthConfig().ADMIN_SESSION_SECRET, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_DURATION_SECONDS,
  });

  redirect(nextPath);
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  redirect("/admin/login");
}
