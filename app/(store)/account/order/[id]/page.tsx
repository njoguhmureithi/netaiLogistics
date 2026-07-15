"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package, Clock, Truck, MapPin, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/animate";
import { format } from "date-fns";

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const handleDownloadInvoice = async () => {
    if (!params?.id) return;
    setDownloadingInvoice(true);
    try {
      const res = await fetch(`/api/orders/${params.id}/invoice`);
      if (!res.ok) { alert("Failed to generate invoice"); setDownloadingInvoice(false); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${order?.orderNumber || params.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { alert("Error generating invoice"); }
    setDownloadingInvoice(false);
  };

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/orders/${params.id}`).then((r) => r?.json?.()).then((d: any) => setOrder(d ?? null)).catch(() => {}).finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!order) return <div className="max-w-[1200px] mx-auto px-4 py-16 text-center"><p className="text-muted-foreground">Order not found</p></div>;

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
      <Link href="/account" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Orders
      </Link>
      <FadeIn>
        <div className="flex items-center gap-3 mb-6">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold tracking-tight">{order?.orderNumber}</h1>
          <Badge variant={order?.status === "Dispatched" ? "default" : "secondary"}>
            {order?.status === "Dispatched" ? <Truck className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
            {order?.status}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownloadInvoice} disabled={downloadingInvoice} className="mb-6">
          {downloadingInvoice ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          {downloadingInvoice ? "Generating Invoice..." : "Download Invoice"}
        </Button>
        {order?.estimatedDelivery && order?.status === "Dispatched" && (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 mb-6">
            <p className="text-sm text-green-700 dark:text-green-400">Estimated delivery: {order.estimatedDelivery}</p>
          </div>
        )}
        <div className="space-y-6">
          <div className="p-6 rounded-lg bg-card" style={{ boxShadow: "var(--shadow-sm)" }}>
            <h3 className="font-medium mb-3">Items</h3>
            <div className="space-y-3">
              {(order?.items ?? []).map((item: any) => (
                <div key={item?.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded bg-muted overflow-hidden">
                    {item?.product?.imageUrl ? <Image src={item.product.imageUrl} alt={item?.productName ?? ""} fill className="object-cover" sizes="48px" /> : <div className="w-full h-full bg-muted" />}
                  </div>
                  <div className="flex-1"><p className="text-sm font-medium">{item?.productName}</p><p className="text-xs text-muted-foreground">Qty: {item?.quantity}</p></div>
                  <p className="text-sm font-medium">KES {((item?.price ?? 0) * (item?.quantity ?? 0))?.toLocaleString?.()}</p>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between font-bold"><span>Total</span><span>KES {order?.total?.toLocaleString?.()}</span></div>
          </div>
          <div className="p-6 rounded-lg bg-card" style={{ boxShadow: "var(--shadow-sm)" }}>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">
                {order?.deliveryMethod === "pickup" ? "Pickup Point" : "Shipping"}
              </h3>
              <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${order?.deliveryMethod === "pickup" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                {order?.deliveryMethod === "pickup" ? "📍 Pickup" : "🚚 Delivery"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{order?.customerName}</p>
            {order?.deliveryMethod === "pickup" && order?.pickupPoint ? (
              <>
                <p className="text-sm font-medium text-foreground">{order.pickupPoint}</p>
                <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">{order?.shippingAddress}</p>
                <p className="text-sm text-muted-foreground">{[order?.shippingCity, order?.shippingState, order?.shippingZip].filter(Boolean).join(", ")}</p>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center">Placed on {order?.createdAt ? format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a") : ""}</p>
        </div>
      </FadeIn>
    </div>
  );
}
