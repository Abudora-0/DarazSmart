"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Check, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/alerts");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((d) => setAlerts(d.alerts ?? []))
      .catch(() => setAlerts([]))
      .finally(() => setLoaded(true));
  }, [status]);

  // Derived, not stored: a signed-out visitor is redirected rather than left
  // staring at skeletons forever, which is what the old `loading` flag did
  // because nothing ever set it back to false.
  const showSkeleton =
    status === "loading" || (status === "authenticated" && !loaded);

  async function deleteAlert(alertId: string) {
    const previous = alerts;
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    try {
      const res = await fetch("/api/alerts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId }),
      });
      if (!res.ok) throw new Error();
      toast("Alert removed");
    } catch {
      setAlerts(previous);
      toast("Could not remove that alert. Please try again.", {
        variant: "error",
      });
    }
  }

  if (showSkeleton || status === "unauthenticated") {
    return (
      <div className="px-4 py-6 sm:px-6">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft">
          <Bell className="h-5 w-5 text-brand-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">Price Alerts</h1>
          <p className="text-sm text-ink-muted">
            We&apos;ll email you when a product hits your target price.
          </p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <EmptyState icon={<Bell className="h-6 w-6" />} title="No alerts set yet">
          Open any product and set a target price. We will watch it for you.
          <div className="mt-4">
            <Button asChild size="sm">
              <Link href="/">Find a product</Link>
            </Button>
          </div>
        </EmptyState>
      ) : (
        <div className="stagger flex flex-col gap-3">
          {alerts.map((alert, i) => {
            const hit = alert.product.currentPrice <= alert.targetPrice;
            const gap = alert.product.currentPrice - alert.targetPrice;
            return (
              <Card
                key={alert.id}
                interactive
                style={{ ["--i" as string]: i }}
                className="flex items-center gap-4 p-4"
              >
                <Link
                  href={`/product/${alert.product.id}`}
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-sunken"
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
                    className="line-clamp-1 text-sm font-semibold text-ink hover:text-brand-600"
                  >
                    {alert.product.title}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="text-ink-muted">
                      Now:{" "}
                      <span
                        className={cn(
                          "tabular-nums",
                          hit ? "font-semibold text-success" : "text-ink"
                        )}
                      >
                        {formatPrice(alert.product.currentPrice)}
                      </span>
                    </span>
                    <span className="font-medium tabular-nums text-brand-600">
                      Target: {formatPrice(alert.targetPrice)}
                    </span>
                    {hit ? (
                      <Badge variant="success">
                        <Check className="h-3 w-3" /> Target reached
                      </Badge>
                    ) : (
                      <span className="tabular-nums text-ink-subtle">
                        {formatPrice(gap)} to go
                      </span>
                    )}
                    {alert.notified && <Badge variant="neutral">Emailed</Badge>}
                  </div>
                </div>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => deleteAlert(alert.id)}
                  aria-label={`Delete alert for ${alert.product.title}`}
                  className="shrink-0 px-2.5"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
