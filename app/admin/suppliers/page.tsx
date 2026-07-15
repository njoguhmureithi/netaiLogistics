"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Search, Plus, Truck, Mail, Phone, MapPin, ChevronDown, ChevronUp,
  Pencil, Trash2, X, Loader2, Package, Eye, EyeOff, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/animate";
import { toast } from "sonner";
import { format } from "date-fns";

interface SupplierItem {
  id: string;
  itemName: string;
  sku: string | null;
  unitPrice: number;
  currency: string;
  minOrderQty: number | null;
  leadTimeDays: number | null;
  notes: string | null;
}

interface Supplier {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  items?: SupplierItem[];
  _count?: { items: number };
}

const emptySupplierForm = { name: "", contactName: "", email: "", phone: "", address: "", notes: "" };
const emptyItemForm = { itemName: "", sku: "", unitPrice: "", currency: "KES", minOrderQty: "", leadTimeDays: "", notes: "" };

export default function AdminSuppliersPage() {
  const { data: session } = useSession() || {};
  const isAdmin = (session?.user as any)?.role === "admin";
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptySupplierForm);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<Supplier | null>(null);
  const [loadingItems, setLoadingItems] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Item form
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<SupplierItem | null>(null);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [savingItem, setSavingItem] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/admin/suppliers${params}`);
      if (res.ok) setSuppliers(await res.json());
    } catch (err) {
      console.error("Failed to fetch suppliers", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => fetchSuppliers(), 300);
    return () => clearTimeout(t);
  }, [fetchSuppliers]);

  const fetchSupplierDetail = async (id: string) => {
    setLoadingItems(true);
    try {
      const res = await fetch(`/api/admin/suppliers/${id}`);
      if (res.ok) setExpandedData(await res.json());
    } catch {} finally {
      setLoadingItems(false);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedData(null);
    } else {
      setExpandedId(id);
      fetchSupplierDetail(id);
    }
  };

  const openCreate = () => {
    setEditingSupplier(null);
    setForm(emptySupplierForm);
    setShowModal(true);
  };

  const openEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setForm({
      name: s.name,
      contactName: s.contactName || "",
      email: s.email || "",
      phone: s.phone || "",
      address: s.address || "",
      notes: s.notes || "",
    });
    setShowModal(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Supplier name is required"); return; }
    setSaving(true);
    try {
      const url = editingSupplier ? `/api/admin/suppliers/${editingSupplier.id}` : "/api/admin/suppliers";
      const method = editingSupplier ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); toast.error(d.error || "Failed to save"); return; }
      toast.success(editingSupplier ? "Supplier updated" : "Supplier created");
      setShowModal(false);
      fetchSuppliers();
      if (editingSupplier && expandedId === editingSupplier.id) fetchSupplierDetail(editingSupplier.id);
    } catch { toast.error("Failed to save supplier"); } finally { setSaving(false); }
  };

  const handleDeleteSupplier = async (id: string, name: string) => {
    if (!confirm(`Delete supplier "${name}" and all their items? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/suppliers/${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); toast.error(d.error || "Failed to delete"); return; }
      toast.success("Supplier deleted");
      if (expandedId === id) { setExpandedId(null); setExpandedData(null); }
      fetchSuppliers();
    } catch { toast.error("Failed to delete"); } finally { setDeletingId(null); }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/suppliers/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (res.ok) { toast.success(currentActive ? "Supplier deactivated" : "Supplier activated"); fetchSuppliers(); }
    } catch { toast.error("Failed to update status"); }
  };

  // Item handlers
  const openCreateItem = () => {
    setEditingItem(null);
    setItemForm(emptyItemForm);
    setShowItemModal(true);
  };

  const openEditItem = (item: SupplierItem) => {
    setEditingItem(item);
    setItemForm({
      itemName: item.itemName,
      sku: item.sku || "",
      unitPrice: String(item.unitPrice),
      currency: item.currency,
      minOrderQty: item.minOrderQty ? String(item.minOrderQty) : "",
      leadTimeDays: item.leadTimeDays ? String(item.leadTimeDays) : "",
      notes: item.notes || "",
    });
    setShowItemModal(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.itemName.trim()) { toast.error("Item name is required"); return; }
    if (!itemForm.unitPrice || Number(itemForm.unitPrice) < 0) { toast.error("Valid price is required"); return; }
    setSavingItem(true);
    try {
      const url = editingItem
        ? `/api/admin/suppliers/${expandedId}/items/${editingItem.id}`
        : `/api/admin/suppliers/${expandedId}/items`;
      const method = editingItem ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(itemForm) });
      if (!res.ok) { const d = await res.json(); toast.error(d.error || "Failed to save item"); return; }
      toast.success(editingItem ? "Item updated" : "Item added");
      setShowItemModal(false);
      if (expandedId) fetchSupplierDetail(expandedId);
      fetchSuppliers();
    } catch { toast.error("Failed to save item"); } finally { setSavingItem(false); }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Delete this item?")) return;
    setDeletingItemId(itemId);
    try {
      const res = await fetch(`/api/admin/suppliers/${expandedId}/items/${itemId}`, { method: "DELETE" });
      if (res.ok) { toast.success("Item deleted"); if (expandedId) fetchSupplierDetail(expandedId); fetchSuppliers(); }
      else toast.error("Failed to delete item");
    } catch { toast.error("Failed to delete"); } finally { setDeletingItemId(null); }
  };

  const stats = {
    total: suppliers.length,
    active: suppliers.filter(s => s.active).length,
    totalItems: suppliers.reduce((sum, s) => sum + (s._count?.items || 0), 0),
  };

  return (
    <div className="max-w-[1200px] space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Suppliers</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your suppliers, contacts, and item pricing</p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add Supplier
          </Button>
        </div>
      </FadeIn>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Total Suppliers</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{stats.active}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Total Items</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{stats.totalItems}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search suppliers..." className="pl-10" />
      </div>

      {/* Supplier List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : suppliers.length === 0 ? (
        <div className="text-center py-16"><Truck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No suppliers found</p></div>
      ) : (
        <div className="space-y-3">
          {suppliers.map(s => (
            <div key={s.id} className={`bg-card border border-border rounded-xl overflow-hidden transition-all ${!s.active ? 'opacity-60' : ''}`}>
              {/* Supplier row */}
              <div className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{s.name}</p>
                    <Badge variant={s.active ? "default" : "secondary"}
                      className={s.active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 text-[10px]" : "text-[10px] border-0"}
                    >
                      {s.active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="secondary" className="border-0 text-[10px]">
                      <Package className="h-2.5 w-2.5 mr-1" />{s._count?.items || 0} items
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                    {s.contactName && <span>{s.contactName}</span>}
                    {s.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{s.email}</span>}
                    {s.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleExpand(s.id)} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground" title="View items">
                    {expandedId === s.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground" title="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleToggleActive(s.id, s.active)} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground" title={s.active ? "Deactivate" : "Activate"}>
                    {s.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {isAdmin && (
                    <button onClick={() => handleDeleteSupplier(s.id, s.name)} disabled={deletingId === s.id}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-red-500" title="Delete">
                      {deletingId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded items section */}
              {expandedId === s.id && (
                <div className="border-t border-border bg-muted/30 p-4">
                  {loadingItems ? (
                    <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <Package className="h-4 w-4" /> Items &amp; Pricing
                          {expandedData?.address && (
                            <span className="font-normal text-muted-foreground text-xs flex items-center gap-1 ml-3">
                              <MapPin className="h-3 w-3" />{expandedData.address}
                            </span>
                          )}
                        </h3>
                        <Button size="sm" variant="outline" onClick={openCreateItem} className="gap-1 h-7 text-xs">
                          <Plus className="h-3 w-3" /> Add Item
                        </Button>
                      </div>
                      {expandedData?.notes && (
                        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1"><FileText className="h-3 w-3" />{expandedData.notes}</p>
                      )}
                      {(!expandedData?.items || expandedData.items.length === 0) ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No items yet. Add items this supplier provides.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-xs text-muted-foreground border-b border-border">
                                <th className="text-left pb-2 font-medium">Item</th>
                                <th className="text-left pb-2 font-medium">SKU</th>
                                <th className="text-right pb-2 font-medium">Price</th>
                                <th className="text-right pb-2 font-medium hidden sm:table-cell">MOQ</th>
                                <th className="text-right pb-2 font-medium hidden md:table-cell">Lead Time</th>
                                <th className="text-right pb-2 font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                              {expandedData.items.map(item => (
                                <tr key={item.id} className="hover:bg-muted/30">
                                  <td className="py-2 font-medium">{item.itemName}</td>
                                  <td className="py-2 text-muted-foreground font-mono text-xs">{item.sku || "—"}</td>
                                  <td className="py-2 text-right font-medium">{item.currency} {item.unitPrice.toLocaleString()}</td>
                                  <td className="py-2 text-right text-muted-foreground hidden sm:table-cell">{item.minOrderQty ?? "—"}</td>
                                  <td className="py-2 text-right text-muted-foreground hidden md:table-cell">{item.leadTimeDays ? `${item.leadTimeDays}d` : "—"}</td>
                                  <td className="py-2 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button onClick={() => openEditItem(item)} className="p-1 hover:bg-muted rounded text-muted-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                                      <button onClick={() => handleDeleteItem(item.id)} disabled={deletingItemId === item.id}
                                        className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500">
                                        {deletingItemId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-lg p-6 mx-4 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingSupplier ? "Edit Supplier" : "Add Supplier"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-muted rounded"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSaveSupplier} className="space-y-4">
              <div><Label>Company Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Supplier Co." required className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Contact Person</Label><Input value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} placeholder="Jane Doe" className="mt-1" /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+254 ..." className="mt-1" /></div>
              </div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="supplier@example.com" className="mt-1" /></div>
              <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Business Rd, Nairobi" className="mt-1" /></div>
              <div><Label>Notes</Label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Internal notes about this supplier..." className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px]" /></div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingSupplier ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowItemModal(false)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-lg p-6 mx-4 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingItem ? "Edit Item" : "Add Item"}</h2>
              <button onClick={() => setShowItemModal(false)} className="p-1 hover:bg-muted rounded"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div><Label>Item Name *</Label><Input value={itemForm.itemName} onChange={e => setItemForm({ ...itemForm, itemName: e.target.value })} placeholder="Argan Oil 500ml" required className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>SKU</Label><Input value={itemForm.sku} onChange={e => setItemForm({ ...itemForm, sku: e.target.value })} placeholder="SKU-001" className="mt-1" /></div>
                <div><Label>Currency</Label>
                  <select value={itemForm.currency} onChange={e => setItemForm({ ...itemForm, currency: e.target.value })} className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-input bg-background">
                    <option value="KES">KES</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Unit Price *</Label><Input type="number" step="0.01" min="0" value={itemForm.unitPrice} onChange={e => setItemForm({ ...itemForm, unitPrice: e.target.value })} placeholder="0.00" required className="mt-1" /></div>
                <div><Label>Min Order Qty</Label><Input type="number" min="1" value={itemForm.minOrderQty} onChange={e => setItemForm({ ...itemForm, minOrderQty: e.target.value })} placeholder="—" className="mt-1" /></div>
                <div><Label>Lead Time (days)</Label><Input type="number" min="1" value={itemForm.leadTimeDays} onChange={e => setItemForm({ ...itemForm, leadTimeDays: e.target.value })} placeholder="—" className="mt-1" /></div>
              </div>
              <div><Label>Notes</Label><textarea value={itemForm.notes} onChange={e => setItemForm({ ...itemForm, notes: e.target.value })} placeholder="Item-specific notes..." className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[60px]" /></div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowItemModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={savingItem}>
                  {savingItem ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingItem ? "Update Item" : "Add Item"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
