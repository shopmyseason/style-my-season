import { promises as fs } from "fs";
import path from "path";
import type { Product } from "@/src/data/manualProducts";

const PRODUCTS_PATH = path.join(process.cwd(), "src/data/products.json");

export async function readProductsFile(): Promise<Product[]> {
  const raw = await fs.readFile(PRODUCTS_PATH, "utf-8");
  return JSON.parse(raw) as Product[];
}

export async function writeProductsFile(products: Product[]): Promise<void> {
  await fs.writeFile(PRODUCTS_PATH, JSON.stringify(products, null, 2) + "\n", "utf-8");
}
