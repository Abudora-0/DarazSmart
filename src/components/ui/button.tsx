"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const button = cva(
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-55",
  {
    variants: {
      variant: {
        primary:
          "sweep bg-brand-500 text-white shadow-[var(--shadow-brand)] hover:bg-brand-600",
        secondary:
          "bg-surface text-ink shadow-[var(--shadow-1)] ring-1 ring-line hover:bg-sunken",
        outline:
          "border border-brand-200 text-brand-600 hover:border-brand-500 hover:bg-accent-soft",
        ghost: "text-ink-muted hover:bg-sunken hover:text-ink",
        danger:
          "border border-line text-ink-muted hover:border-danger/50 hover:bg-danger-soft hover:text-danger",
        soft: "bg-accent-soft text-brand-600 hover:bg-brand-100",
      },
      size: {
        sm: "h-9 rounded-xl px-3 text-xs",
        md: "h-11 rounded-2xl px-4 text-sm",
        lg: "h-13 rounded-2xl px-6 text-sm",
        pill: "h-9 rounded-full px-4 text-xs",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", block: false },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  loading?: boolean;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      block,
      loading,
      asChild,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(button({ variant, size, block }), className)}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { button as buttonVariants };
