import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Search, Star, TrendingDown } from "lucide-react";
import { PriceHistoryChart } from "@/components/price-history-chart";
import { RecordView } from "@/components/record-view";
import { BackLink } from "@/components/back-link";
import { ProductActions } from "./product-actions";
import { SetAlertForm } from "./set-alert-form";
import { getProductWithHistory } from "@/lib/product-service";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const product = await getProductWithHistory(id).catch(() => null);
  if (!product) return { title: "Product not found | DarazSmart" };

  const priceText = formatPrice(product.currentPrice);
  return {
    title: `${product.title} at ${priceText} | DarazSmart`,
    description: `${product.title} on Daraz.pk for ${priceText}. Compare prices, track history, and set a price alert on DarazSmart.`,
  };
}

export default async function ProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const product = await getProductWithHistory(id).catch(() => null);

  if (!product) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="Product not found"
        >
          This product may have been removed from Daraz, or the link is wrong.
          <div className="mt-4">
            <Button asChild size="sm">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </EmptyState>
      </div>
    );
  }

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.currentPrice;

  const lowest = product.priceHistory?.length
    ? Math.min(...product.priceHistory.map((p) => p.price), product.currentPrice)
    : product.currentPrice;
  const atLowest = product.currentPrice <= lowest;

  return (
    <div className="animate-fade-in px-4 py-6 sm:px-6">
      <RecordView
        product={{
          id: product.id,
          darazUrl: product.darazUrl,
          title: product.title,
          image: product.image,
          currentPrice: product.currentPrice,
          originalPrice: product.originalPrice,
          discount: product.discount,
          rating: product.rating,
          seller: product.seller,
        }}
      />

      <BackLink fallback="/" label="Back to results" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Image */}
        <Card className="group relative aspect-square overflow-hidden md:sticky md:top-24 md:self-start">
          {product.image && (
            <Image
              src={product.image}
              alt={product.title}
              fill
              priority
              className="object-contain p-6 transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-105"
              unoptimized
            />
          )}
          {atLowest && product.priceHistory?.length > 1 && (
            <Badge
              variant="success"
              size="lg"
              className="absolute left-4 top-4 shadow-[var(--shadow-1)]"
            >
              <TrendingDown className="h-3 w-3" />
              Lowest price we have seen
            </Badge>
          )}
        </Card>

        {/* Details */}
        <Card className="flex flex-col gap-4 p-6">
          <h1 className="text-xl font-bold leading-snug text-ink">
            {product.title}
          </h1>

          {product.rating != null && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-warn-soft px-2.5 py-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-warn">
                  {product.rating.toFixed(1)}
                </span>
              </span>
              {product.reviewCount != null && (
                <span className="text-sm text-ink-subtle">
                  {product.reviewCount.toLocaleString()} reviews
                </span>
              )}
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-baseline gap-3">
              <p className="text-3xl font-extrabold tabular-nums text-brand-600">
                {formatPrice(product.currentPrice)}
              </p>
              {hasDiscount && (
                <p className="text-sm tabular-nums text-ink-subtle line-through">
                  {formatPrice(product.originalPrice ?? 0)}
                </p>
              )}
            </div>
            {hasDiscount && product.discount && (
              <Badge variant="danger" className="mt-2">
                Save {Math.round(product.discount)}%
              </Badge>
            )}
          </div>

          {product.seller && (
            <p className="text-sm text-ink-muted">
              Sold by{" "}
              <span className="font-medium text-ink">{product.seller}</span>
            </p>
          )}

          <ProductActions
            product={{
              id: product.id,
              darazUrl: product.darazUrl,
              title: product.title,
              image: product.image,
              currentPrice: product.currentPrice,
              originalPrice: product.originalPrice ?? undefined,
              discount: product.discount ?? undefined,
              rating: product.rating ?? undefined,
              reviewCount: product.reviewCount ?? undefined,
              seller: product.seller ?? undefined,
            }}
          />

          <SetAlertForm
            productId={product.id}
            currentPrice={product.currentPrice}
          />
        </Card>
      </div>

      {/* Price history */}
      {product.priceHistory?.length > 0 && (
        <Card className="mt-6 p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-ink">Price History</h2>
            <span className="text-xs text-ink-subtle">
              Lowest recorded: {formatPrice(lowest)}
            </span>
          </div>
          <PriceHistoryChart data={product.priceHistory} />
        </Card>
      )}
    </div>
  );
}
