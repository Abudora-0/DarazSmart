"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Layers, Star, Trash2, TrendingDown } from "lucide-react";
import { useCompareStore } from "@/store/compare";
import { useCartStore } from "@/store/cart";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, EmptyState } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoreHydrated } from "@/lib/use-store-hydrated";

type Row = {
  label: string;
  render: (item: ReturnType<typeof useCompareStore.getState>["items"][number]) => React.ReactNode;
  /** Marks the winning cell in the row, when there is one. */
  best?: (
    items: ReturnType<typeof useCompareStore.getState>["items"]
  ) => string | null;
};

export function CompareView() {
  const items = useCompareStore((s) => s.items);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const addItem = useCartStore((s) => s.addItem);
  const hydrated = useStoreHydrated(useCompareStore);

  if (!hydrated) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <EmptyState icon={<Layers className="h-6 w-6" />} title="Nothing to compare yet">
          Pin products with the layers icon on any product card, then come back
          to see them side by side.
          <div className="mt-4">
            <Button asChild size="sm">
              <Link href="/">Browse products</Link>
            </Button>
          </div>
        </EmptyState>
      </div>
    );
  }

  const cheapest = items.reduce((a, b) =>
    b.currentPrice < a.currentPrice ? b : a
  ).id;
  const bestRated = items.some((i) => i.rating)
    ? items.reduce((a, b) => ((b.rating ?? 0) > (a.rating ?? 0) ? b : a)).id
    : null;
  const biggestDiscount = items.some((i) => i.discount)
    ? items.reduce((a, b) => ((b.discount ?? 0) > (a.discount ?? 0) ? b : a)).id
    : null;

  const rows: Row[] = [
    {
      label: "Price",
      best: () => cheapest,
      render: (i) => (
        <span className="text-lg font-extrabold tabular-nums text-brand-600">
          {formatPrice(i.currentPrice)}
        </span>
      ),
    },
    {
      label: "Was",
      render: (i) =>
        i.originalPrice && i.originalPrice > i.currentPrice ? (
          <span className="text-sm text-ink-subtle line-through">
            {formatPrice(i.originalPrice)}
          </span>
        ) : (
          <span className="text-sm text-ink-subtle">Not on sale</span>
        ),
    },
    {
      label: "Discount",
      best: () => biggestDiscount,
      render: (i) =>
        i.discount ? (
          <Badge variant="danger" size="lg">
            <TrendingDown className="h-3 w-3" />-{Math.round(i.discount)}%
          </Badge>
        ) : (
          <span className="text-sm text-ink-subtle">None</span>
        ),
    },
    {
      label: "Rating",
      best: () => bestRated,
      render: (i) =>
        i.rating ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {i.rating.toFixed(1)}
            {i.reviewCount ? (
              <span className="font-normal text-ink-subtle">
                ({i.reviewCount.toLocaleString()})
              </span>
            ) : null}
          </span>
        ) : (
          <span className="text-sm text-ink-subtle">No ratings</span>
        ),
    },
    {
      label: "Seller",
      render: (i) => (
        <span className="text-sm text-ink-muted">{i.seller ?? "Unknown"}</span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft">
            <Layers className="h-5 w-5 text-brand-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">Compare</h1>
            <p className="text-sm text-ink-muted">
              {items.length} product{items.length === 1 ? "" : "s"} side by side
            </p>
          </div>
        </div>
        <Button variant="danger" size="sm" onClick={clear}>
          <Trash2 className="h-3.5 w-3.5" />
          Clear all
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="scroll-slim overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr>
                <th className="w-28 border-b border-line px-4 py-4 align-bottom text-xs font-bold uppercase tracking-wider text-ink-subtle sm:w-36">
                  Product
                </th>
                {items.map((item) => (
                  <th
                    key={item.id}
                    className="min-w-[180px] border-b border-line p-4 align-bottom font-normal"
                  >
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${item.id}`}
                          className="relative h-20 w-20 overflow-hidden rounded-2xl bg-sunken"
                        >
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-contain p-1.5"
                              unoptimized
                            />
                          )}
                        </Link>
                        <button
                          onClick={() => remove(item.id)}
                          aria-label={`Remove ${item.title}`}
                          className="rounded-lg p-1.5 text-ink-subtle transition-colors hover:bg-danger-soft hover:text-danger"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <Link
                        href={`/product/${item.id}`}
                        className="line-clamp-3 text-sm font-semibold leading-snug text-ink hover:text-brand-600"
                      >
                        {item.title}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => {
                const winner = row.best?.(items) ?? null;
                return (
                  <tr key={row.label} className="even:bg-sunken/40">
                    <th
                      scope="row"
                      className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-subtle"
                    >
                      {row.label}
                    </th>
                    {items.map((item) => (
                      <td
                        key={item.id}
                        className={cn(
                          "px-4 py-3.5",
                          winner === item.id &&
                            "relative before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-brand-500"
                        )}
                      >
                        {row.render(item)}
                      </td>
                    ))}
                  </tr>
                );
              })}

              <tr>
                <th scope="row" className="px-4 py-4" />
                {items.map((item) => (
                  <td key={item.id} className="px-4 py-4">
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          addItem(item);
                          toast("Added to your cart", { variant: "success" });
                        }}
                      >
                        Add to cart
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={item.darazUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          On Daraz
                        </a>
                      </Button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
