"use client";
import { useEffect, useState } from "react";
import { Package, ShoppingBag, Users, DollarSign, AlertTriangle, BarChart3 } from "lucide-react";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/animate";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, revenue: 0 });
  const [lowStock, setLowStock] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/products").then((r) => r?.json?.()),
      fetch("/api/admin/orders").then((r) => r?.json?.()),
      fetch("/api/admin/customers").then((r) => r?.json?.()),
      fetch("/api/admin/analytics").then((r) => r?.json?.()),
    ]).then(([products, orders, customers, analytics]) => {
      const prods = products ?? [];
      const ords = orders ?? [];
      const custs = customers ?? [];
      setStats({
        products: prods?.length ?? 0,
        orders: ords?.length ?? 0,
        customers: custs?.length ?? 0,
        revenue: (ords ?? []).reduce((t: number, o: any) => t + (o?.total ?? 0), 0),
      });
      setLowStock(analytics?.lowStock ?? []);
    }).catch(() => {});
  }, []);

  const cards = [
    { label: "Products", value: stats.products, icon: Package, color: "text-blue-500 bg-blue-500/10" },
    { label: "Orders", value: stats.orders, icon: ShoppingBag, color: "text-amber-500 bg-amber-500/10" },
    { label: "Customers", value: stats.customers, icon: Users, color: "text-green-500 bg-green-500/10" },
    { label: "Revenue", value: `KES ${stats.revenue?.toLocaleString?.() ?? "0"}`, icon: DollarSign, color: "text-primary bg-primary/10" },
  ];

  return (
    <div className="max-w-[1200px]">
      <FadeIn>
        <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm mb-6">Overview of your store performance</p>
      </FadeIn>
      <Stagger staggerDelay={0.08}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((c, i) => (
            <StaggerItem key={i}>
              <div className="p-5 rounded-lg bg-card" style={{ boxShadow: "var(--shadow-sm)" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">{c.label}</span>
                  <div className={`p-2 rounded-lg ${c.color}`}><c.icon className="h-4 w-4" /></div>
                </div>
                <p className="text-2xl font-bold">{c.value}</p>
              </div>
            </StaggerItem>
          ))}
        </div>
      </Stagger>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <FadeIn>
          <div className="p-5 rounded-lg bg-card mb-6" style={{ boxShadow: "var(--shadow-sm)" }}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="font-display text-lg font-bold">Low Stock Alerts</h2>
              <Badge variant="destructive" className="ml-auto">{lowStock.length} item{lowStock.length !== 1 ? "s" : ""}</Badge>
            </div>
            <div className="space-y-2">
              {lowStock.slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                  </div>
                  <Badge variant={p.stockQuantity === 0 ? "destructive" : "secondary"}>
                    {p.stockQuantity === 0 ? "Out of stock" : `${p.stockQuantity} left`}
                  </Badge>
                </div>
              ))}
              {lowStock.length > 5 && (
                <Link href="/admin/analytics" className="text-sm text-primary hover:underline block pt-2">View all {lowStock.length} alerts →</Link>
              )}
            </div>
          </div>
        </FadeIn>
      )}

      {/* Quick Links */}
      <FadeIn>
        <div className="flex gap-3">
          <Link href="/admin/analytics" className="flex-1 p-4 rounded-lg bg-card text-center hover:bg-muted/50 transition-colors" style={{ boxShadow: "var(--shadow-sm)" }}>
            <BarChart3 className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">View Analytics</p>
          </Link>
          <Link href="/admin/coupons" className="flex-1 p-4 rounded-lg bg-card text-center hover:bg-muted/50 transition-colors" style={{ boxShadow: "var(--shadow-sm)" }}>
            <Package className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Manage Coupons</p>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
