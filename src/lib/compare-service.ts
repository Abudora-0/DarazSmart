import { prisma } from "@/lib/db";

/** The shape the client compare store holds. */
export interface CompareLine {
  id: string;
  darazUrl: string;
  title: string;
  image: string;
  currentPrice: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  seller?: string;
}

/** Kept in step with the client-side limit in src/store/compare.ts. */
export const MAX_COMPARE = 4;

/** Reads the account's compare tray, joined to the live product rows. */
export async function readCompare(userId: string): Promise<CompareLine[]> {
  const rows = await prisma.compareItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { addedAt: "desc" },
  });

  return rows.map((row) => ({
    id: row.product.id,
    darazUrl: row.product.darazUrl,
    title: row.product.title,
    image: row.product.image,
    currentPrice: row.product.currentPrice,
    originalPrice: row.product.originalPrice ?? undefined,
    discount: row.product.discount ?? undefined,
    rating: row.product.rating ?? undefined,
    reviewCount: row.product.reviewCount ?? undefined,
    seller: row.product.seller ?? undefined,
  }));
}

/** Makes the account's compare tray match `ids` exactly, capped at four. */
export async function replaceCompare(
  userId: string,
  ids: string[]
): Promise<CompareLine[]> {
  const capped = ids.slice(0, MAX_COMPARE);
  const known = capped.length
    ? await prisma.product.findMany({
        where: { id: { in: capped } },
        select: { id: true },
      })
    : [];
  const knownIds = new Set(known.map((p) => p.id));
  const valid = capped.filter((id) => knownIds.has(id));

  await prisma.$transaction([
    prisma.compareItem.deleteMany({
      where: {
        userId,
        ...(valid.length ? { productId: { notIn: valid } } : {}),
      },
    }),
    ...valid.map((productId) =>
      prisma.compareItem.upsert({
        where: { userId_productId: { userId, productId } },
        update: {},
        create: { userId, productId },
      })
    ),
  ]);

  return readCompare(userId);
}

/**
 * Folds a device's local compare selection into the account's on sign-in.
 *
 * The incoming device is what the person is actively looking at, so its
 * picks win the four slots first; the account's existing picks fill
 * whatever is left, rather than the two lists competing on recency.
 */
export async function mergeCompare(
  userId: string,
  incomingIds: string[]
): Promise<CompareLine[]> {
  const existing = await readCompare(userId);
  const merged = [...new Set([...incomingIds, ...existing.map((l) => l.id)])];

  return replaceCompare(userId, merged.slice(0, MAX_COMPARE));
}
