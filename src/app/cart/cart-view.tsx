"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore, cartTotals } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useCountUp } from "@/lib/use-count-up";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoreHydrated } from "@/lib/use-store-hydrated";

export function CartView() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const hydrated = useStoreHydrated(useCartStore);

  const { count, total, totalOriginal, savings } = cartTotals(items);
  const animatedTotal = useCountUp(total);
  const animatedSavings = useCountUp(savings);

  function handleRemove(id: string) {
    removeItem(id);
    toast("Removed from your cart");
  }

  function moveToWishlist(item: (typeof items)[number]) {
    toggleWish(item);
    removeItem(item.id);
    toast("Moved to your wishlist", { variant: "success" });
  }

  // Reading localStorage happens after hydration, so show placeholders
  // rather than briefly claiming the cart is empty.
  if (!hydrated) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-3xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <EmptyState
          icon={<ShoppingBag className="h-6 w-6" />}
          title="Your cart is empty"
        >
          Save products while you browse and check them out on Daraz whenever
          you are ready.
          <div className="mt-4">
            <Button asChild size="sm">
              <Link href="/">Start searching</Link>
            </Button>
          </div>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="animate-fade-in px-4 py-6 sm:px-6">
      <h1 className="mb-5 text-xl font-bold text-ink">
        Your Cart{" "}
        <span className="text-ink-subtle tabular-nums">
          ({count} item{count === 1 ? "" : "s"})
        </span>
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
        <div className="stagger flex flex-col gap-3">
          {items.map((item, i) => (
            <Card
              key={item.id}
              interactive
              style={{ ["--i" as string]: i }}
              className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <Link
                  href={`/product/${item.id}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-sunken"
                >
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain p-1.5 transition-transform duration-300 hover:scale-110"
                      unoptimized
                    />
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Link
                    href={`/product/${item.id}`}
                    className="line-clamp-2 text-sm font-semibold text-ink hover:text-brand-600"
                  >
                    {item.title}
                  </Link>
                  {item.seller && (
                    <p className="text-xs text-ink-subtle">by {item.seller}</p>
                  )}
                  <p className="font-bold tabular-nums text-brand-600">
                    {formatPrice(item.currentPrice * item.quantity)}
                    {item.quantity > 1 && (
                      <span className="ml-1.5 text-xs font-normal text-ink-subtle">
                        {formatPrice(item.currentPrice)} each
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                <QuantityStepper
                  value={item.quantity}
                  onChange={(q) => setQuantity(item.id, q)}
                />

                <div className="flex items-center gap-1.5">
                  <Button variant="primary" size="sm" asChild>
                    <a
                      href={item.darazUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Buy
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveToWishlist(item)}
                    aria-label="Move to wishlist"
                    title="Move to wishlist"
                    className="px-2"
                  >
                    <Heart className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(item.id)}
                    aria-label="Remove from cart"
                    title="Remove from cart"
                    className="px-2 hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card className="h-fit p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 font-bold text-ink">Summary</h2>

          <div className="flex items-center justify-between pb-3">
            <span className="text-sm text-ink-muted">Items</span>
            <span className="text-sm font-medium tabular-nums text-ink">
              {count}
            </span>
          </div>

          {savings > 0 && (
            <div className="flex items-center justify-between border-b border-dashed border-line pb-3">
              <span className="text-sm text-ink-muted">Original price</span>
              <span className="text-sm tabular-nums text-ink-subtle line-through">
                {formatPrice(totalOriginal)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between py-4">
            <span className="font-medium text-ink">Estimated total</span>
            <span className="text-xl font-extrabold tabular-nums text-brand-600">
              {formatPrice(animatedTotal)}
            </span>
          </div>

          {savings > 0 && (
            <div className="mb-3 flex items-center justify-between rounded-xl bg-success-soft px-3 py-2">
              <span className="text-sm font-medium text-success">You save</span>
              <span className="text-sm font-bold tabular-nums text-success">
                {formatPrice(animatedSavings)}
              </span>
            </div>
          )}

          <p className="text-xs leading-relaxed text-ink-subtle">
            Prices are captured from Daraz and may change at checkout. Use
            &ldquo;Buy&rdquo; on each item to complete your purchase there.
          </p>
        </Card>
      </div>
    </div>
  );
}
