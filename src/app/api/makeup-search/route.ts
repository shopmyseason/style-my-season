import { NextRequest, NextResponse } from "next/server";
import { readProductsFile } from "@/src/lib/products-store";
import { seasonalPaletteNames } from "@/src/data/seasonalPalettes";
import type { SeasonalPalette } from "@/src/data/seasonalPalettes";

const MAKEUP_CATEGORIES = [
  "lipstick",
  "lip gloss",
  "lip liner",
  "blush",
  "eyeshadow",
  "eye shadow",
  "eyeliner",
  "mascara",
  "foundation",
  "concealer",
  "bronzer",
  "highlighter",
  "makeup",
  "cosmetics",
  "nail polish",
  "lip",
  "rouge",
  "powder",
  "primer",
];

function isMakeupProduct(category: string): boolean {
  const lower = category.toLowerCase();
  return MAKEUP_CATEGORIES.some((mc) => lower.includes(mc));
}

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
