"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistProduct {
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

interface WishlistState {
  items: WishlistProduct[];
  toggle: (product: Omit<WishlistProduct, "addedAt">) => boolean;
  remove: (id: string) => void;
  /** Adopts a wishlist wholesale, used when the server's copy wins. */
  replaceAll: (items: WishlistProduct[]) => void;
  clear: () => void;
  has: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      /** Returns true when the product ended up saved. */
      toggle: (product) => {
        if (get().has(product.id)) {
          set((s) => ({ items: s.items.filter((i) => i.id !== product.id) }));
          return false;
        }
        set((s) => ({
          items: [{ ...product, addedAt: Date.now() }, ...s.items],
        }));
        return true;
      },
      remove: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      replaceAll: (items) => set({ items }),
      clear: () => set({ items: [] }),
      has: (id) => get().items.some((i) => i.id === id),
    }),
    { name: "darazsmart-wishlist", skipHydration: true }
  )
);
