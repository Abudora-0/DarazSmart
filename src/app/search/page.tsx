import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryNav } from "@/components/category-nav";
import { SearchResults } from "@/components/search-results";
import { SearchSkeleton } from "@/components/search-skeleton";
import { searchAndUpsert } from "@/lib/search-service";
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
    title: query ? `"${query}" — Search Results | DarazSmart` : "Search — DarazSmart",
  };
}

async function Results({ query }: { query: string }) {
  const results = await searchAndUpsert(query, 1).catch(() => []);

  if (results.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center gap-2 rounded-3xl py-24 text-center text-gray-400">
        <Search className="h-9 w-9 opacity-30" />
        <p className="font-medium text-gray-600">No results for &ldquo;{query}&rdquo;</p>
        <p className="text-sm">Try a different or more general term.</p>
      </div>
    );
  }

  return <SearchResults results={results} query={query} />;
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
          <h1 className="mb-5 text-lg font-bold text-[#1c1917]">
            Results for{" "}
            <span className="text-brand-600">&ldquo;{query}&rdquo;</span>
          </h1>
          <Suspense key={query} fallback={<SearchSkeleton />}>
            <Results query={query} />
          </Suspense>
        </>
      ) : (
        <div className="glass-card flex flex-col items-center gap-2 rounded-3xl py-24 text-center text-gray-400">
          <Search className="h-9 w-9 opacity-30" />
          <p className="font-medium text-gray-600">Search Daraz for anything</p>
          <p className="text-sm">Type a product name above to get started.</p>
        </div>
      )}
    </div>
  );
}
