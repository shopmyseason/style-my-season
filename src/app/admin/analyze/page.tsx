"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { analyzeAmazonUrl, saveVariants } from "@/src/app/actions/analyze-amazon";
import type { AnalyzedVariant } from "@/src/app/actions/analyze-amazon";
import { seasonalPaletteNames } from "@/src/data/seasonalPalettes";

const CATEGORIES = [
  "Women's Dresses", "Women's Maxi Dresses", "Women's Tops", "Women's T-Shirts",
  "Women's Blouses", "Women's Blazers", "Women's Skirts", "Women's Pants",
  "Women's Shorts", "Women's Cardigans", "Women's Sweaters", "Women's Coats",
  "Women's Jumpsuits", "Women's Polo Shirts",
  "Men's T-Shirts", "Men's Shirts", "Men's Pants", "Men's Shorts",
  "Men's Blazers", "Men's Sweaters", "Men's Coats",
  "Unisex Tops", "Unisex Bottoms",
];

export default function AnalyzePage() {
  const [url, setUrl] = useState("");
  const [variants, setVariants] = useState<AnalyzedVariant[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");
  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSaving] = useTransition();

  function handleAnalyze() {
    setError("");
    setSavedCount(null);
    setVariants([]);
    setSelected(new Set());
    startTransition(async () => {
      const result = await analyzeAmazonUrl(url.trim());
      if (!result.ok) {
        setError(result.error);
      } else {
        setVariants(result.variants);
        setSelected(new Set(result.variants.map((_, i) => i)));
      }
    });
  }

  function updateVariant(index: number, field: keyof AnalyzedVariant, value: string | number | null) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    );
  }

  function toggleSelect(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleSave() {
    const toSave = variants.filter((_, i) => selected.has(i));
    startSaving(async () => {
      const { saved } = await saveVariants(toSave);
      setSavedCount(saved);
      setVariants([]);
      setSelected(new Set());
      setUrl("");
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Admin
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Analyze Amazon Product</h1>
        </div>

        {/* URL input */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Amazon product URL
          </label>
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
          <p className="mt-2 text-xs text-gray-400">
            Claude will extract all color variants from this product and suggest palette matches.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        {/* Success */}
        {savedCount !== null && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Saved {savedCount} product{savedCount !== 1 ? "s" : ""} to the catalog.{" "}
            <Link href="/admin" className="font-medium underline underline-offset-2">
              Back to admin
            </Link>
          </div>
        )}

        {/* Variant cards */}
        {variants.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                {variants.length} variant{variants.length !== 1 ? "s" : ""} found —{" "}
                <span className="text-gray-500">{selected.size} selected to save</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelected(new Set(variants.map((_, i) => i)))}
                  className="text-xs font-medium text-gray-500 hover:text-gray-900"
                >
                  Select all
                </button>
                <span className="text-gray-300">·</span>
                <button
                  onClick={() => setSelected(new Set())}
                  className="text-xs font-medium text-gray-500 hover:text-gray-900"
                >
                  Deselect all
                </button>
              </div>
            </div>

            {variants.map((v, i) => (
              <div
                key={i}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                  selected.has(i) ? "border-rose-200" : "border-gray-200 opacity-60"
                }`}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selected.has(i)}
                      onChange={() => toggleSelect(i)}
                      className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-300"
                    />
                    <div className="flex items-center gap-2">
                      <span
                        className="h-6 w-6 shrink-0 rounded-full border border-black/10 shadow-sm"
                        style={{ backgroundColor: v.hex }}
                      />
                      <span className="font-medium text-gray-900">{v.colorName || "Unknown color"}</span>
                    </div>
                  </label>
                  {v.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.imageUrl} alt={v.colorName} className="h-16 w-16 rounded-lg object-cover border border-gray-100" />
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Product name" span={2}>
                    <input value={v.productName} onChange={(e) => updateVariant(i, "productName", e.target.value)} className={input} />
                  </Field>
                  <Field label="Brand">
                    <input value={v.brand} onChange={(e) => updateVariant(i, "brand", e.target.value)} className={input} />
                  </Field>
                  <Field label="Category">
                    <select value={v.category} onChange={(e) => updateVariant(i, "category", e.target.value)} className={input}>
                      <option value="">Select…</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Color name">
                    <input value={v.colorName} onChange={(e) => updateVariant(i, "colorName", e.target.value)} className={input} />
                  </Field>
                  <Field label="Hex color">
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={v.hex}
                        onChange={(e) => updateVariant(i, "hex", e.target.value)}
                        className="h-9 w-12 cursor-pointer rounded border border-gray-200 p-0.5"
                      />
                      <input value={v.hex} onChange={(e) => updateVariant(i, "hex", e.target.value)} className={`${input} flex-1`} />
                    </div>
                  </Field>
                  <Field label="Seasonal palette">
                    <select value={v.seasonalPalette} onChange={(e) => updateVariant(i, "seasonalPalette", e.target.value)} className={input}>
                      <option value="">Select…</option>
                      {seasonalPaletteNames.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </Field>
                  <Field label="Price ($)">
                    <input
                      type="number"
                      step="0.01"
                      value={v.price ?? ""}
                      onChange={(e) => updateVariant(i, "price", e.target.value ? parseFloat(e.target.value) : null)}
                      className={input}
                    />
                  </Field>
                  <Field label="Affiliate URL" span={2}>
                    <input value={v.affiliateUrl} onChange={(e) => updateVariant(i, "affiliateUrl", e.target.value)} className={input} />
                  </Field>
                  <Field label="Image URL" span={2}>
                    <input value={v.imageUrl} onChange={(e) => updateVariant(i, "imageUrl", e.target.value)} className={input} />
                  </Field>
                  <Field label="Notes" span={2}>
                    <input value={v.notes} onChange={(e) => updateVariant(i, "notes", e.target.value)} className={input} />
                  </Field>
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={selected.size === 0 || isSaving}
                className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving…
                  </span>
                ) : `Save ${selected.size} product${selected.size !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const input = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-rose-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-100";

function Field({
  label,
  children,
  span,
}: {
  label: string;
  children: React.ReactNode;
  span?: number;
}) {
  return (
    <div className={span === 2 ? "sm:col-span-2" : ""}>
      <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  );
}
