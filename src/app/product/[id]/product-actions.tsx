"use client";

import { Check, ExternalLink, Heart, Layers, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useCompareStore, MAX_COMPARE } from "@/store/compare";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";

export interface ProductActionsProduct {
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

export function ProductActions({ product }: { product: ProductActionsProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const cartItem = useCartStore((s) => s.items.find((i) => i.id === product.id));

  const toggleWish = useWishlistStore((s) => s.toggle);
  const wished = useWishlistStore((s) => s.items.some((i) => i.id === product.id));

  const toggleCompare = useCompareStore((s) => s.toggle);
  const comparing = useCompareStore((s) =>
    s.items.some((i) => i.id === product.id)
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {cartItem ? (
          <div className="flex items-center gap-3 rounded-2xl bg-success-soft px-3 py-2">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-success">
              <Check className="h-4 w-4" />
              In your cart
            </span>
            <QuantityStepper
              value={cartItem.quantity}
              onChange={(q) => setQuantity(product.id, q)}
            />
          </div>
        ) : (
          <Button
            onClick={() => {
              addItem(product);
              toast("Added to your cart", { variant: "success" });
            }}
          >
            <ShoppingBag className="h-4 w-4" />
            Add to cart
          </Button>
        )}

        <Button variant="outline" asChild>
          <a
            href={product.darazUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
            View on Daraz
          </a>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            const saved = toggleWish(product);
            toast(saved ? "Saved to your wishlist" : "Removed from your wishlist", {
              variant: saved ? "success" : "default",
            });
          }}
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-colors",
            wished
              ? "bg-accent-soft text-brand-600"
              : "bg-sunken text-ink-muted hover:text-ink"
          )}
        >
          <Heart className={cn("h-3.5 w-3.5", wished && "fill-current")} />
          {wished ? "Saved" : "Save for later"}
        </button>

        <button
          onClick={() => {
            const result = toggleCompare(product);
            if (result === "full") {
              toast(`You can compare up to ${MAX_COMPARE} products at once`, {
                variant: "error",
              });
              return;
            }
            toast(
              result === "added" ? "Added to compare" : "Removed from compare"
            );
          }}
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-colors",
            comparing
              ? "bg-ink text-ink-inverse"
              : "bg-sunken text-ink-muted hover:text-ink"
          )}
        >
          <Layers className="h-3.5 w-3.5" />
          {comparing ? "Comparing" : "Compare"}
        </button>
      </div>
    </div>
  );
}
