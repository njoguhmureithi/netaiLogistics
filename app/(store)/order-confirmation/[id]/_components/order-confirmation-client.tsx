"use client";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, ScaleIn } from "@/components/ui/animate";

export default function OrderConfirmationClient({ order }: { order: any }) {
  return (
    <div className="max-w-[600px] mx-auto px-4 sm:px-6 py-16 text-center">
      <ScaleIn>
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
      </ScaleIn>
      <FadeIn delay={0.2}>
        <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Order Placed!</h1>
        <p className="text-muted-foreground mb-6">Thank you for your order. We&apos;ll notify you when it ships.</p>
        <div className="p-6 rounded-lg bg-card text-left mb-6" style={{ boxShadow: "var(--shadow-md)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <span className="font-mono text-sm font-medium">{order?.orderNumber ?? ""}</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium text-amber-600">{order?.status ?? "Received"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Items</span><span>{order?.items?.length ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-bold">KES {order?.total?.toLocaleString?.() ?? "0"}</span></div>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <Link href="/account"><Button variant="outline">View Orders</Button></Link>
          <Link href="/products"><Button>Continue Shopping <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>
      </FadeIn>
    </div>
  );
}
