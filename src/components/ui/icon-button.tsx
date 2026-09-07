"use client";

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconButton = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full transition-[background-color,color,transform,box-shadow] duration-200 hover:scale-110 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        surface:
          "bg-surface/90 text-ink-muted shadow-[var(--shadow-1)] hover:text-brand-500",
        brand: "bg-brand-500 text-white shadow-[var(--shadow-brand)]",
        ghost: "text-ink-subtle hover:bg-sunken hover:text-ink",
        danger: "text-ink-subtle hover:bg-danger-soft hover:text-danger",
      },
      size: {
        sm: "h-8 w-8",
        md: "h-9 w-9",
        lg: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "surface", size: "md" },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButton> {
  /** Required: these buttons never have a visible text label. */
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, label, ...props }, ref) => (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={cn(iconButton({ variant, size }), className)}
      {...props}
    />
  )
);
IconButton.displayName = "IconButton";
