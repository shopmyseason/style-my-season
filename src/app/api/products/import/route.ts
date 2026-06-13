import { NextRequest, NextResponse } from "next/server";
import { readProductsFile, writeProductsFile } from "@/src/lib/products-store";
import { seasonalPaletteNames } from "@/src/data/seasonalPalettes";
import type { Product } from "@/src/data/manualProducts";
import { randomUUID } from "crypto";

type ImportRow = Omit<Product, "id"> & { id?: string };

type ImportResult = {
  added: number;
  updated: number;
  skipped: number;
  errors: { rowIndex: number; message: string }[];
};

const VALID_PALETTES = new Set<string>(seasonalPaletteNames);

export async function POST(request: NextRequest) {
  const body = await request.json() as { rows: { data: ImportRow; rowIndex: number }[] };

  if (!Array.isArray(body?.rows)) {
    return NextResponse.json({ error: "Expected { rows: [...] }" }, { status: 400 });
  }

  const existing = await readProductsFile();
  const byId = new Map(existing.map((p) => [p.id, p]));
  const byAsin = new Map(existing.filter((p) => p.asin).map((p) => [p.asin, p]));

  const result: ImportResult = { added: 0, updated: 0, skipped: 0, errors: [] };
  const updated = [...existing];

  for (const { data, rowIndex } of body.rows) {
    // Server-side validation
    if (!data.productName?.trim()) {
      result.errors.push({ rowIndex, message: "productName is required" });
      result.skipped++;
      continue;
    }
    if (!VALID_PALETTES.has(data.seasonalPalette)) {
      result.errors.push({ rowIndex, message: `"${data.seasonalPalette}" is not a valid palette` });
      result.skipped++;
      continue;
    }

    const product: Product = {
      id: data.id?.trim() || `prod-${randomUUID().slice(0, 8)}`,
      asin: data.asin ?? "",
      productName: data.productName.trim(),
      brand: data.brand ?? "",
      retailer: data.retailer ?? "Amazon",
      category: data.category ?? "",
      amazonUrl: data.amazonUrl ?? "",
      affiliateUrl: data.affiliateUrl ?? "",
      colorName: data.colorName ?? "",
      hex: data.hex ?? "#000000",
      seasonalPalette: data.seasonalPalette,
      price: data.price ?? undefined,
      imageUrl: data.imageUrl ?? "",
      notes: data.notes ?? "",
    };

    // Upsert: match by id first, then asin
    const existingById = data.id ? byId.get(data.id) : undefined;
    const existingByAsin = data.asin ? byAsin.get(data.asin) : undefined;
    const match = existingById ?? existingByAsin;

    if (match) {
      const idx = updated.findIndex((p) => p.id === match.id);
      updated[idx] = { ...match, ...product, id: match.id };
      result.updated++;
    } else {
      updated.push(product);
      result.added++;
    }
  }

  await writeProductsFile(updated);

  return NextResponse.json(result);
}
