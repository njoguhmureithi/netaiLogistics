"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { FadeIn, SlideIn } from "@/components/ui/animate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  ImageIcon,
  Upload,
  Loader2,
  GripVertical,
  Eye,
  EyeOff,
  Megaphone,
  LayoutTemplate,
  Clock,
  Link as LinkIcon,
  Ticket,
  ArrowUpDown,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */
interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  buttonText: string;
  buttonLink: string;
  imageUrl: string | null;
  overlayColor: string;
  isActive: boolean;
  sortOrder: number;
}

interface PromoPopup {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  couponCode: string | null;
  isActive: boolean;
  showDelay: number;
  displayFrequency: string;
  startDate: string | null;
  endDate: string | null;
}

const emptyHero: Omit<HeroSlide, "id"> = {
  title: "",
  subtitle: "",
  badge: "",
  buttonText: "Shop Now",
  buttonLink: "/products",
  imageUrl: "",
  overlayColor: "from-black/60 via-black/40 to-transparent",
  isActive: true,
  sortOrder: 0,
};

const emptyPopup: Omit<PromoPopup, "id"> = {
  title: "",
  description: "",
  imageUrl: "",
  buttonText: "",
  buttonLink: "",
  couponCode: "",
  isActive: false,
  showDelay: 3,
  displayFrequency: "once_per_session",
  startDate: null,
  endDate: null,
};

/* ═══════════════════════════════════════════════════════════════
   IMAGE UPLOAD HELPER
   ═══════════════════════════════════════════════════════════════ */
async function uploadImage(file: File): Promise<string> {
  const res = await fetch("/api/upload/presigned", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, fileType: file.type }),
  });
  if (!res.ok) throw new Error("Failed to get presigned URL");
  const { uploadUrl, publicUrl, signedHeaders } = await res.json();
  const headers: Record<string, string> = { "Content-Type": file.type };
  if (signedHeaders?.["content-disposition"]) headers["Content-Disposition"] = "attachment";
  const up = await fetch(uploadUrl, { method: "PUT", headers, body: file });
  if (!up.ok) throw new Error("Upload failed");
  return publicUrl;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function ContentManagementPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Content Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage your hero banners and promotional pop-ups
            </p>
          </div>
        </div>
      </FadeIn>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4" /> Hero Banners
          </TabsTrigger>
          <TabsTrigger value="popups" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" /> Promo Pop-ups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <HeroManager />
        </TabsContent>
        <TabsContent value="popups">
          <PopupManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO BANNER MANAGER
   ═══════════════════════════════════════════════════════════════ */
function HeroManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyHero);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSlides = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/hero");
      if (res.ok) setSlides(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSlides(); }, [fetchSlides]);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyHero, sortOrder: slides.length });
    setDialogOpen(true);
  }

  function openEdit(s: HeroSlide) {
    setEditingId(s.id);
    setForm({
      title: s.title,
      subtitle: s.subtitle || "",
      badge: s.badge || "",
      buttonText: s.buttonText,
      buttonLink: s.buttonLink,
      imageUrl: s.imageUrl || "",
      overlayColor: s.overlayColor,
      isActive: s.isActive,
      sortOrder: s.sortOrder,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/hero/${editingId}` : "/api/admin/hero";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(editingId ? "Slide updated" : "Slide created");
      setDialogOpen(false);
      fetchSlides();
    } catch {
      toast.error("Failed to save slide");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this hero slide?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/hero/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Slide deleted");
      fetchSlides();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleActive(s: HeroSlide) {
    try {
      const res = await fetch(`/api/admin/hero/${s.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !s.isActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(s.isActive ? "Slide deactivated" : "Slide activated");
      fetchSlides();
    } catch {
      toast.error("Failed to update");
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {slides.length} banner{slides.length !== 1 ? "s" : ""} configured
        </p>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" /> Add Banner
        </Button>
      </div>

      {slides.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <LayoutTemplate className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium mb-1">No hero banners yet</h3>
          <p className="text-sm text-muted-foreground mb-4">The homepage will show a default banner. Add one to customize it.</p>
          <Button onClick={openCreate} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" /> Create First Banner
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((s, i) => (
            <SlideIn key={s.id} from="left" delay={i * 0.05}>
              <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                <GripVertical className="h-5 w-5 text-muted-foreground/40 flex-shrink-0" />
                <div className="relative w-24 h-14 rounded overflow-hidden bg-muted flex-shrink-0">
                  {s.imageUrl ? (
                    <Image src={s.imageUrl} alt={s.title} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{s.title}</p>
                    <Badge variant={s.isActive ? "default" : "secondary"} className="text-xs">
                      {s.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Order: {s.sortOrder}</span>
                  </div>
                  {s.subtitle && <p className="text-sm text-muted-foreground truncate">{s.subtitle}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleToggleActive(s)} title={s.isActive ? "Deactivate" : "Activate"}>
                    {s.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(s.id)}
                    disabled={deletingId === s.id}
                    className="text-destructive hover:text-destructive"
                  >
                    {deletingId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </SlideIn>
          ))}
        </div>
      )}

      {/* Hero Slide Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Hero Banner" : "New Hero Banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Image */}
            <div>
              <Label>Banner Image</Label>
              <div className="mt-1.5 space-y-2">
                {form.imageUrl && (
                  <div className="relative w-full aspect-[21/9] rounded-lg overflow-hidden bg-muted">
                    <Image src={form.imageUrl} alt="Preview" fill className="object-cover" />
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="flex-1">
                    <div className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer hover:bg-muted/50 text-sm">
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploading ? "Uploading..." : "Upload Image"}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                  <Input
                    placeholder="Or paste image URL"
                    value={form.imageUrl || ""}
                    onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                    className="flex-[2]"
                  />
                </div>
              </div>
            </div>

            {/* Badge */}
            <div>
              <Label>Badge Text <span className="text-muted-foreground text-xs">(small label above title)</span></Label>
              <Input placeholder="e.g. Premium Beauty" value={form.badge || ""} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} />
            </div>

            {/* Title */}
            <div>
              <Label>Title *</Label>
              <Input placeholder="e.g. Where Beauty Meets Reach" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>

            {/* Subtitle */}
            <div>
              <Label>Subtitle</Label>
              <Textarea placeholder="Supporting description text" value={form.subtitle || ""} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} rows={2} />
            </div>

            {/* Button */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Button Text</Label>
                <Input value={form.buttonText} onChange={(e) => setForm((f) => ({ ...f, buttonText: e.target.value }))} />
              </div>
              <div>
                <Label>Button Link</Label>
                <Input value={form.buttonLink} onChange={(e) => setForm((f) => ({ ...f, buttonLink: e.target.value }))} />
              </div>
            </div>

            {/* Sort + Active */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sort Order</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
                <Label>Active</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editingId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROMO POPUP MANAGER
   ═══════════════════════════════════════════════════════════════ */
function PopupManager() {
  const [popups, setPopups] = useState<PromoPopup[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyPopup);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPopups = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/promo-popups");
      if (res.ok) setPopups(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPopups(); }, [fetchPopups]);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyPopup });
    setDialogOpen(true);
  }

  function openEdit(p: PromoPopup) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description || "",
      imageUrl: p.imageUrl || "",
      buttonText: p.buttonText || "",
      buttonLink: p.buttonLink || "",
      couponCode: p.couponCode || "",
      isActive: p.isActive,
      showDelay: p.showDelay,
      displayFrequency: p.displayFrequency,
      startDate: p.startDate ? p.startDate.slice(0, 16) : null,
      endDate: p.endDate ? p.endDate.slice(0, 16) : null,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/promo-popups/${editingId}` : "/api/admin/promo-popups";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(editingId ? "Pop-up updated" : "Pop-up created");
      setDialogOpen(false);
      fetchPopups();
    } catch {
      toast.error("Failed to save pop-up");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this promotional pop-up?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/promo-popups/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Pop-up deleted");
      fetchPopups();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleActive(p: PromoPopup) {
    try {
      const res = await fetch(`/api/admin/promo-popups/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(p.isActive ? "Pop-up deactivated" : "Pop-up activated");
      fetchPopups();
    } catch {
      toast.error("Failed to update");
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const freqLabels: Record<string, string> = {
    once_per_session: "Once per session",
    once_per_day: "Once per day",
    always: "Every page load",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {popups.length} pop-up{popups.length !== 1 ? "s" : ""} configured
        </p>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" /> Add Pop-up
        </Button>
      </div>

      {popups.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium mb-1">No promotional pop-ups</h3>
          <p className="text-sm text-muted-foreground mb-4">Create pop-ups to promote offers, discounts, or announcements.</p>
          <Button onClick={openCreate} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" /> Create First Pop-up
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {popups.map((p, i) => (
            <SlideIn key={p.id} from="left" delay={i * 0.05}>
              <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                <div className="relative w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt={p.title} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Megaphone className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{p.title}</p>
                    <Badge variant={p.isActive ? "default" : "secondary"} className="text-xs">
                      {p.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {p.couponCode && (
                      <span className="flex items-center gap-1"><Ticket className="h-3 w-3" /> {p.couponCode}</span>
                    )}
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {p.showDelay}s delay</span>
                    <span>{freqLabels[p.displayFrequency] || p.displayFrequency}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleToggleActive(p)} title={p.isActive ? "Deactivate" : "Activate"}>
                    {p.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="text-destructive hover:text-destructive"
                  >
                    {deletingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </SlideIn>
          ))}
        </div>
      )}

      {/* Popup Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Promotional Pop-up" : "New Promotional Pop-up"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Image */}
            <div>
              <Label>Pop-up Image</Label>
              <div className="mt-1.5 space-y-2">
                {form.imageUrl && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                    <Image src={form.imageUrl} alt="Preview" fill className="object-cover" />
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="flex-1">
                    <div className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer hover:bg-muted/50 text-sm">
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploading ? "Uploading..." : "Upload Image"}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                  <Input
                    placeholder="Or paste image URL"
                    value={form.imageUrl || ""}
                    onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                    className="flex-[2]"
                  />
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <Label>Title *</Label>
              <Input placeholder="e.g. Summer Sale!" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Textarea placeholder="Pop-up message text" value={form.description || ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </div>

            {/* Button */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Button Text</Label>
                <Input placeholder="e.g. Shop Now" value={form.buttonText || ""} onChange={(e) => setForm((f) => ({ ...f, buttonText: e.target.value }))} />
              </div>
              <div>
                <Label>Button Link</Label>
                <Input placeholder="e.g. /products?category=sale" value={form.buttonLink || ""} onChange={(e) => setForm((f) => ({ ...f, buttonLink: e.target.value }))} />
              </div>
            </div>

            {/* Coupon Code */}
            <div>
              <Label>Coupon Code <span className="text-muted-foreground text-xs">(optional, shown with copy button)</span></Label>
              <Input placeholder="e.g. SUMMER20" value={form.couponCode || ""} onChange={(e) => setForm((f) => ({ ...f, couponCode: e.target.value }))} />
            </div>

            {/* Timing */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Show Delay (seconds)</Label>
                <Input type="number" min={0} value={form.showDelay} onChange={(e) => setForm((f) => ({ ...f, showDelay: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>Display Frequency</Label>
                <select
                  className="w-full h-9 rounded-md border px-3 text-sm bg-transparent"
                  value={form.displayFrequency}
                  onChange={(e) => setForm((f) => ({ ...f, displayFrequency: e.target.value }))}
                >
                  <option value="once_per_session">Once per session</option>
                  <option value="once_per_day">Once per day</option>
                  <option value="always">Every page load</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
                <Label>Active</Label>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  type="datetime-local"
                  value={form.startDate || ""}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value || null }))}
                />
              </div>
              <div>
                <Label>End Date <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  type="datetime-local"
                  value={form.endDate || ""}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value || null }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editingId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
