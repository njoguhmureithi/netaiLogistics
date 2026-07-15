"use client";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { HoverLift } from "@/components/ui/animate";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  category?: { name: string } | null;
  stockQuantity: number;
  createdAt?: string | null;
}

export default function ProductCard({ id, name, slug, price, compareAtPrice, imageUrl, category, stockQuantity, createdAt }: ProductCardProps) {
  const addItem = useCartStore((s) => s?.addItem);
  const isOnSale = !!(compareAtPrice && compareAtPrice > price);
  const isNewArrival = createdAt ? (Date.now() - new Date(createdAt).getTime()) < 14 * 24 * 60 * 60 * 1000 : false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (stockQuantity <= 0) {
      toast.error("Out of stock");
      return;
    }
    addItem?.({ id, name, price, imageUrl, stockQuantity });
    toast.success(`${name} added to cart`);
  };

  return (
    <HoverLift>
      <Link href={`/products/${slug}`} className="group block">
        <div className="bg-card rounded-lg overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
          <div className="relative aspect-square bg-muted">
            {imageUrl ? (
              <Image src={imageUrl} alt={name ?? "Product"} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
            )}
            {stockQuantity <= 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-medium text-sm">Out of Stock</span>
              </div>
            )}
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isOnSale && (
                <span className="bg-destructive text-destructive-foreground text-xs font-medium px-2 py-0.5 rounded">
                  -{Math.round(((compareAtPrice! - price) / compareAtPrice!) * 100)}% OFF
                </span>
              )}
              {isNewArrival && (
                <span className="bg-emerald-500 text-white text-xs font-medium px-2 py-0.5 rounded">
                  NEW
                </span>
              )}
            </div>
          </div>
          <div className="p-4">
            {category?.name && (
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">{category.name}</p>
            )}
            <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">{name}</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-foreground">KES {price?.toLocaleString?.() ?? "0"}</span>
                {compareAtPrice && compareAtPrice > price && (
                  <span className="text-xs text-muted-foreground line-through">KES {compareAtPrice?.toLocaleString?.() ?? "0"}</span>
                )}
              </div>
              <Button variant="outline" size="icon-sm" onClick={handleAddToCart} disabled={stockQuantity <= 0} className="shrink-0">
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </HoverLift>
  );
}
