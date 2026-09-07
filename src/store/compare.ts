"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CompareProduct {
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

export const MAX_COMPARE = 4;

interface CompareState {
  items: CompareProduct[];
  toggle: (product: CompareProduct) => "added" | "removed" | "full";
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        if (get().has(product.id)) {
          set((s) => ({ items: s.items.filter((i) => i.id !== product.id) }));
          return "removed";
        }
        // Four columns is as many as fits on a laptop without the table
        // turning into a horizontal scroll of unreadable slivers.
        if (get().items.length >= MAX_COMPARE) return "full";
        set((s) => ({ items: [...s.items, product] }));
        return "added";
      },
      remove: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      has: (id) => get().items.some((i) => i.id === id),
    }),
    { name: "darazsmart-compare", skipHydration: true }
  )
);
