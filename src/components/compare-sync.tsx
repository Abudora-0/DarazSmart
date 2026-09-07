"use client";

import { useCompareStore, type CompareProduct } from "@/store/compare";
import { useStoreHydrated } from "@/lib/use-store-hydrated";
import { useSyncedList } from "@/lib/use-synced-list";

function getLocalItems() {
  return useCompareStore.getState().items;
}

function getId(item: CompareProduct) {
  return item.id;
}

function toInput(items: CompareProduct[]) {
  return items.map((i) => i.id);
}

function signature(items: CompareProduct[]) {
  return [...items.map((i) => i.id)].sort().join("|");
}

/**
 * Keeps the signed-in compare tray in step with the account. See
 * useSyncedList. Silent on purpose: the tray is visible scratch space, so a
 * toast about it changing is more noise than help.
 */
export function CompareSync() {
  const hydrated = useStoreHydrated(useCompareStore);
  const items = useCompareStore((s) => s.items);
  const replaceAll = useCompareStore((s) => s.replaceAll);
  const clear = useCompareStore((s) => s.clear);

  useSyncedList<CompareProduct>({
    hydrated,
    items,
    getLocalItems,
    replaceAll,
    getId,
    clear,
    signature,
    toInput,
    apiPath: "/api/compare",
    syncPath: "/api/compare/sync",
  });

  return null;
}
