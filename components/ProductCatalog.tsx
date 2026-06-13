"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { scoreAndSortProducts } from "@/lib/score-products";
import { seasonalPalettes } from "@/src/data/seasonalPalettes";
import type { Product, SeasonalPalette } from "@/lib/types";
import { EmptyState } from "./EmptyState";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

const ALL_PALETTES_VALUE = "";

type AmazonSearchResponse = {
  products: Product[];
  searchTerm: string;
  selectedPalette: SeasonalPalette | null;
};

export function ProductCatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [paletteValue, setPaletteValue] = useState(ALL_PALETTES_VALUE);
  const [onlyGoodMatches, setOnlyGoodMatches] = useState(false);

  const [results, setResults] = useState<Product[]>([]);
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedPalette, setAppliedPalette] = useState<SeasonalPalette | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (term: string, palette: string) => {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (term.trim()) {
        params.set("q", term.trim());
      }
      if (palette) {
        params.set("palette", palette);
      }

      try {
        const response = await fetch(`/api/amazon-search?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Search failed. Please try again.");
        }

        const data = (await response.json()) as AmazonSearchResponse;
        setResults(data.products);
        setAppliedSearchTerm(data.searchTerm);
        setAppliedPalette(data.selectedPalette);
      } catch (err) {
        setResults([]);
        setError(
          err instanceof Error ? err.message : "Something went wrong.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchProducts("", "");
  }, [fetchProducts]);

  const productsWithScores = useMemo(
    () => scoreAndSortProducts(results, appliedPalette, onlyGoodMatches),
    [results, appliedPalette, onlyGoodMatches],
  );

  const hasActiveFilters =
    appliedSearchTerm.trim().length > 0 ||
    appliedPalette !== null ||
    onlyGoodMatches;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchProducts(searchQuery, paletteValue);
  }

  function clearFilters() {
    setSearchQuery("");
    setPaletteValue(ALL_PALETTES_VALUE);
    setOnlyGoodMatches(false);
    fetchProducts("", "");
  }

  return (
    <>
      <section className="relative z-10 -mt-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-white/80 bg-white p-5 shadow-xl shadow-gray-200/40 sm:p-6">
            <form
              onSubmit={handleSearch}
              className="flex flex-col gap-4 sm:flex-row sm:items-end"
            >
              <div className="flex-1 space-y-1.5">
                <label
                  htmlFor="product-search"
                  className="text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  Search
                </label>
                <input
                  id="product-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Dresses, blouses, sweaters..."
                  autoComplete="off"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all focus:border-rose-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-100/80"
                />
              </div>

              <div className="space-y-3 sm:w-56">
                <div className="space-y-1.5">
                  <label
                    htmlFor="palette-select"
                    className="text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Palette
                  </label>
                  <select
                    id="palette-select"
                    value={paletteValue}
                    onChange={(e) => setPaletteValue(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-gray-900 transition-all focus:border-rose-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-100/80"
                  >
                    <option value={ALL_PALETTES_VALUE}>All palettes</option>
                    {seasonalPalettes.map((palette) => (
                      <option key={palette.name} value={palette.name}>
                        {palette.name}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={onlyGoodMatches}
                    onChange={(e) => setOnlyGoodMatches(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-300"
                  />
                  Only show good matches
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-gray-900 px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-gray-800 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:shrink-0"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Searching
                  </span>
                ) : (
                  "Search"
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-gray-200/80 pb-6">
            <div>
              <h2 className="font-serif text-2xl font-medium text-gray-900">
                {isLoading ? "Finding your matches" : "Your matches"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {isLoading
                  ? "Analyzing colors against your palette…"
                  : error
                    ? error
                    : productsWithScores.length === 0
                      ? "Adjust your filters to discover more pieces"
                      : `Showing ${productsWithScores.length} of ${results.length} items`}
              </p>
            </div>

            {hasActiveFilters && !isLoading && !error && (
              <div className="flex flex-wrap items-center gap-2">
                {appliedSearchTerm.trim() && (
                  <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
                    &ldquo;{appliedSearchTerm.trim()}&rdquo;
                  </span>
                )}
                {appliedPalette && (
                  <span className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 shadow-sm">
                    {appliedPalette}
                  </span>
                )}
                {onlyGoodMatches && (
                  <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm">
                    75+ match score
                  </span>
                )}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-medium text-gray-500 underline-offset-2 transition-colors hover:text-gray-900 hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-100 bg-white px-6 py-20 text-center shadow-sm">
              <p className="text-gray-600">{error}</p>
              <button
                type="button"
                onClick={() => fetchProducts(searchQuery, paletteValue)}
                className="mt-6 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                Try again
              </button>
            </div>
          ) : productsWithScores.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productsWithScores.map(
                ({ product, matchScore, hasAvoidWarning }) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    matchScore={matchScore}
                    hasAvoidWarning={hasAvoidWarning}
                  />
                ),
              )}
            </div>
          ) : (
            <EmptyState
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          )}
        </div>
      </section>
    </>
  );
}
