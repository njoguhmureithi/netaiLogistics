"use client";
import { useState, useEffect } from "react";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/animate";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface ReviewData {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
  user: { id: string; name: string | null };
}

interface Props {
  productId: string;
  initialReviews: ReviewData[];
  initialAverage: number;
  initialCount: number;
}

function StarRating({ rating, size = "sm", interactive, onChange }: { rating: number; size?: "sm" | "lg"; interactive?: boolean; onChange?: (r: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const px = size === "lg" ? "h-6 w-6" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = interactive ? i <= (hovered || rating) : i <= Math.round(rating);
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(i)}
            onMouseEnter={() => interactive && setHovered(i)}
            onMouseLeave={() => interactive && setHovered(0)}
            className={`transition-colors ${interactive ? "cursor-pointer" : "cursor-default"}`}
          >
            <Star className={`${px} ${filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
          </button>
        );
      })}
    </div>
  );
}

function RatingBreakdown({ reviews, average, count }: { reviews: ReviewData[]; average: number; count: number }) {
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const c = reviews.filter((r) => r.rating === star).length;
    return { star, count: c, pct: count > 0 ? (c / count) * 100 : 0 };
  });

  return (
    <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-start">
      <div className="text-center shrink-0">
        <p className="text-5xl font-bold tracking-tight">{average > 0 ? average.toFixed(1) : "—"}</p>
        <StarRating rating={average} size="lg" />
        <p className="text-sm text-muted-foreground mt-1">{count} {count === 1 ? "review" : "reviews"}</p>
      </div>
      <div className="flex-1 w-full space-y-1.5">
        {distribution.map((d) => (
          <div key={d.star} className="flex items-center gap-2 text-sm">
            <span className="w-6 text-right text-muted-foreground">{d.star}</span>
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-amber-400 transition-all duration-500" style={{ width: `${d.pct}%` }} />
            </div>
            <span className="w-8 text-right text-muted-foreground">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewForm({ productId, existingReview, onSubmitted }: { productId: string; existingReview?: ReviewData | null; onSubmitted: (r: ReviewData) => void }) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [title, setTitle] = useState(existingReview?.title ?? "");
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { toast.error("Please select a star rating"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title: title.trim() || null, comment: comment.trim() || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to submit review");
        return;
      }
      const review = await res.json();
      toast.success(existingReview ? "Review updated! It will appear once approved." : "Review submitted! It will appear once approved by our team.");
      onSubmitted(review);
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h4 className="font-semibold text-sm">{existingReview ? "Update Your Review" : "Write a Review"}</h4>
      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Your Rating</label>
        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
      </div>
      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Title <span className="text-muted-foreground/50">(optional)</span></label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={100}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Comment <span className="text-muted-foreground/50">(optional)</span></label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share more about your experience..."
          rows={3}
          maxLength={1000}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>
      <Button type="submit" disabled={submitting || rating === 0} size="sm" className="gap-2">
        <Send className="h-3.5 w-3.5" /> {submitting ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
      </Button>
    </form>
  );
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function ProductReviews({ productId, initialReviews, initialAverage, initialCount }: Props) {
  const { data: session } = useSession() || {};
  const [reviews, setReviews] = useState<ReviewData[]>(initialReviews);
  const [average, setAverage] = useState(initialAverage);
  const [count, setCount] = useState(initialCount);

  const currentUserId = (session?.user as any)?.id as string | undefined;
  const myReview = currentUserId ? reviews.find((r) => r.user.id === currentUserId) : null;

  function handleSubmitted(newReview: ReviewData) {
    setReviews((prev) => {
      const existing = prev.findIndex((r) => r.id === newReview.id);
      let updated: ReviewData[];
      if (existing >= 0) {
        updated = [...prev];
        updated[existing] = newReview;
      } else {
        updated = [newReview, ...prev];
      }
      // Recalculate
      const c = updated.length;
      const avg = c > 0 ? updated.reduce((s, r) => s + r.rating, 0) / c : 0;
      setAverage(Math.round(avg * 10) / 10);
      setCount(c);
      return updated;
    });
  }

  return (
    <FadeIn>
      <div className="mt-16 pt-10 border-t border-border">
        <h2 className="font-display text-2xl font-bold tracking-tight mb-8">Customer Reviews</h2>

        <RatingBreakdown reviews={reviews} average={average} count={count} />

        {/* Review form */}
        <div className="mt-8">
          {session?.user ? (
            <ReviewForm productId={productId} existingReview={myReview} onSubmitted={handleSubmitted} />
          ) : (
            <div className="rounded-xl border border-dashed border-border p-5 text-center">
              <p className="text-sm text-muted-foreground">
                <a href="/login" className="text-primary hover:underline font-medium">Sign in</a> to leave a review
              </p>
            </div>
          )}
        </div>

        {/* Review list */}
        {reviews.length > 0 && (
          <div className="mt-8 space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-border/50 bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StarRating rating={r.rating} />
                      {r.title && <span className="font-medium text-sm">{r.title}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {r.user.name || "Customer"} · {formatDate(r.createdAt)}
                      {currentUserId === r.user.id && (
                        <span className="ml-1.5 text-primary font-medium">(You)</span>
                      )}
                    </p>
                  </div>
                </div>
                {r.comment && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </FadeIn>
  );
}
