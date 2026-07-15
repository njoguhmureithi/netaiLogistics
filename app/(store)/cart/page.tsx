"use client";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore, CartItem } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/animate";

export default function CartPage() {
  const items = useCartStore((s) => s?.items ?? []);
  const removeItem = useCartStore((s) => s?.removeItem);
  const updateQuantity = useCartStore((s) => s?.updateQuantity);
  const total = useCartStore((s) => s?.getTotalPrice?.() ?? 0);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      <FadeIn>
        <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground mb-8">{(items?.length ?? 0) === 0 ? "Your cart is empty" : `${items.length} item${items.length > 1 ? "s" : ""} in your cart`}</p>
      </FadeIn>

      {(items?.length ?? 0) === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Nothing here yet</p>
          <Link href="/products"><Button>Start Shopping <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {(items ?? []).map((item: CartItem) => (
              <div key={item?.id} className="flex gap-4 p-4 rounded-lg bg-card" style={{ boxShadow: "var(--shadow-sm)" }}>
                <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0">
                  {item?.imageUrl ? (
                    <Image src={item.imageUrl} alt={item?.name ?? ""} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{item?.name}</h3>
                  <p className="text-base font-bold mt-1">KES {item?.price?.toLocaleString?.() ?? "0"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-border rounded">
                      <button onClick={() => updateQuantity?.(item?.id ?? "", (item?.quantity ?? 1) - 1)} className="p-1 hover:bg-muted"><Minus className="h-3 w-3" /></button>
                      <span className="w-8 text-center text-sm">{item?.quantity ?? 0}</span>
                      <button onClick={() => updateQuantity?.(item?.id ?? "", (item?.quantity ?? 0) + 1)} className="p-1 hover:bg-muted"><Plus className="h-3 w-3" /></button>
                    </div>
                    <button onClick={() => removeItem?.(item?.id ?? "")} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <p className="text-sm font-bold whitespace-nowrap">KES {((item?.price ?? 0) * (item?.quantity ?? 0))?.toLocaleString?.()}</p>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="p-6 rounded-lg bg-card sticky top-24" style={{ boxShadow: "var(--shadow-md)" }}>
              <h3 className="font-display text-lg font-bold mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>KES {total?.toLocaleString?.() ?? "0"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>KES {total?.toLocaleString?.() ?? "0"}</span>
                </div>
              </div>
              <Link href="/checkout" className="block">
                <Button className="w-full" size="lg">Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
