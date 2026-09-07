import { Skeleton } from "@/components/ui/skeleton";

export function SearchSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[264px_1fr]">
      {/* Sidebar skeleton, matching the sidebar's own lg breakpoint */}
      <aside className="hidden flex-col gap-4 lg:flex">
        {[190, 210, 230].map((h, i) => (
          <Skeleton key={i} className="rounded-3xl" style={{ height: h }} />
        ))}
      </aside>

      {/* Grid skeleton */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-9 w-44 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="glass-card rounded-3xl p-3">
              <Skeleton className="aspect-square rounded-2xl" />
              <div className="mt-3 space-y-2 px-1">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
                <Skeleton className="mt-3 h-7 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
