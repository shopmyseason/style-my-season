import { seasonalPalettes } from "@/src/data/seasonalPalettes";
import {
  GOOD_MATCH_MIN_SCORE,
  getMatchScore,
  isNearAvoidColor,
} from "@/src/lib/colorMatch";

/** Minimum score to show a product when a palette filter is active. */
const PALETTE_FILTER_MIN_SCORE = 50;
import type { Product } from "@/lib/types";
import type { SeasonalPalette } from "@/src/data/seasonalPalettes";

export type PaletteMatch = {
  name: string;
  score: number;
};

/** Returns all palettes sorted by match score descending. */
export function getTopMatchingPalettes(hex: string): PaletteMatch[] {
  return seasonalPalettes
    .map((p) => ({ name: p.name, score: getMatchScore(hex, p.colors) }))
    .sort((a, b) => b.score - a.score);
}

export type ScoredProduct = {
  product: Product;
  matchScore: number;
  hasAvoidWarning: boolean;
};

export function scoreAndSortProducts(
  products: Product[],
  selectedPalette: SeasonalPalette | null,
  onlyGoodMatches: boolean,
): ScoredProduct[] {
  const scored = products
    .map((product) => {
      const scorePaletteName = selectedPalette ?? product.seasonalPalette;
      const scorePalette = seasonalPalettes.find(
        (p) => p.name === scorePaletteName,
      );
      const matchScore = scorePalette
        ? getMatchScore(product.hex, scorePalette.colors)
        : 0;

      const selectedPaletteData = selectedPalette
        ? seasonalPalettes.find((p) => p.name === selectedPalette)
        : undefined;
      const hasAvoidWarning = selectedPaletteData
        ? isNearAvoidColor(product.hex, selectedPaletteData.avoidColors, matchScore)
        : false;

      return { product, matchScore, hasAvoidWarning };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  // When a palette is active, drop products that don't meet the minimum threshold.
  const paletteFiltered = selectedPalette
    ? scored.filter((item) => item.matchScore >= PALETTE_FILTER_MIN_SCORE)
    : scored;

  if (!onlyGoodMatches) {
    return paletteFiltered;
  }

  return paletteFiltered.filter((item) => item.matchScore >= GOOD_MATCH_MIN_SCORE);
}
