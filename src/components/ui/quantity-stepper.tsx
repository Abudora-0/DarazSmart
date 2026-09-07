"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const REPEAT_DELAY = 420;
const REPEAT_INTERVAL = 90;

/**
 * Themed quantity counter. Press and hold either end to repeat, and the
 * number rolls whenever it changes so the step is legible at a glance.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
  label = "Quantity",
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  className?: string;
  label?: string;
}) {
  const [rolling, setRolling] = useState(false);
  const timers = useRef<{ delay?: number; interval?: number }>({});
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setRolling(true);
    }
  }, [value]);

  // Any unmount mid-hold has to clear both timers, otherwise the repeat
  // keeps firing against an unmounted component.
  useEffect(() => stopRepeat, []);

  function stopRepeat() {
    window.clearTimeout(timers.current.delay);
    window.clearInterval(timers.current.interval);
    timers.current = {};
  }

  function step(delta: number) {
    onChange(Math.min(max, Math.max(min, value + delta)));
  }

  function startRepeat(delta: number) {
    stopRepeat();
    timers.current.delay = window.setTimeout(() => {
      timers.current.interval = window.setInterval(() => {
        // Read through the ref so the repeat is not stuck on a stale value.
        onChange(Math.min(max, Math.max(min, prev.current + delta)));
      }, REPEAT_INTERVAL);
    }, REPEAT_DELAY);
  }

  const btn =
    "flex h-8 w-8 items-center justify-center rounded-xl text-ink-muted transition-[background-color,color,transform] duration-150 hover:bg-surface hover:text-brand-600 active:scale-90 disabled:pointer-events-none disabled:opacity-40";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-2xl bg-sunken p-1 ring-1 ring-line",
        className
      )}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => step(-1)}
        onPointerDown={() => startRepeat(-1)}
        onPointerUp={stopRepeat}
        onPointerLeave={stopRepeat}
        className={btn}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <span
        aria-live="polite"
        onAnimationEnd={() => setRolling(false)}
        className={cn(
          "min-w-7 text-center text-sm font-bold tabular-nums text-ink",
          rolling && "animate-roll"
        )}
      >
        {value}
      </span>

      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => step(1)}
        onPointerDown={() => startRepeat(1)}
        onPointerUp={stopRepeat}
        onPointerLeave={stopRepeat}
        className={btn}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
