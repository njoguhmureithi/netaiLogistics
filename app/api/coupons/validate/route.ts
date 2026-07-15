export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { code, subtotal } = await req.json();
    if (!code) return NextResponse.json({ error: "Coupon code required" }, { status: 400 });
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });
    if (!coupon) return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    if (!coupon.active) return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
    if (subtotal < coupon.minimumOrder) return NextResponse.json({ error: `Minimum order of KES ${coupon.minimumOrder.toLocaleString()} required` }, { status: 400 });
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = Math.round((subtotal * coupon.discountValue / 100) * 100) / 100;
    } else {
      discount = Math.min(coupon.discountValue, subtotal);
    }
    return NextResponse.json({ valid: true, discount, coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue, description: coupon.description } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
