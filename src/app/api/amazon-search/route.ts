import { NextRequest, NextResponse } from "next/server";
import { manualProducts } from "@/src/data/manualProducts";
import { seasonalPaletteNames } from "@/src/data/seasonalPalettes";
import { filterProducts } from "@/lib/filter-products";
import type { SeasonalPalette } from "@/src/data/seasonalPalettes";

function parseSelectedPalette(value: string | null): SeasonalPalette | null {
  if (!value || value.trim() === "" || value === "All palettes") {
    return null;
  }

  if (
    seasonalPaletteNames.includes(value as (typeof seasonalPaletteNames)[number])
  ) {
    return value as SeasonalPalette;
  }

  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const searchTerm = searchParams.get("q") ?? searchParams.get("search") ?? "";
  const paletteParam =
    searchParams.get("palette") ?? searchParams.get("selectedPalette") ?? "";
  const selectedPalette = parseSelectedPalette(paletteParam);

  const products = filterProducts(
    manualProducts,
    searchTerm,
    selectedPalette,
  );

  return NextResponse.json({
    products,
    searchTerm,
    selectedPalette,
  });
}
