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
    <div className="scroll-slim flex items-center gap-2 overflow-x-auto pb-1">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat.toLowerCase();
        return (
          <Link
            key={cat}
            href={`/search?q=${encodeURIComponent(cat)}`}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand-500 text-white shadow-sm shadow-brand-500/30"
                : "bg-white/70 text-gray-600 ring-1 ring-white/60 hover:bg-brand-50/80 hover:text-brand-600"
            )}
          >
            {cat}
          </Link>
        );
      })}
    </div>
  );
}
