"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useCompareStore } from "@/store/compare";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const compareOpen = useCompareStore((s) => s.items.length > 0);

  useEffect(() => {
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(window.scrollY > 480);
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll back to top"
      title="Scroll back to top"
      className={cn(
        // Sits above the toast stack rather than on top of it, and lifts
        // again when the compare tray is docked along the bottom.
        "fixed right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white shadow-[var(--shadow-3)] transition-all duration-300 hover:scale-110 hover:bg-brand-600",
        compareOpen ? "bottom-28 sm:bottom-32" : "bottom-6",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      )}
    >
      {/* Reading progress ring */}
      <svg
        aria-hidden
        viewBox="0 0 44 44"
        className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
      >
        <circle
          cx="22"
          cy="22"
          r="20"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="2.5"
        />
        <circle
          cx="22"
          cy="22"
          r="20"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 20}
          strokeDashoffset={2 * Math.PI * 20 * (1 - progress)}
        />
      </svg>
      <ArrowUp className="relative h-5 w-5" />
    </button>
  );
}
