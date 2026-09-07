"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import {
  applyTheme,
  getStoredChoice,
  setTheme,
  subscribeTheme,
  type ThemeChoice,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

/** getStoredChoice returns a primitive, so it is already a stable snapshot. */
function useThemeChoice(): ThemeChoice {
  return useSyncExternalStore(
    subscribeTheme,
    getStoredChoice,
    () => "system" as const
  );
}

/**
 * Single button that cycles light, dark, system. Used where the three-way
 * segmented control does not fit, so a phone still has a theme control.
 */
export function ThemeToggleCompact({ className }: { className?: string }) {
  const choice = useThemeChoice();
  const index = Math.max(
    0,
    OPTIONS.findIndex((o) => o.value === choice)
  );
  const { Icon, label } = OPTIONS[index];
  const next = OPTIONS[(index + 1) % OPTIONS.length];

  return (
    <button
      onClick={() => setTheme(next.value)}
      aria-label={`Theme: ${label}. Switch to ${next.label}.`}
      title={`Theme: ${label}`}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-sunken hover:text-ink",
        className
      )}
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const choice = useThemeChoice();

  // Following the operating system means reacting when it changes.
  useEffect(() => {
    if (choice !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [choice]);

  const activeIndex = OPTIONS.findIndex((o) => o.value === choice);

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn(
        "relative flex items-center gap-0.5 rounded-full bg-sunken p-1 ring-1 ring-line",
        className
      )}
    >
      {/* Sliding pill behind the active option */}
      <span
        aria-hidden
        className="absolute left-1 top-1 h-7 w-7 rounded-full bg-surface shadow-[var(--shadow-1)] transition-transform duration-300 ease-[var(--ease-spring)]"
        style={{ transform: `translateX(${activeIndex * 30}px)` }}
      />
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          role="radio"
          aria-checked={choice === value}
          aria-label={`${label} theme`}
          title={`${label} theme`}
          onClick={() => setTheme(value)}
          className={cn(
            "relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200",
            choice === value ? "text-brand-600" : "text-ink-subtle hover:text-ink"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
