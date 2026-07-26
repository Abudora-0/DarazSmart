"use client";

import { useMemo, useState } from "react";
import { Star, SlidersHorizontal, Loader2, Plus } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { formatPrice, cn } from "@/lib/utils";

export interface SearchProduct {
  id: string;
  darazUrl: string;
  title: string;
  image: string;
  currentPrice: number;
  originalPrice: number | null;
  discount: number | null;
  rating: number | null;
  reviewCount: number | null;
  seller: string | null;
}

type SortKey = "relevance" | "price-asc" | "price-desc" | "rating";

const RATING_OPTIONS = [
  { value: 4.5, label: "4.5 & up" },
  { value: 4, label: "4 Stars & up" },
  { value: 3, label: "3 Stars & up" },
  { value: 0, label: "Any rating" },
];

export function SearchResults({
  results,
  query,
}: {
  results: SearchProduct[];
  query: string;
}) {
  const [items, setItems] = useState(results);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(results.length >= 40);

  const prices = items.map((r) => r.currentPrice);
  const minPrice = prices.length ? Math.floor(Math.min(...prices)) : 0;
  const maxPrice = prices.length ? Math.ceil(Math.max(...prices)) : 0;
  const span = maxPrice - minPrice || 1;
  const step = Math.max(1, Math.round(span / 100));
  const avgPrice = prices.length
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : 0;

  const [lo, setLo] = useState(minPrice);
  const [hi, setHi] = useState(maxPrice);
  const [minRating, setMinRating] = useState(0);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [discountedOnly, setDiscountedOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("relevance");

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = page + 1;
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&page=${next}`
      );
      const data = await res.json();
      const more: SearchProduct[] = data.results ?? [];
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...more.filter((p) => !seen.has(p.id))];
      });
      setPage(next);
      if (more.length < 40) setHasMore(false);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }

  // Top sellers/brands present in the results
  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((r) => {
      if (r.seller) counts.set(r.seller, (counts.get(r.seller) ?? 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [items]);

  // Price histogram buckets
  const histogram = useMemo(() => {
    const n = 22;
    const arr = new Array(n).fill(0);
    items.forEach((r) => {
      let idx = Math.floor(((r.currentPrice - minPrice) / span) * n);
      idx = Math.max(0, Math.min(n - 1, idx));
      arr[idx]++;
    });
    const peak = Math.max(...arr, 1);
    return arr.map((c) => c / peak);
  }, [items, minPrice, span]);

  const filtered = useMemo(() => {
    let out = items.filter((r) => {
      if (r.currentPrice < lo || r.currentPrice > hi) return false;
      if (minRating > 0 && (r.rating ?? 0) < minRating) return false;
      if (selectedBrands.size > 0 && !(r.seller && selectedBrands.has(r.seller)))
        return false;
      if (discountedOnly && !((r.discount ?? 0) > 0)) return false;
      return true;
    });

    if (sort === "price-asc") out = [...out].sort((a, b) => a.currentPrice - b.currentPrice);
    else if (sort === "price-desc") out = [...out].sort((a, b) => b.currentPrice - a.currentPrice);
    else if (sort === "rating") out = [...out].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return out;
  }, [items, lo, hi, minRating, selectedBrands, discountedOnly, sort]);

  const loPct = ((lo - minPrice) / span) * 100;
  const hiPct = ((hi - minPrice) / span) * 100;
  const priceDisabled = minPrice === maxPrice;

  function toggleBrand(brand: string) {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) next.delete(brand);
      else next.add(brand);
      return next;
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[264px_1fr]">
      {/* Sidebar — sticks while scrolling the results */}
      <aside className="scroll-slim flex flex-col gap-4 lg:sticky lg:top-5 lg:max-h-[calc(100vh-2.5rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
        {/* Price Range */}
        <section className="glass-card rounded-3xl p-5">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="font-bold text-[#1c1917]">Price Range</h3>
            <button
              onClick={() => {
                setLo(minPrice);
                setHi(maxPrice);
              }}
              className="text-xs font-medium text-brand-500 hover:text-brand-600"
            >
              Reset
            </button>
          </div>
          <p className="mb-3 text-xs text-gray-400">
            The average price is {formatPrice(avgPrice)}
          </p>

          {/* Histogram */}
          <div className="flex h-14 items-end gap-[3px]">
            {histogram.map((h, i) => {
              const bucketPct = (i / histogram.length) * 100;
              const inRange = bucketPct >= loPct - 5 && bucketPct <= hiPct;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-t-sm transition-colors",
                    inRange ? "bg-brand-400" : "bg-brand-100"
                  )}
                  style={{ height: `${Math.max(6, h * 100)}%` }}
                />
              );
            })}
          </div>

          {/* Dual slider */}
          <div className="relative mt-2 h-9">
            <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-gray-200" />
            {!priceDisabled && (
              <div
                className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-500"
                style={{ left: `${loPct}%`, width: `${hiPct - loPct}%` }}
              />
            )}
            <input
              type="range"
              className="dual-range"
              min={minPrice}
              max={maxPrice}
              step={step}
              value={lo}
              disabled={priceDisabled}
              onChange={(e) =>
                setLo(Math.min(Number(e.target.value), hi - step))
              }
            />
            <input
              type="range"
              className="dual-range"
              min={minPrice}
              max={maxPrice}
              step={step}
              value={hi}
              disabled={priceDisabled}
              onChange={(e) =>
                setHi(Math.max(Number(e.target.value), lo + step))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-[#1c1917] px-2.5 py-1 text-xs font-semibold text-white">
              {formatPrice(lo)}
            </span>
            <span className="rounded-full bg-[#1c1917] px-2.5 py-1 text-xs font-semibold text-white">
              {formatPrice(hi)}
            </span>
          </div>
        </section>

        {/* Star Rating */}
        <section className="glass-card rounded-3xl p-5">
          <h3 className="mb-3 font-bold text-[#1c1917]">Star Rating</h3>
          <div className="flex flex-col gap-1.5">
            {RATING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMinRating(opt.value)}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors",
                  minRating === opt.value
                    ? "bg-brand-50 font-semibold text-brand-600"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <span className="flex items-center gap-1">
                  {opt.value > 0 &&
                    Array.from({ length: Math.floor(opt.value) }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  <span className="ml-1">{opt.label}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Brand */}
        {brands.length > 0 && (
          <section className="glass-card rounded-3xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-[#1c1917]">Brand</h3>
              {selectedBrands.size > 0 && (
                <button
                  onClick={() => setSelectedBrands(new Set())}
                  className="text-xs font-medium text-brand-500 hover:text-brand-600"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="flex flex-col gap-1">
              {brands.map(([brand, count]) => (
                <label
                  key={brand}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedBrands.has(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="h-4 w-4 rounded border-gray-300 accent-brand-500"
                  />
                  <span className="flex-1 truncate text-sm text-gray-600">
                    {brand}
                  </span>
                  <span className="text-xs text-gray-400">{count}</span>
                </label>
              ))}
            </div>
          </section>
        )}
      </aside>

      {/* Results */}
      <div>
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-[#1c1917]">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "product" : "products"}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDiscountedOnly((v) => !v)}
              className={cn(
                "rounded-full px-3.5 py-2 text-xs font-semibold transition-colors",
                discountedOnly
                  ? "bg-brand-500 text-white"
                  : "bg-white/55 text-gray-600 ring-1 ring-white/60 backdrop-blur-md hover:bg-white/75"
              )}
            >
              On sale
            </button>
            <div className="flex items-center gap-1.5 rounded-full bg-white/55 px-3 py-1.5 ring-1 ring-white/60 backdrop-blur-md">
              <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="bg-transparent text-xs font-medium text-gray-700 focus:outline-none"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="stagger grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {filtered.map((p, i) => (
              <ProductCard
                key={p.id}
                index={Math.min(i, 12)}
                id={p.id}
                darazUrl={p.darazUrl}
                title={p.title}
                image={p.image}
                currentPrice={p.currentPrice}
                originalPrice={p.originalPrice ?? undefined}
                discount={p.discount ?? undefined}
                rating={p.rating ?? undefined}
                reviewCount={p.reviewCount ?? undefined}
                seller={p.seller ?? undefined}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card flex flex-col items-center gap-2 rounded-3xl py-20 text-center text-gray-400">
            <SlidersHorizontal className="h-8 w-8 opacity-30" />
            <p className="font-medium">No products match your filters</p>
            <p className="text-sm">Try widening the price range or rating.</p>
          </div>
        )}

        {hasMore && filtered.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="flex items-center gap-2 rounded-full bg-white/70 px-6 py-3 text-sm font-semibold text-brand-600 ring-1 ring-brand-200 backdrop-blur-md transition-colors hover:bg-brand-50 disabled:opacity-60"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading more…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Load more products
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
