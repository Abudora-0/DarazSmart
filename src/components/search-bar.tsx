"use client";

import {
  useState,
  useRef,
  useEffect,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Clock, TrendingUp } from "lucide-react";
import {
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
} from "@/lib/recent";
import { cn } from "@/lib/utils";

const POPULAR = ["iPhone", "Smart Watch", "Sneakers", "Headphones", "Perfume", "Laptop"];

const HERO_PLACEHOLDERS = [
  "Search for anything on Daraz…",
  "Try “iPhone 17 Pro Max”…",
  "Try “Smart Watch”…",
  "Try “Wireless Headphones”…",
  "Try “Nike Sneakers”…",
  "Try “Men's Perfume”…",
];

interface SearchBarProps {
  defaultValue?: string;
  variant?: "hero" | "compact";
}

export function SearchBar({ defaultValue = "", variant = "hero" }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const isCompact = variant === "compact";

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Rotate the hero placeholder through a few example searches while idle.
  useEffect(() => {
    if (isCompact || query || open) return;
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % HERO_PLACEHOLDERS.length);
    }, 2800);
    return () => clearInterval(id);
  }, [isCompact, query, open]);

  function runSearch(q: string) {
    const term = q.trim();
    if (!term) return;
    addRecentSearch(term);
    setOpen(false);
    startTransition(() => router.push(`/search?q=${encodeURIComponent(term)}`));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    runSearch(query);
  }

  function openDropdown() {
    setRecent(getRecentSearches());
    setOpen(true);
  }

  return (
    <div ref={ref} className={cn("relative", isCompact ? "w-full max-w-md" : "w-full max-w-2xl")}>
      <form onSubmit={handleSubmit} className={cn("flex w-full", !isCompact && "gap-2")}>
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {pending ? (
              <Loader2 className={cn("animate-spin", isCompact ? "h-4 w-4" : "h-5 w-5")} />
            ) : (
              <Search className={isCompact ? "h-4 w-4" : "h-5 w-5"} />
            )}
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={openDropdown}
            placeholder={
              isCompact ? "Search products…" : HERO_PLACEHOLDERS[placeholderIdx]
            }
            className={cn(
              "w-full text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none",
              isCompact
                ? "rounded-full border border-transparent bg-gray-100 py-2.5 pl-11 pr-4 transition-colors focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100"
                : "rounded-2xl border border-white/60 bg-white/85 py-4 pl-12 pr-4 shadow-sm backdrop-blur-md focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
            )}
          />
        </div>
        {!isCompact && (
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 rounded-2xl bg-brand-500 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-600 active:scale-95 disabled:opacity-70"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Searching…
              </>
            ) : (
              <>
                <Search className="h-4 w-4" /> Search
              </>
            )}
          </button>
        )}
      </form>

      {/* Suggestions dropdown */}
      {open && (
        <div className="glass-float animate-fade-up absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl p-2 text-left shadow-[0_20px_50px_-15px_rgba(120,45,10,0.35)]">
          {recent.length > 0 && (
            <div className="mb-1">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Recent
                </span>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    clearRecentSearches();
                    setRecent([]);
                  }}
                  className="text-xs text-gray-400 hover:text-rose-500"
                >
                  Clear
                </button>
              </div>
              {recent.map((term) => (
                <button
                  key={term}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => runSearch(term)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-600"
                >
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  {term}
                </button>
              ))}
            </div>
          )}

          <div>
            <span className="block px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Popular
            </span>
            <div className="flex flex-wrap gap-1.5 p-2">
              {POPULAR.map((term) => (
                <button
                  key={term}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => runSearch(term)}
                  className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-brand-100 hover:text-brand-600"
                >
                  <TrendingUp className="h-3 w-3" />
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
