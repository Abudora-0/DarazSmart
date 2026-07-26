"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useCountUp } from "@/lib/use-count-up";

export function CartView() {
  const { items, removeItem } = useCartStore();

  function handleRemove(id: string) {
    removeItem(id);
    toast("Removed from cart");
  }
  const total = items.reduce((sum, i) => sum + i.currentPrice, 0);
  const totalOriginal = items.reduce(
    (sum, i) => sum + (i.originalPrice ?? i.currentPrice),
    0
  );
  const savings = Math.max(0, Math.round(totalOriginal - total));
  const animatedTotal = useCountUp(total);
  const animatedSavings = useCountUp(savings);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
          <ShoppingBag className="h-7 w-7 text-brand-400" />
        </div>
        <p className="text-lg font-semibold text-gray-700">Your cart is empty</p>
        <p className="max-w-xs text-sm text-gray-400">
          Save products while you browse and check them out on Daraz whenever
          you&apos;re ready.
        </p>
        <Link
          href="/"
          className="rounded-2xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-colors hover:bg-brand-600"
        >
          Start searching
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in px-4 py-6 sm:px-6">
      <h1 className="mb-5 text-xl font-bold text-[#1c1917]">
        Your Cart <span className="text-gray-400">({items.length})</span>
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="stagger flex flex-col gap-3">
          {items.map((item, i) => (
            <div
              key={item.id}
              style={{ ["--i" as string]: i }}
              className="glass-card flex items-center gap-4 rounded-3xl p-4 transition-shadow hover:shadow-md"
            >
              <Link
                href={`/product/${item.id}`}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-canvas"
              >
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-contain p-1.5"
                    unoptimized
                  />
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Link
                  href={`/product/${item.id}`}
                  className="line-clamp-2 text-sm font-semibold text-[#1c1917] hover:text-brand-600"
                >
                  {item.title}
                </Link>
                {item.seller && (
                  <p className="text-xs text-gray-400">by {item.seller}</p>
                )}
                <p className="font-bold text-brand-600">
                  {formatPrice(item.currentPrice)}
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                <a
                  href={item.darazUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-600"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Buy on Daraz
                </a>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-500 transition-colors hover:border-rose-300 hover:text-rose-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="glass-card h-fit rounded-3xl p-6 lg:sticky lg:top-6">
          <h2 className="mb-4 font-bold text-[#1c1917]">Summary</h2>
          <div className="flex items-center justify-between pb-3">
            <span className="text-sm text-gray-500">Items</span>
            <span className="text-sm font-medium text-gray-700">
              {items.length}
            </span>
          </div>
          {savings > 0 && (
            <div className="flex items-center justify-between border-b border-dashed pb-3">
              <span className="text-sm text-gray-500">Original price</span>
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(totalOriginal)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between py-4">
            <span className="font-medium text-gray-700">Estimated Total</span>
            <span className="text-xl font-extrabold text-brand-600 tabular-nums">
              {formatPrice(animatedTotal)}
            </span>
          </div>
          {savings > 0 && (
            <div className="mb-3 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2">
              <span className="text-sm font-medium text-emerald-700">
                You save
              </span>
              <span className="text-sm font-bold text-emerald-700 tabular-nums">
                {formatPrice(animatedSavings)}
              </span>
            </div>
          )}
          <p className="text-xs text-gray-400">
            Prices are captured from Daraz and may change at checkout. Use
            &ldquo;Buy on Daraz&rdquo; on each item to complete your purchase.
          </p>
        </div>
      </div>
    </div>
  );
}
