"use client";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search, Eye, EyeOff, Star, StarOff, Loader2, X, BookOpen, ImageIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/animate";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string;
  imageUrl: string | null;
  author: string;
  readTime: string | null;
  featured: boolean;
  published: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = ["Skincare", "Makeup", "Haircare", "Sun Care", "Tips & Tricks", "Education", "General"];

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  category: "General",
  imageUrl: "",
  author: "Netai Team",
  readTime: "",
  featured: false,
  published: true,
};

export default function AdminBlogPage() {
  const { data: session } = useSession() || {};
  const isAdmin = (session?.user as any)?.role === "admin";
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/admin/blog");
      if (res.ok) setPosts(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const filtered = useMemo(() => {
    let result = [...posts];
    if (filterCategory) result = result.filter((p) => p.category === filterCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    return result;
  }, [posts, filterCategory, searchQuery]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content || "",
      category: post.category,
      imageUrl: post.imageUrl || "",
      author: post.author,
      readTime: post.readTime || "",
      featured: post.featured,
      published: post.published,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/blog/${editingId}` : "/api/admin/blog";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      toast.success(editingId ? "Post updated" : "Post created");
      closeForm();
      fetchPosts();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      toast.success("Post deleted");
      fetchPosts();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleField = async (post: BlogPost, field: "published" | "featured") => {
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...post, [field]: !post[field] }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(`Post ${field === "published" ? (post.published ? "unpublished" : "published") : (post.featured ? "unfeatured" : "featured")}`);
      fetchPosts();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); } catch { return d; }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" /> Blog Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{posts.length} total post{posts.length !== 1 ? "s" : ""}</p>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" /> New Post
          </Button>
        </div>
      </FadeIn>

      {/* Search + Filter */}
      <FadeIn delay={0.05}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e?.target?.value ?? "")}
              placeholder="Search posts..."
              className="pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[160px]"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </FadeIn>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-10 px-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-xl w-full max-w-2xl p-6 relative mb-10">
            <button onClick={closeForm} className="absolute top-4 right-4 p-1 hover:bg-muted rounded">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold mb-5">{editingId ? "Edit Post" : "New Post"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Title *</label>
                <Input value={form.title} onChange={(e: any) => setForm({ ...form, title: e?.target?.value ?? "" })} placeholder="Post title" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Author</label>
                  <Input value={form.author} onChange={(e: any) => setForm({ ...form, author: e?.target?.value ?? "" })} placeholder="Author name" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Short summary of the post..."
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Full blog post content..."
                  rows={6}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Image URL</label>
                  <Input value={form.imageUrl} onChange={(e: any) => setForm({ ...form, imageUrl: e?.target?.value ?? "" })} placeholder="https://info.runsignup.com/wp-content/uploads/sites/3/2025/07/image-4-1024x472.png" />
                  {form.imageUrl && (
                    <div className="relative h-24 w-full mt-2 rounded-lg overflow-hidden bg-muted">
                      <Image src={form.imageUrl} alt="Preview" fill className="object-cover" onError={(e: any) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Read Time</label>
                  <Input value={form.readTime} onChange={(e: any) => setForm({ ...form, readTime: e?.target?.value ?? "" })} placeholder="5 min read" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded" />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="rounded" />
                  Published
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingId ? "Update Post" : "Create Post"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Posts Table */}
      <FadeIn delay={0.1}>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left font-medium px-4 py-3">Post</th>
                  <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Category</th>
                  <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Author</th>
                  <th className="text-left font-medium px-4 py-3 hidden lg:table-cell">Date</th>
                  <th className="text-center font-medium px-4 py-3">Status</th>
                  <th className="text-right font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      No posts found
                    </td>
                  </tr>
                ) : (
                  filtered.map((post) => (
                    <tr key={post.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {post.imageUrl ? (
                            <div className="relative h-10 w-14 rounded overflow-hidden bg-muted flex-shrink-0">
                              <Image src={post.imageUrl} alt={post.title} fill className="object-cover" onError={(e: any) => { e.currentTarget.style.display = 'none'; }} />
                            </div>
                          ) : (
                            <div className="h-10 w-14 rounded bg-muted flex items-center justify-center flex-shrink-0">
                              <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px] lg:max-w-[300px]">{post.title}</p>
                            {post.excerpt && <p className="text-xs text-muted-foreground truncate max-w-[200px] lg:max-w-[300px]">{post.excerpt}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge variant="secondary">{post.category}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{post.author}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{formatDate(post.publishedAt)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Badge variant={post.published ? "default" : "outline"} className="text-xs">
                            {post.published ? "Published" : "Draft"}
                          </Badge>
                          {post.featured && <Badge className="bg-amber-500 text-white text-xs">Featured</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleField(post, "published")}
                            className="p-1.5 rounded hover:bg-muted transition-colors"
                            title={post.published ? "Unpublish" : "Publish"}
                          >
                            {post.published ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                          </button>
                          <button
                            onClick={() => toggleField(post, "featured")}
                            className="p-1.5 rounded hover:bg-muted transition-colors"
                            title={post.featured ? "Unfeature" : "Feature"}
                          >
                            {post.featured ? <StarOff className="h-4 w-4 text-amber-500" /> : <Star className="h-4 w-4 text-muted-foreground" />}
                          </button>
                          <button
                            onClick={() => openEdit(post)}
                            className="p-1.5 rounded hover:bg-muted transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(post.id)}
                              disabled={deletingId === post.id}
                              className="p-1.5 rounded hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              {deletingId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-red-500" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
