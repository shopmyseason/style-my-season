import { seasonalPalettes } from "@/src/data/seasonalPalettes";
import {
  GOOD_MATCH_MIN_SCORE,
  getMatchScore,
  isNearAvoidColor,
} from "@/src/lib/colorMatch";
import type { Product } from "@/lib/types";
import type { SeasonalPalette } from "@/src/data/seasonalPalettes";

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
        ? isNearAvoidColor(product.hex, selectedPaletteData.avoidColors)
        : false;

      return { product, matchScore, hasAvoidWarning };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  if (!onlyGoodMatches) {
    return scored;
  }

  return scored.filter((item) => item.matchScore >= GOOD_MATCH_MIN_SCORE);
}
