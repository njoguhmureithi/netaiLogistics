export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin-guard";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    const body = await req.json();
    const { status, estimatedDelivery } = body ?? {};
    const data: any = {};
    if (status) data.status = status;
    if (estimatedDelivery !== undefined) data.estimatedDelivery = estimatedDelivery;
    const order = await prisma.order.update({
      where: { id: params.id },
      data,
      include: { items: true, user: { select: { name: true, email: true } } },
    });

    // Send email notification to customer on status change
    if (status && order.user?.email) {
      sendOrderStatusEmail(order, status).catch((err) =>
        console.error("Failed to send order status email:", err)
      );
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

/* ---------- Order status email helper ---------- */
async function sendOrderStatusEmail(order: any, newStatus: string) {
  const appUrl = process.env.NEXTAUTH_URL || "";
  let appName = "Netai Logistics";
  try { appName = new URL(appUrl).hostname.split(".")[0] || appName; } catch {}

  const customerName = order.user?.name || "Valued Customer";
  const customerEmail = order.user?.email;
  if (!customerEmail) return;

  const statusLabel: Record<string, string> = {
    Received: "Order Received",
    Processing: "Processing",
    Dispatched: "Dispatched",
    Delivered: "Delivered",
    Cancelled: "Cancelled",
  };
  const friendlyStatus = statusLabel[newStatus] || newStatus;

  const statusColor: Record<string, string> = {
    Received: "#3b82f6",
    Processing: "#f59e0b",
    Dispatched: "#8b5cf6",
    Delivered: "#22c55e",
    Cancelled: "#ef4444",
  };
  const color = statusColor[newStatus] || "#6b7280";

  const deliveryMethodLine = order.deliveryMethod === "pickup"
    ? `<p style="margin:10px 0;"><strong>📍 Pickup at:</strong> ${order.pickupPoint || "Pickup point"}</p>`
    : `<p style="margin:10px 0;"><strong>🚚 Delivery to:</strong> ${order.shippingAddress || "Your address"}</p>`;

  const estimatedLine = order.estimatedDelivery
    ? `<p style="margin:10px 0;"><strong>Estimated Delivery:</strong> ${order.estimatedDelivery}</p>`
    : "";

  const itemRows = (order.items || [])
    .map(
      (item: any) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${item.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">KES ${Number(item.price).toLocaleString()}</td>
        </tr>`
    )
    .join("");

  const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
      <div style="background:linear-gradient(135deg,${color},${color}cc);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Order Status Update</h1>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
        <p style="margin:0 0 16px;">Hi <strong>${customerName}</strong>,</p>
        <p style="margin:0 0 16px;">Your order <strong>#${order.orderNumber}</strong> has been updated to:</p>
        <div style="text-align:center;margin:20px 0;">
          <span style="display:inline-block;background:${color};color:#fff;padding:10px 28px;border-radius:24px;font-weight:bold;font-size:16px;">
            ${friendlyStatus}
          </span>
        </div>
        ${deliveryMethodLine}
        ${estimatedLine}
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb;">Item</th>
              <th style="padding:8px 12px;text-align:center;border-bottom:2px solid #e5e7eb;">Qty</th>
              <th style="padding:8px 12px;text-align:right;border-bottom:2px solid #e5e7eb;">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div style="text-align:right;margin:12px 0;font-size:16px;">
          <strong>Total: KES ${Number(order.total).toLocaleString()}</strong>
        </div>
        ${
          appUrl
            ? `<div style="text-align:center;margin:24px 0;">
                <a href="${appUrl}/account" style="display:inline-block;background:${color};color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">View Your Orders</a>
              </div>`
            : ""
        }
        <p style="color:#888;font-size:12px;margin:24px 0 0;text-align:center;">
          Thank you for shopping with Netai Logistics!
        </p>
      </div>
    </div>
  `;

  try {
    const senderEmail = appUrl ? `noreply@${new URL(appUrl).hostname}` : undefined;
    const res = await fetch("https://apps.abacus.ai/api/sendNotificationEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        app_id: process.env.WEB_APP_ID,
        notification_id: process.env.NOTIF_ID_ORDER_STATUS_UPDATE,
        subject: `Order #${order.orderNumber} — ${friendlyStatus}`,
        body: htmlBody,
        is_html: true,
        recipient_email: customerEmail,
        ...(senderEmail && { sender_email: senderEmail }),
        sender_alias: "Netai Logistics",
      }),
    });
    const result = await res.json();
    if (!result.success && !result.notification_disabled) {
      console.error("Order status email API error:", result);
    }
  } catch (err) {
    console.error("Order status email send error:", err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireSuperAdmin();
  if (auth.error) return auth.response;
  try {
    // Delete order items first, then the order
    await prisma.orderItem.deleteMany({ where: { orderId: params.id } });
    await prisma.order.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting order:", error);
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
