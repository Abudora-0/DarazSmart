import { searchProductsPage } from "@/lib/scraper/search";
import { getCached, setCached } from "@/lib/cache";
import { prisma } from "@/lib/db";
import type { Product } from "@/generated/prisma/client";

export interface SearchPageResult {
  products: Product[];
  hasMore: boolean;
}

// Run async operations in parallel, but in bounded chunks so we don't
// exhaust the connection pool with 40 simultaneous queries.
async function chunkedMap<T, R>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
  }
  return out;
}

/**
 * Search Daraz and upsert results into the DB, with Redis caching.
 * Called directly (in-process) by both the /api/search route and the
 * server-rendered pages — no self-fetch over HTTP, which is unreliable
 * on serverless platforms (cold-start stacking, deployment protection).
 */
export async function searchAndUpsertPage(
  q: string,
  page: number
): Promise<SearchPageResult> {
  // v2 keys: the cached shape gained a hasMore flag, so old entries would
  // deserialise into an array rather than an object.
  const cacheKey = `search:v2:${q.toLowerCase()}:${page}`;
  const cached = await getCached<SearchPageResult>(cacheKey);
  if (cached) return cached;

  const { results: scraped, hasMore } = await searchProductsPage(q, page);

  // Don't cache empty results — a transient failure shouldn't leave a
  // query "stuck" returning nothing for the whole cache window.
  if (scraped.length === 0) return { products: [], hasMore: false };

  const products = await chunkedMap(scraped, 10, (r) =>
    prisma.product.upsert({
      where: { darazUrl: r.darazUrl },
      update: {
        currentPrice: r.currentPrice,
        originalPrice: r.originalPrice,
        discount: r.discount,
        rating: r.rating,
        reviewCount: r.reviewCount,
        image: r.image,
        title: r.title,
        seller: r.seller,
      },
      create: {
        darazUrl: r.darazUrl,
        title: r.title,
        image: r.image,
        currentPrice: r.currentPrice,
        originalPrice: r.originalPrice,
        discount: r.discount,
        rating: r.rating,
        reviewCount: r.reviewCount,
        seller: r.seller,
      },
    })
  );

  const result: SearchPageResult = { products, hasMore };
  await setCached(cacheKey, result);
  return result;
}

export async function searchAndUpsert(
  q: string,
  page: number
): Promise<Product[]> {
  return (await searchAndUpsertPage(q, page)).products;
}
