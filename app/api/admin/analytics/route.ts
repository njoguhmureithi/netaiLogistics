export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
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

    const [orders, products, customers] = await Promise.all([
      prisma.order.findMany({ select: { total: true, discount: true, status: true, createdAt: true, items: { select: { quantity: true, productName: true, price: true } } }, orderBy: { createdAt: "asc" } }),
      prisma.product.findMany({ select: { id: true, name: true, stockQuantity: true, lowStockThreshold: true, price: true, active: true, category: { select: { name: true } } } }),
      prisma.user.count({ where: { role: "customer" } }),
    ]);

    // Revenue by month (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const revenueByMonth: { month: string; revenue: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
      const monthOrders = orders.filter((o) => {
        const od = new Date(o.createdAt);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      });
      revenueByMonth.push({ month: monthLabel, revenue: monthOrders.reduce((s, o) => s + o.total, 0), orders: monthOrders.length });
    }

    // Top selling products
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        if (!productSales[item.productName]) productSales[item.productName] = { name: item.productName, quantity: 0, revenue: 0 };
        productSales[item.productName].quantity += item.quantity;
        productSales[item.productName].revenue += item.price * item.quantity;
      });
    });
    const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Order status breakdown
    const statusCounts: Record<string, number> = {};
    orders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1; });

    // Low stock products
    const lowStock = products.filter((p) => p.active && p.stockQuantity <= p.lowStockThreshold).map((p) => ({
      id: p.id, name: p.name, stockQuantity: p.stockQuantity, lowStockThreshold: p.lowStockThreshold, category: p.category.name,
    }));

    // Summary
    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const totalOrders = orders.length;
    const totalDiscount = orders.reduce((s, o) => s + (o.discount ?? 0), 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    return NextResponse.json({
      summary: { totalRevenue, totalOrders, totalCustomers: customers, totalProducts: products.length, totalDiscount, avgOrderValue },
      revenueByMonth,
      topProducts,
      statusCounts,
      lowStock,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
