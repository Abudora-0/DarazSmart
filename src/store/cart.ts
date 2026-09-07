"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartProduct {
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

export const MAX_QUANTITY = 99;

interface CartState {
  items: CartProduct[];
  addItem: (product: Omit<CartProduct, "quantity">) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  /** Adopts a cart wholesale, used when the server's copy wins. */
  replaceAll: (items: CartProduct[]) => void;
  clearCart: () => void;
  hasItem: (id: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        // Adding something already in the cart bumps its quantity rather
        // than silently doing nothing.
        if (get().hasItem(product.id)) {
          get().setQuantity(
            product.id,
            (get().items.find((i) => i.id === product.id)?.quantity ?? 1) + 1
          );
          return;
        }
        set((s) => ({ items: [...s.items, { ...product, quantity: 1 }] }));
      },
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQuantity: (id, quantity) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.min(MAX_QUANTITY, Math.max(1, quantity)) }
              : i
          ),
        })),
      replaceAll: (items) =>
        set({
          items: items.map((i) => ({
            ...i,
            quantity: Math.min(MAX_QUANTITY, Math.max(1, i.quantity ?? 1)),
          })),
        }),
      clearCart: () => set({ items: [] }),
      hasItem: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: "darazsmart-cart",
      version: 1,
      // Carts saved before quantities existed have no quantity field, which
      // would make every total NaN.
      migrate: (state) => {
        const s = state as { items?: Partial<CartProduct>[] } | undefined;
        return {
          items: (s?.items ?? []).map((i) => ({ ...i, quantity: i.quantity ?? 1 })),
        } as CartState;
      },
      // The server renders an empty cart and localStorage would otherwise be
      // read before React hydrates, which React reports as a mismatch. The
      // StoreHydration component rehydrates once the client has taken over.
      skipHydration: true,
    }
  )
);

export function cartTotals(items: CartProduct[]) {
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.currentPrice * i.quantity, 0);
  const totalOriginal = items.reduce(
    (sum, i) => sum + (i.originalPrice ?? i.currentPrice) * i.quantity,
    0
  );
  return {
    count,
    total: Math.round(total),
    totalOriginal: Math.round(totalOriginal),
    savings: Math.max(0, Math.round(totalOriginal - total)),
  };
}
