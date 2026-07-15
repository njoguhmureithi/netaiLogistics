"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Search, Users, Eye, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/ui/animate";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminCustomersPage() {
  const { data: session } = useSession() || {};
  const isAdmin = (session?.user as any)?.role === "admin";
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCustomers = useCallback(() => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    fetch(`/api/admin/customers${params}`).then((r) => r?.json?.()).then((d: any) => setCustomers(d ?? [])).catch(() => {}).finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete customer "${name || "this customer"}" and all their orders? This action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete customer");
        return;
      }
      toast.success("Customer deleted");
      fetchCustomers();
    } catch {
      toast.error("Failed to delete customer");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-[1200px]">
      <FadeIn>
        <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Customers</h1>
        <p className="text-sm text-muted-foreground mb-6">{customers?.length ?? 0} registered customers</p>
      </FadeIn>

      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e: any) => setSearch(e?.target?.value ?? "")} placeholder="Search customers..." className="pl-10" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : (customers?.length ?? 0) === 0 ? (
        <div className="text-center py-16"><Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">No customers found</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-muted-foreground border-b">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium">Orders</th>
                <th className="pb-3 font-medium">Joined</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(customers ?? []).map((c: any) => (
                <tr key={c?.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 text-sm font-medium">{c?.name ?? "—"}</td>
                  <td className="py-3 text-sm text-muted-foreground">{c?.email}</td>
                  <td className="py-3 text-sm text-muted-foreground">{c?.phone ?? "—"}</td>
                  <td className="py-3 text-sm">{c?._count?.orders ?? 0}</td>
                  <td className="py-3 text-sm text-muted-foreground">{c?.createdAt ? format(new Date(c.createdAt), "MMM d, yyyy") : ""}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/customers/${c?.id}`}>
                        <Button variant="ghost" size="icon-sm"><Eye className="h-4 w-4" /></Button>
                      </Link>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteCustomer(c?.id, c?.name)}
                          disabled={deletingId === c?.id}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          {deletingId === c?.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
