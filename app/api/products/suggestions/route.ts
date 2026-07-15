export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const q = new URL(req.url).searchParams.get("q")?.trim();
    if (!q || q.length < 2) return NextResponse.json([]);
    const products = await prisma.product.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, slug: true, price: true, imageUrl: true, category: { select: { name: true } } },
      take: 6,
      orderBy: { name: "asc" },
    });
    const categories = await prisma.category.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { name: true, slug: true },
      take: 3,
    });
    return NextResponse.json({ products, categories });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ products: [], categories: [] });
  }
}
