export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    const posts = await prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" } });
    return NextResponse.json(posts);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    const body = await req.json();
    const { title, excerpt, content, category, imageUrl, author, readTime, featured, published } = body;
    if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    let slug = slugify(title);
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const post = await prisma.blogPost.create({
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
        publishedAt: new Date(),
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
