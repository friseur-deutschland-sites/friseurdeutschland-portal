import { requireAdmin } from "../../../../lib/session";
import { sb } from "../../../../lib/db";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const users = await sb("portal_users?select=id,email,role,is_active,created_at&order=created_at.desc").catch(() => []);
  return Response.json({ users: users || [] });
}
