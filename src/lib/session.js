import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE_NAME } from "./auth";

export async function getSession() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}
