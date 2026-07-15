export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin-guard";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ids } = body ?? {};

    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Action and product IDs are required" }, { status: 400 });
    }

    // Hard delete requires super admin (admin only)
    if (action === "delete") {
      const auth = await requireSuperAdmin();
      if (auth.error) return auth.response;

      // Check for products with order items
      const productsWithOrders = await prisma.product.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true, _count: { select: { orderItems: true } } },
      });

      const hasOrders = productsWithOrders.filter((p) => p._count.orderItems > 0);
      if (hasOrders.length > 0) {
        // Soft-delete products with orders, hard-delete the rest
        const softDeleteIds = hasOrders.map((p) => p.id);
        const hardDeleteIds = ids.filter((id: string) => !softDeleteIds.includes(id));

        if (softDeleteIds.length > 0) {
          await prisma.product.updateMany({ where: { id: { in: softDeleteIds } }, data: { active: false, published: false } });
        }
        if (hardDeleteIds.length > 0) {
          await prisma.wishlistItem.deleteMany({ where: { productId: { in: hardDeleteIds } } });
          await prisma.product.deleteMany({ where: { id: { in: hardDeleteIds } } });
        }

        return NextResponse.json({
          success: true,
          message: `${hardDeleteIds.length} product(s) permanently deleted, ${softDeleteIds.length} product(s) deactivated (have existing orders)`,
          hardDeleted: hardDeleteIds.length,
          softDeleted: softDeleteIds.length,
        });
      }

      // No orders — hard delete all
      await prisma.wishlistItem.deleteMany({ where: { productId: { in: ids } } });
      await prisma.product.deleteMany({ where: { id: { in: ids } } });
      return NextResponse.json({ success: true, message: `${ids.length} product(s) permanently deleted` });
    }

    // Other actions require admin or manager
    const auth = await requireAdmin();
    if (auth.error) return auth.response;

    switch (action) {
      case "activate":
        await prisma.product.updateMany({ where: { id: { in: ids } }, data: { active: true } });
        return NextResponse.json({ success: true, message: `${ids.length} product(s) activated` });

      case "deactivate":
        await prisma.product.updateMany({ where: { id: { in: ids } }, data: { active: false } });
        return NextResponse.json({ success: true, message: `${ids.length} product(s) deactivated` });

      case "publish":
        await prisma.product.updateMany({ where: { id: { in: ids } }, data: { published: true } });
        return NextResponse.json({ success: true, message: `${ids.length} product(s) published` });

      case "unpublish":
        await prisma.product.updateMany({ where: { id: { in: ids } }, data: { published: false } });
        return NextResponse.json({ success: true, message: `${ids.length} product(s) unpublished` });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Bulk action error:", error);
    return NextResponse.json({ error: "Failed to perform bulk action" }, { status: 500 });
  }
}
