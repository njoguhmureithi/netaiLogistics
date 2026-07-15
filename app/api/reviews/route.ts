export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// GET /api/reviews?productId=xxx
export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get("productId");
    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Calculate aggregate
    const count = reviews.length;
    const average = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

    return NextResponse.json({ reviews, average: Math.round(average * 10) / 10, count });
  } catch (e: any) {
    console.error("GET /api/reviews error:", e);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST /api/reviews  { productId, rating, title?, comment? }
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: "Please sign in to leave a review" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, rating, title, comment } = body;

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Valid productId and rating (1-5) required" }, { status: 400 });
    }

    // Upsert: one review per user per product
    const review = await prisma.review.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId, rating, title: title || null, comment: comment || null },
      update: { rating, title: title || null, comment: comment || null },
      include: { user: { select: { id: true, name: true } } },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/reviews error:", e);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
