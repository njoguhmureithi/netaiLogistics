export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  const { id } = params;
  const body = await req.json();
  const slide = await prisma.heroSlide.update({
    where: { id },
    data: {
      title: body.title,
      subtitle: body.subtitle ?? undefined,
      badge: body.badge ?? undefined,
      buttonText: body.buttonText ?? undefined,
      buttonLink: body.buttonLink ?? undefined,
      imageUrl: body.imageUrl ?? undefined,
      overlayColor: body.overlayColor ?? undefined,
      isActive: body.isActive ?? undefined,
      sortOrder: body.sortOrder ?? undefined,
    },
  });
  return NextResponse.json(slide);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  await prisma.heroSlide.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
