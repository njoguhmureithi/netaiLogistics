"use client";
import { useEffect, useState } from "react";
import { TrendingUp, ShoppingBag, Users, DollarSign, Package, AlertTriangle, Loader2, BarChart3 } from "lucide-react";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/animate";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics").then((r) => r.json()).then((d) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!data) return <p className="text-muted-foreground">Failed to load analytics</p>;

  const summary = data?.summary ?? {};
  const revenueByMonth = data?.revenueByMonth ?? [];
  const topProducts = data?.topProducts ?? [];
  const statusCounts = data?.statusCounts ?? {};
  const lowStock = data?.lowStock ?? [];
  const maxRevenue = Math.max(...revenueByMonth.map((m: any) => m?.revenue ?? 0), 1);

  const summaryCards = [
    { label: "Total Revenue", value: `KES ${(summary.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign, color: "text-primary bg-primary/10" },
    { label: "Total Orders", value: summary.totalOrders ?? 0, icon: ShoppingBag, color: "text-amber-500 bg-amber-500/10" },
    { label: "Customers", value: summary.totalCustomers ?? 0, icon: Users, color: "text-green-500 bg-green-500/10" },
    { label: "Avg Order Value", value: `KES ${(summary.avgOrderValue ?? 0).toLocaleString()}`, icon: TrendingUp, color: "text-blue-500 bg-blue-500/10" },
    { label: "Products", value: summary.totalProducts ?? 0, icon: Package, color: "text-purple-500 bg-purple-500/10" },
    { label: "Total Discounts", value: `KES ${(summary.totalDiscount ?? 0).toLocaleString()}`, icon: BarChart3, color: "text-orange-500 bg-orange-500/10" },
  ];

  return (
    <div className="max-w-[1200px]">
      <FadeIn>
        <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Analytics</h1>
        <p className="text-muted-foreground text-sm mb-6">Insights into your store&apos;s performance</p>
      </FadeIn>

      {/* Summary Cards */}
      <Stagger staggerDelay={0.06}>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {summaryCards.map((c, i) => (
            <StaggerItem key={i}>
              <div className="p-4 rounded-lg bg-card" style={{ boxShadow: "var(--shadow-sm)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{c.label}</span>
                  <div className={`p-1.5 rounded-lg ${c.color}`}><c.icon className="h-3.5 w-3.5" /></div>
                </div>
                <p className="text-xl font-bold">{c.value}</p>
              </div>
            </StaggerItem>
          ))}
        </div>
      </Stagger>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <FadeIn>
          <div className="p-6 rounded-lg bg-card" style={{ boxShadow: "var(--shadow-sm)" }}>
            <h2 className="font-display text-lg font-bold mb-4">Revenue (Last 6 Months)</h2>
            <div className="space-y-3">
              {revenueByMonth.map((m: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-16 shrink-0">{m.month}</span>
                  <div className="flex-1 h-7 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/80 rounded-full transition-all flex items-center justify-end pr-2" style={{ width: `${Math.max((m.revenue / maxRevenue) * 100, 2)}%` }}>
                      {m.revenue > 0 && <span className="text-[10px] font-medium text-primary-foreground whitespace-nowrap">KES {m.revenue.toLocaleString()}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground w-16 text-right">{m.orders} orders</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Order Status */}
        <FadeIn>
          <div className="p-6 rounded-lg bg-card" style={{ boxShadow: "var(--shadow-sm)" }}>
            <h2 className="font-display text-lg font-bold mb-4">Order Status Breakdown</h2>
            {Object.keys(statusCounts).length === 0 ? (
              <p className="text-muted-foreground text-sm">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(statusCounts).map(([status, count]) => {
                  const total = Object.values(statusCounts).reduce((s: number, v: any) => s + (v ?? 0), 0) as number;
                  const pct = total > 0 ? Math.round(((count as number) / total) * 100) : 0;
                  const colors: Record<string, string> = { Received: "bg-amber-500", Dispatched: "bg-blue-500", Delivered: "bg-green-500" };
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{status}</span>
                        <span className="text-muted-foreground">{count as number} ({pct}%)</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colors[status] ?? "bg-gray-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <FadeIn>
          <div className="p-6 rounded-lg bg-card" style={{ boxShadow: "var(--shadow-sm)" }}>
            <h2 className="font-display text-lg font-bold mb-4">Top Selling Products</h2>
            {topProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No sales data yet</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <span className="text-xs text-muted-foreground mr-2">#{i + 1}</span>
                      <span className="font-medium text-sm">{p.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">KES {p.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{p.quantity} units sold</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeIn>

        {/* Low Stock Alerts */}
        <FadeIn>
          <div className="p-6 rounded-lg bg-card" style={{ boxShadow: "var(--shadow-sm)" }}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className={`h-5 w-5 ${lowStock.length > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
              <h2 className="font-display text-lg font-bold">Inventory Alerts</h2>
              {lowStock.length > 0 && <Badge variant="destructive" className="ml-auto">{lowStock.length}</Badge>}
            </div>
            {lowStock.length === 0 ? (
              <div className="text-center py-6">
                <Package className="h-10 w-10 text-green-500/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All products are well-stocked</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStock.map((p: any) => (
                  <Link key={p.id} href="/admin/products" className="flex items-center justify-between py-2 border-b border-border last:border-0 hover:bg-muted/50 rounded px-2 -mx-2">
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.category}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={p.stockQuantity === 0 ? "destructive" : "secondary"} className="text-xs">
                        {p.stockQuantity === 0 ? "Out of stock" : `${p.stockQuantity} left`}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Threshold: {p.lowStockThreshold}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
