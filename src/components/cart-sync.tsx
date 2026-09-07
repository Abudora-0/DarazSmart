"use client";

import { useCartStore, type CartProduct } from "@/store/cart";
import { useStoreHydrated } from "@/lib/use-store-hydrated";
import { useSyncedList } from "@/lib/use-synced-list";

// Top-level, so these are stable across renders: useSyncedList relies on
// that to avoid re-running its effects on every keystroke.
function getLocalItems() {
  return useCartStore.getState().items;
}

function getId(item: CartProduct) {
  return item.id;
}

function toInput(items: CartProduct[]) {
  return items.map((i) => ({ id: i.id, quantity: i.quantity }));
}

function signature(items: CartProduct[]) {
  return toInput(items)
    .map((i) => `${i.id}:${i.quantity}`)
    .sort()
    .join("|");
}

function restoredMessage(gained: number, hadLocal: boolean) {
  return gained > 0 && hadLocal
    ? `Restored ${gained} item${gained === 1 ? "" : "s"} from your other devices`
    : null;
}

/** Keeps the signed-in cart in step with the account. See useSyncedList. */
export function CartSync() {
  const hydrated = useStoreHydrated(useCartStore);
  const items = useCartStore((s) => s.items);
  const replaceAll = useCartStore((s) => s.replaceAll);
  const clearCart = useCartStore((s) => s.clearCart);

  useSyncedList<CartProduct>({
    hydrated,
    items,
    getLocalItems,
    replaceAll,
    getId,
    clear: clearCart,
    signature,
    toInput,
    apiPath: "/api/cart",
    syncPath: "/api/cart/sync",
    restoredMessage,
  });

  return null;
}
