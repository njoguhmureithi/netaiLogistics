"use client";
import { useEffect, useState } from "react";
import { MapPin, Plus, Pencil, Trash2, Loader2, GripVertical, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FadeIn } from "@/components/ui/animate";

interface PickupLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  hours: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

const defaultForm = { name: "", address: "", city: "", phone: "", hours: "", isActive: true, sortOrder: 0 };

export default function AdminPickupLocationsPage() {
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PickupLocation | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadLocations = () =>
    fetch("/api/admin/pickup-locations")
      .then((r) => r.json())
      .then((d) => { setLocations(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));

  useEffect(() => { loadLocations(); }, []);

  const resetForm = () => { setForm(defaultForm); setEditing(null); };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (loc: PickupLocation) => {
    setEditing(loc);
    setForm({
      name: loc.name,
      address: loc.address,
      city: loc.city,
      phone: loc.phone ?? "",
      hours: loc.hours ?? "",
      isActive: loc.isActive,
      sortOrder: loc.sortOrder,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.city) {
      toast.error("Name, address and city are required");
      return;
    }
    setSaving(true);
    const url = editing ? `/api/admin/pickup-locations/${editing.id}` : "/api/admin/pickup-locations";
    const method = editing ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.error ?? "Failed"); setSaving(false); return; }
      toast.success(editing ? "Pickup location updated" : "Pickup location created");
      setDialogOpen(false);
      resetForm();
      loadLocations();
    } catch {
      toast.error("Something went wrong");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this pickup location? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/pickup-locations/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to delete"); setDeletingId(null); return; }
      toast.success("Pickup location deleted");
      loadLocations();
    } catch {
      toast.error("Something went wrong");
    }
    setDeletingId(null);
  };

  const toggleActive = async (loc: PickupLocation) => {
    try {
      const res = await fetch(`/api/admin/pickup-locations/${loc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: loc.name, address: loc.address, city: loc.city, phone: loc.phone, hours: loc.hours, isActive: !loc.isActive, sortOrder: loc.sortOrder }),
      });
      if (!res.ok) { toast.error("Failed to update"); return; }
      toast.success(loc.isActive ? "Location deactivated" : "Location activated");
      loadLocations();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight">Pickup Locations</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage pickup points where customers can collect their orders
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add Location
          </Button>
        </div>
      </FadeIn>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : locations.length === 0 ? (
        <FadeIn>
          <div className="text-center py-16">
            <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-1">No pickup locations yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add your first pickup point for customers</p>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Add Location
            </Button>
          </div>
        </FadeIn>
      ) : (
        <FadeIn>
          <div className="space-y-3">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border transition-colors hover:border-primary/20"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">{loc.name}</h3>
                    <Badge variant={loc.isActive ? "default" : "secondary"} className="text-xs">
                      {loc.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {loc.sortOrder > 0 && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <GripVertical className="h-3 w-3" /> Order: {loc.sortOrder}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{loc.address}</p>
                  <p className="text-xs text-muted-foreground">{loc.city}</p>
                  <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                    {loc.phone && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {loc.phone}
                      </span>
                    )}
                    {loc.hours && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {loc.hours}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(loc)} title={loc.isActive ? "Deactivate" : "Activate"}>
                    <div className={`w-3 h-3 rounded-full ${loc.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(loc)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(loc.id)} disabled={deletingId === loc.id}>
                    {deletingId === loc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Pickup Location" : "Add Pickup Location"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <Label htmlFor="name">Location Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Netai CBD Hub" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="e.g. Moi Avenue, Nairobi CBD" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Nairobi" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. +254 700 123456" className="mt-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="hours">Operating Hours</Label>
              <Input id="hours" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="e.g. Mon-Fri 8AM-6PM, Sat 9AM-3PM" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input id="sortOrder" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })} className="mt-1" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input id="isActive" type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
                <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
