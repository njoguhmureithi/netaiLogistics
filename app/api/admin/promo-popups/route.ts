export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  const popups = await prisma.promoPopup.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(popups);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  const body = await req.json();
  const popup = await prisma.promoPopup.create({
    data: {
      title: body.title,
      description: body.description || null,
      imageUrl: body.imageUrl || null,
      buttonText: body.buttonText || null,
      buttonLink: body.buttonLink || null,
      couponCode: body.couponCode || null,
      isActive: body.isActive ?? false,
      showDelay: body.showDelay ?? 3,
      displayFrequency: body.displayFrequency || "once_per_session",
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    },
  });
  return NextResponse.json(popup, { status: 201 });
}
