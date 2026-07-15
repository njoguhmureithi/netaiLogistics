export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

function buildInvoiceHtml(order: any) {
  const items = order.items ?? [];
  const rows = items.map((item: any) => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #eee">${item.productName}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right">KES ${item.price.toLocaleString()}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right">KES ${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join("");

  const statusColor = order.status === "Dispatched" ? "#2563eb" : order.status === "Delivered" ? "#16a34a" : "#d97706";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; margin: 0; padding: 40px; font-size: 14px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #e11d73; padding-bottom: 20px; }
    .brand { font-size: 28px; font-weight: 700; color: #e11d73; }
    .brand-sub { font-size: 11px; color: #666; margin-top: 4px; }
    .invoice-title { font-size: 32px; font-weight: 700; color: #1a1a2e; text-align: right; }
    .invoice-num { font-size: 13px; color: #666; text-align: right; margin-top: 4px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #e11d73; margin-bottom: 8px; }
    .info-grid { display: flex; gap: 40px; }
    .info-block p { margin: 3px 0; font-size: 13px; color: #444; }
    .info-block p strong { color: #1a1a2e; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { background: #fdf2f8; color: #e11d73; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 8px; text-align: left; }
    th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: right; }
    th:nth-child(2) { text-align: center; }
    .totals { margin-top: 16px; display: flex; justify-content: flex-end; }
    .totals-table { width: 280px; }
    .totals-table td { padding: 6px 0; font-size: 13px; }
    .totals-table .total-row td { font-size: 18px; font-weight: 700; color: #e11d73; border-top: 2px solid #e11d73; padding-top: 10px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; color: white; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #999; }
  </style></head><body>
    <div class="header">
      <div><div class="brand">✦ Netai</div><div class="brand-sub">Where beauty meets reach.</div></div>
      <div><div class="invoice-title">INVOICE</div><div class="invoice-num">#${order.orderNumber}</div><div class="invoice-num">${new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div></div>
    </div>

    <div class="info-grid section">
      <div class="info-block" style="flex:1">
        <div class="section-title">Bill To</div>
        <p><strong>${order.customerName}</strong></p>
        <p>${order.customerEmail}</p>
        ${order.customerPhone ? `<p>${order.customerPhone}</p>` : ""}
      </div>
      <div class="info-block" style="flex:1">
        <div class="section-title">Ship To</div>
        <p>${order.shippingAddress}</p>
        ${order.shippingCity ? `<p>${order.shippingCity}${order.shippingState ? ", " + order.shippingState : ""}${order.shippingZip ? " " + order.shippingZip : ""}</p>` : ""}
      </div>
      <div class="info-block">
        <div class="section-title">Status</div>
        <span class="status-badge" style="background:${statusColor}">${order.status}</span>
        ${order.estimatedDelivery ? `<p style="margin-top:6px">ETA: ${order.estimatedDelivery}</p>` : ""}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Order Items</div>
      <table>
        <thead><tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <div class="totals">
      <table class="totals-table">
        <tr><td>Subtotal</td><td style="text-align:right">KES ${order.subtotal.toLocaleString()}</td></tr>
        ${(order.discount ?? 0) > 0 ? `<tr><td style="color:#16a34a">Discount${order.couponCode ? " (" + order.couponCode + ")" : ""}</td><td style="text-align:right;color:#16a34a">-KES ${order.discount.toLocaleString()}</td></tr>` : ""}
        <tr><td>Shipping</td><td style="text-align:right">Free</td></tr>
        <tr class="total-row"><td>Total</td><td style="text-align:right">KES ${order.total.toLocaleString()}</td></tr>
      </table>
    </div>

    <div class="footer">
      <p>Netai Logistics · Where beauty meets reach.</p>
      <p>Thank you for shopping with us!</p>
    </div>
  </body></html>`;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any)?.id;
    const role = (session.user as any)?.role;

    const order = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (role !== "admin" && order.userId !== userId) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const html = buildInvoiceHtml(order);

    // Create PDF
    const createRes = await fetch("https://apps.abacus.ai/api/createConvertHtmlToPdfRequest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        html_content: html,
        pdf_options: { format: "A4", margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" }, print_background: true },
      }),
    });

    if (!createRes.ok) return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
    const { request_id } = await createRes.json();
    if (!request_id) return NextResponse.json({ error: "No request ID" }, { status: 500 });

    // Poll
    for (let i = 0; i < 120; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const statusRes = await fetch("https://apps.abacus.ai/api/getConvertHtmlToPdfStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id, deployment_token: process.env.ABACUSAI_API_KEY }),
      });
      const sr = await statusRes.json();
      if (sr?.status === "SUCCESS" && sr?.result?.result) {
        const buf = Buffer.from(sr.result.result, "base64");
        return new NextResponse(buf, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="Netai-Invoice-${order.orderNumber}.pdf"`,
          },
        });
      }
      if (sr?.status === "FAILED") return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
    }
    return NextResponse.json({ error: "PDF generation timed out" }, { status: 500 });
  } catch (error) {
    console.error("Invoice error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
