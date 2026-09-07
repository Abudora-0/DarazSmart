import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryNav } from "@/components/category-nav";
import { SearchResults } from "@/components/search-results";
import { SearchSkeleton } from "@/components/search-skeleton";
import { searchAndUpsertPage } from "@/lib/search-service";
import { EmptyState } from "@/components/ui/card";
import { Search } from "lucide-react";

// Cold starts (fresh Neon connection + ~40 upserts) can exceed the default
// 10s serverless limit on the first request after a deploy or DB idle-suspend.
export const maxDuration = 30;

export async function generateMetadata(props: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await props.searchParams;
  const query = q?.trim();
  return {
    title: query
      ? `"${query}" search results | DarazSmart`
      : "Search | DarazSmart",
  };
}

async function Results({ query }: { query: string }) {
  const { products, hasMore } = await searchAndUpsertPage(query, 1).catch(
    () => ({ products: [], hasMore: false })
  );

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Search className="h-6 w-6" />}
        title={`No results for "${query}"`}
      >
        Try a different or more general term.
      </EmptyState>
    );
  }

  return (
    <SearchResults results={products} query={query} hasMore={hasMore} />
  );
}

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await props.searchParams;
  const query = q?.trim() ?? "";

  return (
    <div className="px-4 py-5 sm:px-6">
      <div className="mb-5">
        <CategoryNav activeQuery={query} />
      </div>

      {query ? (
        <>
          <h1 className="mb-5 text-lg font-bold text-ink">
            Results for{" "}
            <span className="text-brand-600">&ldquo;{query}&rdquo;</span>
          </h1>
          <Suspense key={query} fallback={<SearchSkeleton />}>
            <Results query={query} />
          </Suspense>
        </>
      ) : (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="Search Daraz for anything"
        >
          Type a product name in the bar above to get started.
        </EmptyState>
      )}
    </div>
  );
}
