"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Layers, Star, ShoppingBag, Check } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useCompareStore, MAX_COMPARE } from "@/store/compare";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";

export interface SearchProductLike {
  id: string;
  darazUrl: string;
  title: string;
  image: string;
  currentPrice: number;
  originalPrice?: number | null;
  discount?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  seller?: string | null;
  index?: number;
}

export function ProductCard(props: SearchProductLike) {
  const addItem = useCartStore((s) => s.addItem);
  const inCart = useCartStore((s) => s.items.some((i) => i.id === props.id));
  const toggleWish = useWishlistStore((s) => s.toggle);
  const wished = useWishlistStore((s) => s.items.some((i) => i.id === props.id));
  const toggleCompare = useCompareStore((s) => s.toggle);
  const comparing = useCompareStore((s) =>
    s.items.some((i) => i.id === props.id)
  );
  const [popping, setPopping] = useState(false);

  const rating = props.rating ?? undefined;
  const reviewCount = props.reviewCount ?? undefined;
  const originalPrice = props.originalPrice ?? undefined;
  const discount = props.discount ?? undefined;
  const topItem = (discount ?? 0) >= 25 || (rating ?? 0) >= 4.6;
  const hasDiscount =
    originalPrice !== undefined && originalPrice > props.currentPrice;

  const base = {
    id: props.id,
    darazUrl: props.darazUrl,
    title: props.title,
    image: props.image,
    currentPrice: props.currentPrice,
    originalPrice,
    discount,
    rating,
    seller: props.seller ?? undefined,
  };

  function handleCart() {
    addItem(base);
    setPopping(true);
    toast(
      inCart
        ? "Added another to your cart"
        : `Added "${props.title.slice(0, 40)}" to your cart`,
      { variant: "success" }
    );
  }

  function handleWish() {
    const saved = toggleWish(base);
    toast(saved ? "Saved to your wishlist" : "Removed from your wishlist", {
      variant: saved ? "success" : "default",
    });
  }

  function handleCompare() {
    const result = toggleCompare({ ...base, reviewCount });
    if (result === "full") {
      toast(`You can compare up to ${MAX_COMPARE} products at once`, {
        variant: "error",
      });
      return;
    }
    toast(result === "added" ? "Added to compare" : "Removed from compare");
  }

  return (
    <article
      style={{ ["--i" as string]: props.index ?? 0 }}
      className="glass-card sheen group relative flex flex-col rounded-3xl p-3 shadow-[var(--shadow-1)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-3)]"
    >
      {/* Image */}
      <div className="relative">
        <Link
          href={`/product/${props.id}`}
          className="relative block aspect-square overflow-hidden rounded-2xl bg-sunken"
        >
          {props.image ? (
            <Image
              src={props.image}
              alt={props.title}
              fill
              className="object-contain p-4 transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-ink-subtle opacity-30" />
            </div>
          )}
        </Link>

        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {topItem && (
            <Badge variant="warn" className="bg-amber-400 text-amber-950">
              Top item
            </Badge>
          )}
          {hasDiscount && discount !== undefined && (
            <Badge variant="danger">-{Math.round(discount)}%</Badge>
          )}
        </div>

        {/* Actions slide in on hover, and stay put on touch devices */}
        <div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5">
          <button
            onClick={handleWish}
            aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
            title={wished ? "Remove from wishlist" : "Save to wishlist"}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full shadow-[var(--shadow-1)] backdrop-blur-md transition-[background-color,color,transform] duration-200 hover:scale-110 active:scale-95",
              wished
                ? "bg-brand-500 text-white"
                : "bg-surface/90 text-ink-subtle hover:text-brand-500"
            )}
          >
            <Heart className={cn("h-[18px] w-[18px]", wished && "fill-current")} />
          </button>

          <button
            onClick={handleCompare}
            aria-label={comparing ? "Remove from compare" : "Add to compare"}
            title={comparing ? "Remove from compare" : "Add to compare"}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full shadow-[var(--shadow-1)] backdrop-blur-md transition-[background-color,color,transform,opacity] duration-200 hover:scale-110 active:scale-95 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100",
              comparing
                ? "bg-ink text-ink-inverse sm:opacity-100"
                : "bg-surface/90 text-ink-subtle hover:text-brand-500"
            )}
          >
            <Layers className="h-[17px] w-[17px]" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 px-1 pt-3">
        <Link href={`/product/${props.id}`}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-brand-600">
            {props.title}
          </h3>
        </Link>

        {rating !== undefined && (
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-ink-muted">
              {rating.toFixed(1)}
            </span>
            {reviewCount !== undefined && (
              <span className="text-xs text-ink-subtle">
                ({reviewCount.toLocaleString()})
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="min-w-0">
            {hasDiscount && (
              <p className="text-xs text-ink-subtle line-through">
                {formatPrice(originalPrice!)}
              </p>
            )}
            <p className="text-base font-extrabold tabular-nums text-brand-600">
              {formatPrice(props.currentPrice)}
            </p>
          </div>

          <button
            onClick={handleCart}
            onAnimationEnd={() => setPopping(false)}
            aria-label={inCart ? "Add another to cart" : "Add to cart"}
            title={inCart ? "Add another to cart" : "Add to cart"}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-[background-color,color,transform] duration-200 hover:scale-105 active:scale-90",
              popping && "animate-pop",
              inCart
                ? "bg-success-soft text-success"
                : "bg-brand-500 text-white shadow-[var(--shadow-brand)] hover:bg-brand-600"
            )}
          >
            {inCart ? (
              <Check className="h-[18px] w-[18px]" />
            ) : (
              <ShoppingBag className="h-[17px] w-[17px]" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
