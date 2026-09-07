"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Tag } from "lucide-react";
import { toast } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";
import { Card, EmptyState } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount: string;
  category?: string;
  expiresAt?: string;
}

export function CouponsView() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/coupons")
      .then((r) => r.json())
      .then((d) => setCoupons(d.coupons ?? []))
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  }, []);

  async function copyCode(code: string) {
    // The Clipboard API throws on an insecure origin and when the permission
    // is denied, so a bare await here used to reject unhandled.
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      toast(`Copied "${code}" to your clipboard`, { variant: "success" });
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast(`Could not copy automatically. The code is ${code}`, {
        variant: "error",
      });
    }
  }

  return (
    <div className="animate-fade-in px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft">
          <Tag className="h-5 w-5 text-brand-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">Coupon Collector</h1>
          <p className="text-sm text-ink-muted">
            Active Daraz voucher codes. Click any code to copy it.
          </p>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-3xl" />
          ))}
        </div>
      )}

      {!loading && coupons.length === 0 && (
        <EmptyState
          icon={<Tag className="h-6 w-6" />}
          title="No active coupons right now"
        >
          Check back later. We refresh the list daily.
        </EmptyState>
      )}

      {!loading && coupons.length > 0 && (
        <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon, i) => (
            <Card
              key={coupon.id}
              interactive
              style={{ ["--i" as string]: i }}
              className="flex flex-col gap-3 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{coupon.description}</p>
                  {coupon.category && (
                    <Badge className="mt-1.5">{coupon.category}</Badge>
                  )}
                </div>
                {coupon.discount && (
                  <span className="shrink-0 rounded-xl bg-danger-soft px-2.5 py-1 text-sm font-bold text-danger">
                    {coupon.discount}
                  </span>
                )}
              </div>

              <button
                onClick={() => copyCode(coupon.code)}
                aria-label={`Copy coupon code ${coupon.code}`}
                className="group mt-auto flex items-center justify-between rounded-xl border-2 border-dashed border-brand-200 bg-accent-soft px-4 py-2.5 transition-colors hover:border-brand-400"
              >
                <span className="font-mono text-sm font-bold tracking-widest text-brand-700">
                  {coupon.code}
                </span>
                {copied === coupon.code ? (
                  <Check className="animate-pop h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4 text-brand-400 transition-transform duration-200 group-hover:scale-110" />
                )}
              </button>

              {coupon.expiresAt && (
                <p className="text-xs text-ink-subtle">
                  Expires{" "}
                  {new Date(coupon.expiresAt).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
