export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  const { id } = params;
  const body = await req.json();
  const popup = await prisma.promoPopup.update({
    where: { id },
    data: {
      title: body.title ?? undefined,
      description: body.description ?? undefined,
      imageUrl: body.imageUrl ?? undefined,
      buttonText: body.buttonText ?? undefined,
      buttonLink: body.buttonLink ?? undefined,
      couponCode: body.couponCode ?? undefined,
      isActive: body.isActive ?? undefined,
      showDelay: body.showDelay ?? undefined,
      displayFrequency: body.displayFrequency ?? undefined,
      startDate: body.startDate !== undefined ? (body.startDate ? new Date(body.startDate) : null) : undefined,
      endDate: body.endDate !== undefined ? (body.endDate ? new Date(body.endDate) : null) : undefined,
    },
  });
  return NextResponse.json(popup);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  await prisma.promoPopup.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
