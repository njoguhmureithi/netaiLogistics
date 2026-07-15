export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin-guard";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    const customer = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true, name: true, email: true, phone: true, role: true, createdAt: true,
        orders: { include: { items: true }, orderBy: { createdAt: "desc" } },
      },
    });
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireSuperAdmin();
  if (auth.error) return auth.response;
  try {
    const currentUserId = (auth.session?.user as any)?.id;
    if (params.id === currentUserId) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    // Check the user exists and is not an admin
    const user = await prisma.user.findUnique({ where: { id: params.id }, select: { role: true } });
    if (!user) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    if (user.role === "admin") {
      return NextResponse.json({ error: "Cannot delete an admin account from here. Use User Management instead." }, { status: 400 });
    }

    // Delete related data then user
    await prisma.wishlistItem.deleteMany({ where: { userId: params.id } });
    await prisma.orderItem.deleteMany({ where: { order: { userId: params.id } } });
    await prisma.order.deleteMany({ where: { userId: params.id } });
    await prisma.session.deleteMany({ where: { userId: params.id } });
    await prisma.account.deleteMany({ where: { userId: params.id } });
    await prisma.user.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting customer:", error);
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
