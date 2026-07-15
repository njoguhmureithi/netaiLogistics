export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    const body = await req.json();
    const { name, description, price, compareAtPrice, categoryId, subCategoryId, imageUrl, cloudStoragePath, isPublicImage, stockQuantity, featured, active } = body ?? {};
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (compareAtPrice !== undefined) data.compareAtPrice = compareAtPrice ? parseFloat(compareAtPrice) : null;
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (subCategoryId !== undefined) data.subCategoryId = subCategoryId || null;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (cloudStoragePath !== undefined) data.cloudStoragePath = cloudStoragePath;
    if (isPublicImage !== undefined) data.isPublicImage = isPublicImage;
    if (stockQuantity !== undefined) data.stockQuantity = parseInt(stockQuantity);
    if (featured !== undefined) data.featured = featured;
    if (active !== undefined) data.active = active;
    if (body?.published !== undefined) data.published = body.published;

    const product = await prisma.product.update({
      where: { id: params.id },
      data,
      include: { category: true, subCategory: true },
    });
    return NextResponse.json(product);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    await prisma.product.update({ where: { id: params.id }, data: { active: false } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
