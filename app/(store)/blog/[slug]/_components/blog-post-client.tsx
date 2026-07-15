"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, User, ArrowLeft, ArrowRight, BookOpen, Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/animate";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  author: string;
  readTime: string;
  date: string;
  featured: boolean;
}

interface RelatedPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  author: string;
  readTime: string;
  date: string;
}

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' fill='%23f3f4f6'%3E%3Crect width='600' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='24' fill='%239ca3af'%3EBlog%3C/text%3E%3C/svg%3E";

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function renderContent(content: string) {
  // Simple markdown-like rendering for bold text and line breaks
  return content.split("\n\n").map((paragraph, i) => {
    if (!paragraph.trim()) return null;

    // Check if it's a list item
    const isListItem = paragraph.trim().startsWith("- ") || /^\d+\.\s/.test(paragraph.trim());

    if (isListItem) {
      const items = paragraph.split("\n").filter(l => l.trim());
      return (
        <ul key={i} className="space-y-2 my-4">
          {items.map((item, j) => {
            const text = item.replace(/^[-\d.]+\s*/, "");
            return (
              <li key={j} className="flex items-start gap-2 text-muted-foreground leading-relaxed">
                <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                <span dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>') }} />
              </li>
            );
          })}
        </ul>
      );
    }

    return (
      <p
        key={i}
        className="text-muted-foreground leading-relaxed mb-4"
        dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>') }}
      />
    );
  });
}

function ShareDropdown({ title, slug }: { title: string; slug: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const fullUrl = mounted ? `${window.location.origin}/blog/${slug}` : "";

  function handleShare() {
    setOpen((v) => !v);
  }

  function copyLink() {
    const url = fullUrl || window.location.href;
    let success = false;

    // Try modern Clipboard API first
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
      }).catch(() => {
        // Fallback for iframe / insecure contexts
        success = fallbackCopy(url);
        if (success) {
          setCopied(true);
          toast.success("Link copied to clipboard!");
          setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
        } else {
          toast.error("Failed to copy link");
        }
      });
      return;
    }

    // Direct fallback if Clipboard API not available
    success = fallbackCopy(url);
    if (success) {
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
    } else {
      toast.error("Failed to copy link");
    }
  }

  function fallbackCopy(text: string): boolean {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "-9999px";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }

  const items = [
    {
      label: "X (Twitter)",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: mounted ? `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}` : "#",
    },
    {
      label: "Facebook",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      href: mounted ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}` : "#",
    },
    {
      label: "WhatsApp",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      href: mounted ? `https://wa.me/?text=${encodeURIComponent(`${title} — ${fullUrl}`)}` : "#",
    },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleShare}
        aria-label="Share this article"
        className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
      >
        <Share2 className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {items.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {item.icon}
              {item.label}
            </a>
          ))}
          <button
            onClick={copyLink}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors w-full"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function BlogPostClient({ post, relatedPosts }: { post: BlogPost; relatedPosts: RelatedPost[] }) {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10">
      {/* Back button */}
      <FadeIn>
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
      </FadeIn>

      {/* Article */}
      <article className="max-w-3xl mx-auto">
        <FadeIn>
          {/* Category + Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge className="bg-primary text-primary-foreground">{post.category}</Badge>
            {post.featured && <Badge className="bg-amber-500 text-white">Featured</Badge>}
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">{post.title}</h1>

          {/* Author + Date + Read time */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" /> {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {post.readTime}
            </span>
            <span className="flex items-center gap-1.5">
              <ShareDropdown title={post.title} slug={post.slug} />
            </span>
          </div>
        </FadeIn>

        {/* Hero image */}
        {post.imageUrl && (
          <FadeIn delay={0.1}>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted mb-10">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
                onError={(e: any) => { e.currentTarget.src = PLACEHOLDER; }}
              />
            </div>
          </FadeIn>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <FadeIn delay={0.15}>
            <p className="text-lg text-foreground/80 font-medium leading-relaxed mb-8 border-l-4 border-primary/30 pl-4">
              {post.excerpt}
            </p>
          </FadeIn>
        )}

        {/* Content */}
        <FadeIn delay={0.2}>
          <div className="prose-custom">
            {post.content ? renderContent(post.content) : (
              <p className="text-muted-foreground">Full article coming soon...</p>
            )}
          </div>
        </FadeIn>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <FadeIn delay={0.25}>
          <div className="max-w-3xl mx-auto mt-16 pt-10 border-t border-border">
            <h2 className="font-display text-xl font-bold tracking-tight mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> More in {post.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedPosts.map((rp) => (
                <Link key={rp.id} href={`/blog/${rp.slug}`} className="group">
                  <article className="rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/20 transition-all" style={{ boxShadow: "var(--shadow-sm)" }}>
                    <div className="relative h-32 bg-muted">
                      <Image
                        src={rp.imageUrl}
                        alt={rp.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, 33vw"
                        onError={(e: any) => { e.currentTarget.src = PLACEHOLDER; }}
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">{rp.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(rp.date)}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>
      )}

      {/* Back to blog CTA */}
      <FadeIn delay={0.3}>
        <div className="text-center mt-12">
          <Link href="/blog">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Browse All Articles
            </Button>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
