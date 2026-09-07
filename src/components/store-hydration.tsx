"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useCompareStore } from "@/store/compare";

/**
 * All three persisted stores are created with `skipHydration`, so the first
 * client render matches the server's empty one. This reads localStorage back
 * once React has taken over, which turns what used to be a hydration
 * mismatch into an ordinary state update.
 */
export function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
    useCompareStore.persist.rehydrate();
  }, []);

  return null;
}
