"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { analyzeAmazonUrl } from "@/src/app/actions/analyze-amazon";
import type { AnalyzedVariant } from "@/src/app/actions/analyze-amazon";
import { seasonalPaletteNames } from "@/src/data/seasonalPalettes";
import type { SeasonalPalette } from "@/src/data/seasonalPalettes";
import { getMatchScore } from "@/src/lib/colorMatch";
import { seasonalPalettes } from "@/src/data/seasonalPalettes";

const SEASON_DOT: Record<string, string> = {
  Spring: "bg-amber-400",
  Summer: "bg-sky-400",
  Autumn: "bg-orange-400",
  Winter: "bg-violet-400",
};

const PALETTE_SEASON: Record<string, string> = {
  "Light Spring": "Spring", "Warm Spring": "Spring", "Clear Spring": "Spring",
  "Light Summer": "Summer", "Soft Summer": "Summer", "Cool Summer": "Summer",
  "Soft Autumn": "Autumn", "Warm Autumn": "Autumn", "Deep Autumn": "Autumn",
  "Clear Winter": "Winter", "Cool Winter": "Winter", "Deep Winter": "Winter",
};

type ScoredVariant = AnalyzedVariant & { matchScore: number };

function scoreVariants(variants: AnalyzedVariant[], palette: SeasonalPalette): ScoredVariant[] {
  const paletteData = seasonalPalettes.find((p) => p.name === palette);
  if (!paletteData) return variants.map((v) => ({ ...v, matchScore: 0 }));
  return variants
    .map((v) => ({ ...v, matchScore: getMatchScore(v.hex, paletteData.colors) }))
    .sort((a, b) => b.matchScore - a.matchScore);
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 75 ? "bg-emerald-400" : score >= 60 ? "bg-amber-400" : "bg-rose-300";
  const label =
    score >= 75 ? "Great match" : score >= 60 ? "Possible match" : "Poor match";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-600">{label}</span>
        <span className="tabular-nums text-gray-500">{score}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  const [palette, setPalette] = useState<SeasonalPalette | "">("");
  const [url, setUrl] = useState("");
  const [rawVariants, setRawVariants] = useState<AnalyzedVariant[]>([]);
  const [error, setError] = useState("");
  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);

  const variants = useMemo(
    () => palette ? scoreVariants(rawVariants, palette) : rawVariants.map((v) => ({ ...v, matchScore: 0 })),
    [rawVariants, palette],
  );

  function handleAnalyze() {
    setError("");
    setSavedCount(null);
    setRawVariants([]);
    startTransition(async () => {
      const result = await analyzeAmazonUrl(url.trim());
      if (!result.ok) {
        setError(result.error);
      } else {
        setRawVariants(result.variants);
      }
    });
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch("/api/products/save-variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rawVariants),
      });
      const data = await res.json() as { saved?: number; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setSavedCount(data.saved ?? rawVariants.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  const goodMatches = variants.filter((v) => v.matchScore >= 75);
  const otherMatches = variants.filter((v) => v.matchScore < 75);

  return (
    <div className="min-h-full bg-[#faf9f7]">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-gray-200/60 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to catalog
          </Link>
          <h1 className="font-serif text-3xl font-medium text-gray-900 sm:text-4xl">
            Analyze a new product
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-gray-600">
            Paste any Amazon clothing link and we'll pull all the color variations, then show you which ones work best for your season.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">

        {/* Step 1 — palette */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
            Step 1 — Your season
          </p>
          <p className="mb-4 text-sm text-gray-600">
            Select your seasonal palette so we can rank the colors for you.{" "}
            <Link href="/seasons" className="font-medium text-rose-600 underline-offset-2 hover:underline">
              Not sure? Learn about the 12 palettes.
            </Link>
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {seasonalPaletteNames.map((p) => {
              const season = PALETTE_SEASON[p] ?? "Spring";
              const isActive = palette === p;
              return (
                <button
                  key={p}
                  onClick={() => setPalette(p)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all ${
                    isActive
                      ? "border-rose-300 bg-rose-50 text-rose-900 shadow-sm"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-white"
                  }`}
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${SEASON_DOT[season]}`} />
                  {p}
                </button>
              );
            })}
          </div>
          {!palette && (
            <p className="mt-3 text-xs text-gray-400">
              You can still analyze without selecting — colors will be shown without ranking.
            </p>
          )}
        </div>

        {/* Step 2 — URL */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
            Step 2 — Amazon product link
          </p>
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isPending && url && handleAnalyze()}
              placeholder="https://www.amazon.com/dp/B0XXXXXXXX"
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-rose-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-100/80"
            />
            <button
              onClick={handleAnalyze}
              disabled={!url.trim() || isPending}
              className="shrink-0 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-50"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Analyzing…
                </span>
              ) : "Analyze"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        {/* Results */}
        {variants.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-medium text-gray-900">
                {variants.length} color variation{variants.length !== 1 ? "s" : ""} found
              </h2>
              {savedCount === null ? (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
                >
                  {isSaving ? "Saving…" : "Add all to catalog"}
                </button>
              ) : (
                <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
                  ✓ Added to catalog
                </span>
              )}
            </div>

            {/* Good matches */}
            {palette && goodMatches.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  Great for {palette}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {goodMatches.map((v, i) => (
                    <VariantCard key={i} variant={v} showScore={!!palette} />
                  ))}
                </div>
              </div>
            )}

            {/* Other / all matches */}
            {(palette ? otherMatches : variants).length > 0 && (
              <div>
                {palette && otherMatches.length > 0 && (
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Other colors
                  </p>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {(palette ? otherMatches : variants).map((v, i) => (
                    <VariantCard key={i} variant={v} showScore={!!palette} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200/60 px-4 py-8 text-center text-xs text-gray-400 sm:px-6 lg:px-8">
        Style My Season is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
      </footer>
    </div>
  );
}

function VariantCard({ variant: v, showScore }: { variant: ScoredVariant; showScore: boolean }) {
  const productUrl = v.affiliateUrl || v.amazonUrl;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {v.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={v.imageUrl} alt={v.colorName} className="h-20 w-20 shrink-0 rounded-xl object-cover border border-gray-100" />
        ) : (
          <div
            className="h-20 w-20 shrink-0 rounded-xl border border-black/5"
            style={{ backgroundColor: v.hex }}
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-400">{v.brand}</p>
          <p className="mt-0.5 line-clamp-2 text-sm font-medium text-gray-900">{v.productName}</p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10"
              style={{ backgroundColor: v.hex }}
            />
            <span className="text-xs text-gray-500">{v.colorName}</span>
          </div>
          {v.price != null && (
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v.price)}
            </p>
          )}
        </div>
      </div>

      {showScore && <ScoreBar score={v.matchScore} />}

      <a
        href={productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-xl bg-gray-900 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
      >
        View on Amazon
      </a>
    </div>
  );
}
