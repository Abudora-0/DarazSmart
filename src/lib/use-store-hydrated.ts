"use client";

import { useCallback, useSyncExternalStore } from "react";

interface PersistedStore {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => () => void;
  };
}

/**
 * True once a `skipHydration` store has read localStorage back.
 *
 * Without this the server renders an empty store and the page shows its empty
 * state for a frame before the real contents arrive, so an existing cart
 * flashes "Your cart is empty" on every load.
 */
export function useStoreHydrated(store: PersistedStore): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => store.persist.onFinishHydration(onChange),
    [store]
  );
  const getSnapshot = useCallback(
    () => store.persist.hasHydrated(),
    [store]
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
