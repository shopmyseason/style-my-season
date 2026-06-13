import type { SeasonalPalette } from "@/src/data/seasonalPalettes";

export type Product = {
  id: string;
  asin: string;
  productName: string;
  brand: string;
  retailer: string;
  category: string;
  amazonUrl: string;
  affiliateUrl: string;
  colorName: string;
  hex: string;
  seasonalPalette: SeasonalPalette;
  price?: number;
  imageUrl?: string;
  notes?: string;
};
