export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function PUT(req: NextRequest, { params }: { params: { id: string; itemId: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    const body = await req.json();
    const { itemName, sku, unitPrice, currency, minOrderQty, leadTimeDays, notes } = body;
    const updateData: any = {};
    if (itemName !== undefined) updateData.itemName = itemName;
    if (sku !== undefined) updateData.sku = sku;
    if (unitPrice !== undefined) updateData.unitPrice = Number(unitPrice);
    if (currency !== undefined) updateData.currency = currency;
    if (minOrderQty !== undefined) updateData.minOrderQty = minOrderQty ? Number(minOrderQty) : null;
    if (leadTimeDays !== undefined) updateData.leadTimeDays = leadTimeDays ? Number(leadTimeDays) : null;
    if (notes !== undefined) updateData.notes = notes;

    const item = await prisma.supplierItem.update({
      where: { id: params.itemId },
      data: updateData,
    });
    return NextResponse.json(item);
  } catch (error: any) {
    console.error("Error updating supplier item:", error);
    if (error?.code === "P2025") return NextResponse.json({ error: "Item not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; itemId: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    await prisma.supplierItem.delete({ where: { id: params.itemId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting supplier item:", error);
    if (error?.code === "P2025") return NextResponse.json({ error: "Item not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
