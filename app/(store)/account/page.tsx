"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Clock, Truck, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/animate";
import { format } from "date-fns";

export default function AccountPage() {
  const { data: session, status } = useSession() || {};
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") { setLoading(false); return; }
    fetch("/api/orders").then((r) => r?.json?.()).then((d: any) => setOrders(d ?? [])).catch(() => {}).finally(() => setLoading(false));
  }, [status]);

  if (status === "loading") return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (status === "unauthenticated") {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 text-center">
        <Lock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Sign in to view your account</h2>
        <Link href="/login"><Button className="mt-4">Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      <FadeIn>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-full bg-primary/10"><User className="h-6 w-6 text-primary" /></div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Welcome, {session?.user?.name ?? "there"}</h1>
            <p className="text-sm text-muted-foreground">{session?.user?.email ?? ""}</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <h2 className="font-display text-xl font-bold mb-4">Order History</h2>
      </FadeIn>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : (orders?.length ?? 0) === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No orders yet</p>
          <Link href="/products"><Button>Start Shopping</Button></Link>
        </div>
      ) : (
        <Stagger staggerDelay={0.05}>
          <div className="space-y-4">
            {(orders ?? []).map((order: any) => (
              <StaggerItem key={order?.id}>
                <div className="p-4 md:p-6 rounded-lg bg-card" style={{ boxShadow: "var(--shadow-sm)" }}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm font-medium">{order?.orderNumber ?? ""}</span>
                        <Badge variant={order?.status === "Dispatched" ? "default" : "secondary"}>
                          {order?.status === "Dispatched" ? <Truck className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                          {order?.status ?? "Received"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Placed on {order?.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy") : ""}</p>
                      <p className="text-sm text-muted-foreground">{order?.items?.length ?? 0} item(s) · KES {order?.total?.toLocaleString?.() ?? "0"}</p>
                      {order?.estimatedDelivery && order?.status === "Dispatched" && (
                        <p className="text-sm text-green-600 mt-1">Estimated delivery: {order.estimatedDelivery}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/account/order/${order?.id ?? ""}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </div>
        </Stagger>
      )}
    </div>
  );
}
