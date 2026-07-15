export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "").slice(0, 80);
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    const subs = await prisma.subCategory.findMany({
      where: { categoryId: params.id },
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(subs);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    const body = await req.json();
    const { name, description } = body;
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const category = await prisma.category.findUnique({ where: { id: params.id } });
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    const slug = slugify(name);
    const sub = await prisma.subCategory.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        categoryId: params.id,
      },
    });
    return NextResponse.json(sub, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Subcategory with this name already exists in this category" }, { status: 409 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
