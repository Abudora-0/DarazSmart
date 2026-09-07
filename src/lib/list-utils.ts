/**
 * Trims whatever a client posted down to a bounded list of clean product
 * ids: known shape, deduped, capped. Shared by the wishlist and compare
 * routes, which unlike the cart carry no per-item quantity to validate.
 */
export function parseIdList(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];

  const ids: string[] = [];
  const seen = new Set<string>();
  for (const raw of value) {
    if (typeof raw !== "string" || !raw || raw.length > 64 || seen.has(raw)) {
      continue;
    }
    seen.add(raw);
    ids.push(raw);
    if (ids.length >= max) break;
  }
  return ids;
}
