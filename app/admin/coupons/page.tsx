"use client";
import { useEffect, useState } from "react";
import { Tag, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FadeIn } from "@/components/ui/animate";
import { format } from "date-fns";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ code: "", description: "", discountType: "percentage", discountValue: "", minimumOrder: "0", maxUses: "", expiresAt: "" });

  const loadCoupons = () => fetch("/api/admin/coupons").then((r) => r.json()).then((d) => { setCoupons(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { loadCoupons(); }, []);

  const resetForm = () => { setForm({ code: "", description: "", discountType: "percentage", discountValue: "", minimumOrder: "0", maxUses: "", expiresAt: "" }); setEditing(null); };

  const openEdit = (c: any) => {
    setEditing(c);
    setForm({ code: c.code ?? "", description: c.description ?? "", discountType: c.discountType ?? "percentage", discountValue: String(c.discountValue ?? ""), minimumOrder: String(c.minimumOrder ?? 0), maxUses: c.maxUses ? String(c.maxUses) : "", expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 16) : "" });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.discountValue) { toast.error("Code and discount value are required"); return; }
    const url = editing ? `/api/admin/coupons/${editing.id}` : "/api/admin/coupons";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { toast.error(data?.error ?? "Failed"); return; }
    toast.success(editing ? "Coupon updated" : "Coupon created");
    setDialogOpen(false); resetForm(); loadCoupons();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    toast.success("Coupon deleted"); loadCoupons();
  };

  const toggleActive = async (c: any) => {
    await fetch(`/api/admin/coupons/${c.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !c.active }) });
    toast.success(c.active ? "Coupon deactivated" : "Coupon activated"); loadCoupons();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-[1200px]">
      <FadeIn>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Coupons</h1>
            <p className="text-muted-foreground text-sm">Manage discount codes for your store</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" /> New Coupon</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>{editing ? "Edit Coupon" : "Create Coupon"}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Code *</Label><Input value={form.code} onChange={(e: any) => setForm((p) => ({ ...p, code: e?.target?.value ?? "" }))} placeholder="e.g. SUMMER20" className="mt-1 uppercase" /></div>
                <div><Label>Description</Label><Input value={form.description} onChange={(e: any) => setForm((p) => ({ ...p, description: e?.target?.value ?? "" }))} placeholder="Summer sale 20% off" className="mt-1" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Discount Type</Label>
                    <select value={form.discountType} onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value }))} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (KES)</option>
                    </select>
                  </div>
                  <div><Label>Value *</Label><Input type="number" step="0.01" value={form.discountValue} onChange={(e: any) => setForm((p) => ({ ...p, discountValue: e?.target?.value ?? "" }))} className="mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Min Order (KES)</Label><Input type="number" step="0.01" value={form.minimumOrder} onChange={(e: any) => setForm((p) => ({ ...p, minimumOrder: e?.target?.value ?? "0" }))} className="mt-1" /></div>
                  <div><Label>Max Uses</Label><Input type="number" value={form.maxUses} onChange={(e: any) => setForm((p) => ({ ...p, maxUses: e?.target?.value ?? "" }))} placeholder="Unlimited" className="mt-1" /></div>
                </div>
                <div><Label>Expires At</Label><Input type="datetime-local" value={form.expiresAt} onChange={(e: any) => setForm((p) => ({ ...p, expiresAt: e?.target?.value ?? "" }))} className="mt-1" /></div>
                <Button type="submit" className="w-full">{editing ? "Update" : "Create"} Coupon</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </FadeIn>

      {coupons.length === 0 ? (
        <div className="text-center py-20">
          <Tag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No coupons created yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((c: any) => (
            <div key={c.id} className="p-4 rounded-lg bg-card flex flex-col sm:flex-row sm:items-center gap-3 justify-between" style={{ boxShadow: "var(--shadow-sm)" }}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-lg">{c.code}</span>
                  <Badge variant={c.active ? "default" : "secondary"}>{c.active ? "Active" : "Inactive"}</Badge>
                  {c.expiresAt && new Date(c.expiresAt) < new Date() && <Badge variant="destructive">Expired</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{c.description || "No description"}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{c.discountType === "percentage" ? `${c.discountValue}% off` : `KES ${c.discountValue} off`}</span>
                  {c.minimumOrder > 0 && <span>Min: KES {c.minimumOrder.toLocaleString()}</span>}
                  <span>Used: {c.usedCount ?? 0}{c.maxUses ? `/${c.maxUses}` : ""}</span>
                  {c.expiresAt && <span>Expires: {format(new Date(c.expiresAt), "MMM d, yyyy")}</span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => toggleActive(c)}>{c.active ? "Disable" : "Enable"}</Button>
                <Button variant="outline" size="sm" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="outline" size="sm" onClick={() => deleteCoupon(c.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
