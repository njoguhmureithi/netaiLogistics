export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const orderNumber = req.nextUrl.searchParams.get("orderNumber")?.trim();
    if (!orderNumber) {
      return NextResponse.json({ error: "Order number is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        orderNumber: true,
        status: true,
        customerName: true,
        shippingCity: true,
        shippingState: true,
        estimatedDelivery: true,
        subtotal: true,
        discount: true,
        total: true,
        createdAt: true,
        updatedAt: true,
        deliveryMethod: true,
        pickupPoint: true,
        items: {
          select: {
            productName: true,
            quantity: true,
            price: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found. Please check the order number and try again." }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Track order error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
