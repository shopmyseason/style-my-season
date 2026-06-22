import { NextRequest, NextResponse } from "next/server";
import { readProductsFile } from "@/src/lib/products-store";
import { seasonalPaletteNames } from "@/src/data/seasonalPalettes";
import type { SeasonalPalette } from "@/src/data/seasonalPalettes";

import { isMakeupProduct } from "@/lib/makeup-categories";

function parseSelectedPalette(value: string | null): SeasonalPalette | null {
  if (!value || value.trim() === "" || value === "All palettes") {
    return null;
  }
  if (seasonalPaletteNames.includes(value as (typeof seasonalPaletteNames)[number])) {
    return value as SeasonalPalette;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category") ?? "";
  const paletteParam = searchParams.get("palette") ?? "";
  const selectedPalette = parseSelectedPalette(paletteParam);

  const allProducts = await readProductsFile();
  let products = allProducts.filter((p) => isMakeupProduct(p.category));

  if (category) {
    const lowerCat = category.toLowerCase();
    products = products.filter((p) => p.category.toLowerCase().includes(lowerCat));
  }

  return NextResponse.json({ products, category, selectedPalette });
}
