import { randomUserAgent } from "./ua";

export interface SearchResult {
  darazUrl: string;
  darazItemId: string;
  title: string;
  image: string;
  currentPrice: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  seller?: string;
}

interface DarazListItem {
  name?: string;
  itemId?: string;
  nid?: string;
  price?: string;
  originalPrice?: string;
  discount?: string;
  ratingScore?: string;
  review?: string;
  image?: string;
  itemUrl?: string;
  location?: string;
  sellerName?: string;
  brandName?: string;
}

function toInt(v?: string): number {
  return parseInt((v ?? "").replace(/[^\d]/g, "")) || 0;
}

/** Fetch + parse one query against Daraz's JSON catalog API. */
async function fetchDaraz(query: string, page: number): Promise<SearchResult[]> {
  const url = `https://www.daraz.pk/catalog/?ajax=true&q=${encodeURIComponent(
    query
  )}&page=${page}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": randomUserAgent(),
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "X-Requested-With": "XMLHttpRequest",
        Referer: `https://www.daraz.pk/catalog/?q=${encodeURIComponent(query)}`,
      },
    });
    if (!res.ok) return [];

    const json = await res.json();
    const items: DarazListItem[] = json?.mods?.listItems ?? [];

    return items
      .map((it): SearchResult | null => {
        const currentPrice = toInt(it.price);
        const title = it.name?.trim() ?? "";
        const itemUrl = it.itemUrl ?? "";
        if (!currentPrice || !title || !itemUrl) return null;

        const darazUrl = itemUrl.startsWith("http") ? itemUrl : `https:${itemUrl}`;
        const darazItemId =
          it.itemId ?? itemUrl.match(/-i(\d+)\.html/)?.[1] ?? darazUrl;
        const originalPrice = toInt(it.originalPrice);
        const rating = it.ratingScore ? parseFloat(it.ratingScore) : undefined;
        const image = it.image?.startsWith("//")
          ? `https:${it.image}`
          : it.image ?? "";

        return {
          darazUrl,
          darazItemId,
          title,
          image,
          currentPrice,
          originalPrice: originalPrice > currentPrice ? originalPrice : undefined,
          discount: toInt(it.discount) || undefined,
          rating: rating && rating > 0 ? rating : undefined,
          reviewCount: toInt(it.review) || undefined,
          seller: it.brandName?.trim() || it.sellerName?.trim() || undefined,
        };
      })
      .filter((r): r is SearchResult => r !== null);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

// The category pills (see components/category-nav.tsx) search these exact
// broad terms for browsing — titles legitimately won't contain the literal
// category name, so relevance filtering must not apply to them.
const BROWSE_CATEGORIES = new Set([
  "deals",
  "electronics",
  "mobiles",
  "fashion",
  "home",
  "beauty",
  "appliances",
  "sports",
  "toys",
  "groceries",
]);

/**
 * Score + reorder results by how many of the query's words actually appear
 * in the title, and drop the ones that share none. Daraz backfills a search
 * with loosely-related or unrelated "you might also like" items once real
 * matches run thin — this shows up as early as page 1 (e.g. "iphone" starts
 * drifting into accessories/parts by item ~6) and gets worse on page 2+.
 */
function filterByRelevance(
  results: SearchResult[],
  queryTerms: string[]
): SearchResult[] {
  if (
    queryTerms.length === 1 &&
    BROWSE_CATEGORIES.has(queryTerms[0].toLowerCase())
  ) {
    return results;
  }

  const tokens = queryTerms.map((t) => t.toLowerCase());
  const scored = results.map((r) => {
    const titleLower = r.title.toLowerCase();
    const score = tokens.reduce((n, t) => (titleLower.includes(t) ? n + 1 : n), 0);
    return { r, score };
  });

  const minScore = Math.ceil(tokens.length / 2);
  let relevant = scored.filter((s) => s.score >= minScore);

  // Don't over-filter thin result sets — better to show loosely-related
  // items than an almost-empty page.
  if (relevant.length < Math.min(5, results.length)) {
    relevant = scored.filter((s) => s.score >= 1);
  }

  // Stable sort by score (ties keep Daraz's original relative order).
  return relevant
    .map((s, i) => ({ ...s, i }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map((s) => s.r);
}

/** A full Daraz catalog page. Fewer than this means there is no page after. */
const DARAZ_PAGE_SIZE = 40;

export interface SearchPage {
  results: SearchResult[];
  /** Whether Daraz itself returned a full page, before relevance filtering. */
  hasMore: boolean;
}

/**
 * Search Daraz. Daraz requires ALL query words to match a product (strict AND),
 * so an extra qualifier (e.g. "... Vp") can return zero results even when the
 * core query has plenty. If the full query comes back empty, we progressively
 * drop trailing words until we get hits — so users always see relevant products.
 */
export async function searchProductsPage(
  query: string,
  page = 1
): Promise<SearchPage> {
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return { results: [], hasMore: false };

  // Full query first, then drop one trailing word at a time (cap the attempts).
  // Keep a floor of 2 words for multi-word queries so pure nonsense
  // ("asdfghjkl zxcvb") doesn't fall back to a single word's generic
  // recommendations — Daraz returns 0 for unknown 2-word combos.
  const minTerms = terms.length >= 2 ? Math.max(2, terms.length - 3) : 1;
  for (let n = terms.length; n >= minTerms; n--) {
    const usedTerms = terms.slice(0, n);
    const raw = await fetchDaraz(usedTerms.join(" "), page);
    if (raw.length > 0) {
      // "Is there another page" has to be judged on what Daraz sent, not on
      // what survives relevance filtering, or a heavily filtered page looks
      // like the last one when it is not.
      return {
        results: filterByRelevance(raw, usedTerms),
        hasMore: raw.length >= DARAZ_PAGE_SIZE,
      };
    }
  }
  return { results: [], hasMore: false };
}

export async function searchProducts(
  query: string,
  page = 1
): Promise<SearchResult[]> {
  return (await searchProductsPage(query, page)).results;
}
