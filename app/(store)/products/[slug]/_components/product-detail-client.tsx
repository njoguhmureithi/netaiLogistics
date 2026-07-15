"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingCart, Minus, Plus, ArrowLeft, Package, Heart } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useRecentlyViewedStore } from "@/lib/recently-viewed-store";
import ProductCard from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { FadeIn, SlideIn } from "@/components/ui/animate";
import ProductReviews from "./product-reviews";

export default function ProductDetailClient({ product, relatedProducts, reviews = [], reviewAverage = 0, reviewCount = 0 }: { product: any; relatedProducts: any[]; reviews?: any[]; reviewAverage?: number; reviewCount?: number }) {
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const addItem = useCartStore((s) => s?.addItem);
  const addRecentlyViewed = useRecentlyViewedStore((s) => s?.addProduct);
  const { data: session } = useSession() || {};

  useEffect(() => {
    if (product) {
      addRecentlyViewed?.({ id: product.id, name: product.name, slug: product.slug, price: product.price, imageUrl: product.imageUrl, categoryName: product.category?.name ?? "" });
    }
  }, [product?.id]);

  useEffect(() => {
    if (session?.user && product?.id) {
      fetch("/api/wishlist").then((r) => r.json()).then((items: any[]) => {
        if (Array.isArray(items)) setWishlisted(items.some((i: any) => i?.productId === product.id));
      }).catch(() => {});
    }
  }, [session?.user, product?.id]);

  const toggleWishlist = async () => {
    if (!session?.user) { toast.error("Please sign in to use wishlist"); return; }
    setWishLoading(true);
    try {
      const res = await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product?.id }) });
      const data = await res.json();
      if (data?.added) { setWishlisted(true); toast.success("Added to wishlist"); }
      else if (data?.removed) { setWishlisted(false); toast.success("Removed from wishlist"); }
    } catch { toast.error("Failed"); }
    setWishLoading(false);
  };

  const handleAdd = () => {
    if ((product?.stockQuantity ?? 0) <= 0) { toast.error("Out of stock"); return; }
    addItem?.({ id: product?.id ?? "", name: product?.name ?? "", price: product?.price ?? 0, imageUrl: product?.imageUrl ?? null, stockQuantity: product?.stockQuantity ?? 0 }, qty);
    toast.success(`${product?.name ?? "Product"} added to cart`);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      <Link href="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Products
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <SlideIn from="left">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {product?.imageUrl ? (
              <Image src={product.imageUrl} alt={product?.name ?? "Product"} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
            )}
            {product?.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-sm font-medium px-3 py-1 rounded">
                -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
              </span>
            )}
          </div>
        </SlideIn>
        <SlideIn from="right">
          <div>
            {product?.category?.name && <p className="text-sm text-primary font-medium uppercase tracking-wide mb-2">{product.category.name}</p>}
            <h1 className="font-display text-3xl font-bold tracking-tight mb-4">{product?.name}</h1>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold">KES {product?.price?.toLocaleString?.() ?? "0"}</span>
              {product?.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-lg text-muted-foreground line-through">KES {product.compareAtPrice?.toLocaleString?.()}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className={`text-sm ${(product?.stockQuantity ?? 0) > 0 ? "text-green-600" : "text-destructive"}`}>
                {(product?.stockQuantity ?? 0) > 0 ? `${product.stockQuantity} in stock` : "Out of stock"}
              </span>
            </div>
            {product?.description && <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 border border-border rounded-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-muted rounded-l-lg"><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <button onClick={() => setQty(Math.min(product?.stockQuantity ?? 99, qty + 1))} className="p-2 hover:bg-muted rounded-r-lg"><Plus className="h-4 w-4" /></button>
              </div>
              <Button onClick={handleAdd} disabled={(product?.stockQuantity ?? 0) <= 0} size="lg" className="flex-1">
                <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
              </Button>
              <Button variant="outline" size="lg" onClick={toggleWishlist} disabled={wishLoading} className="shrink-0">
                <Heart className={`h-5 w-5 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>
          </div>
        </SlideIn>
      </div>
      {/* Reviews */}
      <ProductReviews productId={product?.id} initialReviews={reviews} initialAverage={reviewAverage} initialCount={reviewCount} />

      {(relatedProducts?.length ?? 0) > 0 && (
        <FadeIn>
          <h2 className="font-display text-2xl font-bold tracking-tight mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {(relatedProducts ?? []).map((p: any) => (
              <ProductCard key={p?.id} id={p?.id} name={p?.name} slug={p?.slug} price={p?.price ?? 0} compareAtPrice={p?.compareAtPrice} imageUrl={p?.imageUrl} category={p?.category} stockQuantity={p?.stockQuantity ?? 0} createdAt={p?.createdAt} />
            ))}
          </div>
        </FadeIn>
      )}
    </div>
  );
}
