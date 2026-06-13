import type { AvoidColor, PaletteColor } from "@/src/data/seasonalPalettes";

export type Rgb = {
  r: number;
  g: number;
  b: number;
};

/** Maximum Euclidean distance between two sRGB colors (black ↔ white). */
export const MAX_RGB_DISTANCE = Math.sqrt(3 * 255 ** 2);

export function hexToRgb(hex: string): Rgb | null {
  const normalized = hex.trim().replace(/^#/, "");

  if (normalized.length === 3) {
    const r = Number.parseInt(normalized[0] + normalized[0], 16);
    const g = Number.parseInt(normalized[1] + normalized[1], 16);
    const b = Number.parseInt(normalized[2] + normalized[2], 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return { r, g, b };
  }

  if (normalized.length === 6) {
    const r = Number.parseInt(normalized.slice(0, 2), 16);
    const g = Number.parseInt(normalized.slice(2, 4), 16);
    const b = Number.parseInt(normalized.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return { r, g, b };
  }

  return null;
}

export function colorDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  if (!rgb1 || !rgb2) {
    return MAX_RGB_DISTANCE;
  }

  return Math.sqrt(
    (rgb1.r - rgb2.r) ** 2 +
      (rgb1.g - rgb2.g) ** 2 +
      (rgb1.b - rgb2.b) ** 2,
  );
}

export function distanceToMatchScore(distance: number): number {
  const raw = 100 - (distance / MAX_RGB_DISTANCE) * 100;
  return Math.round(Math.min(100, Math.max(0, raw)));
}

/**
 * Compares a product color to every color in a palette and returns the best
 * match score (0–100), based on the smallest RGB distance.
 */
export function compareProductToPalette(
  productHex: string,
  paletteColors: PaletteColor[],
): number {
  if (paletteColors.length === 0) {
    return 0;
  }

  const closestDistance = Math.min(
    ...paletteColors.map((color) => colorDistance(productHex, color.hex)),
  );

  return distanceToMatchScore(closestDistance);
}

export function getMatchScore(
  productHex: string,
  paletteColors: PaletteColor[],
): number {
  return compareProductToPalette(productHex, paletteColors);
}

export const GOOD_MATCH_MIN_SCORE = 75;

/** Minimum similarity to an avoid color (0–100) before showing a warning. */
export const AVOID_COLOR_CLOSE_SCORE = 82;

export function isNearAvoidColor(
  productHex: string,
  avoidColors: AvoidColor[],
  goodColorScore: number,
): boolean {
  if (avoidColors.length === 0) {
    return false;
  }

  // If the color already matches the palette's good colors well, don't warn —
  // the scoring tells the real story and an avoid warning would be contradictory.
  if (goodColorScore >= GOOD_MATCH_MIN_SCORE) {
    return false;
  }

  const avoidAsPalette = avoidColors.map((color) => ({
    name: color.name,
    hex: color.hex,
  }));

  return getMatchScore(productHex, avoidAsPalette) >= AVOID_COLOR_CLOSE_SCORE;
}

export type MatchTier = "excellent" | "good" | "possible" | "poor";

export type MatchLabel = {
  label: string;
  tier: MatchTier;
};

export function getMatchLabel(score: number): MatchLabel {
  if (score >= 90) {
    return { label: "Excellent Match", tier: "excellent" };
  }
  if (score >= 75) {
    return { label: "Good Match", tier: "good" };
  }
  if (score >= 60) {
    return { label: "Possible Match", tier: "possible" };
  }
  return { label: "Poor Match", tier: "poor" };
}
