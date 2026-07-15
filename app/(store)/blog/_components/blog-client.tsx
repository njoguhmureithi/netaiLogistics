"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Calendar, Clock, User, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/animate";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  author: string;
  readTime: string;
  date: string;
  featured: boolean;
}

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' fill='%23f3f4f6'%3E%3Crect width='600' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='24' fill='%239ca3af'%3EBlog%3C/text%3E%3C/svg%3E";

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function BlogClient({ posts }: { posts: BlogPost[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  const categories = useMemo(() => {
    const cats = [...new Set(posts.map((p) => p.category))];
    return cats.sort();
  }, [posts]);

  const filtered = useMemo(() => {
    let result = [...posts];
    if (activeCategory) result = result.filter((p) => p.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.author.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, activeCategory, searchQuery]);

  const featuredPosts = filtered.filter((p) => p.featured);
  const regularPosts = filtered.filter((p) => !p.featured);

  const clearFilters = () => {
    setSearchQuery("");
    setActiveCategory("");
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <FadeIn>
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Netai Blog</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">Beauty Tips & Insights</h1>
          <p className="text-muted-foreground max-w-md mx-auto">Expert advice, trending topics, and insider tips to elevate your beauty routine.</p>
        </div>
      </FadeIn>

      {/* Search + Category Filter */}
      <FadeIn delay={0.1}>
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e?.target?.value ?? "")}
              placeholder="Search articles..."
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setActiveCategory("")}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === "" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted hover:bg-muted/80 text-foreground"}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? "" : cat)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted hover:bg-muted/80 text-foreground"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <div className="mb-12">
          <Stagger key={`featured-${activeCategory}-${searchQuery}`} staggerDelay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredPosts.map((post) => (
                <StaggerItem key={post.id}>
                  <Link href={`/blog/${post.slug}`} className="block">
                    <article className="group rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/20 transition-all" style={{ boxShadow: "var(--shadow-sm)" }}>
                      <div className="relative h-52 sm:h-60 bg-muted">
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          onError={(e: any) => { e.currentTarget.src = PLACEHOLDER; }}
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-primary text-primary-foreground">{post.category}</Badge>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(post.date)}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                        </div>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h2>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="h-3 w-3" /> {post.author}
                          </span>
                          <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read More <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </StaggerItem>
              ))}
            </div>
          </Stagger>
        </div>
      )}

      {/* Regular Posts Grid */}
      {regularPosts.length > 0 && (
        <Stagger key={`regular-${activeCategory}-${searchQuery}`} staggerDelay={0.05}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <StaggerItem key={post.id}>
                <Link href={`/blog/${post.slug}`} className="block">
                  <article className="group rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/20 transition-all" style={{ boxShadow: "var(--shadow-sm)" }}>
                    <div className="relative h-44 bg-muted">
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        onError={(e: any) => { e.currentTarget.src = PLACEHOLDER; }}
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary">{post.category}</Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(post.date)}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                      </div>
                      <h3 className="font-display text-base font-bold tracking-tight mb-1.5 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="h-3 w-3" /> {post.author}
                        </span>
                        <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              </StaggerItem>
            ))}
          </div>
        </Stagger>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <FadeIn>
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-2">No articles found</p>
            <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
