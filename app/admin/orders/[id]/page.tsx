"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft, Package, Clock, Truck, MapPin, User, Download, Loader2, Trash2,
  CheckCircle2, XCircle, ChevronRight, Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FadeIn } from "@/components/ui/animate";
import { format } from "date-fns";

/* ─── Order progress steps ─── */
const STATUS_FLOW = [
  { key: "Received",   label: "Received",   icon: Package,      color: "bg-blue-500",   ring: "ring-blue-200 dark:ring-blue-800" },
  { key: "Processing", label: "Processing",  icon: Clock,        color: "bg-amber-500",  ring: "ring-amber-200 dark:ring-amber-800" },
  { key: "Dispatched", label: "Dispatched",  icon: Truck,        color: "bg-purple-500", ring: "ring-purple-200 dark:ring-purple-800" },
  { key: "Delivered",  label: "Delivered",   icon: CheckCircle2, color: "bg-green-500",  ring: "ring-green-200 dark:ring-green-800" },
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession() || {};
  const isAdmin = (session?.user as any)?.role === "admin";
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ─── fetch order ─── */
  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/orders/${params.id}`).then((r) => r?.json?.()).then((d: any) => {
      setOrder(d ?? null);
      setEstimatedDelivery(d?.estimatedDelivery ?? "");
    }).catch(() => {}).finally(() => setLoading(false));
  }, [params?.id]);

  /* ─── helpers ─── */
  const isCancelled = order?.status === "Cancelled";
  const currentStepIdx = STATUS_FLOW.findIndex((s) => s.key === order?.status);
  const nextStep = !isCancelled && currentStepIdx >= 0 && currentStepIdx < STATUS_FLOW.length - 1
    ? STATUS_FLOW[currentStepIdx + 1]
    : null;
  const isTerminal = isCancelled || order?.status === "Delivered";

  /* ─── advance to next status ─── */
  const handleAdvance = async (targetStatus: string) => {
    if (targetStatus === "Dispatched" && !estimatedDelivery.trim()) {
      toast.error("Please enter an estimated delivery time before dispatching.");
      return;
    }
    setUpdating(targetStatus);
    try {
      const body: any = { status: targetStatus };
      if (targetStatus === "Dispatched") body.estimatedDelivery = estimatedDelivery;
      const res = await fetch(`/api/admin/orders/${params?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res?.ok) {
        const data = await res?.json?.();
        setOrder(data);
        setEstimatedDelivery(data?.estimatedDelivery ?? estimatedDelivery);
        toast.success(`Order updated to ${targetStatus}`);
      } else { toast.error("Failed to update status"); }
    } catch { toast.error("Something went wrong"); }
    setUpdating(null);
  };

  /* ─── cancel order ─── */
  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order? The customer will be notified.")) return;
    setUpdating("Cancelled");
    try {
      const res = await fetch(`/api/admin/orders/${params?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" }),
      });
      if (res?.ok) {
        const data = await res?.json?.();
        setOrder(data);
        toast.success("Order cancelled");
      } else { toast.error("Failed to cancel order"); }
    } catch { toast.error("Something went wrong"); }
    setUpdating(null);
  };

  /* ─── invoice download ─── */
  const handleDownloadInvoice = async () => {
    if (!params?.id) return;
    setDownloadingInvoice(true);
    try {
      const res = await fetch(`/api/orders/${params.id}/invoice`);
      if (!res.ok) { toast.error("Failed to generate invoice"); setDownloadingInvoice(false); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${order?.orderNumber || params.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { toast.error("Error generating invoice"); }
    setDownloadingInvoice(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!order) return <div className="text-center py-16"><p className="text-muted-foreground">Order not found</p></div>;

  return (
    <div className="max-w-[800px]">
      <Link href="/admin/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Orders
      </Link>
      <FadeIn>
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="font-display text-2xl font-bold tracking-tight">{order?.orderNumber}</h1>
          </div>
          <Badge
            variant={isCancelled ? "destructive" : order?.status === "Delivered" ? "default" : "secondary"}
            className="w-fit"
          >
            {isCancelled ? <XCircle className="h-3 w-3 mr-1" /> : order?.status === "Delivered" ? <CheckCircle2 className="h-3 w-3 mr-1" /> : order?.status === "Dispatched" ? <Truck className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
            {order?.status}
          </Badge>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={handleDownloadInvoice} disabled={downloadingInvoice}>
            {downloadingInvoice ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            {downloadingInvoice ? "Generating..." : "Download Invoice"}
          </Button>
          {isAdmin && (
            <Button
              variant="outline" size="sm"
              onClick={async () => {
                if (!confirm(`Are you sure you want to permanently delete order ${order?.orderNumber}? This action cannot be undone.`)) return;
                setDeleting(true);
                try {
                  const res = await fetch(`/api/admin/orders/${params?.id}`, { method: "DELETE" });
                  if (!res.ok) { const d = await res.json(); toast.error(d.error || "Failed to delete"); return; }
                  toast.success("Order deleted");
                  router.push("/admin/orders");
                } catch { toast.error("Failed to delete order"); } finally { setDeleting(false); }
              }}
              disabled={deleting}
              className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
            >
              {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              {deleting ? "Deleting..." : "Delete Order"}
            </Button>
          )}
        </div>

        {/* ════════════════════════════════════════════════
            ORDER PROGRESS STEPPER
           ════════════════════════════════════════════════ */}
        <div className="p-5 rounded-xl bg-card border border-border mb-6" style={{ boxShadow: "var(--shadow-md)" }}>
          <h3 className="font-semibold mb-5">Order Progress</h3>

          {isCancelled ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
                <XCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
              </div>
              <p className="font-semibold text-red-700 dark:text-red-400 text-lg">Order Cancelled</p>
              <p className="text-sm text-muted-foreground mt-1">This order has been cancelled.</p>
            </div>
          ) : (
            <>
              {/* Horizontal stepper (desktop) */}
              <div className="hidden sm:flex items-start justify-between gap-0 mb-6">
                {STATUS_FLOW.map((step, idx) => {
                  const isCompleted = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  const isLast = idx === STATUS_FLOW.length - 1;
                  const StepIcon = step.icon;
                  return (
                    <div key={step.key} className="flex items-start flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div className={`flex items-center justify-center w-11 h-11 rounded-full transition-all ${
                          isCurrent
                            ? `${step.color} text-white ring-4 ${step.ring}`
                            : isCompleted
                            ? `${step.color} text-white`
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <StepIcon className="h-5 w-5" />
                        </div>
                        <p className={`text-xs mt-2 font-medium text-center ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <span className="mt-1 text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      {!isLast && (
                        <div className={`flex-1 h-0.5 mt-[22px] mx-2 rounded-full transition-colors ${
                          idx < currentStepIdx ? step.color : "bg-border"
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Vertical stepper (mobile) */}
              <div className="sm:hidden space-y-0 mb-6">
                {STATUS_FLOW.map((step, idx) => {
                  const isCompleted = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  const isLast = idx === STATUS_FLOW.length - 1;
                  const StepIcon = step.icon;
                  return (
                    <div key={step.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-all ${
                          isCurrent
                            ? `${step.color} text-white ring-4 ${step.ring}`
                            : isCompleted
                            ? `${step.color} text-white`
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <StepIcon className="h-4 w-4" />
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 h-8 my-1 rounded-full ${idx < currentStepIdx ? step.color : "bg-border"}`} />
                        )}
                      </div>
                      <div className={`pt-1.5 ${isLast ? "pb-0" : "pb-6"}`}>
                        <p className={`text-sm font-medium ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                        {isCurrent && (
                          <span className="inline-block mt-1 text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Estimated delivery (for Dispatched step) ── */}
          {order?.estimatedDelivery && !isCancelled && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 mb-5">
              <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                <Truck className="h-4 w-4 shrink-0" />
                Estimated delivery: <strong>{order.estimatedDelivery}</strong>
              </p>
            </div>
          )}

          {/* ── Next step action ── */}
          {!isTerminal && nextStep && (
            <div className="border-t border-border pt-5">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Advance to next step</h4>

              {/* Show estimated delivery input when advancing TO Dispatched */}
              {nextStep.key === "Dispatched" && (
                <div className="mb-4 max-w-md">
                  <Label className="text-sm">Estimated Delivery Time</Label>
                  <Input
                    value={estimatedDelivery}
                    onChange={(e: any) => setEstimatedDelivery(e?.target?.value ?? "")}
                    placeholder="e.g. 2-3 business days"
                    className="mt-1.5"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => handleAdvance(nextStep.key)}
                  disabled={!!updating}
                >
                  {updating === nextStep.key ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1" />
                  )}
                  {updating === nextStep.key ? "Updating..." : `Mark as ${nextStep.label}`}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={!!updating}
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                >
                  {updating === "Cancelled" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Ban className="h-4 w-4 mr-1" />}
                  {updating === "Cancelled" ? "Cancelling..." : "Cancel Order"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Customer & Shipping ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-5 rounded-lg bg-card" style={{ boxShadow: "var(--shadow-sm)" }}>
            <div className="flex items-center gap-2 mb-3"><User className="h-4 w-4 text-muted-foreground" /><h3 className="font-medium">Customer</h3></div>
            <p className="text-sm">{order?.customerName}</p>
            <p className="text-sm text-muted-foreground">{order?.customerEmail}</p>
            {order?.customerPhone && <p className="text-sm text-muted-foreground">{order.customerPhone}</p>}
          </div>
          <div className="p-5 rounded-lg bg-card" style={{ boxShadow: "var(--shadow-sm)" }}>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">
                {order?.deliveryMethod === "pickup" ? "Pickup Point" : "Shipping Address"}
              </h3>
              <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${order?.deliveryMethod === "pickup" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                {order?.deliveryMethod === "pickup" ? "📍 Pickup" : "🚚 Delivery"}
              </span>
            </div>
            {order?.deliveryMethod === "pickup" && order?.pickupPoint ? (
              <>
                <p className="text-sm font-medium">{order.pickupPoint}</p>
                <p className="text-sm text-muted-foreground mt-1">{order.shippingAddress}</p>
              </>
            ) : (
              <>
                <p className="text-sm">{order?.shippingAddress}</p>
                <p className="text-sm text-muted-foreground">{[order?.shippingCity, order?.shippingState, order?.shippingZip].filter(Boolean).join(", ")}</p>
              </>
            )}
          </div>
        </div>

        {/* ── Items ── */}
        <div className="p-5 rounded-lg bg-card mb-6" style={{ boxShadow: "var(--shadow-sm)" }}>
          <h3 className="font-medium mb-3">Items</h3>
          <div className="space-y-2">
            {(order?.items ?? []).map((item: any) => (
              <div key={item?.id} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                <div><p className="text-sm font-medium">{item?.productName}</p><p className="text-xs text-muted-foreground">Qty: {item?.quantity} × KES {item?.price?.toLocaleString?.()}</p></div>
                <p className="text-sm font-medium">KES {((item?.price ?? 0) * (item?.quantity ?? 0))?.toLocaleString?.()}</p>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 flex justify-between font-bold"><span>Total</span><span>KES {order?.total?.toLocaleString?.()}</span></div>
        </div>

        <p className="text-xs text-muted-foreground mt-6">Placed on {order?.createdAt ? format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a") : ""}</p>
      </FadeIn>
    </div>
  );
}
