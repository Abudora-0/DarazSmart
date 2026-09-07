"use client";

import { Clock } from "lucide-react";
import { getRecentlyViewed } from "@/lib/recently-viewed";
import { useClientValue } from "@/lib/use-client-value";
import { ProductCard, type SearchProductLike } from "@/components/product-card";

const EMPTY: SearchProductLike[] = [];

export function RecentlyViewed() {
  // localStorage only exists on the client, so the server renders nothing
  // here and the list appears once the client has taken over.
  const items = useClientValue<SearchProductLike[]>(getRecentlyViewed, EMPTY);

  if (items.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
        <Clock className="h-5 w-5 text-brand-500" /> Recently Viewed
      </h2>
      <div className="stagger grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.slice(0, 5).map((p, i) => (
          <ProductCard key={p.id} index={i} {...p} />
        ))}
      </div>
    </section>
  );
}
