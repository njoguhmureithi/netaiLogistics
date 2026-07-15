export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import HomeClient from "./_components/home-client";

export default async function HomePage() {
  let featuredProducts: any[] = [];
  let allProducts: any[] = [];
  let categories: any[] = [];
  let priceRange = { min: 0, max: 100000 };
  try {
    featuredProducts = await prisma.product.findMany({
      where: { active: true, published: true, featured: true },
      include: { category: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
    allProducts = await prisma.product.findMany({
      where: { active: true, published: true },
      include: { category: true, subCategory: true },
      orderBy: { createdAt: "desc" },
    });
    categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: { where: { active: true, published: true } } } },
        subCategories: {
          orderBy: { name: "asc" },
          include: { _count: { select: { products: { where: { active: true, published: true } } } } },
        },
      },
      orderBy: { name: "asc" },
    });
    const agg = await prisma.product.aggregate({
      where: { active: true, published: true },
      _min: { price: true },
      _max: { price: true },
    });
    priceRange = {
      min: Math.floor(agg._min?.price ?? 0),
      max: Math.ceil(agg._max?.price ?? 100000),
    };
  } catch (e) {
    console.error(e);
  }
  let heroSlides: any[] = [];
  try {
    heroSlides = await prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch (e) {
    console.error("Failed to fetch hero slides:", e);
  }
  const serialize = (v: any) => JSON.parse(JSON.stringify(v ?? []));
  return (
    <HomeClient
      featuredProducts={serialize(featuredProducts)}
      allProducts={serialize(allProducts)}
      categories={serialize(categories)}
      priceRange={priceRange}
      heroSlides={serialize(heroSlides)}
    />
  );
}
