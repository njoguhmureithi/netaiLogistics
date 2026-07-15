"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Search, ShoppingBag, Clock, Truck, Eye, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/animate";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminOrdersPage() {
  const { data: session } = useSession() || {};
  const isAdmin = (session?.user as any)?.role === "admin";
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search) params.set("search", search);
    fetch(`/api/admin/orders?${params.toString()}`).then((r) => r?.json?.()).then((d: any) => setOrders(d ?? [])).catch(() => {}).finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleDeleteOrder = async (id: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to permanently delete order ${orderNumber}? This action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete order");
        return;
      }
      toast.success(`Order ${orderNumber} deleted`);
      fetchOrders();
    } catch {
      toast.error("Failed to delete order");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-[1200px]">
      <FadeIn>
        <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Orders</h1>
        <p className="text-sm text-muted-foreground mb-6">{orders?.length ?? 0} orders found</p>
      </FadeIn>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e: any) => setSearch(e?.target?.value ?? "")} placeholder="Search by order # or customer..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          {["all", "Received", "Dispatched"].map((s) => (
            <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}>
              {s === "all" ? "All" : s}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : (orders?.length ?? 0) === 0 ? (
        <div className="text-center py-16"><ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">No orders found</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-muted-foreground border-b">
                <th className="pb-3 font-medium">Order #</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Items</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(orders ?? []).map((o: any) => (
                <tr key={o?.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 font-mono text-sm font-medium">{o?.orderNumber}</td>
                  <td className="py-3 text-sm">{o?.customerName}</td>
                  <td className="py-3 text-sm text-muted-foreground">{o?.items?.length ?? 0}</td>
                  <td className="py-3 text-sm font-medium">KES {o?.total?.toLocaleString?.()}</td>
                  <td className="py-3">
                    <Badge variant={o?.status === "Dispatched" ? "default" : "secondary"}>
                      {o?.status === "Dispatched" ? <Truck className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                      {o?.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">{o?.createdAt ? format(new Date(o.createdAt), "MMM d, yyyy") : ""}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/orders/${o?.id}`}>
                        <Button variant="ghost" size="icon-sm"><Eye className="h-4 w-4" /></Button>
                      </Link>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteOrder(o?.id, o?.orderNumber)}
                          disabled={deletingId === o?.id}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          {deletingId === o?.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
