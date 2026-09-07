import { Suspense } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { CategoryNav } from "@/components/category-nav";
import { ProductCard, type SearchProductLike } from "@/components/product-card";
import { RecentlyViewed } from "@/components/recently-viewed";
import { Reveal } from "@/components/ui/reveal";
import { Card } from "@/components/ui/card";
import { searchAndUpsert } from "@/lib/search-service";
import {
  TrendingUp,
  Tag,
  Bell,
  ArrowRight,
  Flame,
  Layers,
  Sparkles,
} from "lucide-react";

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

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Price History",
    desc: "See how a product's price moved over time so you buy at the right moment.",
    href: "/search?q=deals",
    cta: "Browse deals",
  },
  {
    icon: Layers,
    title: "Side by Side",
    desc: "Pin up to four products and compare price, discount, rating and seller at a glance.",
    href: "/compare",
    cta: "Open compare",
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

      {/* Hero. No overflow-hidden, so the search dropdown is not clipped. */}
      <section className="relative z-10 overflow-visible rounded-[26px] bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 px-6 py-14 text-center sm:px-10 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[26px] opacity-50"
          style={{
            background:
              "radial-gradient(620px 320px at 18% 0%, rgba(255,255,255,0.3), transparent 62%), radial-gradient(500px 260px at 88% 100%, rgba(255,255,255,0.16), transparent 60%)",
          }}
        />

        <div className="animate-fade-up relative mx-auto flex max-w-2xl flex-col items-center gap-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/25 backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            Powered by live Daraz.pk data
          </span>

          <h1 className="font-brand text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Shop Daraz <span className="text-amber-300">Smarter</span>
          </h1>

          <p className="max-w-lg text-sm text-white/85 sm:text-base">
            Compare prices, track drops, and collect coupons in one place. Save
            products to your cart and check out directly on Daraz.
          </p>

          <div className="mt-1 flex w-full justify-center">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
            <Flame className="h-5 w-5 text-brand-500" /> Trending Deals
          </h2>
          <Link
            href="/search?q=deals"
            className="group flex items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
          >
            See all
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
        <Suspense fallback={<GridSkeleton />}>
          <TrendingGrid />
        </Suspense>
      </section>

      {/* Recently viewed (client, localStorage) */}
      <RecentlyViewed />

      {/* Feature cards */}
      <Reveal as="section" className="mt-10">
        <h2 className="mb-4 text-lg font-bold text-ink">
          Everything you need to buy at the right price
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc, href, cta }) => (
            <Card key={title} interactive className="flex flex-col p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft">
                <Icon className="h-5 w-5 text-brand-500" />
              </div>
              <h3 className="mb-1 font-bold text-ink">{title}</h3>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-ink-muted">
                {desc}
              </p>
              <Link
                href={href}
                className="group inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
              >
                {cta}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Card>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
