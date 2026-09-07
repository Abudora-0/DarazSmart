import { cn } from "@/lib/utils";

/**
 * The one card surface in the app. `interactive` adds the lift-and-bloom
 * hover used by product cards and list rows.
 */
export function Card({
  className,
  interactive,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "glass-card sheen rounded-3xl shadow-[var(--shadow-1)]",
        interactive &&
          "transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-3)]",
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("font-bold text-ink", className)} {...props} />
  );
}

/** Centred empty / zero-result state shared by every list page. */
export function EmptyState({
  icon,
  title,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "animate-fade-up flex flex-col items-center gap-3 px-6 py-20 text-center",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-brand-500">
        {icon}
      </div>
      <p className="font-semibold text-ink">{title}</p>
      {children && (
        <div className="max-w-xs text-sm text-ink-subtle">{children}</div>
      )}
    </Card>
  );
}
