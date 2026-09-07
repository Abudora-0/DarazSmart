"use client";

import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoreHydrated } from "@/lib/use-store-hydrated";
import { toast } from "@/lib/toast";

export function WishlistView() {
  const items = useWishlistStore((s) => s.items);
  const clear = useWishlistStore((s) => s.clear);
  const addItem = useCartStore((s) => s.addItem);
  const hydrated = useStoreHydrated(useWishlistStore);

  if (!hydrated) {
    return (
      <div className="grid grid-cols-2 gap-4 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <EmptyState icon={<Heart className="h-6 w-6" />} title="No saved products yet">
          Tap the heart on any product to keep it here for later. Your wishlist
          is separate from your cart.
          <div className="mt-4">
            <Button asChild size="sm">
              <Link href="/">Find something to save</Link>
            </Button>
          </div>
        </EmptyState>
      </div>
    );
  }

  function addAllToCart() {
    items.forEach((item) => addItem(item));
    toast(`Added ${items.length} saved product${items.length === 1 ? "" : "s"} to your cart`, {
      variant: "success",
    });
  }

  return (
    <div className="animate-fade-in px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft">
            <Heart className="h-5 w-5 text-brand-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">Your Wishlist</h1>
            <p className="text-sm text-ink-muted">
              {items.length} saved product{items.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="soft" size="sm" onClick={addAllToCart}>
            Add all to cart
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              clear();
              toast("Wishlist cleared");
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      </div>

      <div className="stagger grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item, i) => (
          <ProductCard key={item.id} index={Math.min(i, 12)} {...item} />
        ))}
      </div>
    </div>
  );
}
