import type { Product } from "./types";

const GENDER_PREFIXES = ["women's", "men's", "unisex"];

export function getBaseCategory(cat: string): string {
  return cat.replace(/^(Women's|Men's|Unisex)\s+/i, "");
}

function categoryHasGenderPrefix(cat: string): boolean {
  const lower = cat.toLowerCase();
  return GENDER_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

export function filterProducts(
  products: Product[],
  category: string,
  gender: string,
): Product[] {
  return products.filter((product) => {
    // Products without a gender prefix (e.g. "Tops", "Sweaters") match all genders
    const hasPrefix = categoryHasGenderPrefix(product.category);
    const matchesGender =
      !gender ||
      !hasPrefix ||
      product.category.toLowerCase().startsWith(gender.toLowerCase());
    const matchesCategory =
      !category || getBaseCategory(product.category) === category;
    return matchesGender && matchesCategory;
  });
}
