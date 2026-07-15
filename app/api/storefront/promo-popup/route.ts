export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const now = new Date();
  // First try to find a popup that matches date constraints
  let popup = await prisma.promoPopup.findFirst({
    where: {
      isActive: true,
      OR: [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: { gte: now } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
  // If none found, fall back to any active popup whose end date hasn't passed
  // (handles timezone mismatches where admin entered local time as UTC)
  if (!popup) {
    popup = await prisma.promoPopup.findFirst({
      where: {
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  }
  return NextResponse.json(popup);
}
