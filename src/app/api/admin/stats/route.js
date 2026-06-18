import { requireAdmin } from "../../../../lib/session";
import { sb } from "../../../../lib/db";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const today = new Date().toISOString().split("T")[0];

  const [projects, users, billing] = await Promise.allSettled([
    sb("salon_projects?select=project_id,status,city,salon_name,created_at&order=created_at.desc&limit=200"),
    sb("portal_users?select=id,created_at&limit=1000"),
    sb("billing_records?select=amount,status&limit=1000"),
  ]);

  const projectData = projects.status === "fulfilled" ? (projects.value || []) : [];
  const userData = users.status === "fulfilled" ? (users.value || []) : [];
  const billingData = billing.status === "fulfilled" ? (billing.value || []) : [];

  return Response.json({
    total_projects: projectData.length,
    live_projects: projectData.filter(p => p.status === "completed").length,
    pending_projects: projectData.filter(p => ["pending", "info_submitted", "building"].includes(p.status)).length,
    total_users: userData.length,
    total_revenue: billingData.filter(b => b.status === "completed").reduce((s, b) => s + (b.amount || 0), 0),
    new_today: projectData.filter(p => p.created_at?.startsWith(today)).length,
    recent_projects: projectData.slice(0, 10),
  });
}
