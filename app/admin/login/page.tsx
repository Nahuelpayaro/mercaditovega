import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginAdmin } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ADMIN_SESSION_COOKIE_NAME, hasValidAdminSession, sanitizeAdminNextPath } from "@/lib/admin-auth";
import { publicEnv, serverEnv } from "@/lib/env";

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();

  if (hasValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value)) {
    redirect("/admin");
  }

  const nextPath = sanitizeAdminNextPath(params.next);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#201915_0%,#171310_100%)] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-200/70">Acceso administrativo</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Panel privado de {publicEnv.NEXT_PUBLIC_STORE_NAME}</h1>
          <p className="max-w-xl text-base leading-7 text-white/72 sm:text-lg">
            Entrá con la cuenta del negocio para revisar pedidos, catálogo, promos y clientes sin dejar el admin abierto a cualquiera.
          </p>
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 text-sm text-white/72">
            <p className="font-bold text-white">Contacto operativo</p>
            <p className="mt-2">Responsable configurado: {serverEnv.ADMIN_CONTACT_NAME}</p>
          </div>
        </section>

        <Card className="border-white/10 bg-[rgba(255,250,244,0.97)] shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
          <CardHeader>
            <CardTitle>Ingresar al admin</CardTitle>
            <CardDescription>Usá las credenciales configuradas en el entorno local para habilitar la sesión.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={loginAdmin} className="space-y-4">
              <input type="hidden" name="next" value={nextPath} />
              <div>
                <Label htmlFor="login">Email o usuario</Label>
                <Input id="login" name="login" type="text" autoComplete="username" placeholder="tu cuenta admin" required />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
              </div>

              {params.error ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                  {params.error}
                </div>
              ) : null}

              <Button type="submit" className="w-full">
                Entrar al panel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
