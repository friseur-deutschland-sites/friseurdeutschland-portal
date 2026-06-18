import { requireAdmin } from "../../../../lib/session";
import { sb } from "../../../../lib/db";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const projects = await sb(
    "salon_projects?select=project_id,salon_name,status,city,address,live_url,logo_url,created_at,expires_at,user_id&order=created_at.desc&limit=500"
  ).catch(() => []);

  return Response.json({ projects: projects || [] });
}
