import { NextRequest, NextResponse } from "next/server";
import { readProductsFile, writeProductsFile } from "@/src/lib/products-store";
import type { Product } from "@/src/data/manualProducts";
import { seasonalPaletteNames } from "@/src/data/seasonalPalettes";
import { randomUUID } from "crypto";

export async function GET() {
  const products = await readProductsFile();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const errors = validateProductBody(body);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const products = await readProductsFile();
  const newProduct: Product = {
    id: `prod-${randomUUID().slice(0, 8)}`,
    asin: body.asin ?? "",
    productName: body.productName,
    brand: body.brand ?? "",
    retailer: body.retailer ?? "",
    category: body.category ?? "",
    amazonUrl: body.amazonUrl ?? "",
    affiliateUrl: body.affiliateUrl ?? "",
    colorName: body.colorName ?? "",
    hex: body.hex ?? "#000000",
    seasonalPalette: body.seasonalPalette,
    price: body.price != null && body.price !== "" ? Number(body.price) : undefined,
    imageUrl: body.imageUrl ?? "",
    notes: body.notes ?? "",
  };

  products.push(newProduct);
  await writeProductsFile(products);

  return NextResponse.json(newProduct, { status: 201 });
}

function validateProductBody(body: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (!body.productName || typeof body.productName !== "string") {
    errors.push("productName is required");
  }
  if (
    !body.seasonalPalette ||
    !seasonalPaletteNames.includes(
      body.seasonalPalette as (typeof seasonalPaletteNames)[number],
    )
  ) {
    errors.push("seasonalPalette must be a valid palette name");
  }
  return errors;
}
