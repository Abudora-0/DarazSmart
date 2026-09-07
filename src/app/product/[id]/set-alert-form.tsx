"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SetAlertForm({
  productId,
  currentPrice,
}: {
  productId: string;
  currentPrice: number;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [targetPrice, setTargetPrice] = useState(
    Math.floor(currentPrice * 0.9).toString()
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  const target = Number(targetPrice);
  const drop =
    target > 0 && target < currentPrice
      ? Math.round(((currentPrice - target) / currentPrice) * 100)
      : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/product/${productId}`);
      return;
    }
    setStatus("saving");
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, targetPrice }),
      });
      if (!res.ok) throw new Error();
      setStatus("saved");
      toast(`We'll email you when the price drops to ${formatPrice(target)}`, {
        variant: "success",
      });
    } catch {
      setStatus("error");
      toast("Could not save the alert. Please try again.", { variant: "error" });
    }
  }

  return (
    <div className="rounded-2xl border border-brand-200/60 bg-accent-soft p-4">
      <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
        <Bell className="h-4 w-4 text-brand-500" />
        Set a price alert
      </h3>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-subtle">
            Rs.
          </span>
          <Input
            type="number"
            aria-label="Target price"
            value={targetPrice}
            onChange={(e) => {
              setTargetPrice(e.target.value);
              if (status !== "idle") setStatus("idle");
            }}
            className="no-spin pl-9 tabular-nums"
            min={1}
          />
        </div>
        <Button type="submit" loading={status === "saving"}>
          {status === "saving" ? (
            "Saving"
          ) : status === "saved" ? (
            <>
              <Check className="h-4 w-4" /> Saved
            </>
          ) : (
            "Alert me"
          )}
        </Button>
      </form>

      <p className="mt-2 text-xs text-ink-subtle">
        Current price: {formatPrice(currentPrice)}
        {drop > 0 && ` · that is ${drop}% below today`}
        {!session && " · sign in to save alerts"}
      </p>
    </div>
  );
}
