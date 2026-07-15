"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Truck, Shield, Heart, Search, SlidersHorizontal, X, ChevronDown, Filter } from "lucide-react";
import ProductCard from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FadeIn, SlideIn, Stagger, StaggerItem } from "@/components/ui/animate";
import { useInView } from "framer-motion";
import { useRef, useEffect, useState, useMemo } from "react";

const HERO_IMG = "/images/hero-banner.jpg";

const CATEGORY_IMAGES: Record<string, string> = {
  skincare: "/images/cat-skincare.jpg",
  makeup: "/images/cat-makeup.jpg",
  haircare: "/images/cat-haircare.jpg",
  braids: "/images/cat-braids.jpg",
};
const DEFAULT_CAT_IMG = "/images/cat-default.jpg";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
  { value: "name-desc", label: "Name: Z-A" },
];

const ITEMS_PER_PAGE = 9;

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = Math.max(1, Math.floor(target / 40));
    const interval = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(interval); } else { setCount(start); }
    }, 30);
    return () => clearInterval(interval);
  }, [isInView, target]);

  return <span ref={ref} className="font-display text-3xl font-bold text-primary">{count}{suffix}</span>;
}

interface HeroSlideData {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  buttonText: string;
  buttonLink: string;
  imageUrl: string | null;
  overlayColor: string;
}

interface HomeClientProps {
  featuredProducts: any[];
  allProducts: any[];
  categories: any[];
  priceRange: { min: number; max: number };
  heroSlides?: HeroSlideData[];
}

