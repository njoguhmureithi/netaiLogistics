"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Copy, Check, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PromoPopupData {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  couponCode: string | null;
  showDelay: number;
  displayFrequency: string;
}

export default function PromoPopup() {
  const [popup, setPopup] = useState<PromoPopupData | null>(null);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const shouldShow = useCallback((p: PromoPopupData) => {
    const key = `promo_popup_${p.id}`;
    if (p.displayFrequency === "once_per_session") {
      return !sessionStorage.getItem(key);
    }
    if (p.displayFrequency === "once_per_day") {
      const last = localStorage.getItem(key);
      if (!last) return true;
      const diff = Date.now() - parseInt(last, 10);
      return diff > 24 * 60 * 60 * 1000;
    }
    return true; // "always"
  }, []);

  const markShown = useCallback((p: PromoPopupData) => {
    const key = `promo_popup_${p.id}`;
    if (p.displayFrequency === "once_per_session") {
      sessionStorage.setItem(key, "1");
    } else if (p.displayFrequency === "once_per_day") {
      localStorage.setItem(key, Date.now().toString());
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let cancelled = false;
    const fetchPopup = async () => {
      try {
        const res = await fetch("/api/storefront/promo-popup");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!data || !data.id || cancelled) return;
        if (!shouldShow(data)) return;
        setPopup(data);
        timer = setTimeout(() => {
          if (!cancelled) {
            setVisible(true);
            markShown(data);
          }
        }, (data.showDelay ?? 3) * 1000);
      } catch (e) {
        console.error("Promo popup fetch error:", e);
      }
    };
    // Small delay to let the page settle before fetching
    const initTimer = setTimeout(fetchPopup, 500);
    return () => {
      cancelled = true;
      clearTimeout(initTimer);
      clearTimeout(timer);
    };
  }, [shouldShow, markShown]);

  function handleClose() {
    setVisible(false);
    setTimeout(() => setPopup(null), 300);
  }

  async function handleCopy() {
    if (!popup?.couponCode) return;
    try {
      await navigator.clipboard.writeText(popup.couponCode);
      setCopied(true);
      toast.success("Coupon code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  if (!popup) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={handleClose}
      />

      {/* Popup */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          aria-label="Close popup"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image */}
        {popup.imageUrl && (
          <div className="relative w-full aspect-[16/9] bg-muted">
            <Image src={popup.imageUrl} alt={popup.title} fill className="object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="p-6 text-center space-y-3">
          <h3 className="text-xl font-bold text-foreground">{popup.title}</h3>
          {popup.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{popup.description}</p>
          )}

          {/* Coupon Code */}
          {popup.couponCode && (
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5">
                <Ticket className="h-4 w-4 text-primary" />
                <span className="font-mono font-bold text-primary tracking-wider">{popup.couponCode}</span>
              </div>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Copy code"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
          )}

          {/* CTA Button */}
          {popup.buttonText && popup.buttonLink && (
            <Link href={popup.buttonLink} onClick={handleClose}>
              <Button className="mt-2 w-full">{popup.buttonText}</Button>
            </Link>
          )}

          <button onClick={handleClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            No thanks
          </button>
        </div>
      </div>
    </>
  );
}
