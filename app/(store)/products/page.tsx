export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import ProductsClient from "./_components/products-client";

export default async function ProductsPage({ searchParams }: { searchParams: { category?: string; subcategory?: string; search?: string; minPrice?: string; maxPrice?: string } }) {
  const sp = searchParams ?? {};
  let products: any[] = [];
  let categories: any[] = [];
  try {
    const where: any = { active: true, published: true };
    if (sp.category) {
      const cat = await prisma.category.findUnique({ where: { slug: sp.category } });
      if (cat) where.categoryId = cat.id;
    }
    if (sp.subcategory) {
      const sub = await prisma.subCategory.findFirst({ where: { slug: sp.subcategory } });
      if (sub) where.subCategoryId = sub.id;
    }
    if (sp.search) {
      where.OR = [
        { name: { contains: sp.search, mode: "insensitive" } },
        { description: { contains: sp.search, mode: "insensitive" } },
      ];
    }
    if (sp.minPrice) where.price = { ...(where.price ?? {}), gte: parseFloat(sp.minPrice) };
    if (sp.maxPrice) where.price = { ...(where.price ?? {}), lte: parseFloat(sp.maxPrice) };

    products = await prisma.product.findMany({ where, include: { category: true, subCategory: true }, orderBy: { createdAt: "desc" } });
    categories = await prisma.category.findMany({
      include: {
        subCategories: {
          orderBy: { name: "asc" },
          include: { _count: { select: { products: { where: { active: true, published: true } } } } },
        },
      },
      orderBy: { name: "asc" },
    });
  } catch (e) {
    console.error(e);
  }
  return (
    <ProductsClient
      initialProducts={JSON.parse(JSON.stringify(products ?? []))}
      categories={JSON.parse(JSON.stringify(categories ?? []))}
      initialCategory={sp.category ?? ""}
      initialSubCategory={sp.subcategory ?? ""}
      initialSearch={sp.search ?? ""}
    />
  );
}
