"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search, Package, FileDown, Loader2, CheckSquare, Square, MinusSquare, Eye, EyeOff, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { FadeIn } from "@/components/ui/animate";
import { useSession } from "next-auth/react";

export default function AdminProductsPage() {
  const { data: session } = useSession() || {};
  const isAdmin = (session?.user as any)?.role === "admin";
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", compareAtPrice: "", categoryId: "", subCategoryId: "", imageUrl: "", stockQuantity: "", featured: false });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [downloadingCatalogue, setDownloadingCatalogue] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleDownloadCatalogue = async () => {
    setDownloadingCatalogue(true);
    try {
      const res = await fetch("/api/admin/catalogue");
      if (!res.ok) { toast.error("Failed to generate catalogue"); setDownloadingCatalogue(false); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `netai-catalogue-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { toast.error("Error generating catalogue"); }
    setDownloadingCatalogue(false);
  };

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/products").then((r) => r?.json?.()),
      fetch("/api/admin/categories").then((r) => r?.json?.()),
    ]).then(([p, c]) => { setProducts(p ?? []); setCategories(c ?? []); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleChange = (e: any) => setForm((p) => ({ ...(p ?? {}), [e?.target?.name ?? ""]: e?.target?.value ?? "" }));

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", description: "", price: "", compareAtPrice: "", categoryId: categories?.[0]?.id ?? "", subCategoryId: "", imageUrl: "", stockQuantity: "0", featured: false });
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p?.name ?? "", description: p?.description ?? "", price: String(p?.price ?? ""),
      compareAtPrice: p?.compareAtPrice ? String(p.compareAtPrice) : "",
      categoryId: p?.categoryId ?? "", subCategoryId: p?.subCategoryId ?? "", imageUrl: p?.imageUrl ?? "",
      stockQuantity: String(p?.stockQuantity ?? 0), featured: p?.featured ?? false,
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = (e?.target?.files ?? [])?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const presignRes = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, isPublic: true }),
      });
      const { uploadUrl, cloud_storage_path } = await presignRes?.json?.() ?? {};
      if (!uploadUrl) { toast.error("Failed to get upload URL"); setUploadingImage(false); return; }

      const signedHeaders = new URL(uploadUrl)?.searchParams?.get?.("X-Amz-SignedHeaders") ?? "";
      const headers: Record<string, string> = { "Content-Type": file.type };
      if (signedHeaders?.includes?.("content-disposition")) {
        headers["Content-Disposition"] = "attachment";
      }
      const uploadRes = await fetch(uploadUrl, { method: "PUT", headers, body: file });
      if (!uploadRes?.ok) { toast.error("Upload failed"); setUploadingImage(false); return; }

      const publicUrl = uploadUrl?.split?.("?")?.[0] ?? "";
      setForm((p) => ({ ...(p ?? {}), imageUrl: publicUrl }));
      toast.success("Image uploaded");
    } catch (err: any) {
      console.error(err);
      toast.error("Upload failed");
    }
    setUploadingImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    if (!form.name || !form.price || !form.categoryId) { toast.error("Fill required fields"); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/admin/products/${editing.id}` : "/api/admin/products";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res?.ok) { const d = await res?.json?.(); toast.error(d?.error ?? "Failed"); setSaving(false); return; }
      toast.success(editing ? "Product updated" : "Product created");
      setDialogOpen(false);
      fetchData();
    } catch { toast.error("Error"); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res?.ok) { toast.success("Product deleted"); fetchData(); } else { toast.error("Failed to delete"); }
    } catch { toast.error("Error"); }
  };

  const filtered = (products ?? []).filter((p: any) => {
    if (!search) return true;
    const q = search?.toLowerCase?.() ?? "";
    return p?.name?.toLowerCase?.()?.includes?.(q) || p?.category?.name?.toLowerCase?.()?.includes?.(q);
  });

  // Selection helpers
  const filteredIds = filtered.map((p: any) => p?.id).filter(Boolean);
  const allSelected = filteredIds.length > 0 && filteredIds.every((id: string) => selectedIds.has(id));
  const someSelected = filteredIds.some((id: string) => selectedIds.has(id));
  const selectedCount = selectedIds.size;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredIds));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.size === 0) return;
    const actionLabels: Record<string, string> = {
      activate: "activate",
      deactivate: "deactivate",
      publish: "publish",
      unpublish: "unpublish from catalogue",
      delete: "permanently delete",
    };
    const label = actionLabels[action] || action;
    if (!confirm(`Are you sure you want to ${label} ${selectedIds.size} product(s)?`)) return;

    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: Array.from(selectedIds) }),
      });
      const data = await res?.json?.();
      if (res?.ok) {
        toast.success(data?.message || "Bulk action completed");
        setSelectedIds(new Set());
        fetchData();
      } else {
        toast.error(data?.error || "Bulk action failed");
      }
    } catch {
      toast.error("Error performing bulk action");
    }
    setBulkLoading(false);
  };

  return (
    <div className="max-w-[1200px]">
      <FadeIn>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Products</h1>
            <p className="text-sm text-muted-foreground">{products?.length ?? 0} total products</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownloadCatalogue} disabled={downloadingCatalogue}>
              {downloadingCatalogue ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
              {downloadingCatalogue ? "Generating..." : "Download Catalogue"}
            </Button>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
          </div>
        </div>
      </FadeIn>

      <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e: any) => setSearch(e?.target?.value ?? "")} placeholder="Search products..." className="pl-10" />
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedCount > 0 && (
        <div className="mb-4 flex items-center gap-2 flex-wrap p-3 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-sm font-medium mr-2">
            {selectedCount} product{selectedCount !== 1 ? "s" : ""} selected
          </span>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction("activate")} disabled={bulkLoading}>
            <Power className="h-3.5 w-3.5 mr-1.5" /> Activate
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction("deactivate")} disabled={bulkLoading}>
            <PowerOff className="h-3.5 w-3.5 mr-1.5" /> Deactivate
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction("publish")} disabled={bulkLoading}>
            <Eye className="h-3.5 w-3.5 mr-1.5" /> Publish
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction("unpublish")} disabled={bulkLoading}>
            <EyeOff className="h-3.5 w-3.5 mr-1.5" /> Unpublish
          </Button>
          {isAdmin && (
            <Button size="sm" variant="destructive" onClick={() => handleBulkAction("delete")} disabled={bulkLoading}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Permanently
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())} disabled={bulkLoading}>
            Clear Selection
          </Button>
          {bulkLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : (filtered?.length ?? 0) === 0 ? (
        <div className="text-center py-16"><Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">No products found</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-muted-foreground border-b">
                <th className="pb-3 pr-2 w-10">
                  <button onClick={toggleAll} className="p-0.5 hover:text-foreground transition-colors" aria-label="Select all">
                    {allSelected ? (
                      <CheckSquare className="h-4.5 w-4.5 text-primary" />
                    ) : someSelected ? (
                      <MinusSquare className="h-4.5 w-4.5 text-primary" />
                    ) : (
                      <Square className="h-4.5 w-4.5" />
                    )}
                  </button>
                </th>
                <th className="pb-3 font-medium">Product</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Price</th>
                <th className="pb-3 font-medium">Stock</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Published</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(filtered ?? []).map((p: any) => (
                <tr key={p?.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${selectedIds.has(p?.id) ? "bg-primary/5" : ""}`}>
                  <td className="py-3 pr-2">
                    <button onClick={() => toggleOne(p?.id)} className="p-0.5 hover:text-foreground transition-colors" aria-label={`Select ${p?.name}`}>
                      {selectedIds.has(p?.id) ? (
                        <CheckSquare className="h-4.5 w-4.5 text-primary" />
                      ) : (
                        <Square className="h-4.5 w-4.5 text-muted-foreground" />
                      )}
                    </button>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded bg-muted overflow-hidden shrink-0">
                        {p?.imageUrl ? <Image src={p.imageUrl} alt={p?.name ?? ""} fill className="object-cover" sizes="40px" /> : <div className="w-full h-full bg-muted" />}
                      </div>
                      <span className="text-sm font-medium truncate max-w-[200px]">{p?.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">{p?.category?.name ?? ""}</td>
                  <td className="py-3 text-sm font-medium">KES {p?.price?.toLocaleString?.()}</td>
                  <td className="py-3"><Badge variant={(p?.stockQuantity ?? 0) > 0 ? "secondary" : "destructive"}>{p?.stockQuantity ?? 0}</Badge></td>
                  <td className="py-3"><Badge variant={p?.active ? "default" : "secondary"}>{p?.active ? "Active" : "Inactive"}</Badge></td>
                  <td className="py-3"><Badge variant={p?.published ? "default" : "outline"} className={p?.published ? "" : "text-muted-foreground"}>{p?.published ? "Published" : "Draft"}</Badge></td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(p?.id ?? "")} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Name *</Label><Input name="name" value={form.name} onChange={handleChange} required className="mt-1" /></div>
            <div><Label>Description</Label><Textarea name="description" value={form.description} onChange={handleChange} className="mt-1" rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Price (KES) *</Label><Input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required className="mt-1" /></div>
              <div><Label>Compare Price</Label><Input name="compareAtPrice" type="number" step="0.01" value={form.compareAtPrice} onChange={handleChange} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Category *</Label>
                <select name="categoryId" value={form.categoryId} onChange={(e: any) => setForm((p) => ({ ...p, categoryId: e?.target?.value ?? "", subCategoryId: "" }))} className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background text-sm" required>
                  <option value="">Select category</option>
                  {(categories ?? []).map((c: any) => <option key={c?.id} value={c?.id}>{c?.name}</option>)}
                </select>
              </div>
              <div><Label>Subcategory</Label>
                <select name="subCategoryId" value={form.subCategoryId} onChange={handleChange} className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background text-sm">
                  <option value="">None</option>
                  {(categories?.find((c: any) => c?.id === form.categoryId)?.subCategories ?? []).map((sc: any) => (
                    <option key={sc?.id} value={sc?.id}>{sc?.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div><Label>Stock Quantity</Label><Input name="stockQuantity" type="number" value={form.stockQuantity} onChange={handleChange} className="mt-1" /></div>
            <div><Label>Product Image</Label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1" disabled={uploadingImage} />
              {uploadingImage && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
              {form.imageUrl && (
                <div className="mt-2 relative w-20 h-20 rounded bg-muted overflow-hidden">
                  <Image src={form.imageUrl} alt="Preview" fill className="object-cover" sizes="80px" />
                </div>
              )}
              <div className="mt-1"><Label className="text-xs text-muted-foreground">Or paste image URL:</Label><Input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://cdn.dribbble.com/userupload/45870921/file/2175ab72af24d9c0009a035f81eaa79e.png?format=webp&resize=400x300&vertical=center" className="mt-1" /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.featured} onCheckedChange={(v: boolean) => setForm((p) => ({ ...(p ?? {}), featured: v }))} />
              <Label>Featured Product</Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving} loading={saving}>{saving ? "Saving..." : editing ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}