import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badge = cva(
  "inline-flex items-center gap-1 rounded-full font-semibold leading-none",
  {
    variants: {
      variant: {
        brand: "bg-brand-500 text-white",
        soft: "bg-accent-soft text-brand-600",
        success: "bg-success-soft text-success",
        danger: "bg-danger-soft text-danger",
        warn: "bg-warn-soft text-warn",
        neutral: "bg-sunken text-ink-muted",
        outline: "border border-line text-ink-muted",
      },
      size: {
        sm: "px-2 py-1 text-[10px]",
        md: "px-2.5 py-1 text-[11px]",
        lg: "px-3 py-1.5 text-xs",
      },
    },
    defaultVariants: { variant: "soft", size: "md" },
  }
);

export function Badge({
  className,
  variant,
  size,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>) {
  return (
    <span className={cn(badge({ variant, size }), className)} {...props} />
  );
}
