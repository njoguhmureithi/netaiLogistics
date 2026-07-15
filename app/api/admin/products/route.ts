export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    const products = await prisma.product.findMany({
      include: { category: true, subCategory: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    const body = await req.json();
    const { name, description, price, compareAtPrice, categoryId, subCategoryId, imageUrl, cloudStoragePath, isPublicImage, stockQuantity, featured } = body ?? {};
    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: "Name, price, and category are required" }, { status: 400 });
    }
    const slug = (name as string).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description ?? "",
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        categoryId,
        subCategoryId: subCategoryId || null,
        imageUrl: imageUrl ?? null,
        cloudStoragePath: cloudStoragePath ?? null,
        isPublicImage: isPublicImage ?? true,
        stockQuantity: parseInt(stockQuantity ?? "0"),
        featured: featured ?? false,
      },
      include: { category: true, subCategory: true },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
