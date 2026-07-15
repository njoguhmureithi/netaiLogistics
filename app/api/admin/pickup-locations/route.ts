export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

async function isAdminOrManager() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  return role === "admin" || role === "manager";
}

export async function GET() {
  if (!(await isAdminOrManager())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const locations = await prisma.pickupLocation.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json(locations);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminOrManager())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { name, address, city, phone, hours, isActive, sortOrder } = body;
    if (!name || !address || !city) return NextResponse.json({ error: "Name, address and city are required" }, { status: 400 });
    const location = await prisma.pickupLocation.create({
      data: { name, address, city, phone: phone || null, hours: hours || null, isActive: isActive ?? true, sortOrder: sortOrder ?? 0 },
    });
    return NextResponse.json(location, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to create pickup location" }, { status: 500 });
  }
}
