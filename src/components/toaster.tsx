"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { subscribeToast, type ToastItem } from "@/lib/toast";
import { cn } from "@/lib/utils";

const DURATION = 3200;

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, number>());

  useEffect(() => {
    const pending = timers.current;
    const unsubscribe = subscribeToast((t) => {
      setToasts((prev) => [...prev, t]);
      const handle = window.setTimeout(() => {
        pending.delete(t.id);
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, DURATION);
      pending.set(t.id, handle);
    });

    return () => {
      unsubscribe();
      // Unmounting with timers still queued would fire setState on a dead
      // component and leak one handle per toast shown.
      pending.forEach((handle) => window.clearTimeout(handle));
      pending.clear();
    };
  }, []);

  function dismiss(id: string) {
    const handle = timers.current.get(id);
    if (handle) {
      window.clearTimeout(handle);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:bottom-24 sm:left-auto sm:right-6 sm:w-full sm:translate-x-0"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "glass-float animate-fade-up pointer-events-auto flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium shadow-[var(--shadow-3)]",
            t.variant === "success" && "text-success",
            t.variant === "error" && "text-danger",
            t.variant === "default" && "text-ink"
          )}
        >
          {t.variant === "success" && (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          )}
          {t.variant === "error" && <XCircle className="h-4 w-4 shrink-0" />}
          {t.variant === "default" && (
            <Info className="h-4 w-4 shrink-0 text-brand-500" />
          )}
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
            className="shrink-0 text-ink-subtle transition-colors hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
