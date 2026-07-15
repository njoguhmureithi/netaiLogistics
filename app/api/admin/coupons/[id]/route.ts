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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await isAdminOrManager())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { code, description, discountType, discountValue, minimumOrder, maxUses, expiresAt, active } = body ?? {};
    const data: any = {};
    if (code !== undefined) data.code = code.toUpperCase().trim();
    if (description !== undefined) data.description = description;
    if (discountType !== undefined) data.discountType = discountType;
    if (discountValue !== undefined) data.discountValue = parseFloat(discountValue);
    if (minimumOrder !== undefined) data.minimumOrder = parseFloat(minimumOrder);
    if (maxUses !== undefined) data.maxUses = maxUses ? parseInt(maxUses) : null;
    if (expiresAt !== undefined) data.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (active !== undefined) data.active = active;
    const coupon = await prisma.coupon.update({ where: { id: params.id }, data });
    return NextResponse.json(coupon);
  } catch (error: any) {
    if (error?.code === "P2002") return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    console.error(error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await isAdminOrManager())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await prisma.coupon.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
