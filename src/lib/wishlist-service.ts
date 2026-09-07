import { prisma } from "@/lib/db";

/** The shape the client wishlist store holds. */
export interface WishlistLine {
  id: string;
  darazUrl: string;
  title: string;
  image: string;
  currentPrice: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  seller?: string;
  addedAt: number;
}

export const MAX_WISHLIST = 200;

/** Reads the account's wishlist, joined to the live product rows. */
export async function readWishlist(userId: string): Promise<WishlistLine[]> {
  const rows = await prisma.wishlistItem.findMany({
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
    seller: row.product.seller ?? undefined,
    addedAt: row.addedAt.getTime(),
  }));
}

/**
 * Makes the account's wishlist match `ids` exactly.
 *
 * The upsert's `update: {}` is deliberate: touching a product that is already
 * saved must not reset when it was added, or "restored on this device"
 * would bump it back to the top of a most-recently-saved list every time.
 */
export async function replaceWishlist(
  userId: string,
  ids: string[]
): Promise<WishlistLine[]> {
  const known = ids.length
    ? await prisma.product.findMany({
        where: { id: { in: ids } },
        select: { id: true },
      })
    : [];
  const knownIds = new Set(known.map((p) => p.id));
  const valid = ids.filter((id) => knownIds.has(id));

  await prisma.$transaction([
    prisma.wishlistItem.deleteMany({
      where: {
        userId,
        ...(valid.length ? { productId: { notIn: valid } } : {}),
      },
    }),
    ...valid.map((productId) =>
      prisma.wishlistItem.upsert({
        where: { userId_productId: { userId, productId } },
        update: {},
        create: { userId, productId },
      })
    ),
  ]);

  return readWishlist(userId);
}

/** Folds a device's local wishlist into the account's on sign-in. */
export async function mergeWishlist(
  userId: string,
  incomingIds: string[]
): Promise<WishlistLine[]> {
  const existing = await readWishlist(userId);
  const merged = new Set(existing.map((line) => line.id));
  incomingIds.forEach((id) => merged.add(id));

  return replaceWishlist(userId, [...merged].slice(0, MAX_WISHLIST));
}
