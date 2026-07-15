export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  const slides = await prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(slides);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  const body = await req.json();
  const slide = await prisma.heroSlide.create({
    data: {
      title: body.title,
      subtitle: body.subtitle || null,
      badge: body.badge || null,
      buttonText: body.buttonText || "Shop Now",
      buttonLink: body.buttonLink || "/products",
      imageUrl: body.imageUrl || null,
      overlayColor: body.overlayColor || "from-black/60 via-black/40 to-transparent",
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder ?? 0,
    },
  });
  return NextResponse.json(slide, { status: 201 });
}
