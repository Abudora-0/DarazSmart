import { prisma } from "@/lib/db";

/** The shape the client cart store holds, and what every cart route returns. */
export interface CartLine {
  id: string;
  darazUrl: string;
  title: string;
  image: string;
  currentPrice: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  seller?: string;
  quantity: number;
}

/** What the client sends up: just the identity and how many. */
export interface CartInput {
  id: string;
  quantity: number;
}

export const MAX_QUANTITY = 99;
const MAX_LINES = 100;

/**
 * Trims whatever the client posted down to something safe to write: known
 * shape, clamped quantities, one entry per product, and a bounded length.
 */
export function parseCartInput(value: unknown): CartInput[] {
  if (!Array.isArray(value)) return [];

  const byId = new Map<string, number>();
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const { id, quantity } = raw as { id?: unknown; quantity?: unknown };
    if (typeof id !== "string" || !id || id.length > 64) continue;

    const n = Math.floor(Number(quantity));
    const clamped = Number.isFinite(n) ? Math.min(MAX_QUANTITY, Math.max(1, n)) : 1;
    byId.set(id, Math.max(byId.get(id) ?? 0, clamped));
    if (byId.size >= MAX_LINES) break;
  }

  return [...byId.entries()].map(([id, quantity]) => ({ id, quantity }));
}

/**
 * Reads the account's cart back, joined to the live product rows, so a device
 * that has not seen a product in weeks still gets today's price and title.
 */
export async function readCart(userId: string): Promise<CartLine[]> {
  const rows = await prisma.cartItem.findMany({
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
    quantity: row.quantity,
  }));
}

/**
 * Makes the account's cart match `items` exactly.
 *
 * Product rows are checked first: a cart saved months ago can reference a
 * product that has since been deleted, and the foreign key would reject the
 * whole write rather than that one line.
 */
export async function replaceCart(
  userId: string,
  items: CartInput[]
): Promise<CartLine[]> {
  const known = items.length
    ? await prisma.product.findMany({
        where: { id: { in: items.map((i) => i.id) } },
        select: { id: true },
      })
    : [];
  const knownIds = new Set(known.map((p) => p.id));
  const valid = items.filter((i) => knownIds.has(i.id));

  await prisma.$transaction([
    prisma.cartItem.deleteMany({
      where: {
        userId,
        ...(valid.length ? { productId: { notIn: valid.map((i) => i.id) } } : {}),
      },
    }),
    ...valid.map((item) =>
      prisma.cartItem.upsert({
        where: { userId_productId: { userId, productId: item.id } },
        update: { quantity: item.quantity },
        create: { userId, productId: item.id, quantity: item.quantity },
      })
    ),
  ]);

  return readCart(userId);
}

/**
 * Folds a device's local cart into the account's cart on sign-in.
 *
 * Quantities take the larger of the two rather than the sum: signing in on
 * the same device twice should not keep doubling the count.
 */
export async function mergeCart(
  userId: string,
  incoming: CartInput[]
): Promise<CartLine[]> {
  const existing = await readCart(userId);

  const merged = new Map<string, number>();
  for (const line of existing) merged.set(line.id, line.quantity);
  for (const line of incoming) {
    merged.set(line.id, Math.max(merged.get(line.id) ?? 0, line.quantity));
  }

  return replaceCart(
    userId,
    [...merged.entries()].map(([id, quantity]) => ({ id, quantity }))
  );
}
