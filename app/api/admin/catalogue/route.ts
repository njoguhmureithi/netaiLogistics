export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

function buildCatalogueHtml(products: any[], categories: any[]) {
  const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const categoryGroups = categories.map((cat) => {
    const catProducts = products.filter((p) => p.categoryId === cat.id);
    if (catProducts.length === 0) return "";
    const rows = catProducts.map((p, idx) => `
      <tr style="${idx % 2 === 1 ? 'background:#fdf2f8;' : ''}">
        <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0">${p.name}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;text-align:right">KES ${p.price.toLocaleString()}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;text-align:right;color:${p.compareAtPrice && p.compareAtPrice > p.price ? '#999;text-decoration:line-through' : '#666'}">${p.compareAtPrice && p.compareAtPrice > p.price ? 'KES ' + p.compareAtPrice.toLocaleString() : '-'}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;text-align:center">
          <span style="display:inline-block;padding:2px 10px;border-radius:10px;font-size:12px;font-weight:600;${p.stockQuantity === 0 ? 'background:#fee2e2;color:#dc2626' : p.stockQuantity <= (p.lowStockThreshold || 5) ? 'background:#fef3c7;color:#d97706' : 'background:#dcfce7;color:#16a34a'}">${p.stockQuantity}</span>
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;text-align:center">${p.active ? '<span style="color:#16a34a">✓</span>' : '<span style="color:#dc2626">✗</span>'}</td>
      </tr>
    `).join("");

    return `
      <div style="margin-bottom:30px">
        <h2 style="font-size:18px;color:#e11d73;margin:0 0 10px 0;padding-bottom:6px;border-bottom:2px solid #e11d73">${cat.name}</h2>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#1a1a2e">
              <th style="padding:10px 8px;text-align:left;color:white;font-size:11px;text-transform:uppercase;letter-spacing:0.5px">Product</th>
              <th style="padding:10px 8px;text-align:right;color:white;font-size:11px;text-transform:uppercase;letter-spacing:0.5px">Price</th>
              <th style="padding:10px 8px;text-align:right;color:white;font-size:11px;text-transform:uppercase;letter-spacing:0.5px">Was</th>
              <th style="padding:10px 8px;text-align:center;color:white;font-size:11px;text-transform:uppercase;letter-spacing:0.5px">Stock</th>
              <th style="padding:10px 8px;text-align:center;color:white;font-size:11px;text-transform:uppercase;letter-spacing:0.5px">Active</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="text-align:right;font-size:11px;color:#999;margin-top:4px">${catProducts.length} product${catProducts.length !== 1 ? 's' : ''}</p>
      </div>
    `;
  }).join("");

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.active).length;
  const totalStock = products.reduce((s, p) => s + p.stockQuantity, 0);
  const lowStock = products.filter((p) => p.active && p.stockQuantity <= (p.lowStockThreshold || 5)).length;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; margin: 0; padding: 40px; font-size: 14px; }
  </style></head><body>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #e11d73;padding-bottom:20px;margin-bottom:30px">
      <div>
        <div style="font-size:28px;font-weight:700;color:#e11d73">✦ Netai</div>
        <div style="font-size:11px;color:#666;margin-top:4px">Product Catalogue</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:24px;font-weight:700;color:#1a1a2e">CATALOGUE</div>
        <div style="font-size:12px;color:#666;margin-top:4px">Generated: ${now}</div>
      </div>
    </div>

    <div style="display:flex;gap:16px;margin-bottom:30px">
      <div style="flex:1;padding:12px;background:#fdf2f8;border-radius:8px;text-align:center">
        <div style="font-size:24px;font-weight:700;color:#e11d73">${totalProducts}</div>
        <div style="font-size:11px;color:#666;text-transform:uppercase">Total Products</div>
      </div>
      <div style="flex:1;padding:12px;background:#dcfce7;border-radius:8px;text-align:center">
        <div style="font-size:24px;font-weight:700;color:#16a34a">${activeProducts}</div>
        <div style="font-size:11px;color:#666;text-transform:uppercase">Active</div>
      </div>
      <div style="flex:1;padding:12px;background:#e0f2fe;border-radius:8px;text-align:center">
        <div style="font-size:24px;font-weight:700;color:#2563eb">${totalStock}</div>
        <div style="font-size:11px;color:#666;text-transform:uppercase">Total Stock</div>
      </div>
      <div style="flex:1;padding:12px;background:${lowStock > 0 ? '#fef3c7' : '#f0f0f0'};border-radius:8px;text-align:center">
        <div style="font-size:24px;font-weight:700;color:${lowStock > 0 ? '#d97706' : '#666'}">${lowStock}</div>
        <div style="font-size:11px;color:#666;text-transform:uppercase">Low Stock</div>
      </div>
    </div>

    ${categoryGroups}

    <div style="margin-top:40px;padding-top:20px;border-top:1px solid #eee;text-align:center;font-size:11px;color:#999">
      <p>Netai Logistics · Where beauty meets reach.</p>
      <p>Confidential — For internal use only</p>
    </div>
  </body></html>`;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (role !== "admin" && role !== "manager") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [products, categories] = await Promise.all([
      prisma.product.findMany({ where: { active: true, published: true }, orderBy: { name: "asc" } }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
    ]);

    const html = buildCatalogueHtml(products, categories);

    const createRes = await fetch("https://apps.abacus.ai/api/createConvertHtmlToPdfRequest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        html_content: html,
        pdf_options: { format: "A4", margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" }, print_background: true },
      }),
    });

    if (!createRes.ok) return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
    const { request_id } = await createRes.json();
    if (!request_id) return NextResponse.json({ error: "No request ID" }, { status: 500 });

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
            "Content-Disposition": `attachment; filename="Netai-Catalogue-${new Date().toISOString().slice(0, 10)}.pdf"`,
          },
        });
      }
      if (sr?.status === "FAILED") return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
    }
    return NextResponse.json({ error: "PDF generation timed out" }, { status: 500 });
  } catch (error) {
    console.error("Catalogue error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
