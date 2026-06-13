"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { seasonalPaletteNames } from "@/src/data/seasonalPalettes";
import type { Product } from "@/src/data/manualProducts";
import { parseCsv, mapCsvRows } from "@/src/lib/parse-csv";
import type { CsvRow } from "@/src/lib/parse-csv";

// ─── types ────────────────────────────────────────────────────────────────────

type FormData = {
  productName: string;
  brand: string;
  retailer: string;
  category: string;
  asin: string;
  amazonUrl: string;
  affiliateUrl: string;
  colorName: string;
  hex: string;
  seasonalPalette: string;
  price: string;
  imageUrl: string;
  notes: string;
};

const EMPTY_FORM: FormData = {
  productName: "",
  brand: "",
  retailer: "Amazon",
  category: "",
  asin: "",
  amazonUrl: "",
  affiliateUrl: "",
  colorName: "",
  hex: "#000000",
  seasonalPalette: "",
  price: "",
  imageUrl: "",
  notes: "",
};

function productToForm(p: Product): FormData {
  return {
    productName: p.productName,
    brand: p.brand ?? "",
    retailer: p.retailer ?? "",
    category: p.category ?? "",
    asin: p.asin ?? "",
    amazonUrl: p.amazonUrl ?? "",
    affiliateUrl: p.affiliateUrl ?? "",
    colorName: p.colorName ?? "",
    hex: p.hex ?? "#000000",
    seasonalPalette: p.seasonalPalette ?? "",
    price: p.price != null ? String(p.price) : "",
    imageUrl: p.imageUrl ?? "",
    notes: p.notes ?? "",
  };
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function hexIsLight(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length < 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 160;
}

const PALETTE_SEASON: Record<string, string> = {
  "Light Spring": "Spring", "Warm Spring": "Spring", "Clear Spring": "Spring",
  "Light Summer": "Summer", "Soft Summer": "Summer", "Cool Summer": "Summer",
  "Soft Autumn": "Autumn", "Warm Autumn": "Autumn", "Deep Autumn": "Autumn",
  "Clear Winter": "Winter", "Cool Winter": "Winter", "Deep Winter": "Winter",
};

const SEASON_COLOR: Record<string, string> = {
  Spring: "bg-amber-50 text-amber-800 ring-amber-200",
  Summer: "bg-sky-50 text-sky-800 ring-sky-200",
  Autumn: "bg-orange-50 text-orange-800 ring-orange-200",
  Winter: "bg-violet-50 text-violet-800 ring-violet-200",
};

function PaletteBadge({ palette }: { palette: string }) {
  const season = PALETTE_SEASON[palette] ?? "Spring";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${SEASON_COLOR[season]}`}>
      {palette}
    </span>
  );
}

function ColorSwatch({ hex }: { hex: string }) {
  return (
    <span
      className="inline-block h-5 w-5 rounded-full border border-black/10 shadow-inner"
      style={{ backgroundColor: hex }}
      title={hex}
    />
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-rose-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-100/80";

function Field({ label, children, span }: { label: string; children: React.ReactNode; span?: number }) {
  return (
    <div className={span === 2 ? "sm:col-span-2" : undefined}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</label>
      {children}
    </div>
  );
}

// ─── import modal ─────────────────────────────────────────────────────────────

type ImportStep = "pick" | "preview" | "done";
type ImportResult = { added: number; updated: number; skipped: number; errors: { rowIndex: number; message: string }[] };

function ImportModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [step, setStep] = useState<ImportStep>("pick");
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function processFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      setParseError("Please upload a .csv file.");
      return;
    }
    setParseError(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const records = parseCsv(text);
        if (records.length === 0) {
          setParseError("The file appears to be empty or has no data rows.");
          return;
        }
        const parsed = mapCsvRows(records);
        setRows(parsed);
        setStep("preview");
      } catch {
        setParseError("Could not parse the file. Make sure it is a valid CSV.");
      }
    };
    reader.readAsText(file, "utf-8");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  async function handleImport() {
    const validRows = rows.filter((r) => r.errors.length === 0);
    if (validRows.length === 0) return;

    setIsImporting(true);
    try {
      const res = await fetch("/api/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validRows.map((r) => ({ data: r.data, rowIndex: r.rowIndex })) }),
      });
      if (!res.ok) throw new Error("Import failed");
      const data = await res.json() as ImportResult;
      setResult(data);
      setStep("done");
      onImported();
    } catch {
      setParseError("Import failed. Please try again.");
    } finally {
      setIsImporting(false);
    }
  }

  const validCount = rows.filter((r) => r.errors.length === 0).length;
  const invalidCount = rows.length - validCount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="font-serif text-xl font-medium text-gray-900">Import from CSV</h2>
            {step === "preview" && (
              <p className="mt-0.5 text-xs text-gray-500">
                {fileName} — {rows.length} row{rows.length !== 1 ? "s" : ""}
                {invalidCount > 0 && <span className="ml-1 text-amber-600">· {invalidCount} with errors</span>}
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto">
          {step === "pick" && (
            <div className="p-6 space-y-5">
              {/* drop zone */}
              <div
                className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
                  isDragging
                    ? "border-rose-400 bg-rose-50"
                    : "border-gray-200 bg-gray-50/60 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg className="h-10 w-10 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Drop your CSV here, or <span className="text-rose-600 underline underline-offset-2 cursor-pointer">browse</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-400">.csv files only</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </div>

              {parseError && (
                <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{parseError}</p>
              )}

              {/* expected columns */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Expected columns</p>
                <div className="flex flex-wrap gap-1.5">
                  {["id", "asin", "productName", "brand", "category", "amazonUrl", "affiliateUrl", "colorName", "hex", "seasonalPalette", "notes"].map((col) => (
                    <code key={col} className="rounded-md bg-white px-2 py-0.5 text-[11px] font-mono text-gray-700 ring-1 ring-gray-200">
                      {col}
                    </code>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-gray-400">
                  <strong className="text-gray-600">productName</strong> and <strong className="text-gray-600">seasonalPalette</strong> are required. Rows matching an existing <code className="font-mono">id</code> or <code className="font-mono">asin</code> will be updated; others will be added.
                </p>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="p-6">
              {/* summary pills */}
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                  {validCount} valid
                </span>
                {invalidCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                    {invalidCount} will be skipped
                  </span>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">#</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Color</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Product name</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Brand</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Palette</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((row) => (
                      <tr key={row.rowIndex} className={row.errors.length > 0 ? "bg-amber-50/40" : "hover:bg-gray-50/60"}>
                        <td className="px-3 py-2.5 text-xs text-gray-400">{row.rowIndex}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <ColorSwatch hex={row.data.hex || "#ccc"} />
                            <span className="hidden text-xs text-gray-400 lg:inline">{row.data.hex}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="font-medium text-gray-900 leading-snug">{row.data.productName || <span className="italic text-gray-400">—</span>}</p>
                          {row.data.colorName && <p className="text-xs text-gray-400">{row.data.colorName}</p>}
                        </td>
                        <td className="px-3 py-2.5 text-gray-600">{row.data.brand}</td>
                        <td className="px-3 py-2.5">
                          {row.data.seasonalPalette && PALETTE_SEASON[row.data.seasonalPalette]
                            ? <PaletteBadge palette={row.data.seasonalPalette} />
                            : <span className="text-xs text-amber-600">{row.data.seasonalPalette || "—"}</span>}
                        </td>
                        <td className="px-3 py-2.5">
                          {row.errors.length === 0 ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-600">
                              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                              Valid
                            </span>
                          ) : (
                            <div className="space-y-0.5">
                              {row.errors.map((e, i) => (
                                <p key={i} className="flex items-start gap-1 text-xs text-amber-700">
                                  <svg className="mt-px h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                                  {e}
                                </p>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === "done" && result && (
            <div className="flex flex-col items-center justify-center gap-6 p-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-7 w-7 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-serif text-xl font-medium text-gray-900">Import complete</h3>
                <p className="mt-1 text-sm text-gray-500">{fileName}</p>
              </div>
              <div className="flex gap-4">
                {result.added > 0 && (
                  <div className="rounded-xl bg-emerald-50 px-5 py-3 text-center ring-1 ring-emerald-200">
                    <p className="text-2xl font-semibold text-emerald-700">{result.added}</p>
                    <p className="mt-0.5 text-xs text-emerald-600">Added</p>
                  </div>
                )}
                {result.updated > 0 && (
                  <div className="rounded-xl bg-sky-50 px-5 py-3 text-center ring-1 ring-sky-200">
                    <p className="text-2xl font-semibold text-sky-700">{result.updated}</p>
                    <p className="mt-0.5 text-xs text-sky-600">Updated</p>
                  </div>
                )}
                {result.skipped > 0 && (
                  <div className="rounded-xl bg-amber-50 px-5 py-3 text-center ring-1 ring-amber-200">
                    <p className="text-2xl font-semibold text-amber-700">{result.skipped}</p>
                    <p className="mt-0.5 text-xs text-amber-600">Skipped</p>
                  </div>
                )}
              </div>
              {result.errors.length > 0 && (
                <div className="w-full rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-left">
                  <p className="mb-2 text-xs font-semibold text-amber-800">Skipped rows</p>
                  <ul className="space-y-1">
                    {result.errors.map((e, i) => (
                      <li key={i} className="text-xs text-amber-700">Row {e.rowIndex}: {e.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="border-t border-gray-100 px-6 py-4">
          {step === "pick" && (
            <div className="flex justify-end">
              <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          )}
          {step === "preview" && (
            <div className="flex items-center justify-between gap-4">
              <button type="button" onClick={() => { setStep("pick"); setRows([]); }} className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                ← Choose different file
              </button>
              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={validCount === 0 || isImporting}
                  className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {isImporting ? "Importing…" : `Import ${validCount} row${validCount !== 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          )}
          {step === "done" && (
            <div className="flex justify-end">
              <button type="button" onClick={onClose} className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── product form modal ───────────────────────────────────────────────────────

function ProductFormModal({ initial, onSave, onClose, isSaving }: {
  initial: FormData;
  onSave: (data: FormData) => void;
  onClose: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<FormData>(initial);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => { firstRef.current?.focus(); }, []);

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const isEdit = Boolean(initial.productName);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/95 px-6 py-4 backdrop-blur-sm">
          <h2 className="font-serif text-xl font-medium text-gray-900">{isEdit ? "Edit product" : "Add product"}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="p-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Product name *" span={2}>
              <input ref={firstRef} required value={form.productName} onChange={(e) => set("productName", e.target.value)} placeholder="Women's Peach Linen Midi Dress" className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Brand"><input value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Daily Ritual" className={inputCls} /></Field>
            <Field label="Retailer"><input value={form.retailer} onChange={(e) => set("retailer", e.target.value)} placeholder="Amazon" className={inputCls} /></Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Category"><input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Dresses" className={inputCls} /></Field>
            <Field label="ASIN"><input value={form.asin} onChange={(e) => set("asin", e.target.value)} placeholder="B0CKL8SPR1" className={inputCls} /></Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Amazon URL"><input type="url" value={form.amazonUrl} onChange={(e) => set("amazonUrl", e.target.value)} placeholder="https://amazon.com/dp/…" className={inputCls} /></Field>
            <Field label="Affiliate URL"><input type="url" value={form.affiliateUrl} onChange={(e) => set("affiliateUrl", e.target.value)} placeholder="https://amazon.com/dp/…?tag=…" className={inputCls} /></Field>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Color name"><input value={form.colorName} onChange={(e) => set("colorName", e.target.value)} placeholder="Soft Peach" className={inputCls} /></Field>
            <Field label="Hex color">
              <div className="flex gap-2">
                <input type="color" value={form.hex} onChange={(e) => set("hex", e.target.value)} className="h-[42px] w-12 shrink-0 cursor-pointer rounded-xl border border-gray-200 bg-white p-1" />
                <input value={form.hex} onChange={(e) => set("hex", e.target.value)} placeholder="#F5D0C5" className={inputCls} />
              </div>
            </Field>
            <Field label="Seasonal palette *">
              <select required value={form.seasonalPalette} onChange={(e) => set("seasonalPalette", e.target.value)} className={inputCls}>
                <option value="">Select palette…</option>
                {seasonalPaletteNames.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Price (USD)"><input type="number" min={0} step={0.01} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="42.99" className={inputCls} /></Field>
            <Field label="Image URL"><input type="url" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://…" className={inputCls} /></Field>
          </div>
          <Field label="Notes"><textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Optional internal notes…" className={`${inputCls} resize-none`} /></Field>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isSaving} className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 transition-colors">
              {isSaving ? "Saving…" : isEdit ? "Save changes" : "Add product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ product, onConfirm, onCancel, isDeleting }: {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="font-serif text-lg font-medium text-gray-900">Delete product?</h3>
        <p className="mt-2 text-sm text-gray-500">
          <span className="font-medium text-gray-800">{product.productName}</span> will be permanently removed. This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={isDeleting} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [paletteFilter, setPaletteFilter] = useState("");

  const [modal, setModal] = useState<{ mode: "add" } | { mode: "edit"; product: Product } | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to load products");
      setProducts(await res.json());
    } catch {
      setError("Could not load products.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      p.productName.toLowerCase().includes(q) ||
      (p.brand ?? "").toLowerCase().includes(q) ||
      (p.colorName ?? "").toLowerCase().includes(q) ||
      (p.category ?? "").toLowerCase().includes(q);
    const matchesPalette = !paletteFilter || p.seasonalPalette === paletteFilter;
    return matchesSearch && matchesPalette;
  });

  async function handleSave(data: FormData) {
    setIsSaving(true);
    try {
      const body = { ...data, price: data.price !== "" ? Number(data.price) : null };
      let res: Response;
      if (modal?.mode === "edit") {
        res = await fetch(`/api/products/${modal.product.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { errors?: string[] }).errors?.join(", ") ?? "Save failed");
      }
      setModal(null);
      await load();
      showToast(modal?.mode === "edit" ? "Product updated." : "Product added.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setDeleteTarget(null);
      await load();
      showToast("Product deleted.");
    } catch {
      alert("Delete failed.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <a href="/" className="text-gray-400 hover:text-gray-600 transition-colors" title="Back to site">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3H9v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
              </svg>
            </a>
            <div>
              <h1 className="font-serif text-xl font-medium text-gray-900">Product Admin</h1>
              <p className="text-xs text-gray-500">Seasonal Color Match</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v8.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3.75A.75.75 0 0110 3zm-7.25 11.5a.75.75 0 011.5 0v.75a1.75 1.75 0 001.75 1.75h8a1.75 1.75 0 001.75-1.75v-.75a.75.75 0 011.5 0v.75a3.25 3.25 0 01-3.25 3.25H6A3.25 3.25 0 012.75 15.25v-.75z" clipRule="evenodd" />
              </svg>
              Import CSV
            </button>
            <button
              onClick={() => setModal({ mode: "add" })}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Add product
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, brand, color…"
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-100/80"
            />
          </div>
          <select
            value={paletteFilter}
            onChange={(e) => setPaletteFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-100/80 sm:w-52"
          >
            <option value="">All palettes</option>
            {seasonalPaletteNames.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="shrink-0 text-sm text-gray-500">{filtered.length} of {products.length}</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-32 text-gray-400">
            <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button onClick={load} className="mt-4 text-sm font-medium text-gray-700 underline underline-offset-2">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center">
            <p className="text-gray-400">No products match your filters.</p>
            <button onClick={() => { setSearch(""); setPaletteFilter(""); }} className="mt-3 text-sm font-medium text-gray-700 underline underline-offset-2">Clear filters</button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Color</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Product</th>
                  <th className="hidden px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 sm:table-cell">Brand</th>
                  <th className="hidden px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 lg:table-cell">Category</th>
                  <th className="hidden px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 md:table-cell">Palette</th>
                  <th className="hidden px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 sm:table-cell">Price</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => (
                  <ProductRow key={p.id} product={p} onEdit={() => setModal({ mode: "edit", product: p })} onDelete={() => setDeleteTarget(p)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {modal && (
        <ProductFormModal
          initial={modal.mode === "edit" ? productToForm(modal.product) : EMPTY_FORM}
          onSave={handleSave}
          onClose={() => setModal(null)}
          isSaving={isSaving}
        />
      )}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImported={() => {
            load();
            showToast("Import complete.");
          }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm product={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} isDeleting={isDeleting} />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── product row ──────────────────────────────────────────────────────────────

function ProductRow({ product: p, onEdit, onDelete }: { product: Product; onEdit: () => void; onDelete: () => void }) {
  const productUrl = p.affiliateUrl || p.amazonUrl;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _light = hexIsLight(p.hex ?? "#000");

  return (
    <tr className="group hover:bg-gray-50/60 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <ColorSwatch hex={p.hex ?? "#ccc"} />
          <span className="hidden text-xs text-gray-500 lg:inline">{p.hex}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="space-y-0.5">
          {productUrl ? (
            <a href={productUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-900 hover:text-rose-700 hover:underline underline-offset-2 transition-colors">
              {p.productName}
            </a>
          ) : (
            <span className="font-medium text-gray-900">{p.productName}</span>
          )}
          {p.colorName && <p className="text-xs text-gray-400">{p.colorName}</p>}
        </div>
      </td>
      <td className="hidden px-4 py-3 text-gray-600 sm:table-cell">{p.brand}</td>
      <td className="hidden px-4 py-3 text-gray-600 lg:table-cell">{p.category}</td>
      <td className="hidden px-4 py-3 md:table-cell"><PaletteBadge palette={p.seasonalPalette} /></td>
      <td className="hidden px-4 py-3 text-gray-600 sm:table-cell">
        {p.price != null
          ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(p.price)
          : <span className="text-gray-400">—</span>}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors" title="Edit">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
            </svg>
          </button>
          <button onClick={onDelete} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
