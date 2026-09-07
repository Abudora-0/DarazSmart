import Link from "next/link";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Deals",
  "Electronics",
  "Mobiles",
  "Fashion",
  "Home",
  "Beauty",
  "Appliances",
  "Sports",
  "Toys",
  "Groceries",
];

export function CategoryNav({ activeQuery }: { activeQuery?: string }) {
  const active = activeQuery?.trim().toLowerCase();

  return (
    <nav aria-label="Product categories">
      <div className="scroll-slim flex items-center gap-2 overflow-x-auto pb-1.5">
        {CATEGORIES.map((cat) => {
          const isActive = active === cat.toLowerCase();
          return (
            <Link
              key={cat}
              href={`/search?q=${encodeURIComponent(cat)}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color,transform,box-shadow] duration-200 hover:-translate-y-0.5",
                isActive
                  ? "bg-brand-500 text-white shadow-[var(--shadow-brand)]"
                  : "bg-surface/70 text-ink-muted ring-1 ring-line hover:bg-accent-soft hover:text-brand-600"
              )}
            >
              {cat}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
