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

export const manualProducts: Product[] = [
  {
    id: "man-001",
    asin: "B0CKL8SPR1",
    productName: "Women's Peach Linen Midi Dress",
    brand: "Daily Ritual",
    retailer: "Amazon",
    category: "Dresses",
    amazonUrl: "https://www.amazon.com/dp/B0CKL8SPR1",
    affiliateUrl: "https://www.amazon.com/dp/B0CKL8SPR1?tag=shopmyseason-20",
    colorName: "Soft Peach",
    hex: "#F5D0C5",
    seasonalPalette: "Light Spring",
    price: 42.99,
    notes: "Lightweight linen, perfect for warm weather",
  },
  {
    id: "man-002",
    asin: "B0CKAUTM03",
    productName: "Warm Rust Crewneck Knit Sweater",
    brand: "Amazon Essentials",
    retailer: "Amazon",
    category: "Sweaters",
    amazonUrl: "https://www.amazon.com/dp/B0CKAUTM03",
    affiliateUrl: "https://www.amazon.com/dp/B0CKAUTM03?tag=shopmyseason-20",
    colorName: "Warm Rust",
    hex: "#B85C38",
    seasonalPalette: "Warm Autumn",
    price: 41.99,
  },
  {
    id: "man-003",
    asin: "B0CKWINT01",
    productName: "Clear Cobalt Cocktail Dress",
    brand: "Lark & Ro",
    retailer: "Amazon",
    category: "Dresses",
    amazonUrl: "https://www.amazon.com/dp/B0CKWINT01",
    affiliateUrl: "https://www.amazon.com/dp/B0CKWINT01?tag=shopmyseason-20",
    colorName: "Clear Cobalt",
    hex: "#2563EB",
    seasonalPalette: "Clear Winter",
    price: 62.99,
    notes: "Great for formal events",
  },
  {
    id: "man-004",
    asin: "B0CKSMMR01",
    productName: "Powder Lavender Chiffon Blouse",
    brand: "Floern",
    retailer: "Amazon",
    category: "Blouses",
    amazonUrl: "https://www.amazon.com/dp/B0CKSMMR01",
    affiliateUrl: "https://www.amazon.com/dp/B0CKSMMR01?tag=shopmyseason-20",
    colorName: "Powder Lavender",
    hex: "#D4C4E8",
    seasonalPalette: "Light Summer",
    notes: "No price yet — check Amazon for current listing",
  },
  {
    id: "man-005",
    asin: "B0CKAUTM07",
    productName: "Terracotta Wide-Leg Linen Pants",
    brand: "The Drop",
    retailer: "Amazon",
    category: "Pants",
    amazonUrl: "https://www.amazon.com/dp/B0CKAUTM07",
    affiliateUrl: "https://www.amazon.com/dp/B0CKAUTM07?tag=shopmyseason-20",
    colorName: "Terracotta",
    hex: "#C08068",
    seasonalPalette: "Soft Autumn",
    price: 45.99,
  },
];
