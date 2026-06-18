import { getSession } from "../../../../lib/session";
import { sb } from "../../../../lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await sb(
    `salon_projects?select=project_id,salon_name,status,live_url,city,logo_url,created_at,expires_at&user_id=eq.${session.id}&order=created_at.desc`
  ).catch(() => []);

  return Response.json({ projects: projects || [] });
}
