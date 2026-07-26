"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

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
  const { addItem, removeItem, hasItem } = useCartStore();
  const inCart = hasItem(props.id);
  const [popping, setPopping] = useState(false);

  const rating = props.rating ?? undefined;
  const reviewCount = props.reviewCount ?? undefined;
  const originalPrice = props.originalPrice ?? undefined;
  const discount = props.discount ?? undefined;
  const topItem = (discount ?? 0) >= 25 || (rating ?? 0) >= 4.6;
  const hasDiscount = originalPrice !== undefined && originalPrice > props.currentPrice;

  function toggleCart() {
    if (inCart) {
      removeItem(props.id);
      toast("Removed from cart");
    } else {
      addItem({
        id: props.id,
        darazUrl: props.darazUrl,
        title: props.title,
        image: props.image,
        currentPrice: props.currentPrice,
        originalPrice,
        discount,
        rating,
        seller: props.seller ?? undefined,
      });
      toast(`Added "${props.title.slice(0, 40)}" to cart`, { variant: "success" });
      setPopping(true);
    }
  }

  return (
    <div
      style={{ ["--i" as string]: props.index ?? 0 }}
      className="glass-card group relative flex flex-col rounded-3xl p-3 shadow-[0_2px_10px_-4px_rgba(120,45,10,0.15)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-18px_rgba(120,45,10,0.35)]"
    >
      {/* Image */}
      <div className="relative">
        <Link
          href={`/product/${props.id}`}
          className="relative block aspect-square overflow-hidden rounded-2xl bg-canvas"
        >
          {props.image ? (
            <Image
              src={props.image}
              alt={props.title}
              fill
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-gray-200">
              📦
            </div>
          )}
        </Link>

        {topItem && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-amber-950 shadow-sm">
            Top item
          </span>
        )}

        <button
          onClick={toggleCart}
          onAnimationEnd={() => setPopping(false)}
          aria-label={inCart ? "Remove from cart" : "Save to cart"}
          className={cn(
            "absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-all hover:scale-110",
            popping && "animate-pop",
            inCart
              ? "bg-brand-500 text-white"
              : "bg-white/90 text-gray-500 hover:text-brand-500"
          )}
        >
          <Heart className={cn("h-[18px] w-[18px]", inCart && "fill-current")} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 px-1 pt-3">
        <Link href={`/product/${props.id}`}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[#1c1917] transition-colors hover:text-brand-600">
            {props.title}
          </h3>
        </Link>

        {rating !== undefined && (
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-gray-600">
              {rating.toFixed(1)}
            </span>
            {reviewCount !== undefined && (
              <span className="text-xs text-gray-400">
                ({reviewCount.toLocaleString()})
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="min-w-0">
            {hasDiscount && (
              <p className="text-xs text-gray-400 line-through">
                {formatPrice(originalPrice!)}
              </p>
            )}
            <Link
              href={`/product/${props.id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-sm font-bold text-brand-600 transition-colors hover:border-brand-500 hover:bg-brand-50"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {formatPrice(props.currentPrice)}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
