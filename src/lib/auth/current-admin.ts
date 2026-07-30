import { getSessionCookie } from "@/lib/auth/cookies";
import { getSession } from "@/lib/auth/session";

export async function getCurrentAdmin() {
  const token = await getSessionCookie();

  if (!token) {
    return null;
  }

  const session = await getSession(token);

  if (!session) {
    return null;
  }

  return session.admin;
}