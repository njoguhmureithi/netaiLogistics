"use client";
import { useRecentlyViewedStore, RecentProduct } from "@/lib/recently-viewed-store";
import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/components/ui/animate";

export default function RecentlyViewed() {
  const products = useRecentlyViewedStore((s) => s?.products ?? []);
  if (products.length === 0) return null;

  return (
    <FadeIn>
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display text-2xl font-bold tracking-tight mb-6">Recently Viewed</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {products.map((p: RecentProduct) => (
            <Link key={p.id} href={`/products/${p.slug}`} className="shrink-0 w-40">
              <div className="relative aspect-square rounded-lg bg-muted overflow-hidden mb-2">
                {p.imageUrl ? <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="160px" /> : <div className="w-full h-full" />}
              </div>
              <p className="text-xs text-primary font-medium uppercase truncate">{p.categoryName}</p>
              <p className="text-sm font-medium truncate">{p.name}</p>
              <p className="text-sm font-bold">KES {p.price?.toLocaleString?.()}</p>
            </Link>
          ))}
        </div>
      </section>
    </FadeIn>
  );
}
