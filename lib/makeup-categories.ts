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

export function isMakeupProduct(category: string): boolean {
  const lower = category.toLowerCase();
  return MAKEUP_CATEGORIES.some((mc) => lower.includes(mc));
}
