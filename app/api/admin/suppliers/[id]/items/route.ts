export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    const body = await req.json();
    const { itemName, sku, unitPrice, currency, minOrderQty, leadTimeDays, notes } = body;
    if (!itemName?.trim()) return NextResponse.json({ error: "Item name is required" }, { status: 400 });
    if (unitPrice === undefined || unitPrice === null || unitPrice < 0) return NextResponse.json({ error: "Valid unit price is required" }, { status: 400 });

    const item = await prisma.supplierItem.create({
      data: {
        supplierId: params.id,
        itemName: itemName.trim(),
        sku: sku || null,
        unitPrice: Number(unitPrice),
        currency: currency || "KES",
        minOrderQty: minOrderQty ? Number(minOrderQty) : null,
        leadTimeDays: leadTimeDays ? Number(leadTimeDays) : null,
        notes: notes || null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error("Error creating supplier item:", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
