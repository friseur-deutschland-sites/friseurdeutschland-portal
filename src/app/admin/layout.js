import { redirect } from "next/navigation";
import { requireAdmin } from "../../lib/session";
import AdminShell from "./AdminShell";

export default async function AdminLayout({ children }) {
  const session = await requireAdmin();
  if (!session) redirect("/login");
  return <AdminShell>{children}</AdminShell>;
}
