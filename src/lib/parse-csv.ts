/**
 * RFC 4180-compliant CSV parser.
 * Handles quoted fields, embedded commas, embedded newlines, and escaped quotes ("").
 * Returns an array of objects keyed by the header row.
 */
export function parseCsv(raw: string): Record<string, string>[] {
  // Strip BOM if present
  const text = raw.startsWith("﻿") ? raw.slice(1) : raw;

  const rows = tokenize(text);
  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => h.trim());
  const records: Record<string, string>[] = [];

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i];
    // Skip completely blank rows
    if (cells.length === 1 && cells[0].trim() === "") continue;
    const record: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      record[headers[j]] = cells[j]?.trim() ?? "";
    }
    records.push(record);
  }

  return records;
}

/** Split raw CSV text into a 2-D array of cell strings. */
function tokenize(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          // Escaped quote
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(cell);
        cell = "";
      } else if (ch === "\r" && text[i + 1] === "\n") {
        row.push(cell);
        cell = "";
        rows.push(row);
        row = [];
        i += 2;
        continue;
      } else if (ch === "\n" || ch === "\r") {
        row.push(cell);
        cell = "";
        rows.push(row);
        row = [];
      } else {
        cell += ch;
      }
    }
    i++;
  }

  // Last cell / row
  row.push(cell);
  if (row.some((c) => c.trim() !== "")) {
    rows.push(row);
  }

  return rows;
}

// ─── domain-specific mapping ──────────────────────────────────────────────────

import { seasonalPaletteNames } from "@/src/data/seasonalPalettes";
import type { Product } from "@/src/data/manualProducts";

export type CsvRow = {
  raw: Record<string, string>;
  data: Omit<Product, "id"> & { id?: string };
  errors: string[];
  rowIndex: number;
};

const VALID_PALETTES = new Set<string>(seasonalPaletteNames);

/** Parse raw CSV records into typed, validated rows. */
export function mapCsvRows(records: Record<string, string>[]): CsvRow[] {
  return records.map((raw, i) => {
    const errors: string[] = [];

    const productName =
      raw.productName ?? raw.product_name ?? raw["product name"] ?? raw["Product Name"] ?? "";
    if (!productName) errors.push("productName is required");

    const seasonalPalette =
      raw.seasonalPalette ?? raw.seasonal_palette ?? raw["seasonal palette"] ?? raw["Seasonal Palette"] ?? "";
    if (!seasonalPalette) {
      errors.push("seasonalPalette is required");
    } else if (!VALID_PALETTES.has(seasonalPalette)) {
      errors.push(`"${seasonalPalette}" is not a valid palette`);
    }

    const priceRaw = raw.price ?? "";
    const price = priceRaw !== "" ? parseFloat(priceRaw) : undefined;
    if (priceRaw !== "" && isNaN(price!)) {
      errors.push("price must be a number");
    }

    const hex = (raw.hex ?? raw.hex_color ?? raw["hex color"] ?? "").trim() || "#000000";

    const data: Omit<Product, "id"> & { id?: string } = {
      id: raw.id?.trim() || undefined,
      asin: raw.asin ?? "",
      productName,
      brand: raw.brand ?? "",
      retailer: raw.retailer ?? "Amazon",
      category: raw.category ?? "",
      amazonUrl: raw.amazonUrl ?? raw.amazon_url ?? raw["amazon url"] ?? "",
      affiliateUrl: raw.affiliateUrl ?? raw.affiliate_url ?? raw["affiliate url"] ?? "",
      colorName: raw.colorName ?? raw.color_name ?? raw["color name"] ?? "",
      hex,
      seasonalPalette: seasonalPalette as Product["seasonalPalette"],
      price: priceRaw !== "" && !isNaN(price!) ? price : undefined,
      imageUrl: raw.imageUrl ?? raw.image_url ?? raw["image url"] ?? "",
      notes: raw.notes ?? "",
    };

    return { raw, data, errors, rowIndex: i + 2 }; // +2 = 1-based + header row
  });
}
