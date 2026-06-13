import { NextRequest, NextResponse } from "next/server";
import { readProductsFile, writeProductsFile } from "@/src/lib/products-store";
import type { SeasonalPalette } from "@/src/data/seasonalPalettes";
import type { AnalyzedVariant } from "@/src/app/actions/analyze-amazon";

export async function POST(request: NextRequest) {
  try {
    const variants = (await request.json()) as AnalyzedVariant[];
    const products = await readProductsFile();

    let saved = 0;
    for (const v of variants) {
      const id =
        `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      const product = {
        id,
        asin: v.asin,
        productName: v.productName,
        brand: v.brand,
        retailer: "Amazon",
        category: v.category,
        amazonUrl: v.amazonUrl,
        affiliateUrl: v.affiliateUrl,
        colorName: v.colorName,
        hex: v.hex,
        seasonalPalette: v.seasonalPalette as SeasonalPalette,
        ...(v.price != null ? { price: v.price } : {}),
        ...(v.imageUrl ? { imageUrl: v.imageUrl } : {}),
        ...(v.notes ? { notes: v.notes } : {}),
      };

      const existingIdx = products.findIndex(
        (p) => p.asin === v.asin && p.colorName === v.colorName,
      );
      if (existingIdx >= 0) {
        products[existingIdx] = { ...products[existingIdx], ...product, id: products[existingIdx].id };
      } else {
        products.push(product);
      }
      saved++;
    }

    await writeProductsFile(products);
    return NextResponse.json({ saved });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Save failed" },
      { status: 500 },
    );
  }
}
