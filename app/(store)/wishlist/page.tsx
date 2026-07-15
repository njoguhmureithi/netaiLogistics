"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { toast } from "sonner";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/animate";

export default function WishlistPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s?.addItem);

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status === "authenticated") {
      fetch("/api/wishlist").then((r) => r.json()).then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [status]);

  const removeFromWishlist = async (productId: string) => {
    const res = await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
    const data = await res.json();
    if (data?.removed) {
      setItems((prev) => prev.filter((i) => i?.productId !== productId));
      toast.success("Removed from wishlist");
    }
  };

  const addToCart = (product: any) => {
    if ((product?.stockQuantity ?? 0) <= 0) { toast.error("Out of stock"); return; }
    addItem?.({ id: product?.id, name: product?.name, price: product?.price, imageUrl: product?.imageUrl, stockQuantity: product?.stockQuantity });
    toast.success(`${product?.name} added to cart`);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      <FadeIn>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <Heart className="h-7 w-7 text-primary" /> My Wishlist
          </h1>
          <p className="text-muted-foreground">{items.length} {items.length === 1 ? "item" : "items"} saved</p>
        </div>
      </FadeIn>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-4">Your wishlist is empty</p>
          <Link href="/products"><Button>Browse Products</Button></Link>
        </div>
      ) : (
        <Stagger staggerDelay={0.05}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {items.map((item: any) => {
              const p = item?.product;
              if (!p) return null;
              return (
                <StaggerItem key={item?.id}>
                  <div className="rounded-lg bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
                    <Link href={`/products/${p?.slug}`}>
                      <div className="relative aspect-square bg-muted">
                        {p?.imageUrl ? <Image src={p.imageUrl} alt={p?.name ?? ""} fill className="object-cover" sizes="300px" /> : <div className="w-full h-full" />}
                      </div>
                    </Link>
                    <div className="p-4">
                      <p className="text-xs text-primary font-medium uppercase">{p?.category?.name ?? ""}</p>
                      <Link href={`/products/${p?.slug}`}>
                        <h3 className="font-medium mt-1 truncate hover:text-primary">{p?.name}</h3>
                      </Link>
                      <p className="font-bold mt-1">KES {p?.price?.toLocaleString?.()}</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1" onClick={() => addToCart(p)} disabled={(p?.stockQuantity ?? 0) <= 0}>
                          <ShoppingCart className="h-3.5 w-3.5 mr-1" /> {(p?.stockQuantity ?? 0) > 0 ? "Add to Cart" : "Out of Stock"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => removeFromWishlist(p?.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </div>
        </Stagger>
      )}
    </div>
  );
}
