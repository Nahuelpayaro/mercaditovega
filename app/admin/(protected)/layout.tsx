import { AdminShell } from "@/components/admin/admin-shell";
import { serverEnv } from "@/lib/env";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell adminContactName={serverEnv.ADMIN_CONTACT_NAME}>{children}</AdminShell>;
}
