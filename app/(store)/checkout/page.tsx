"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore, CartItem } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShoppingBag, ArrowLeft, Lock, Tag, X, Truck, MapPin, CheckCircle2 } from "lucide-react";
import { FadeIn } from "@/components/ui/animate";

interface PickupPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string | null;
  hours?: string | null;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const items = useCartStore((s) => s?.items ?? []);
  const subtotal = useCartStore((s) => s?.getTotalPrice?.() ?? 0);
  const clearCart = useCartStore((s) => s?.clearCart);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ customerName: "", customerEmail: "", customerPhone: "", shippingAddress: "", shippingCity: "", shippingState: "", shippingZip: "", notes: "" });
  const [prefilled, setPrefilled] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; description?: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [moq, setMoq] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [selectedPickup, setSelectedPickup] = useState("");
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);

  useEffect(() => {
    fetch("/api/settings/moq").then((r) => r.json()).then((d) => setMoq(d?.minimumOrderValue ?? 0)).catch(() => {});
    fetch("/api/pickup-locations").then((r) => r.json()).then((d) => setPickupPoints(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  // Auto-populate customer details from profile + last order
  useEffect(() => {
    if (status !== "authenticated" || prefilled) return;
    fetch("/api/checkout/prefill")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        setForm((prev) => ({
          ...prev,
          customerName: prev.customerName || data.customerName || "",
          customerEmail: prev.customerEmail || data.customerEmail || "",
          customerPhone: prev.customerPhone || data.customerPhone || "",
          shippingAddress: prev.shippingAddress || data.shippingAddress || "",
          shippingCity: prev.shippingCity || data.shippingCity || "",
          shippingState: prev.shippingState || data.shippingState || "",
          shippingZip: prev.shippingZip || data.shippingZip || "",
        }));
        setPrefilled(true);
      })
      .catch(() => {});
  }, [status, prefilled]);

  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(subtotal - discount, 0);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: couponCode, subtotal }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.error ?? "Invalid coupon"); setCouponLoading(false); return; }
      setAppliedCoupon({ code: data.coupon.code, discount: data.discount, description: data.coupon.description });
      toast.success(`Coupon applied! You save KES ${data.discount.toLocaleString()}`);
    } catch { toast.error("Failed to validate coupon"); }
    setCouponLoading(false);
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCouponCode(""); };

  const handleChange = (e: any) => setForm((prev) => ({ ...(prev ?? {}), [e?.target?.name ?? ""]: e?.target?.value ?? "" }));

  if (status === "unauthenticated") {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 text-center">
        <Lock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Please sign in to checkout</h2>
        <p className="text-muted-foreground mb-4">Create an account or sign in to place your order</p>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    );
  }

  if ((items?.length ?? 0) === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Your cart is empty</h2>
        <Link href="/products"><Button className="mt-4">Continue Shopping</Button></Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    if (!form.customerName || !form.customerEmail) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (deliveryMethod === "delivery" && !form.shippingAddress) {
      toast.error("Please enter a shipping address");
      return;
    }
    if (deliveryMethod === "pickup" && !selectedPickup) {
      toast.error("Please select a pickup point");
      return;
    }
    if (moq > 0 && subtotal < moq) {
      toast.error(`Minimum order value is KES ${moq.toLocaleString()}`);
      return;
    }
    setLoading(true);

    // For pickup: use pickup point details as shipping info
    const pickup = deliveryMethod === "pickup" ? pickupPoints.find((p) => p.id === selectedPickup) : null;
    const shippingData = deliveryMethod === "pickup" && pickup
      ? { shippingAddress: `Pickup: ${pickup.name} – ${pickup.address}`, shippingCity: pickup.city, shippingState: "", shippingZip: "" }
      : { shippingAddress: form.shippingAddress, shippingCity: form.shippingCity, shippingState: form.shippingState, shippingZip: form.shippingZip };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ...shippingData,
          deliveryMethod,
          pickupPoint: pickup ? `${pickup.name} – ${pickup.address}, ${pickup.city}` : null,
          couponCode: appliedCoupon?.code ?? null,
          items: (items ?? []).map((i: CartItem) => ({ id: i?.id, name: i?.name, quantity: i?.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.error ?? "Failed to place order"); setLoading(false); return; }
      clearCart?.();
      router.replace(`/order-confirmation/${data?.id ?? ""}`);
    } catch {
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      <FadeIn>
        <Link href="/cart" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Cart
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight mb-8">Checkout</h1>
      </FadeIn>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-lg bg-card" style={{ boxShadow: "var(--shadow-sm)" }}>
              <h2 className="font-display text-lg font-bold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input id="customerName" name="customerName" value={form.customerName} onChange={handleChange} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input id="customerEmail" name="customerEmail" type="email" value={form.customerEmail} onChange={handleChange} required className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input id="customerPhone" name="customerPhone" value={form.customerPhone} onChange={handleChange} className="mt-1" />
                </div>
              </div>
            </div>

            {/* ── Delivery Method Selector ── */}
            <div className="p-6 rounded-lg bg-card" style={{ boxShadow: "var(--shadow-sm)" }}>
              <h2 className="font-display text-lg font-bold mb-4">Delivery Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("delivery")}
                  className={`relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    deliveryMethod === "delivery"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
                    deliveryMethod === "delivery" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Deliver to My Address</p>
                    <p className="text-xs text-muted-foreground mt-0.5">We&apos;ll ship directly to you</p>
                  </div>
                  {deliveryMethod === "delivery" && (
                    <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-primary" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("pickup")}
                  className={`relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    deliveryMethod === "pickup"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
                    deliveryMethod === "pickup" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Pick Up at a Location</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Collect from a nearby pickup point</p>
                  </div>
                  {deliveryMethod === "pickup" && (
                    <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-primary" />
                  )}
                </button>
              </div>
            </div>

            {/* ── Delivery: Shipping Address ── */}
            {deliveryMethod === "delivery" && (
              <div className="p-6 rounded-lg bg-card" style={{ boxShadow: "var(--shadow-sm)" }}>
                <h2 className="font-display text-lg font-bold mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="shippingAddress">Address *</Label>
                    <Input id="shippingAddress" name="shippingAddress" value={form.shippingAddress} onChange={handleChange} required className="mt-1" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="shippingCity">City</Label>
                      <Input id="shippingCity" name="shippingCity" value={form.shippingCity} onChange={handleChange} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="shippingState">State/County</Label>
                      <Input id="shippingState" name="shippingState" value={form.shippingState} onChange={handleChange} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="shippingZip">ZIP/Postal Code</Label>
                      <Input id="shippingZip" name="shippingZip" value={form.shippingZip} onChange={handleChange} className="mt-1" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Pickup: Select Pickup Point ── */}
            {deliveryMethod === "pickup" && (
              <div className="p-6 rounded-lg bg-card" style={{ boxShadow: "var(--shadow-sm)" }}>
                <h2 className="font-display text-lg font-bold mb-4">Select Pickup Point</h2>
                <div className="space-y-3">
                  {pickupPoints.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No pickup locations available at the moment.</p>
                  ) : (
                    pickupPoints.map((point) => (
                      <button
                        key={point.id}
                        type="button"
                        onClick={() => setSelectedPickup(point.id)}
                        className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                          selectedPickup === point.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <div className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 mt-0.5 ${
                          selectedPickup === point.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                        }`}>
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{point.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{point.address}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-muted-foreground">{point.city}</span>
                            {point.hours && <span className="text-xs text-muted-foreground">🕐 {point.hours}</span>}
                          </div>
                        </div>
                        {selectedPickup === point.id && (
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-1" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="p-6 rounded-lg bg-card sticky top-24" style={{ boxShadow: "var(--shadow-md)" }}>
              <h2 className="font-display text-lg font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {(items ?? []).map((item: CartItem) => (
                  <div key={item?.id} className="flex gap-3">
                    <div className="relative w-12 h-12 rounded bg-muted overflow-hidden shrink-0">
                      {item?.imageUrl ? <Image src={item.imageUrl} alt={item?.name ?? ""} fill className="object-cover" sizes="48px" /> : <div className="w-full h-full bg-muted" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item?.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item?.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">KES {((item?.price ?? 0) * (item?.quantity ?? 0))?.toLocaleString?.()}</p>
                  </div>
                ))}
              </div>
              {/* Coupon Code */}
              <div className="border-t border-border pt-3 mb-3">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">{appliedCoupon.code}</span>
                    </div>
                    <button onClick={removeCoupon} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input placeholder="Coupon code" value={couponCode} onChange={(e: any) => setCouponCode(e?.target?.value ?? "")} className="text-sm" />
                    <Button type="button" variant="outline" size="sm" onClick={applyCoupon} disabled={couponLoading}>
                      {couponLoading ? "..." : "Apply"}
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>KES {subtotal?.toLocaleString?.()}</span></div>
                {discount > 0 && <div className="flex justify-between text-sm"><span className="text-green-600">Discount</span><span className="text-green-600">-KES {discount?.toLocaleString?.()}</span></div>}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{deliveryMethod === "pickup" ? "Pickup" : "Shipping"}</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span>KES {total?.toLocaleString?.()}</span></div>
              </div>
              {moq > 0 && subtotal < moq && (
                <p className="text-xs text-destructive mt-2">Minimum order value: KES {moq.toLocaleString()}. Add KES {(moq - subtotal).toLocaleString()} more.</p>
              )}
              <Button type="submit" className="w-full mt-4" size="lg" disabled={loading || (moq > 0 && subtotal < moq)} loading={loading}>
                {loading ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
