export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const categorySlug = url.searchParams.get("category") ?? undefined;
    const subcategorySlug = url.searchParams.get("subcategory") ?? undefined;
    const search = url.searchParams.get("search") ?? undefined;
    const featured = url.searchParams.get("featured");
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const limit = url.searchParams.get("limit");

    const where: any = { active: true };
    if (categorySlug) {
      const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (cat) where.categoryId = cat.id;
    }
    if (subcategorySlug) {
      const sub = await prisma.subCategory.findFirst({ where: { slug: subcategorySlug } });
      if (sub) where.subCategoryId = sub.id;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (featured === "true") where.featured = true;
    if (minPrice) where.price = { ...(where.price ?? {}), gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...(where.price ?? {}), lte: parseFloat(maxPrice) };

    const products = await prisma.product.findMany({
      where,
      include: { category: true, subCategory: true },
      orderBy: { createdAt: "desc" },
      ...(limit ? { take: parseInt(limit) } : {}),
    });
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Products fetch error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
