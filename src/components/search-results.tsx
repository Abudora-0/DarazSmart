"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  Loader2,
  Plus,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
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

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

const RATING_OPTIONS = [
  { value: 4.5, label: "4.5 and up" },
  { value: 4, label: "4 stars and up" },
  { value: 3, label: "3 stars and up" },
  { value: 0, label: "Any rating" },
];

export function SearchResults({
  results,
  query,
  hasMore: initialHasMore,
}: {
  results: SearchProduct[];
  query: string;
  hasMore?: boolean;
}) {
  const pathname = usePathname();
  const params = useSearchParams();

  const [items, setItems] = useState(results);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore ?? false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // A fresh query replaces the whole result set, so the pages accumulated by
  // "load more" on the previous search must not leak into it. Adjusting
  // during render (rather than in an effect) avoids a throwaway paint of the
  // old results under the new query.
  const [renderedFor, setRenderedFor] = useState(results);
  if (renderedFor !== results) {
    setRenderedFor(results);
    setItems(results);
    setPage(1);
    setHasMore(initialHasMore ?? false);
  }

  const prices = items.map((r) => r.currentPrice);
  const minPrice = prices.length ? Math.floor(Math.min(...prices)) : 0;
  const maxPrice = prices.length ? Math.ceil(Math.max(...prices)) : 0;
  const span = maxPrice - minPrice || 1;
  const step = Math.max(1, Math.round(span / 100));
  const avgPrice = prices.length
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : 0;

  // Filters live in the URL so a filtered result set can be shared, bookmarked
  // and restored by the back button.
  const rawMin = params.get("min");
  const rawMax = params.get("max");
  const minRating = Number(params.get("rating") ?? 0);
  const discountedOnly = params.get("sale") === "1";
  const sort = (params.get("sort") as SortKey) ?? "relevance";
  const selectedBrands = useMemo(
    () => new Set(params.getAll("brand")),
    [params]
  );

  // An untouched slider tracks the data. Once the user has set a bound it is
  // theirs, and later pages must not silently widen it back open.
  const lo = rawMin !== null ? Math.max(minPrice, Number(rawMin)) : minPrice;
  const hi = rawMax !== null ? Math.min(maxPrice, Number(rawMax)) : maxPrice;

  // Filtering happens entirely on the client, so the URL is rewritten with
  // history.replaceState rather than router.replace. The App Router picks the
  // change up through useSearchParams without re-rendering the page on the
  // server, which would otherwise refetch Daraz on every checkbox.
  const setParams = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      mutate(next);
      const qs = next.toString();
      window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
    },
    [params, pathname]
  );

  // Dragging a range input fires continuously; writing every frame to the URL
  // would flood the history and stutter. Keep a local value while dragging.
  const [dragging, setDragging] = useState<{ lo: number; hi: number } | null>(
    null
  );
  const commitTimer = useRef<number | undefined>(undefined);

  function commitRange(nextLo: number, nextHi: number) {
    setDragging({ lo: nextLo, hi: nextHi });
    window.clearTimeout(commitTimer.current);
    commitTimer.current = window.setTimeout(() => {
      setParams((p) => {
        if (nextLo <= minPrice) p.delete("min");
        else p.set("min", String(nextLo));
        if (nextHi >= maxPrice) p.delete("max");
        else p.set("max", String(nextHi));
      });
      setDragging(null);
    }, 220);
  }

  useEffect(() => () => window.clearTimeout(commitTimer.current), []);

  const viewLo = dragging?.lo ?? lo;
  const viewHi = dragging?.hi ?? hi;

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
      setHasMore(Boolean(data.hasMore) && more.length > 0);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }

  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((r) => {
      if (r.seller) counts.set(r.seller, (counts.get(r.seller) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [items]);

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
      if (r.currentPrice < viewLo || r.currentPrice > viewHi) return false;
      if (minRating > 0 && (r.rating ?? 0) < minRating) return false;
      if (selectedBrands.size > 0 && !(r.seller && selectedBrands.has(r.seller)))
        return false;
      if (discountedOnly && !((r.discount ?? 0) > 0)) return false;
      return true;
    });

    if (sort === "price-asc")
      out = [...out].sort((a, b) => a.currentPrice - b.currentPrice);
    else if (sort === "price-desc")
      out = [...out].sort((a, b) => b.currentPrice - a.currentPrice);
    else if (sort === "rating")
      out = [...out].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return out;
  }, [items, viewLo, viewHi, minRating, selectedBrands, discountedOnly, sort]);

  const loPct = ((viewLo - minPrice) / span) * 100;
  const hiPct = ((viewHi - minPrice) / span) * 100;
  const priceDisabled = minPrice === maxPrice;

  const activeFilters = [
    ...(rawMin !== null || rawMax !== null
      ? [
          {
            key: "price",
            label: `${formatPrice(lo)} to ${formatPrice(hi)}`,
            clear: () =>
              setParams((p) => {
                p.delete("min");
                p.delete("max");
              }),
          },
        ]
      : []),
    ...(minRating > 0
      ? [
          {
            key: "rating",
            label: `${minRating} stars and up`,
            clear: () => setParams((p) => p.delete("rating")),
          },
        ]
      : []),
    ...(discountedOnly
      ? [
          {
            key: "sale",
            label: "On sale",
            clear: () => setParams((p) => p.delete("sale")),
          },
        ]
      : []),
    ...[...selectedBrands].map((brand) => ({
      key: `brand-${brand}`,
      label: brand,
      clear: () =>
        setParams((p) => {
          const rest = [...selectedBrands].filter((b) => b !== brand);
          p.delete("brand");
          rest.forEach((b) => p.append("brand", b));
        }),
    })),
  ];

  function clearAll() {
    setParams((p) => {
      ["min", "max", "rating", "sale", "brand", "sort"].forEach((k) =>
        p.delete(k)
      );
    });
  }

  function toggleBrand(brand: string) {
    setParams((p) => {
      const next = new Set(selectedBrands);
      if (next.has(brand)) next.delete(brand);
      else next.add(brand);
      p.delete("brand");
      next.forEach((b) => p.append("brand", b));
    });
  }

  const filterPanels = (
    <div className="flex flex-col gap-4">
      {/* Price */}
      <Card className="p-5">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-bold text-ink">Price range</h3>
          <button
            onClick={() =>
              setParams((p) => {
                p.delete("min");
                p.delete("max");
              })
            }
            className="text-xs font-medium text-brand-500 transition-colors hover:text-brand-600"
          >
            Reset
          </button>
        </div>
        <p className="mb-3 text-xs text-ink-subtle">
          The average price is {formatPrice(avgPrice)}
        </p>

        <div className="flex h-14 items-end gap-[3px]">
          {histogram.map((h, i) => {
            const bucketPct = (i / histogram.length) * 100;
            const inRange = bucketPct >= loPct - 5 && bucketPct <= hiPct;
            return (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-t-sm transition-colors duration-200",
                  inRange ? "bg-brand-400" : "bg-brand-500/20"
                )}
                style={{ height: `${Math.max(6, h * 100)}%` }}
              />
            );
          })}
        </div>

        <div className="relative mt-2 h-9">
          <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-line-strong" />
          {!priceDisabled && (
            <div
              className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-500"
              style={{ left: `${loPct}%`, width: `${hiPct - loPct}%` }}
            />
          )}
          <input
            type="range"
            aria-label="Minimum price"
            className="dual-range"
            min={minPrice}
            max={maxPrice}
            step={step}
            value={viewLo}
            disabled={priceDisabled}
            onChange={(e) =>
              commitRange(
                Math.min(Number(e.target.value), viewHi - step),
                viewHi
              )
            }
          />
          <input
            type="range"
            aria-label="Maximum price"
            className="dual-range"
            min={minPrice}
            max={maxPrice}
            step={step}
            value={viewHi}
            disabled={priceDisabled}
            onChange={(e) =>
              commitRange(
                viewLo,
                Math.max(Number(e.target.value), viewLo + step)
              )
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-semibold tabular-nums text-ink-inverse">
            {formatPrice(viewLo)}
          </span>
          <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-semibold tabular-nums text-ink-inverse">
            {formatPrice(viewHi)}
          </span>
        </div>
      </Card>

      {/* Rating */}
      <Card className="p-5">
        <h3 className="mb-3 font-bold text-ink">Star rating</h3>
        <div className="flex flex-col gap-1.5">
          {RATING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                setParams((p) => {
                  if (opt.value === 0) p.delete("rating");
                  else p.set("rating", String(opt.value));
                })
              }
              className={cn(
                "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors",
                minRating === opt.value
                  ? "bg-accent-soft font-semibold text-brand-600"
                  : "text-ink-muted hover:bg-sunken hover:text-ink"
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
      </Card>

      {/* Brand */}
      {brands.length > 0 && (
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-ink">Brand</h3>
            {selectedBrands.size > 0 && (
              <button
                onClick={() => setParams((p) => p.delete("brand"))}
                className="text-xs font-medium text-brand-500 transition-colors hover:text-brand-600"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            {brands.map(([brand, count]) => (
              <label
                key={brand}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 transition-colors hover:bg-sunken"
              >
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={selectedBrands.has(brand)}
                  onChange={() => toggleBrand(brand)}
                />
                <span className="flex-1 truncate text-sm text-ink-muted">
                  {brand}
                </span>
                <span className="text-xs tabular-nums text-ink-subtle">
                  {count}
                </span>
              </label>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[264px_1fr]">
      {/* Sidebar sticks while the results scroll. Becomes a sheet under lg. */}
      <aside className="scroll-slim hidden lg:sticky lg:top-24 lg:flex lg:max-h-[calc(100vh-7rem)] lg:flex-col lg:self-start lg:overflow-y-auto lg:pr-1">
        {filterPanels}
      </aside>

      <Sheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title="Filters"
        description={`${filtered.length} of ${items.length} products match`}
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" block onClick={clearAll}>
              Clear all
            </Button>
            <Button block onClick={() => setFiltersOpen(false)}>
              Show {filtered.length} results
            </Button>
          </div>
        }
      >
        {filterPanels}
      </Sheet>

      {/* Results */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-muted">
            <span className="font-semibold tabular-nums text-ink">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "product" : "products"}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="pill"
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {activeFilters.length > 0 && (
                <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                  {activeFilters.length}
                </span>
              )}
            </Button>

            <button
              onClick={() =>
                setParams((p) => {
                  if (discountedOnly) p.delete("sale");
                  else p.set("sale", "1");
                })
              }
              className={cn(
                "h-9 rounded-full px-3.5 text-xs font-semibold transition-colors",
                discountedOnly
                  ? "bg-brand-500 text-white shadow-[var(--shadow-brand)]"
                  : "bg-surface/70 text-ink-muted ring-1 ring-line backdrop-blur-md hover:bg-surface hover:text-ink"
              )}
            >
              On sale
            </button>

            <Select
              label="Sort results"
              value={sort}
              options={SORT_OPTIONS}
              icon={<ArrowUpDown className="h-3.5 w-3.5" />}
              onChange={(value) =>
                setParams((p) => {
                  if (value === "relevance") p.delete("sort");
                  else p.set("sort", value);
                })
              }
            />
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {activeFilters.map((f) => (
              <button
                key={f.key}
                onClick={f.clear}
                className="animate-scale-in flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-100"
              >
                {f.label}
                <X className="h-3 w-3" />
              </button>
            ))}
            <button
              onClick={clearAll}
              className="px-1 text-xs font-semibold text-ink-subtle underline-offset-2 transition-colors hover:text-ink hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="stagger grid grid-cols-2 gap-4 lg:grid-cols-3">
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
          <EmptyState
            icon={<SlidersHorizontal className="h-6 w-6" />}
            title="No products match your filters"
          >
            Try widening the price range or lowering the minimum rating.
            <div className="mt-4">
              <Button variant="soft" size="sm" onClick={clearAll}>
                Clear all filters
              </Button>
            </div>
          </EmptyState>
        )}

        {hasMore && filtered.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading more
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Load more products
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
