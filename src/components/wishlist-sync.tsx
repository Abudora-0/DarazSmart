"use client";

import { useWishlistStore, type WishlistProduct } from "@/store/wishlist";
import { useStoreHydrated } from "@/lib/use-store-hydrated";
import { useSyncedList } from "@/lib/use-synced-list";

function getLocalItems() {
  return useWishlistStore.getState().items;
}

function getId(item: WishlistProduct) {
  return item.id;
}

function toInput(items: WishlistProduct[]) {
  return items.map((i) => i.id);
}

function signature(items: WishlistProduct[]) {
  return [...items.map((i) => i.id)].sort().join("|");
}

function restoredMessage(gained: number, hadLocal: boolean) {
  return gained > 0 && hadLocal
    ? `Restored ${gained} saved product${gained === 1 ? "" : "s"} from your other devices`
    : null;
}

/** Keeps the signed-in wishlist in step with the account. See useSyncedList. */
export function WishlistSync() {
  const hydrated = useStoreHydrated(useWishlistStore);
  const items = useWishlistStore((s) => s.items);
  const replaceAll = useWishlistStore((s) => s.replaceAll);
  const clear = useWishlistStore((s) => s.clear);

  useSyncedList<WishlistProduct>({
    hydrated,
    items,
    getLocalItems,
    replaceAll,
    getId,
    clear,
    signature,
    toInput,
    apiPath: "/api/wishlist",
    syncPath: "/api/wishlist/sync",
    restoredMessage,
  });

  return null;
}
