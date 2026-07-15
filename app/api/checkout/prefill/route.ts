export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  // Fetch user profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, phone: true },
  });

  // Fetch most recent order for shipping details
  const lastOrder = await prisma.order.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      shippingAddress: true,
      shippingCity: true,
      shippingState: true,
      shippingZip: true,
    },
  });

  return NextResponse.json({
    customerName: lastOrder?.customerName || user?.name || "",
    customerEmail: lastOrder?.customerEmail || user?.email || "",
    customerPhone: lastOrder?.customerPhone || user?.phone || "",
    shippingAddress: lastOrder?.shippingAddress || "",
    shippingCity: lastOrder?.shippingCity || "",
    shippingState: lastOrder?.shippingState || "",
    shippingZip: lastOrder?.shippingZip || "",
  });
}
