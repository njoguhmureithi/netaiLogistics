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
  try {
    if (!(await isAdminOrManager())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(coupons);
  } catch (error) {
    console.error(error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdminOrManager())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { code, description, discountType, discountValue, minimumOrder, maxUses, expiresAt } = body ?? {};
    if (!code || !discountValue) return NextResponse.json({ error: "Code and discount value required" }, { status: 400 });
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        description: description ?? "",
        discountType: discountType ?? "percentage",
        discountValue: parseFloat(discountValue),
        minimumOrder: parseFloat(minimumOrder ?? "0"),
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    console.error(error);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
