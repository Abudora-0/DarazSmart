export default function ProductLoading() {
  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="skeleton mb-4 h-5 w-32 rounded-full" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="skeleton aspect-square rounded-3xl" />
        <div className="glass-card flex flex-col gap-4 rounded-3xl p-6">
          <div className="skeleton h-6 w-3/4 rounded" />
          <div className="skeleton h-6 w-1/2 rounded" />
          <div className="skeleton h-5 w-24 rounded-full" />
          <div className="skeleton h-9 w-40 rounded" />
          <div className="skeleton mt-2 h-12 w-full rounded-2xl" />
          <div className="skeleton h-24 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
