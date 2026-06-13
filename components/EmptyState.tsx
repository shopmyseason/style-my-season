type EmptyStateProps = {
  hasActiveFilters: boolean;
  onClearFilters?: () => void;
};

export function EmptyState({
  hasActiveFilters,
  onClearFilters,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white px-6 py-20 text-center shadow-sm">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-50 to-violet-50">
        <svg
          className="h-10 w-10 text-rose-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </div>
      <h3 className="font-serif text-2xl font-medium text-gray-900">
        No matches found
      </h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-500">
        We couldn&apos;t find clothing that fits your search and palette
        filters. Try a broader search term, choose a different seasonal palette,
        or turn off &ldquo;Only show good matches.&rdquo;
      </p>
      {hasActiveFilters && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-8 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
