"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

/**
 * Themed replacement for a native <select>. The native control renders with
 * operating-system colours that ignore the app theme entirely, which is very
 * obvious in dark mode.
 */
export function Select<T extends string>({
  value,
  onChange,
  options,
  icon,
  label,
  className,
  align = "end",
}: {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  icon?: React.ReactNode;
  label: string;
  className?: string;
  align?: "start" | "center" | "end";
}) {
  const current = options.find((o) => o.value === value);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label={label}
          className={cn(
            "group flex h-9 items-center gap-1.5 rounded-full bg-surface/70 px-3.5 text-xs font-semibold text-ink-muted ring-1 ring-line backdrop-blur-md transition-colors hover:bg-surface hover:text-ink data-[state=open]:bg-surface data-[state=open]:text-ink",
            className
          )}
        >
          {icon}
          <span>{current?.label ?? label}</span>
          <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={8}
          className="glass-float animate-scale-in z-50 min-w-[190px] overflow-hidden rounded-2xl p-1.5 shadow-[var(--shadow-3)]"
        >
          {options.map((opt) => {
            const selected = opt.value === value;
            return (
              <DropdownMenu.Item
                key={opt.value}
                onSelect={() => onChange(opt.value)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm outline-none transition-colors",
                  selected
                    ? "bg-accent-soft font-semibold text-brand-600"
                    : "text-ink-muted data-[highlighted]:bg-sunken data-[highlighted]:text-ink"
                )}
              >
                {opt.label}
                {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
