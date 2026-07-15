"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, User, Mail, Phone, Clock, Truck, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/animate";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession() || {};
  const isAdmin = (session?.user as any)?.role === "admin";
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/admin/customers/${params.id}`).then((r) => r?.json?.()).then((d: any) => setCustomer(d ?? null)).catch(() => {}).finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!customer) return <div className="text-center py-16"><p className="text-muted-foreground">Customer not found</p></div>;

  return (
    <div className="max-w-[800px]">
      <Link href="/admin/customers" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Customers
      </Link>
      <FadeIn>
        <div className="p-6 rounded-lg bg-card mb-6" style={{ boxShadow: "var(--shadow-sm)" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-primary/10"><User className="h-6 w-6 text-primary" /></div>
            <div>
              <h1 className="font-display text-xl font-bold">{customer?.name ?? "Unknown"}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{customer?.email}</span>
                {customer?.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{customer.phone}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted-foreground">Joined {customer?.createdAt ? format(new Date(customer.createdAt), "MMMM d, yyyy") : ""}</p>
            {isAdmin && customer?.role !== "admin" && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!confirm(`Are you sure you want to permanently delete "${customer?.name || customer?.email}" and all their orders? This cannot be undone.`)) return;
                  setDeleting(true);
                  try {
                    const res = await fetch(`/api/admin/customers/${params?.id}`, { method: "DELETE" });
                    if (!res.ok) { const d = await res.json(); toast.error(d.error || "Failed to delete"); return; }
                    toast.success("Customer deleted");
                    router.push("/admin/customers");
                  } catch { toast.error("Failed to delete customer"); } finally { setDeleting(false); }
                }}
                disabled={deleting}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                {deleting ? "Deleting..." : "Delete Customer"}
              </Button>
            )}
          </div>
        </div>

        <h2 className="font-display text-lg font-bold mb-4">Orders ({customer?.orders?.length ?? 0})</h2>
        {(customer?.orders?.length ?? 0) === 0 ? (
          <p className="text-muted-foreground text-sm">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {(customer?.orders ?? []).map((o: any) => (
              <Link key={o?.id} href={`/admin/orders/${o?.id}`} className="block p-4 rounded-lg bg-card hover:bg-muted/30 transition-colors" style={{ boxShadow: "var(--shadow-sm)" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sm font-medium">{o?.orderNumber}</span>
                    <p className="text-sm text-muted-foreground">{o?.items?.length ?? 0} items · KES {o?.total?.toLocaleString?.()}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={o?.status === "Dispatched" ? "default" : "secondary"}>
                      {o?.status === "Dispatched" ? <Truck className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                      {o?.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{o?.createdAt ? format(new Date(o.createdAt), "MMM d, yyyy") : ""}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </FadeIn>
    </div>
  );
}
