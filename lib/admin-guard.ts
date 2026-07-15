import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";

/** Requires admin or manager role — use for product, order, category, coupon, analytics routes */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user || (role !== "admin" && role !== "manager")) {
    return { error: true, response: NextResponse.json({ error: "Unauthorized" }, { status: 403 }) };
  }
  return { error: false, session };
}

/** Requires strictly admin role — use for user management and settings */
export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any)?.role !== "admin") {
    return { error: true, response: NextResponse.json({ error: "Unauthorized" }, { status: 403 }) };
  }
  return { error: false, session };
}
