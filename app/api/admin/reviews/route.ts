export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    const status = req.nextUrl.searchParams.get("status"); // "pending" | "approved" | "all"
    const where: any = {};
    if (status === "pending") where.approved = false;
    else if (status === "approved") where.approved = true;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, slug: true, imageUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reviews);
  } catch (e: any) {
    console.error("GET /api/admin/reviews error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
