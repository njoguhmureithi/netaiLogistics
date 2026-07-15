"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, CheckCircle, XCircle, Trash2, Loader2, Search, MessageSquare, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FadeIn } from "@/components/ui/animate";

interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  approved: boolean;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  product: { id: string; name: string; slug: string; imageUrl: string | null };
}

type FilterStatus = "all" | "pending" | "approved";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/25"}`} />
      ))}
    </div>
  );
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return d;
  }
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function fetchReviews() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?status=${filter}`);
      if (res.ok) setReviews(await res.json());
    } catch { toast.error("Failed to load reviews"); }
    setLoading(false);
  }

  useEffect(() => { fetchReviews(); }, [filter]);

  async function handleApprove(id: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      });
      if (res.ok) {
        toast.success("Review approved");
        setReviews((prev) => prev.map((r) => r.id === id ? { ...r, approved: true } : r));
        if (filter === "pending") setReviews((prev) => prev.filter((r) => r.id !== id));
      } else toast.error("Failed to approve");
    } catch { toast.error("Failed to approve"); }
    setActionLoading(null);
  }

  async function handleReject(id: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: false }),
      });
      if (res.ok) {
        toast.success("Review rejected");
        setReviews((prev) => prev.map((r) => r.id === id ? { ...r, approved: false } : r));
        if (filter === "approved") setReviews((prev) => prev.filter((r) => r.id !== id));
      } else toast.error("Failed to reject");
    } catch { toast.error("Failed to reject"); }
    setActionLoading(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this review?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Review deleted");
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else toast.error("Failed to delete");
    } catch { toast.error("Failed to delete"); }
    setActionLoading(null);
  }

  const filtered = search.trim()
    ? reviews.filter((r) =>
        r.product.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.user.name || "").toLowerCase().includes(search.toLowerCase()) ||
        r.user.email.toLowerCase().includes(search.toLowerCase()) ||
        (r.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.comment || "").toLowerCase().includes(search.toLowerCase())
      )
    : reviews;

  const pendingCount = filter === "pending" ? filtered.length : null;

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" /> Reviews
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Moderate customer reviews before they appear on the store</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2">
            {(["pending", "approved", "all"] as FilterStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors capitalize ${
                  filter === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                {s === "pending" ? "Pending" : s === "approved" ? "Approved" : "All"}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by product, customer, or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </FadeIn>

      {/* Review list */}
      <FadeIn delay={0.1}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">
              {filter === "pending" ? "No pending reviews to moderate" : "No reviews found"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row gap-4">
                {/* Product thumbnail */}
                <Link href={`/products/${r.product.slug}`} target="_blank" className="shrink-0">
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted">
                    {r.product.imageUrl ? (
                      <Image src={r.product.imageUrl} alt={r.product.name} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">N/A</div>
                    )}
                  </div>
                </Link>

                {/* Review content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Stars rating={r.rating} />
                    <Badge variant={r.approved ? "default" : "secondary"} className={`text-xs ${r.approved ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                      {r.approved ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                  {r.title && <p className="font-medium text-sm mb-0.5">{r.title}</p>}
                  {r.comment && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{r.comment}</p>}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Product: <Link href={`/products/${r.product.slug}`} target="_blank" className="text-primary hover:underline">{r.product.name}</Link></span>
                    <span>By: {r.user.name || r.user.email}</span>
                    <span>{formatDate(r.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center gap-2 shrink-0">
                  {!r.approved && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
                      onClick={() => handleApprove(r.id)}
                      disabled={actionLoading === r.id}
                    >
                      {actionLoading === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                      Approve
                    </Button>
                  )}
                  {r.approved && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-900/20"
                      onClick={() => handleReject(r.id)}
                      disabled={actionLoading === r.id}
                    >
                      {actionLoading === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                      Reject
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-destructive border-destructive/20 hover:bg-destructive/5"
                    onClick={() => handleDelete(r.id)}
                    disabled={actionLoading === r.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </FadeIn>
    </div>
  );
}
