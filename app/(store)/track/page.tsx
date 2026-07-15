"use client";

import { useState } from "react";
import { Search, Package, Truck, CheckCircle2, Clock, XCircle, MapPin, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, ScaleIn } from "@/components/ui/animate";

const STATUS_STEPS = [
  { key: "Received", label: "Order Received", icon: Package, description: "Your order has been placed and confirmed" },
  { key: "Processing", label: "Processing", icon: Clock, description: "We're preparing your order" },
  { key: "Dispatched", label: "Dispatched", icon: Truck, description: "Your order is on its way" },
  { key: "Delivered", label: "Delivered", icon: CheckCircle2, description: "Your order has been delivered" },
];

interface TrackedOrder {
  orderNumber: string;
  status: string;
  customerName: string;
  shippingCity: string | null;
  shippingState: string | null;
  estimatedDelivery: string | null;
  subtotal: number;
  discount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  deliveryMethod: string | null;
  pickupPoint: string | null;
  items: { productName: string; quantity: number; price: number }[];
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderNumber.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    setOrder(null);
    setSearched(true);
    try {
      const res = await fetch(`/api/track?orderNumber=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Order not found");
      } else {
        setOrder(data);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isCancelled = order?.status === "Cancelled";
  const currentStepIndex = isCancelled ? -1 : STATUS_STEPS.findIndex((s) => s.key === order?.status);

  return (
    <div className="max-w-[700px] mx-auto px-4 sm:px-6 py-12">
      <FadeIn>
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <Truck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-2">Track Your Order</h1>
          <p className="text-muted-foreground">Enter your order number to see the latest status</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleTrack} className="mb-10">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. ORD-1714500000000"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                autoFocus
              />
            </div>
            <Button type="submit" disabled={loading || !orderNumber.trim()} className="rounded-xl px-6">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Track <ArrowRight className="ml-1 h-4 w-4" /></>}
            </Button>
          </div>
        </form>
      </FadeIn>

      {/* Error */}
      {error && searched && (
        <FadeIn>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 mb-4">
              <XCircle className="h-7 w-7 text-destructive" />
            </div>
            <p className="text-lg font-semibold mb-1">Order Not Found</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </FadeIn>
      )}

      {/* Order Result */}
      {order && (
        <FadeIn delay={0.1}>
          <div className="space-y-6">
            {/* Order summary card */}
            <div className="rounded-2xl bg-card border border-border p-6" style={{ boxShadow: "var(--shadow-md)" }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order Number</p>
                  <p className="font-mono text-lg font-bold">{order.orderNumber}</p>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                  isCancelled
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : order.status === "Delivered"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : order.status === "Dispatched"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                }`}>
                  {isCancelled ? <XCircle className="h-4 w-4" /> : order.status === "Delivered" ? <CheckCircle2 className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                  {isCancelled ? "Cancelled" : order.status}
                </div>
              </div>

              {/* Info row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-xs">Placed on</p>
                    <p className="font-medium">{new Date(order.createdAt).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" })}</p>
                  </div>
                </div>
                {(order.shippingCity || order.shippingState || order.deliveryMethod === "pickup") && (
                  <div className="flex items-start gap-2">
                    {order.deliveryMethod === "pickup" ? (
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    ) : (
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="text-muted-foreground text-xs">
                        {order.deliveryMethod === "pickup" ? "Pickup at" : "Shipping to"}
                      </p>
                      <p className="font-medium">
                        {order.deliveryMethod === "pickup" && order.pickupPoint
                          ? order.pickupPoint
                          : [order.shippingCity, order.shippingState].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                )}
                {order.estimatedDelivery && (
                  <div className="flex items-start gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-muted-foreground text-xs">Estimated delivery</p>
                      <p className="font-medium">{order.estimatedDelivery}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            {isCancelled ? (
              <ScaleIn>
                <div className="rounded-2xl bg-card border border-border p-6 text-center" style={{ boxShadow: "var(--shadow-md)" }}>
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 mb-3">
                    <XCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-lg font-semibold text-red-700 dark:text-red-400">Order Cancelled</p>
                  <p className="text-sm text-muted-foreground mt-1">This order has been cancelled. Contact us if you have questions.</p>
                </div>
              </ScaleIn>
            ) : (
              <div className="rounded-2xl bg-card border border-border p-6" style={{ boxShadow: "var(--shadow-md)" }}>
                <h2 className="font-semibold mb-6">Order Progress</h2>
                <div className="space-y-0">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    const isLast = idx === STATUS_STEPS.length - 1;
                    const StepIcon = step.icon;
                    return (
                      <div key={step.key} className="flex gap-4">
                        {/* Vertical line + icon */}
                        <div className="flex flex-col items-center">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-colors ${
                            isCurrent
                              ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                              : isCompleted
                              ? "bg-primary/80 text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            <StepIcon className="h-5 w-5" />
                          </div>
                          {!isLast && (
                            <div className={`w-0.5 h-12 my-1 rounded-full transition-colors ${
                              isCompleted && idx < currentStepIndex ? "bg-primary/60" : "bg-border"
                            }`} />
                          )}
                        </div>
                        {/* Content */}
                        <div className={`pt-2 ${isLast ? "pb-0" : "pb-8"}`}>
                          <p className={`font-semibold text-sm ${
                            isCompleted ? "text-foreground" : "text-muted-foreground"
                          }`}>{step.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                          {isCurrent && (
                            <span className="inline-block mt-2 text-[11px] font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                              Current status
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="rounded-2xl bg-card border border-border p-6" style={{ boxShadow: "var(--shadow-md)" }}>
              <h2 className="font-semibold mb-4">Order Items</h2>
              <div className="divide-y divide-border">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">KES {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-2 pt-4 space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>KES {order.subtotal.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-KES {order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-1">
                  <span>Total</span>
                  <span>KES {order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
