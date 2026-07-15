"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Tags, Upload, ImageIcon, Loader2, ChevronDown, ChevronRight, X, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FadeIn } from "@/components/ui/animate";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", imageUrl: "" });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Subcategory state
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [subParentId, setSubParentId] = useState("");
  const [editingSub, setEditingSub] = useState<any>(null);
  const [subForm, setSubForm] = useState({ name: "", description: "" });
  const [savingSub, setSavingSub] = useState(false);

  const fetchCategories = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/categories").then((r) => r?.json?.()).then((d: any) => setCategories(d ?? [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const toggleExpand = (id: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ===== Category CRUD =====
  const openNew = () => { setEditing(null); setForm({ name: "", description: "", imageUrl: "" }); setDialogOpen(true); };
  const openEdit = (c: any) => { setEditing(c); setForm({ name: c?.name ?? "", description: c?.description ?? "", imageUrl: c?.imageUrl ?? "" }); setDialogOpen(true); };

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
      const { uploadUrl } = await presignRes?.json?.() ?? {};
      if (!uploadUrl) { toast.error("Failed to get upload URL"); setUploadingImage(false); return; }
      const signedHeaders = new URL(uploadUrl)?.searchParams?.get?.("X-Amz-SignedHeaders") ?? "";
      const headers: Record<string, string> = { "Content-Type": file.type };
      if (signedHeaders?.includes?.("content-disposition")) { headers["Content-Disposition"] = "attachment"; }
      const uploadRes = await fetch(uploadUrl, { method: "PUT", headers, body: file });
      if (!uploadRes?.ok) { toast.error("Upload failed"); setUploadingImage(false); return; }
      const publicUrl = uploadUrl?.split?.("?")?.[0] ?? "";
      setForm((p) => ({ ...(p ?? {}), imageUrl: publicUrl }));
      toast.success("Image uploaded");
    } catch { toast.error("Upload error"); }
    setUploadingImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    if (!form.name) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res?.ok) { const d = await res?.json?.(); toast.error(d?.error ?? "Failed"); setSaving(false); return; }
      toast.success(editing ? "Category updated" : "Category created");
      setDialogOpen(false);
      fetchCategories();
    } catch { toast.error("Error"); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? All subcategories will also be deleted.")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const d = await res?.json?.();
      if (res?.ok) { toast.success("Deleted"); fetchCategories(); } else { toast.error(d?.error ?? "Failed to delete"); }
    } catch { toast.error("Error"); }
  };

  // ===== Subcategory CRUD =====
  const openNewSub = (categoryId: string) => {
    setSubParentId(categoryId);
    setEditingSub(null);
    setSubForm({ name: "", description: "" });
    setSubDialogOpen(true);
  };

  const openEditSub = (categoryId: string, sub: any) => {
    setSubParentId(categoryId);
    setEditingSub(sub);
    setSubForm({ name: sub?.name ?? "", description: sub?.description ?? "" });
    setSubDialogOpen(true);
  };

  const handleSubSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    if (!subForm.name?.trim()) { toast.error("Name is required"); return; }
    setSavingSub(true);
    try {
      const url = editingSub
        ? `/api/admin/categories/${subParentId}/subcategories/${editingSub.id}`
        : `/api/admin/categories/${subParentId}/subcategories`;
      const method = editingSub ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(subForm) });
      if (!res?.ok) { const d = await res?.json?.(); toast.error(d?.error ?? "Failed"); setSavingSub(false); return; }
      toast.success(editingSub ? "Subcategory updated" : "Subcategory created");
      setSubDialogOpen(false);
      fetchCategories();
    } catch { toast.error("Error"); }
    setSavingSub(false);
  };

  const handleDeleteSub = async (categoryId: string, subId: string) => {
    if (!confirm("Delete this subcategory? Products will be unlinked.")) return;
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}/subcategories/${subId}`, { method: "DELETE" });
      if (res?.ok) { toast.success("Subcategory deleted"); fetchCategories(); }
      else { const d = await res?.json?.(); toast.error(d?.error ?? "Failed"); }
    } catch { toast.error("Error"); }
  };

  const totalSubCount = categories.reduce((acc: number, c: any) => acc + (c?.subCategories?.length ?? 0), 0);

  return (
    <div className="max-w-[900px]">
      <FadeIn>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Categories</h1>
            <p className="text-sm text-muted-foreground">
              {categories?.length ?? 0} categories · {totalSubCount} subcategories
            </p>
          </div>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Add Category</Button>
        </div>
      </FadeIn>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : (categories?.length ?? 0) === 0 ? (
        <div className="text-center py-16"><Tags className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">No categories</p></div>
      ) : (
        <div className="space-y-2">
          {(categories ?? []).map((c: any) => {
            const isExpanded = expandedCats.has(c?.id);
            const subs = c?.subCategories ?? [];
            return (
              <div key={c?.id} className="rounded-xl bg-card border border-border/50" style={{ boxShadow: "var(--shadow-sm)" }}>
                {/* Category Row */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleExpand(c?.id)}
                      className="p-1 rounded hover:bg-muted transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    <div className="relative h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {c?.imageUrl ? (
                        <Image src={c.imageUrl} alt={c?.name ?? "Category"} fill className="object-cover" sizes="40px" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center"><ImageIcon className="h-4 w-4 text-muted-foreground/40" /></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{c?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c?._count?.products ?? 0} products · {subs.length} subcategories · /{c?.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openNewSub(c?.id)} title="Add subcategory">
                      <FolderTree className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(c?.id ?? "")} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>

                {/* Subcategories (expandable) */}
                {isExpanded && (
                  <div className="border-t border-border/50 bg-muted/20 px-4 py-3">
                    {subs.length === 0 ? (
                      <div className="flex items-center justify-between py-2">
                        <p className="text-sm text-muted-foreground italic">No subcategories</p>
                        <Button variant="outline" size="sm" onClick={() => openNewSub(c?.id)}>
                          <Plus className="h-3 w-3 mr-1" /> Add
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {subs.map((sub: any) => (
                          <div key={sub?.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-4 bg-primary/30 rounded-full" />
                              <div>
                                <span className="text-sm font-medium">{sub?.name}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {sub?._count?.products ?? 0} products
                                </span>
                                {sub?.description && (
                                  <span className="text-xs text-muted-foreground ml-2">· {sub.description}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon-sm" onClick={() => openEditSub(c?.id, sub)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteSub(c?.id, sub?.id)} className="text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="pt-1">
                          <Button variant="outline" size="sm" onClick={() => openNewSub(c?.id)}>
                            <Plus className="h-3 w-3 mr-1" /> Add Subcategory
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Name *</Label><Input name="name" value={form.name} onChange={(e: any) => setForm((p) => ({ ...(p ?? {}), name: e?.target?.value ?? "" }))} required className="mt-1" /></div>
            <div><Label>Description</Label><Input name="description" value={form.description} onChange={(e: any) => setForm((p) => ({ ...(p ?? {}), description: e?.target?.value ?? "" }))} className="mt-1" /></div>
            <div>
              <Label>Thumbnail Image</Label>
              <div className="mt-1 space-y-2">
                {form.imageUrl && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                    <Image src={form.imageUrl} alt="Category thumbnail preview" fill className="object-cover" sizes="400px" />
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="flex-1">
                    <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-dashed border-border cursor-pointer hover:bg-muted/50 transition-colors text-sm text-muted-foreground">
                      {uploadingImage ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</> : <><Upload className="h-4 w-4" /> Upload Image</>}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                </div>
                <Input placeholder="Or paste image URL" value={form.imageUrl} onChange={(e: any) => setForm((p) => ({ ...(p ?? {}), imageUrl: e?.target?.value ?? "" }))} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving || uploadingImage}>{saving ? "Saving..." : editing ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog open={subDialogOpen} onOpenChange={setSubDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSub ? "Edit Subcategory" : "Add Subcategory"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubSubmit} className="space-y-4">
            <div>
              <Label>Parent Category</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {categories.find((c: any) => c?.id === subParentId)?.name ?? ""}
              </p>
            </div>
            <div>
              <Label>Subcategory Name *</Label>
              <Input
                value={subForm.name}
                onChange={(e: any) => setSubForm((p) => ({ ...p, name: e?.target?.value ?? "" }))}
                placeholder="e.g. Serums, Lipsticks, Shampoos"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={subForm.description}
                onChange={(e: any) => setSubForm((p) => ({ ...p, description: e?.target?.value ?? "" }))}
                placeholder="Optional description"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setSubDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={savingSub}>
                {savingSub ? "Saving..." : editingSub ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
