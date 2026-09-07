"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, X } from "lucide-react";
import { useCompareStore, MAX_COMPARE } from "@/store/compare";
import { Button } from "@/components/ui/button";

/**
 * Floating tray listing everything pinned for comparison. Hidden on the
 * compare page itself, where it would sit on top of the table it links to.
 */
export function CompareTray() {
  const items = useCompareStore((s) => s.items);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const pathname = usePathname();
  const showing = items.length > 0 && pathname !== "/compare";

  // The tray is fixed to the bottom, so without this it permanently covers
  // the last row of whatever is behind it.
  useEffect(() => {
    if (!showing) return;
    document.body.style.paddingBottom = "6.5rem";
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [showing]);

  if (!showing) return null;

  return (
    <div className="animate-slide-up fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="glass-float mx-auto flex max-w-[1360px] items-center gap-3 rounded-3xl p-3 shadow-[var(--shadow-4)]">
        <span className="ml-1 flex shrink-0 items-center gap-2 text-sm font-semibold text-ink">
          <Layers className="h-4 w-4 text-brand-500" />
          <span className="hidden sm:inline">Compare</span>
          <span className="text-ink-subtle">
            {items.length}/{MAX_COMPARE}
          </span>
        </span>

        {/* One scrolling row rather than a wrapping grid, so the tray keeps
            a fixed height on a phone. */}
        <div className="scroll-slim flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-sunken ring-1 ring-line"
            >
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-contain p-1"
                  unoptimized
                />
              )}
              <button
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.title} from compare`}
                className="absolute inset-0 flex items-center justify-center bg-ink/70 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="pill"
            onClick={clear}
            className="hidden sm:inline-flex"
          >
            Clear
          </Button>
          <Button size="pill" asChild>
            <Link href="/compare">Compare now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
