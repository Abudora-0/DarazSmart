import { Suspense } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { CategoryNav } from "@/components/category-nav";
import { ProductCard, type SearchProductLike } from "@/components/product-card";
import { RecentlyViewed } from "@/components/recently-viewed";
import { searchAndUpsert } from "@/lib/search-service";
import { TrendingUp, Tag, Bell, ArrowRight, Flame } from "lucide-react";

// 5 categories fetched in parallel on a cold cache can take a few seconds.
export const maxDuration = 30;

// Pull a mix of categories so the home grid shows variety, not one type.
const TRENDING_QUERIES = [
  "headphones",
  "sneakers",
  "smart watch",
  "perfume",
  "sunglasses",
];

async function fetchCategory(q: string): Promise<SearchProductLike[]> {
  // searchAndUpsert has its own ~45min Redis cache, so no extra fetch-cache needed.
  const results = await searchAndUpsert(q, 1).catch(() => []);
  return results.filter((p) => !!p.image);
}

async function TrendingGrid() {
  const lists = await Promise.all(TRENDING_QUERIES.map(fetchCategory));
  // Best deals first within each category, then interleave round-robin.
  const sorted = lists.map((l) =>
    [...l].sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0))
  );

  const products: SearchProductLike[] = [];
  const seen = new Set<string>();
  for (let round = 0; round < 4; round++) {
    for (const list of sorted) {
      const p = list[round];
      if (p && !seen.has(p.id)) {
        seen.add(p.id);
        products.push(p);
      }
    }
  }

  const top = products.slice(0, 10);
  if (top.length === 0) return null;

  return (
    <div className="stagger grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {top.map((p, i) => (
        <ProductCard key={p.id} index={Math.min(i, 10)} {...p} />
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="glass-card rounded-3xl p-3">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="mt-3 space-y-2 px-1">
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-7 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="px-4 py-5 sm:px-6">
      <div className="mb-5">
        <CategoryNav />
      </div>

      {/* Hero — no overflow-hidden so the search dropdown isn't clipped */}
      <section className="relative z-10 rounded-[26px] bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 px-6 py-14 text-center sm:px-10 sm:py-16">
        <div
          className="pointer-events-none absolute inset-0 rounded-[26px] opacity-40"
          style={{
            background:
              "radial-gradient(600px 300px at 20% 0%, rgba(255,255,255,0.25), transparent 60%)",
          }}
        />
        <div className="animate-fade-up relative mx-auto flex max-w-2xl flex-col items-center gap-5">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/20">
            Powered by live Daraz.pk data
          </span>
          <h1 className="font-brand text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Shop Daraz <span className="text-amber-300">Smarter</span>
          </h1>
          <p className="max-w-lg text-sm text-white/80 sm:text-base">
            Compare prices, track drops, and collect coupons — all in one place.
            Save products to your cart and check out directly on Daraz.
          </p>
          <div className="mt-1 flex w-full justify-center">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#1c1917]">
            <Flame className="h-5 w-5 text-brand-500" /> Trending Deals
          </h2>
          <Link
            href="/search?q=deals"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            See all
          </Link>
        </div>
        <Suspense fallback={<GridSkeleton />}>
          <TrendingGrid />
        </Suspense>
      </section>

      {/* Recently viewed (client, localStorage) */}
      <RecentlyViewed />

      {/* Feature cards */}
      <section className="stagger mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            icon: TrendingUp,
            title: "Price History",
            desc: "See how a product's price moved over time so you buy at the right moment.",
            href: "/search?q=deals",
            cta: "Browse deals",
          },
          {
            icon: Tag,
            title: "Coupon Collector",
            desc: "Browse active Daraz vouchers and copy codes with a single click.",
            href: "/coupons",
            cta: "View coupons",
          },
          {
            icon: Bell,
            title: "Price Alerts",
            desc: "Set a target price and get an email the moment it drops.",
            href: "/alerts",
            cta: "Set an alert",
          },
        ].map(({ icon: Icon, title, desc, href, cta }) => (
          <div
            key={title}
            className="glass-card flex flex-col rounded-3xl p-6 transition-shadow hover:shadow-lg"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50">
              <Icon className="h-5 w-5 text-brand-500" />
            </div>
            <h3 className="mb-1 font-bold text-[#1c1917]">{title}</h3>
            <p className="mb-4 flex-1 text-sm text-gray-500">{desc}</p>
            <Link
              href={href}
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:gap-1.5 hover:text-brand-700"
            >
              {cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}
