"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Trash2, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/lib/toast";

interface Alert {
  id: string;
  targetPrice: number;
  notified: boolean;
  product: {
    id: string;
    title: string;
    image: string;
    currentPrice: number;
    darazUrl: string;
  };
}

export function AlertsView() {
  const { status } = useSession();
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/alerts");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/alerts")
        .then((r) => r.json())
        .then((d) => setAlerts(d.alerts ?? []))
        .finally(() => setLoading(false));
    }
  }, [status]);

  async function deleteAlert(alertId: string) {
    await fetch("/api/alerts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertId }),
    });
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    toast("Alert removed", { variant: "default" });
  }

  if (status === "loading" || loading) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50">
          <Bell className="h-5 w-5 text-brand-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1c1917]">Price Alerts</h1>
          <p className="text-sm text-gray-500">
            We&apos;ll email you when a product hits your target price.
          </p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-3 rounded-3xl py-20 text-center text-gray-400">
          <Bell className="h-10 w-10 opacity-30" />
          <p className="font-medium text-gray-600">No alerts set yet</p>
          <Link href="/" className="text-sm text-brand-600 hover:underline">
            Search for a product and set an alert
          </Link>
        </div>
      ) : (
        <div className="stagger flex flex-col gap-3">
          {alerts.map((alert, i) => {
            const hit = alert.product.currentPrice <= alert.targetPrice;
            return (
              <div
                key={alert.id}
                style={{ ["--i" as string]: i }}
                className="glass-card flex items-center gap-4 rounded-3xl p-4 transition-shadow hover:shadow-md"
              >
                <Link
                  href={`/product/${alert.product.id}`}
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-canvas"
                >
                  {alert.product.image && (
                    <Image
                      src={alert.product.image}
                      alt={alert.product.title}
                      fill
                      className="object-contain p-1.5"
                      unoptimized
                    />
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/product/${alert.product.id}`}
                    className="line-clamp-1 text-sm font-semibold text-[#1c1917] hover:text-brand-600"
                  >
                    {alert.product.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="text-gray-500">
                      Now:{" "}
                      <span className={hit ? "font-semibold text-emerald-600" : "text-gray-700"}>
                        {formatPrice(alert.product.currentPrice)}
                      </span>
                    </span>
                    <span className="font-medium text-brand-600">
                      Target: {formatPrice(alert.targetPrice)}
                    </span>
                    {alert.notified && (
                      <span className="flex items-center gap-0.5 text-emerald-600">
                        <Check className="h-3 w-3" /> Notified
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="shrink-0 rounded-xl border border-gray-200 p-2 text-gray-400 transition-colors hover:border-rose-300 hover:text-rose-500"
                  title="Delete alert"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
