import { NextRequest, NextResponse } from "next/server";
import { readProductsFile } from "@/src/lib/products-store";
import { seasonalPaletteNames } from "@/src/data/seasonalPalettes";
import { filterProducts } from "@/lib/filter-products";
import { isMakeupProduct } from "@/lib/makeup-categories";
import type { SeasonalPalette } from "@/src/data/seasonalPalettes";

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
  const gender = searchParams.get("gender") ?? "";
  const paletteParam = searchParams.get("palette") ?? searchParams.get("selectedPalette") ?? "";
  const selectedPalette = parseSelectedPalette(paletteParam);

  const allProducts = await readProductsFile();
  const clothingProducts = allProducts.filter((p) => !isMakeupProduct(p.category));
  const products = filterProducts(clothingProducts, category, gender);

  return NextResponse.json({ products, category, gender, selectedPalette });
}
