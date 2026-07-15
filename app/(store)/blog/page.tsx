export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import BlogClient from "./_components/blog-client";

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  const serialized = posts.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || "",
    category: p.category,
    imageUrl: p.imageUrl || "",
    author: p.author,
    readTime: p.readTime || "3 min read",
    date: p.publishedAt.toISOString().split("T")[0],
    featured: p.featured,
  }));

  return <BlogClient posts={serialized} />;
}
