export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin-guard";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: params.id },
      include: {
        items: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!supplier) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    return NextResponse.json(supplier);
  } catch (error: any) {
    console.error("Error fetching supplier:", error);
    return NextResponse.json({ error: "Failed to fetch supplier" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    const body = await req.json();
    const { name, contactName, email, phone, address, notes, active } = body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (contactName !== undefined) updateData.contactName = contactName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (notes !== undefined) updateData.notes = notes;
    if (active !== undefined) updateData.active = active;

    const supplier = await prisma.supplier.update({
      where: { id: params.id },
      data: updateData,
      include: { items: { orderBy: { createdAt: "desc" } } },
    });
    return NextResponse.json(supplier);
  } catch (error: any) {
    console.error("Error updating supplier:", error);
    if (error?.code === "P2025") return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireSuperAdmin();
  if (auth.error) return auth.response;
  try {
    await prisma.supplier.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting supplier:", error);
    if (error?.code === "P2025") return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 });
  }
}
