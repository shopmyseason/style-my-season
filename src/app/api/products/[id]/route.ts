import { NextRequest, NextResponse } from "next/server";
import { readProductsFile, writeProductsFile } from "@/src/lib/products-store";
import { seasonalPaletteNames } from "@/src/data/seasonalPalettes";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  const products = await readProductsFile();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (
    body.seasonalPalette &&
    !seasonalPaletteNames.includes(
      body.seasonalPalette as (typeof seasonalPaletteNames)[number],
    )
  ) {
    return NextResponse.json(
      { error: "Invalid seasonalPalette" },
      { status: 400 },
    );
  }

  const updated = {
    ...products[index],
    ...body,
    id,
    price:
      body.price != null && body.price !== ""
        ? Number(body.price)
        : body.price === "" || body.price === null
          ? null
          : products[index].price,
  };

  products[index] = updated;
  await writeProductsFile(products);

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  const products = await readProductsFile();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  products.splice(index, 1);
  await writeProductsFile(products);

  return NextResponse.json({ success: true });
}
