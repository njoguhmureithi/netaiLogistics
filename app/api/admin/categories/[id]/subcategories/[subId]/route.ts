export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "").slice(0, 80);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string; subId: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    const body = await req.json();
    const { name, description } = body;
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const sub = await prisma.subCategory.update({
      where: { id: params.subId },
      data: {
        name: name.trim(),
        slug: slugify(name),
        description: description?.trim() || null,
      },
    });
    return NextResponse.json(sub);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Subcategory with this name already exists in this category" }, { status: 409 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; subId: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    // Unlink products from this subcategory before deleting
    await prisma.product.updateMany({
      where: { subCategoryId: params.subId },
      data: { subCategoryId: null },
    });
    await prisma.subCategory.delete({ where: { id: params.subId } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
