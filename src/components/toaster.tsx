"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { subscribeToast, type ToastItem } from "@/lib/toast";
import { cn } from "@/lib/utils";

const DURATION = 3200;

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribeToast((t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, DURATION);
    });
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-6 sm:w-full sm:translate-x-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "animate-fade-up flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium shadow-[0_15px_35px_-10px_rgba(0,0,0,0.3)] ring-1 backdrop-blur-xl",
            t.variant === "success" && "bg-white/85 text-emerald-700 ring-emerald-100",
            t.variant === "error" && "bg-white/85 text-rose-700 ring-rose-100",
            t.variant === "default" && "bg-[#1c1917]/85 text-white ring-black/10"
          )}
        >
          {t.variant === "success" && (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          )}
          {t.variant === "error" && (
            <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
          )}
          {t.variant === "default" && (
            <Info className="h-4 w-4 shrink-0 text-brand-400" />
          )}
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss"
            className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
