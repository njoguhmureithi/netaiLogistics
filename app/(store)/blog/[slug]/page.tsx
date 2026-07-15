export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import BlogPostClient from "./_components/blog-post-client";

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findFirst({
    where: { slug: params.slug, published: true },
  });

  if (!post) return notFound();

  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      published: true,
      category: post.category,
      id: { not: post.id },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const serialized = {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
    content: post.content || "",
    category: post.category,
    imageUrl: post.imageUrl || "",
    author: post.author,
    readTime: post.readTime || "3 min read",
    date: post.publishedAt.toISOString().split("T")[0],
    featured: post.featured,
  };

  const serializedRelated = relatedPosts.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || "",
    category: p.category,
    imageUrl: p.imageUrl || "",
    author: p.author,
    readTime: p.readTime || "3 min read",
    date: p.publishedAt.toISOString().split("T")[0],
  }));

  return <BlogPostClient post={serialized} relatedPosts={serializedRelated} />;
}
