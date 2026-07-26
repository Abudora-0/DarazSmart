import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Star, ChevronLeft } from "lucide-react";
import { PriceHistoryChart } from "@/components/price-history-chart";
import { RecordView } from "@/components/record-view";
import { AddToCartButton } from "./add-to-cart-button";
import { SetAlertForm } from "./set-alert-form";
import { getProductWithHistory } from "@/lib/product-service";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const product = await getProductWithHistory(id).catch(() => null);
  if (!product) return { title: "Product not found — DarazSmart" };

  const priceText = formatPrice(product.currentPrice);
  return {
    title: `${product.title} — ${priceText} | DarazSmart`,
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
      <div className="flex flex-col items-center gap-3 px-4 py-24 text-center text-gray-400">
        <span className="text-5xl">🔍</span>
        <p className="font-medium text-gray-600">Product not found</p>
        <Link href="/" className="text-sm text-brand-600 hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.currentPrice;

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
      <Link
        href="/search"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-brand-600"
      >
        <ChevronLeft className="h-4 w-4" /> Back to results
      </Link>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Image */}
        <div className="glass-card relative aspect-square overflow-hidden rounded-3xl">
          {product.image && (
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-contain p-6"
              unoptimized
            />
          )}
        </div>

        {/* Details */}
        <div className="glass-card flex flex-col gap-4 rounded-3xl p-6">
          <h1 className="text-xl font-bold leading-snug text-[#1c1917]">
            {product.title}
          </h1>

          {product.rating != null && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-amber-700">
                  {product.rating.toFixed(1)}
                </span>
              </div>
              {product.reviewCount != null && (
                <span className="text-sm text-gray-400">
                  {product.reviewCount.toLocaleString()} reviews
                </span>
              )}
            </div>
          )}

          <div>
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-extrabold text-brand-600">
                {formatPrice(product.currentPrice)}
              </p>
              {hasDiscount && (
                <p className="text-sm text-gray-400 line-through">
                  {formatPrice(product.originalPrice ?? 0)}
                </p>
              )}
            </div>
            {hasDiscount && product.discount && (
              <span className="mt-1 inline-block rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600">
                Save {product.discount}%
              </span>
            )}
          </div>

          {product.seller && (
            <p className="text-sm text-gray-500">
              Sold by <span className="font-medium text-gray-700">{product.seller}</span>
            </p>
          )}

          <div className="flex gap-3">
            <AddToCartButton
              product={{
                id: product.id,
                darazUrl: product.darazUrl,
                title: product.title,
                image: product.image,
                currentPrice: product.currentPrice,
                originalPrice: product.originalPrice ?? undefined,
                discount: product.discount ?? undefined,
                rating: product.rating ?? undefined,
                seller: product.seller ?? undefined,
              }}
            />
            <a
              href={product.darazUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-2xl border border-brand-200 px-4 py-3 text-sm font-semibold text-brand-600 transition-colors hover:border-brand-500 hover:bg-brand-50"
            >
              <ExternalLink className="h-4 w-4" />
              View on Daraz
            </a>
          </div>

          <SetAlertForm
            productId={product.id}
            currentPrice={product.currentPrice}
          />
        </div>
      </div>

      {/* Price history */}
      {product.priceHistory?.length > 0 && (
        <div className="glass-card mt-6 rounded-3xl p-6">
          <h2 className="mb-4 text-base font-bold text-[#1c1917]">
            Price History
          </h2>
          <PriceHistoryChart data={product.priceHistory} />
        </div>
      )}
    </div>
  );
}
