export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-sm">
      <div className="relative aspect-[4/5] animate-pulse bg-gradient-to-br from-gray-100 to-gray-50" />
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
          <div className="h-6 w-20 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="space-y-2">
          <div className="h-1.5 w-full animate-pulse rounded-full bg-gray-100" />
          <div className="flex justify-between">
            <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 animate-pulse rounded-full bg-gray-100" />
          <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