/* ===== Sidebar Filter Content (reused in desktop sidebar + mobile drawer) ===== */
function FilterPanel({
  categories,
  activeCategory,
  setActiveCategory,
  activeSubCategory,
  setActiveSubCategory,
  priceRange,
  priceMin,
  priceMax,
  setPriceMin,
  setPriceMax,
  sortBy,
  setSortBy,
  hasActiveFilters,
  clearFilters,
  setShowAllProducts,
  fmtPrice,
}: any) {
  return (
    <div className="space-y-6">
      {/* Category + Subcategory */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Category</h4>
        <div className="space-y-0.5">
          <button
            onClick={() => { setActiveCategory(""); setActiveSubCategory(""); setShowAllProducts(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === ""
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-muted text-foreground"
            }`}
          >
            All Products
          </button>
          {(categories ?? []).map((c: any) => {
            const isActive = activeCategory === c?.slug;
            const subs = c?.subCategories ?? [];
            return (
              <div key={c?.id}>
                <button
                  onClick={() => {
                    if (isActive) { setActiveCategory(""); setActiveSubCategory(""); }
                    else { setActiveCategory(c?.slug); setActiveSubCategory(""); }
                    setShowAllProducts(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {subs.length > 0 && (
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isActive ? "rotate-0" : "-rotate-90"}`} />
                    )}
                    {c?.name}
                  </span>
                  <span className={`text-xs ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {c?._count?.products ?? 0}
                  </span>
                </button>
                {/* Subcategories — shown when category is active */}
                {isActive && subs.length > 0 && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-primary/20 pl-2">
                    <button
                      onClick={() => { setActiveSubCategory(""); setShowAllProducts(false); }}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                        activeSubCategory === ""
                          ? "text-primary bg-primary/10"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      All {c?.name}
                    </button>
                    {subs.map((sub: any) => (
                      <button
                        key={sub?.id}
                        onClick={() => { setActiveSubCategory(activeSubCategory === sub?.slug ? "" : sub?.slug); setShowAllProducts(false); }}
                        className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-between ${
                          activeSubCategory === sub?.slug
                            ? "text-primary bg-primary/10"
                            : "hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <span>{sub?.name}</span>
                        <span className="text-[10px] text-muted-foreground">{sub?._count?.products ?? 0}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border/50" />

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Price Range</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">KES</span>
              <Input
                type="number"
                min={priceRange.min}
                max={priceMax}
                value={priceMin}
                onChange={(e: any) => { setPriceMin(Number(e?.target?.value ?? 0)); setShowAllProducts(false); }}
                className="pl-9 text-sm h-9"
                placeholder="Min"
              />
            </div>
            <span className="text-muted-foreground text-xs">–</span>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">KES</span>
              <Input
                type="number"
                min={priceMin}
                max={priceRange.max}
                value={priceMax}
                onChange={(e: any) => { setPriceMax(Number(e?.target?.value ?? 0)); setShowAllProducts(false); }}
                className="pl-9 text-sm h-9"
                placeholder="Max"
              />
            </div>
          </div>
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            step={Math.max(1, Math.floor((priceRange.max - priceRange.min) / 100))}
            value={priceMax}
            onChange={(e) => { setPriceMax(Number(e.target.value)); setShowAllProducts(false); }}
            className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{fmtPrice(priceRange.min)}</span>
            <span>{fmtPrice(priceRange.max)}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border/50" />

      {/* Sort */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Sort By</h4>
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                sortBy === opt.value
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear All */}
      {hasActiveFilters && (
        <>
          <div className="border-t border-border/50" />
          <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
            <X className="h-3.5 w-3.5 mr-1.5" /> Clear All Filters
          </Button>
        </>
      )}
    </div>
  );
}

export default function HomeClient({ featuredProducts, allProducts, categories, priceRange, heroSlides = [] }: HomeClientProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const heroData = heroSlides.length > 0 ? heroSlides : [{
    id: "default",
    title: "Where Beauty Meets Reach.",
    subtitle: "Discover curated skincare, makeup, and haircare products that bring out your natural glow.",
    badge: "Premium Beauty",
    buttonText: "Shop Now",
    buttonLink: "/products",
    imageUrl: HERO_IMG,
    overlayColor: "from-black/60 via-black/40 to-transparent",
  }];

  // Auto-rotate slides
  useEffect(() => {
    if (heroData.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroData.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroData.length]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [activeSubCategory, setActiveSubCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceMin, setPriceMin] = useState(priceRange.min);
  const [priceMax, setPriceMax] = useState(priceRange.max);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const hasActiveFilters = searchQuery || activeCategory || activeSubCategory || sortBy !== "newest" || priceMin > priceRange.min || priceMax < priceRange.max;

  const filteredProducts = useMemo(() => {
    let result = [...(allProducts ?? [])];
    if (activeCategory) {
      result = result.filter((p: any) => p?.category?.slug === activeCategory);
    }
    if (activeSubCategory) {
      result = result.filter((p: any) => p?.subCategory?.slug === activeSubCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p: any) =>
        p?.name?.toLowerCase?.()?.includes?.(q) ||
        p?.description?.toLowerCase?.()?.includes?.(q) ||
        p?.category?.name?.toLowerCase?.()?.includes?.(q)
      );
    }
    result = result.filter((p: any) => {
      const price = p?.price ?? 0;
      return price >= priceMin && price <= priceMax;
    });
    switch (sortBy) {
      case "price-asc": result.sort((a: any, b: any) => (a?.price ?? 0) - (b?.price ?? 0)); break;
      case "price-desc": result.sort((a: any, b: any) => (b?.price ?? 0) - (a?.price ?? 0)); break;
      case "name-asc": result.sort((a: any, b: any) => (a?.name ?? "").localeCompare(b?.name ?? "")); break;
      case "name-desc": result.sort((a: any, b: any) => (b?.name ?? "").localeCompare(a?.name ?? "")); break;
      default: break;
    }
    return result;
  }, [allProducts, activeCategory, activeSubCategory, searchQuery, priceMin, priceMax, sortBy]);

  const displayedProducts = showAllProducts ? filteredProducts : filteredProducts.slice(0, ITEMS_PER_PAGE);
  const hasMore = filteredProducts.length > ITEMS_PER_PAGE && !showAllProducts;
  const gridKey = useMemo(() => displayedProducts.map((p: any) => p?.id).join(",") || "empty", [displayedProducts]);

  const clearFilters = () => {
    setSearchQuery("");
    setActiveCategory("");
    setActiveSubCategory("");
    setSortBy("newest");
    setPriceMin(priceRange.min);
    setPriceMax(priceRange.max);
    setShowAllProducts(false);
  };

  const fmtPrice = (v: number) => `KES ${v.toLocaleString()}`;

  const filterPanelProps = {
    categories, activeCategory, setActiveCategory,
    activeSubCategory, setActiveSubCategory,
    priceRange, priceMin, priceMax, setPriceMin, setPriceMax,
    sortBy, setSortBy, hasActiveFilters, clearFilters, setShowAllProducts, fmtPrice,
  };

  const activeFilterCount = [activeCategory, activeSubCategory, searchQuery, priceMin > priceRange.min || priceMax < priceRange.max, sortBy !== "newest"].filter(Boolean).length;

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[520px] md:h-[600px] overflow-hidden">
        {heroData.map((slide, i) => (
          <div key={slide.id} className={`absolute inset-0 transition-opacity duration-700 ${i === activeSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
            <div className="absolute inset-0">
              <Image src={slide.imageUrl || HERO_IMG} alt={slide.title} fill className="object-cover" priority={i === 0} sizes="100vw" />
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlayColor}`} />
            </div>
            <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 h-full flex items-center">
              <FadeIn>
                <div className="max-w-lg">
                  {slide.badge && (
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-pink-300" />
                      <span className="text-pink-200 text-sm font-medium uppercase tracking-widest">{slide.badge}</span>
                    </div>
                  )}
                  <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight mb-4">
                    {slide.title}
                  </h1>
                  {slide.subtitle && (
                    <p className="text-white/80 text-base md:text-lg mb-8 leading-relaxed">{slide.subtitle}</p>
                  )}
                  <Link href={slide.buttonLink}>
                    <Button size="lg" className="bg-primary hover:bg-primary/90">{slide.buttonText} <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </Link>
                </div>
              </FadeIn>
            </div>
          </div>
        ))}
        {/* Slide indicators */}
        {heroData.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {heroData.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeSlide ? "bg-white w-8" : "bg-white/50 hover:bg-white/70"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Features strip */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Truck, title: "Fast Delivery", desc: "Quick and reliable shipping across the country" },
              { icon: Shield, title: "Authentic Products", desc: "100% genuine beauty and cosmetics brands" },
              { icon: Heart, title: "Premium Quality", desc: "Carefully curated products for your routine" },
            ].map((f: any, i: number) => (
              <SlideIn key={i} from={i === 0 ? "left" : i === 2 ? "right" : "bottom"} delay={i * 0.1}>
                <div className="flex items-start gap-4 p-6 rounded-lg bg-card" style={{ boxShadow: "var(--shadow-sm)" }}>
                  <div className="p-3 rounded-lg bg-primary/10"><f.icon className="h-5 w-5 text-primary" /></div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              </SlideIn>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {(categories?.length ?? 0) > 0 && (
        <section className="py-12">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <FadeIn>
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold tracking-tight mb-1">Shop by Category</h2>
                <p className="text-sm text-muted-foreground">Browse our curated collections</p>
              </div>
            </FadeIn>
            <Stagger staggerDelay={0.08}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {(categories ?? []).map((cat: any) => {
                  const catImg = cat?.imageUrl || CATEGORY_IMAGES[cat?.slug?.toLowerCase?.()] || DEFAULT_CAT_IMG;
                  return (
                    <StaggerItem key={cat?.id}>
                      <Link href={`/products?category=${cat?.slug}`} className="group block">
                        <div className="relative h-32 sm:h-36 rounded-lg overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
                          <Image src={catImg} alt={`${cat?.name} beauty products`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                            <h3 className="font-display text-base font-bold text-white mb-0.5">{cat?.name}</h3>
                            <p className="text-white/70 text-xs">{cat?._count?.products ?? 0} products</p>
                          </div>
                        </div>
                      </Link>
                    </StaggerItem>
                  );
                })}
              </div>
            </Stagger>
          </div>
        </section>
      )}

      {/* ===== BROWSE SECTION — LEFT SIDEBAR + RIGHT GRID ===== */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold tracking-tight mb-2">Browse All Products</h2>
              <p className="text-muted-foreground">Find exactly what you&apos;re looking for</p>
            </div>
          </FadeIn>

          <div className="flex gap-8">
            {/* ---- LEFT SIDEBAR (desktop) ---- */}
            <aside className="hidden lg:block w-[250px] shrink-0">
              <div className="sticky top-24 rounded-xl bg-card border border-border/50 p-5 space-y-0" style={{ boxShadow: "var(--shadow-sm)" }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" /> Filters
                  </h3>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-xs text-primary hover:underline">Clear all</button>
                  )}
                </div>
                <FilterPanel {...filterPanelProps} />
              </div>
            </aside>

            {/* ---- RIGHT CONTENT (search bar + grid) ---- */}
            <div className="flex-1 min-w-0">
              {/* Search + Mobile filter toggle */}
              <FadeIn delay={0.1}>
                <div className="flex gap-3 mb-5">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e: any) => { setSearchQuery(e?.target?.value ?? ""); setShowAllProducts(false); }}
                      placeholder="Search products..."
                      className="pl-10"
                    />
                  </div>
                  {/* Mobile filter button */}
                  <Button
                    variant="outline"
                    className="lg:hidden relative"
                    onClick={() => setMobileFiltersOpen(true)}
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </div>
              </FadeIn>

              {/* Active filter badges (desktop + mobile) */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {activeCategory && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      {categories.find((c: any) => c?.slug === activeCategory)?.name ?? activeCategory}
                      <button onClick={() => { setActiveCategory(""); setActiveSubCategory(""); }} className="ml-0.5 hover:text-foreground"><X className="h-3 w-3" /></button>
                    </Badge>
                  )}
                  {activeSubCategory && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      {categories.find((c: any) => c?.slug === activeCategory)?.subCategories?.find((s: any) => s?.slug === activeSubCategory)?.name ?? activeSubCategory}
                      <button onClick={() => setActiveSubCategory("")} className="ml-0.5 hover:text-foreground"><X className="h-3 w-3" /></button>
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      &quot;{searchQuery}&quot;
                      <button onClick={() => setSearchQuery("")} className="ml-0.5 hover:text-foreground"><X className="h-3 w-3" /></button>
                    </Badge>
                  )}
                  {(priceMin > priceRange.min || priceMax < priceRange.max) && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      {fmtPrice(priceMin)} – {fmtPrice(priceMax)}
                      <button onClick={() => { setPriceMin(priceRange.min); setPriceMax(priceRange.max); }} className="ml-0.5 hover:text-foreground"><X className="h-3 w-3" /></button>
                    </Badge>
                  )}
                  {sortBy !== "newest" && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                      <button onClick={() => setSortBy("newest")} className="ml-0.5 hover:text-foreground"><X className="h-3 w-3" /></button>
                    </Badge>
                  )}
                </div>
              )}

              {/* Results count */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{displayedProducts.length}</span>
                  {filteredProducts.length > displayedProducts.length && (
                    <> of <span className="font-medium text-foreground">{filteredProducts.length}</span></>
                  )}
                  {" "}product{filteredProducts.length !== 1 ? "s" : ""}
                  {hasActiveFilters && <span className="text-primary font-medium"> (filtered)</span>}
                </p>
              </div>

              {/* Product Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg mb-2">No products match your filters</p>
                  <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters</p>
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" /> Clear All Filters
                  </Button>
                </div>
              ) : (
                <>
                  <Stagger key={gridKey} staggerDelay={0.03}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                      {displayedProducts.map((p: any) => (
                        <StaggerItem key={p?.id}>
                          <ProductCard
                            id={p?.id}
                            name={p?.name}
                            slug={p?.slug}
                            price={p?.price ?? 0}
                            compareAtPrice={p?.compareAtPrice}
                            imageUrl={p?.imageUrl}
                            category={p?.category}
                            stockQuantity={p?.stockQuantity ?? 0}
                            createdAt={p?.createdAt}
                          />
                        </StaggerItem>
                      ))}
                    </div>
                  </Stagger>
                  {hasMore && (
                    <div className="text-center mt-8">
                      <Button variant="outline" size="lg" onClick={() => setShowAllProducts(true)}>
                        Show All {filteredProducts.length} Products <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---- MOBILE FILTER DRAWER ---- */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 w-[300px] max-w-[85vw] bg-card shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" /> Filters
              </h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterPanel {...filterPanelProps} />
            </div>
            <div className="p-4 border-t border-border space-y-2">
              <Button className="w-full" onClick={() => setMobileFiltersOpen(false)}>
                Show {filteredProducts.length} Product{filteredProducts.length !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Featured Products */}
      {(featuredProducts?.length ?? 0) > 0 && (
        <section className="py-16">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <FadeIn>
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="font-display text-3xl font-bold tracking-tight mb-2">Featured Products</h2>
                  <p className="text-muted-foreground">Handpicked essentials for your beauty routine</p>
                </div>
                <Link href="/products"><Button variant="outline">View All <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              </div>
            </FadeIn>
            <Stagger staggerDelay={0.05}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {(featuredProducts ?? []).map((p: any) => (
                  <StaggerItem key={p?.id}>
                    <ProductCard id={p?.id} name={p?.name} slug={p?.slug} price={p?.price ?? 0} compareAtPrice={p?.compareAtPrice} imageUrl={p?.imageUrl} category={p?.category} stockQuantity={p?.stockQuantity ?? 0} createdAt={p?.createdAt} />
                  </StaggerItem>
                ))}
              </div>
            </Stagger>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[{ t: 500, s: "+", l: "Happy Customers" }, { t: 100, s: "+", l: "Products" }, { t: 50, s: "+", l: "Brands" }, { t: 98, s: "%", l: "Satisfaction" }].map((s: any, i: number) => (
                <div key={i}>
                  <CountUp target={s.t} suffix={s.s} />
                  <p className="text-sm text-muted-foreground mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
