export function SearchSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[264px_1fr]">
      {/* Sidebar skeleton */}
      <aside className="flex flex-col gap-4">
        {[140, 190, 210].map((h, i) => (
          <div
            key={i}
            className="skeleton rounded-3xl"
            style={{ height: h }}
          />
        ))}
      </aside>

      {/* Grid skeleton */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="skeleton h-5 w-24 rounded-full" />
          <div className="skeleton h-8 w-40 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="glass-card rounded-3xl p-3">
              <div className="skeleton aspect-square rounded-2xl" />
              <div className="mt-3 space-y-2 px-1">
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-2/3 rounded" />
                <div className="skeleton mt-3 h-7 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
