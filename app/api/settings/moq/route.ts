export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const setting = await prisma.storeSettings.findUnique({ where: { key: "minimum_order_value" } });
    return NextResponse.json({ minimumOrderValue: setting ? parseFloat(setting.value) : 0 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ minimumOrderValue: 0 });
  }
}
