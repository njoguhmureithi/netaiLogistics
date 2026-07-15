export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailClient from "./_components/product-detail-client";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  let product: any = null;
  let relatedProducts: any[] = [];
  let reviews: any[] = [];
  let reviewAverage = 0;
  let reviewCount = 0;
  try {
    product = await prisma.product.findFirst({
      where: { OR: [{ slug: params.slug }, { id: params.slug }], active: true, published: true },
      include: { category: true },
    });
    if (!product) return notFound();
    relatedProducts = await prisma.product.findMany({
      where: { categoryId: product.categoryId, active: true, published: true, id: { not: product.id } },
      include: { category: true },
      take: 4,
    });
    reviews = await prisma.review.findMany({
      where: { productId: product.id, approved: true },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    reviewCount = reviews.length;
    reviewAverage = reviewCount > 0 ? Math.round((reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviewCount) * 10) / 10 : 0;
  } catch (e) {
    console.error(e);
    return notFound();
  }
  return (
    <ProductDetailClient
      product={JSON.parse(JSON.stringify(product))}
      relatedProducts={JSON.parse(JSON.stringify(relatedProducts ?? []))}
      reviews={JSON.parse(JSON.stringify(reviews))}
      reviewAverage={reviewAverage}
      reviewCount={reviewCount}
    />
  );
}
