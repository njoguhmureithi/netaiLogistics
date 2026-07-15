"use client";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, Search, Menu, X, LogOut, Package, Heart, Tag, BookOpen } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function StoreHeader() {
  const { data: session, status } = useSession() || {};
  const totalItems = useCartStore((s) => s?.getTotalItems?.() ?? 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ products: any[]; categories: any[] }>({ products: [], categories: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setSuggestions({ products: [], categories: [] }); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(() => {
      fetch(`/api/products/suggestions?q=${encodeURIComponent(q.trim())}`)
        .then((r) => r.json())
        .then((data) => { setSuggestions(data ?? { products: [], categories: [] }); setShowSuggestions(true); })
        .catch(() => {});
    }, 250);
  }, []);

  const handleSearchInput = (val: string) => {
    setSearchQuery(val);
    fetchSuggestions(val);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e?.preventDefault?.();
    if (searchQuery?.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (slug: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    setShowSuggestions(false);
    router.push(`/products/${slug}`);
  };

  const selectCategory = (slug: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    setShowSuggestions(false);
    router.push(`/products?category=${slug}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-xl font-bold tracking-tight text-foreground">Netai</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">All Products</Link>
            <Link href="/products?category=skincare" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Skincare</Link>
            <Link href="/products?category=makeup" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Makeup</Link>
            <Link href="/products?category=haircare" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Haircare</Link>
            <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            <Link href="/track" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Track Order</Link>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-full hover:bg-muted transition-colors">
              <Search className="h-5 w-5 text-muted-foreground" />
            </button>
            {status === "authenticated" && (
              <Link href="/wishlist" className="p-2 rounded-full hover:bg-muted transition-colors" title="Wishlist">
                <Heart className="h-5 w-5 text-muted-foreground" />
              </Link>
            )}
            <Link href="/cart" className="p-2 rounded-full hover:bg-muted transition-colors relative">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </Link>
            {status === "authenticated" ? (
              <div className="flex items-center gap-2">
                <Link href="/account" className="p-2 rounded-full hover:bg-muted transition-colors">
                  <User className="h-5 w-5 text-muted-foreground" />
                </Link>
                {((session?.user as any)?.role === "admin" || (session?.user as any)?.role === "manager") && (
                  <Link href="/admin">
                    <Button variant="outline" size="xs">Admin</Button>
                  </Link>
                )}
                <button onClick={() => signOut({ callbackUrl: "/" })} className="p-2 rounded-full hover:bg-muted transition-colors" title="Sign out">
                  <LogOut className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm">Sign In</Button>
              </Link>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-full hover:bg-muted transition-colors">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div ref={searchRef} className="pb-4 relative">
            <form onSubmit={handleSearch}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e?.target?.value ?? "")}
                  placeholder="Search products..."
                  className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
                <Button type="submit" size="sm">Search</Button>
              </div>
            </form>
            {showSuggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-card rounded-lg border border-border z-50 overflow-hidden" style={{ boxShadow: "var(--shadow-lg)" }}>
                {suggestions.categories.length > 0 && (
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Categories</p>
                    {suggestions.categories.map((c: any) => (
                      <button key={c.slug} onClick={() => selectCategory(c.slug)} className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-muted text-sm text-left">
                        <Tag className="h-3.5 w-3.5 text-muted-foreground" /> {c.name}
                      </button>
                    ))}
                  </div>
                )}
                {suggestions.products.length > 0 && (
                  <div className="px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Products</p>
                    {suggestions.products.map((p: any) => (
                      <button key={p.id} onClick={() => selectSuggestion(p.slug)} className="flex items-center gap-3 w-full px-2 py-1.5 rounded hover:bg-muted text-left">
                        <div className="relative w-8 h-8 rounded bg-muted overflow-hidden shrink-0">
                          {p.imageUrl ? <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="32px" /> : <div className="w-full h-full" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.category?.name} · KES {p.price?.toLocaleString?.()}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-2">
            <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium">All Products</Link>
            <Link href="/products?category=skincare" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium">Skincare</Link>
            <Link href="/products?category=makeup" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium">Makeup</Link>
            <Link href="/products?category=haircare" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium">Haircare</Link>
            <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Blog
            </Link>
            <Link href="/track" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" /> Track Order
            </Link>
            {status === "authenticated" && (
              <>
                <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium flex items-center gap-2">
                  <Heart className="h-4 w-4" /> Wishlist
                </Link>
                <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" /> My Orders
                </Link>
                {((session?.user as any)?.role === "admin" || (session?.user as any)?.role === "manager") && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium flex items-center gap-2 text-primary">
                    <User className="h-4 w-4" /> Admin Panel
                  </Link>
                )}
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
