"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Tag } from "lucide-react";
import { toast } from "@/lib/toast";

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
      .finally(() => setLoading(false));
  }, []);

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    toast(`Copied "${code}" to clipboard`, { variant: "success" });
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="animate-fade-in px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50">
          <Tag className="h-5 w-5 text-brand-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1c1917]">Coupon Collector</h1>
          <p className="text-sm text-gray-500">
            Active Daraz voucher codes — click to copy
          </p>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-3xl" />
          ))}
        </div>
      )}

      {!loading && coupons.length === 0 && (
        <div className="glass-card flex flex-col items-center gap-3 rounded-3xl py-20 text-center text-gray-400">
          <Tag className="h-10 w-10 opacity-30" />
          <p className="font-medium text-gray-600">No active coupons right now</p>
          <p className="text-sm">Check back later — we refresh daily.</p>
        </div>
      )}

      {!loading && coupons.length > 0 && (
        <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon, i) => (
            <div
              key={coupon.id}
              style={{ ["--i" as string]: i }}
              className="glass-card flex flex-col gap-3 rounded-3xl p-5 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#1c1917]">
                    {coupon.description}
                  </p>
                  {coupon.category && (
                    <span className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600">
                      {coupon.category}
                    </span>
                  )}
                </div>
                {coupon.discount && (
                  <span className="shrink-0 rounded-xl bg-rose-50 px-2.5 py-1 text-sm font-bold text-rose-600">
                    {coupon.discount}
                  </span>
                )}
              </div>

              <button
                onClick={() => copyCode(coupon.code)}
                className="flex items-center justify-between rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/50 px-4 py-2.5 transition-colors hover:border-brand-400"
              >
                <span className="font-mono text-sm font-bold tracking-widest text-brand-700">
                  {coupon.code}
                </span>
                {copied === coupon.code ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4 text-brand-400" />
                )}
              </button>

              {coupon.expiresAt && (
                <p className="text-xs text-gray-400">
                  Expires{" "}
                  {new Date(coupon.expiresAt).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
