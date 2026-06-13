import type { Product, SeasonalPalette } from "./types";

export function filterProducts(
  products: Product[],
  searchQuery: string,
  selectedPalette: SeasonalPalette | null,
): Product[] {
  const query = searchQuery.trim().toLowerCase();

  return products.filter((product) => {
    const matchesPalette =
      selectedPalette === null ||
      product.seasonalPalette === selectedPalette;

    const matchesName =
      query.length === 0 || product.productName.toLowerCase().includes(query);

    return matchesPalette && matchesName;
  });
}
