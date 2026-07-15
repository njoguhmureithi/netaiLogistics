export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

// PATCH /api/admin/reviews/[id] — approve or reject
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    const body = await req.json();
    const { approved } = body;
    if (typeof approved !== "boolean") {
      return NextResponse.json({ error: "'approved' boolean required" }, { status: 400 });
    }
    const review = await prisma.review.update({
      where: { id: params.id },
      data: { approved },
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, slug: true, imageUrl: true } },
      },
    });
    return NextResponse.json(review);
  } catch (e: any) {
    console.error("PATCH /api/admin/reviews/[id] error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/admin/reviews/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    await prisma.review.delete({ where: { id: params.id } });
    return NextResponse.json({ deleted: true });
  } catch (e: any) {
    console.error("DELETE /api/admin/reviews/[id] error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
