"use client";
import { useEffect, useState } from "react";
import { Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FadeIn } from "@/components/ui/animate";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => {
      setSettings(d ?? {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      if (res.ok) toast.success("Settings saved");
      else toast.error("Failed to save");
    } catch { toast.error("Failed to save"); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-[600px]">
      <FadeIn>
        <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Store Settings</h1>
        <p className="text-muted-foreground text-sm mb-8">Configure store-wide settings</p>
      </FadeIn>

      <div className="space-y-6">
        <div className="p-6 rounded-lg bg-card" style={{ boxShadow: "var(--shadow-sm)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-bold">Order Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="moq">Minimum Order Value (KES)</Label>
              <p className="text-xs text-muted-foreground mb-1">Customers must meet this minimum to place an order. Set to 0 for no minimum.</p>
              <Input
                id="moq"
                type="number"
                step="0.01"
                min="0"
                value={settings.minimum_order_value ?? "0"}
                onChange={(e: any) => setSettings((p) => ({ ...p, minimum_order_value: e?.target?.value ?? "0" }))}
                className="mt-1 max-w-xs"
              />
            </div>
            <div>
              <Label htmlFor="low_stock">Default Low Stock Threshold</Label>
              <p className="text-xs text-muted-foreground mb-1">Default threshold for new products. Each product can override this.</p>
              <Input
                id="low_stock"
                type="number"
                min="0"
                value={settings.default_low_stock_threshold ?? "5"}
                onChange={(e: any) => setSettings((p) => ({ ...p, default_low_stock_threshold: e?.target?.value ?? "5" }))}
                className="mt-1 max-w-xs"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} loading={saving} className="w-full sm:w-auto">
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
