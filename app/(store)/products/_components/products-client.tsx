"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import ProductCard from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/animate";

export default function ProductsClient({ initialProducts, categories, initialCategory, initialSubCategory, initialSearch }: { initialProducts: any[]; categories: any[]; initialCategory: string; initialSubCategory: string; initialSearch: string }) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeSubCategory, setActiveSubCategory] = useState(initialSubCategory);
  const gridKey = useMemo(() => (initialProducts ?? []).map((p: any) => p?.id).join(",") || "empty", [initialProducts]);
  const [showFilters, setShowFilters] = useState(true);

  const navigateWithFilters = (cat: string, sub: string, s?: string) => {
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    if (sub) params.set("subcategory", sub);
    const searchVal = s !== undefined ? s : search;
    if (searchVal?.trim()) params.set("search", searchVal.trim());
    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    setActiveSubCategory("");
    navigateWithFilters(slug, "");
  };

  const handleSubCategoryChange = (slug: string) => {
    setActiveSubCategory(slug);
    navigateWithFilters(activeCategory, slug);
  };

  const handleSearch = (e: React.FormEvent) => {
    e?.preventDefault?.();
    navigateWithFilters(activeCategory, activeSubCategory, search);
  };

  const clearFilters = () => {
    setSearch("");
    setActiveCategory("");
    setActiveSubCategory("");
    router.push("/products");
  };

  const activeCat = (categories ?? []).find((c: any) => c?.slug === activeCategory);
  const subCategories = activeCat?.subCategories ?? [];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      <FadeIn>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Our Products</h1>
          <p className="text-muted-foreground">Explore our complete range of beauty and cosmetics</p>
        </div>
      </FadeIn>

      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e: any) => setSearch(e?.target?.value ?? "")} placeholder="Search products..." className="pl-10" />
            </div>
            <Button type="submit">Search</Button>
          </form>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
          </Button>
        </div>
        {showFilters && (
          <div className="space-y-2">
            {/* Category buttons */}
            <div className="flex flex-wrap gap-2 p-4 rounded-lg bg-muted/50">
              <Button variant={activeCategory === "" ? "default" : "outline"} size="sm" onClick={() => handleCategoryChange("")}>All</Button>
              {(categories ?? []).map((c: any) => (
                <Button key={c?.id} variant={activeCategory === c?.slug ? "default" : "outline"} size="sm" onClick={() => handleCategoryChange(c?.slug ?? "")}>
                  {c?.name}
                  {(c?.subCategories?.length ?? 0) > 0 && activeCategory === c?.slug && <ChevronDown className="h-3 w-3 ml-1" />}
                </Button>
              ))}
              {(activeCategory || activeSubCategory || search) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}><X className="h-4 w-4 mr-1" /> Clear</Button>
              )}
            </div>
            {/* Subcategory buttons — shown when a category with subs is active */}
            {subCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 py-3 rounded-lg bg-muted/30 border border-border/50">
                <span className="text-xs text-muted-foreground self-center mr-1">Subcategory:</span>
                <Button variant={activeSubCategory === "" ? "default" : "outline"} size="sm" className="h-7 text-xs" onClick={() => handleSubCategoryChange("")}>
                  All {activeCat?.name}
                </Button>
                {subCategories.map((sub: any) => (
                  <Button key={sub?.id} variant={activeSubCategory === sub?.slug ? "default" : "outline"} size="sm" className="h-7 text-xs" onClick={() => handleSubCategoryChange(sub?.slug ?? "")}>
                    {sub?.name}
                    <span className="ml-1 text-[10px] opacity-60">({sub?._count?.products ?? 0})</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Active filter badges */}
        {(activeCategory || activeSubCategory || search) && (
          <div className="flex flex-wrap items-center gap-2">
            {activeCategory && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {activeCat?.name ?? activeCategory}
                <button onClick={() => handleCategoryChange("")} className="ml-0.5 hover:text-foreground"><X className="h-3 w-3" /></button>
              </Badge>
            )}
            {activeSubCategory && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {subCategories.find((s: any) => s?.slug === activeSubCategory)?.name ?? activeSubCategory}
                <button onClick={() => handleSubCategoryChange("")} className="ml-0.5 hover:text-foreground"><X className="h-3 w-3" /></button>
              </Badge>
            )}
            {search && (
              <Badge variant="secondary" className="gap-1 pr-1">
                &quot;{search}&quot;
                <button onClick={() => { setSearch(""); navigateWithFilters(activeCategory, activeSubCategory, ""); }} className="ml-0.5 hover:text-foreground"><X className="h-3 w-3" /></button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {(initialProducts?.length ?? 0) === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No products found</p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear Filters</Button>
        </div>
      ) : (
        <Stagger key={gridKey} staggerDelay={0.03}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {(initialProducts ?? []).map((p: any) => (
              <StaggerItem key={p?.id}>
                <ProductCard id={p?.id} name={p?.name} slug={p?.slug} price={p?.price ?? 0} compareAtPrice={p?.compareAtPrice} imageUrl={p?.imageUrl} category={p?.category} stockQuantity={p?.stockQuantity ?? 0} createdAt={p?.createdAt} />
              </StaggerItem>
            ))}
          </div>
        </Stagger>
      )}
    </div>
  );
}
