export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

const VALID_ROLES = ["admin", "manager", "customer"];

async function requireAdminRole() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any)?.role !== "admin") {
    return null;
  }
  return session;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdminRole();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { orders: true, wishlistItems: true } },
        orders: {
          select: { id: true, orderNumber: true, total: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdminRole();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const currentUserId = (session.user as any)?.id;
    const body = await req.json();
    const { role, isActive, name, phone, password } = body;

    // Prevent self-demotion
    if (params.id === currentUserId && role && role !== "admin") {
      return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
    }
    // Prevent self-deactivation
    if (params.id === currentUserId && isActive === false) {
      return NextResponse.json({ error: "You cannot deactivate your own account" }, { status: 400 });
    }

    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      data: updateData,
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Error updating user:", error);
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
