"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink transition-colors placeholder:text-ink-subtle hover:border-line-strong focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/25",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
