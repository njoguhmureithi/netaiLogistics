export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin-guard";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    const body = await req.json();
    const { title, excerpt, content, category, imageUrl, author, readTime, featured, published } = body;
    if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const existing = await prisma.blogPost.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let slug = existing.slug;
    if (title.trim() !== existing.title) {
      slug = slugify(title);
      const dup = await prisma.blogPost.findFirst({ where: { slug, id: { not: params.id } } });
      if (dup) slug = `${slug}-${Date.now()}`;
    }

    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        title: title.trim(),
        slug,
        excerpt: excerpt?.trim() || null,
        content: content?.trim() || null,
        category: category?.trim() || "General",
        imageUrl: imageUrl?.trim() || null,
        author: author?.trim() || "Netai Team",
        readTime: readTime?.trim() || null,
        featured: featured ?? false,
        published: published ?? true,
      },
    });
    return NextResponse.json(post);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireSuperAdmin();
  if (auth.error) return auth.response;
  try {
    await prisma.blogPost.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
