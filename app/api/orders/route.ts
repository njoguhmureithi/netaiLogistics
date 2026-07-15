export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

function generateOrderNumber() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "CG-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any)?.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any)?.id;
    const body = await req.json();
    const { customerName, customerEmail, customerPhone, shippingAddress, shippingCity, shippingState, shippingZip, items, notes, couponCode, deliveryMethod, pickupPoint } = body ?? {};

    if (!customerName || !customerEmail || !shippingAddress || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify stock and calculate totals
    let subtotal = 0;
    const orderItems: any[] = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product || !product.active) {
        return NextResponse.json({ error: `Product ${item?.name ?? "unknown"} is unavailable` }, { status: 400 });
      }
      if (product.stockQuantity < (item?.quantity ?? 0)) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
      }
      subtotal += product.price * (item?.quantity ?? 1);
      orderItems.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: item?.quantity ?? 1,
      });
    }

    // Check MOQ
    const moqSetting = await prisma.storeSettings.findUnique({ where: { key: "minimum_order_value" } });
    const moq = moqSetting ? parseFloat(moqSetting.value) : 0;
    if (moq > 0 && subtotal < moq) {
      return NextResponse.json({ error: `Minimum order value is KES ${moq.toLocaleString()}` }, { status: 400 });
    }

    // Validate coupon
    let discount = 0;
    let appliedCouponCode: string | null = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase().trim() } });
      if (coupon && coupon.active) {
        if (!coupon.expiresAt || new Date(coupon.expiresAt) >= new Date()) {
          if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
            if (subtotal >= coupon.minimumOrder) {
              if (coupon.discountType === "percentage") {
                discount = Math.round((subtotal * coupon.discountValue / 100) * 100) / 100;
              } else {
                discount = Math.min(coupon.discountValue, subtotal);
              }
              appliedCouponCode = coupon.code;
              await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
            }
          }
        }
      }
    }

    const total = Math.max(subtotal - discount, 0);

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        customerName,
        customerEmail,
        customerPhone: customerPhone ?? "",
        shippingAddress,
        shippingCity: shippingCity ?? "",
        shippingState: shippingState ?? "",
        shippingZip: shippingZip ?? "",
        deliveryMethod: deliveryMethod ?? "delivery",
        pickupPoint: pickupPoint ?? null,
        subtotal,
        discount,
        total,
        couponCode: appliedCouponCode,
        notes: notes ?? "",
        status: "Received",
        items: { create: orderItems },
      },
      include: { items: true },
    });

    // Decrease stock
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
