import { redirect } from "next/navigation";
import { getSession } from "../../lib/session";
import DashboardFull from "./DashboardFull";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <DashboardFull user={session} />;
}
