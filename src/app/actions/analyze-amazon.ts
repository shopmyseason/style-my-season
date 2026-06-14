"use server";

import Anthropic from "@anthropic-ai/sdk";
import { readProductsFile, writeProductsFile } from "@/src/lib/products-store";
import { seasonalPaletteNames, type SeasonalPalette } from "@/src/data/seasonalPalettes";

export type AnalyzedVariant = {
  productName: string;
  brand: string;
  category: string;
  asin: string;
  amazonUrl: string;
  affiliateUrl: string;
  colorName: string;
  hex: string;
  seasonalPalette: SeasonalPalette;
  price: number | null;
  imageUrl: string;
  notes: string;
};

export type AnalyzeResult =
  | { ok: true; variants: AnalyzedVariant[] }
  | { ok: false; error: string };

function extractAsin(url: string): string | null {
  const m = url.match(/\/dp\/([A-Z0-9]{10})/i) ?? url.match(/\/gp\/product\/([A-Z0-9]{10})/i);
  return m ? m[1].toUpperCase() : null;
}

function buildAffiliateUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?linkCode=ll2&tag=gracecounselo-20&language=en_US&ref_=as_li_ss_tl`;
}

type PageData = {
  title: string;
  brand: string;
  price: number | null;
  colors: { name: string; imageUrl: string }[];
};

function parseAmazonPage(html: string): PageData {
  const title = html.match(/<span id="productTitle"[^>]*>\s*([^<]+)\s*<\/span>/)?.[1]?.trim() ?? "";
  const brand =
    html.match(/(?:by|Brand)[:\s]+<[^>]+>([^<]+)<\/a>/i)?.[1]?.trim() ??
    html.match(/"brand"\s*:\s*"([^"]+)"/)?.[1]?.trim() ??
    "";
  const priceStr = html.match(/class="a-price-whole">(\d+)/)?.[1];
  const price = priceStr ? parseFloat(priceStr) : null;

  // Extract colorImages block — a reliable JSON blob Amazon embeds in every product page
  const colors: { name: string; imageUrl: string }[] = [];
  const start = html.indexOf('"colorImages":{');
  if (start !== -1) {
    const sub = html.slice(start, start + 20000);
    const matches = [...sub.matchAll(/"([A-Za-z][A-Za-z0-9 /&-]+)":\[\{"large":"([^"]+)","thumb":"[^"]+","hiRes":"([^"]+)"/g)];
    for (const m of matches) {
      const name = m[1];
      if (["large", "thumb", "hiRes", "variant", "main"].includes(name)) continue;
      colors.push({ name, imageUrl: m[3] || m[2] });
    }
  }

  return { title, brand, price, colors };
}

export async function analyzeAmazonUrl(url: string): Promise<AnalyzeResult> {
  const asin = extractAsin(url);
  if (!asin) {
    return { ok: false, error: "Could not find an ASIN in that URL. Make sure it's an Amazon product link." };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "ANTHROPIC_API_KEY is not set. Add it to your .env.local file." };
  }

  // Fetch the Amazon page and extract structured data directly
  let pageData: PageData = { title: "", brand: "", price: null, colors: [] };
  try {
    const res = await fetch(`https://www.amazon.com/dp/${asin}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (res.ok) {
      pageData = parseAmazonPage(await res.text());
    }
  } catch {
    // Continue with empty pageData
  }

  const client = new Anthropic({ apiKey });
  const paletteList = seasonalPaletteNames.join(", ");

  // Build color list for Claude — either from page parse or ask it to estimate
  const colorContext = pageData.colors.length > 0
    ? `The product has these color variations (already extracted from the page):\n${pageData.colors.map(c => `- ${c.name}`).join("\n")}\n\nProduct title: ${pageData.title || "(unknown)"}\nBrand: ${pageData.brand || "(unknown)"}`
    : `ASIN: ${asin}\nProduct URL: https://www.amazon.com/dp/${asin}\n(Page HTML unavailable — estimate typical color options for this type of clothing item and return at least 6–10 common colors.)`;

  const prompt = `You are helping categorize Amazon clothing products for a seasonal color analysis shopping site.

${colorContext}

For each color variant return a JSON object with:
- productName: full product name (same for all variants)${pageData.title ? ` — use "${pageData.title}"` : ""}
- brand: brand name${pageData.brand ? ` — use "${pageData.brand}"` : ""}
- category: pick the best match from: "Women's Dresses", "Women's Maxi Dresses", "Women's Tops", "Women's T-Shirts", "Women's Blouses", "Women's Blazers", "Women's Skirts", "Women's Pants", "Women's Shorts", "Women's Cardigans", "Women's Sweaters", "Women's Coats", "Women's Jumpsuits", "Women's Polo Shirts", "Men's T-Shirts", "Men's Shirts", "Men's Pants", "Men's Shorts", "Men's Blazers", "Men's Sweaters", "Men's Coats", "Unisex Tops", "Unisex Bottoms"
- asin: "${asin}"
- colorName: the color name exactly as listed
- hex: your best hex estimate for this color (e.g. "Navy Blue" → "#1a2d5a", "Ivory" → "#FFFFF0")
- seasonalPalette: which of these 12 palettes best fits this color: ${paletteList}
- price: ${pageData.price != null ? pageData.price : "null (unknown)"}
- imageUrl: "" (images are handled separately)
- notes: ""

Return ONLY a valid JSON array, no explanation or markdown fences.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    const json = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const raw = JSON.parse(json) as Record<string, unknown>[];

    if (!Array.isArray(raw) || raw.length === 0) {
      return { ok: false, error: "Claude did not return any product variants. Try again or check the URL." };
    }

    // Build a lookup of color name → imageUrl from page parse
    const imageByColor = new Map(pageData.colors.map(c => [c.name.toLowerCase(), c.imageUrl]));

    const variants: AnalyzedVariant[] = raw.map((v) => {
      const colorName = String(v.colorName ?? "");
      // Match image by exact color name (case-insensitive)
      const imageUrl = imageByColor.get(colorName.toLowerCase()) ?? "";
      return {
        productName: String(v.productName ?? ""),
        brand: String(v.brand ?? ""),
        category: String(v.category ?? ""),
        asin: String(v.asin ?? asin),
        amazonUrl: `https://www.amazon.com/dp/${asin}`,
        affiliateUrl: buildAffiliateUrl(asin),
        colorName,
        hex: String(v.hex ?? "#888888"),
        seasonalPalette: (seasonalPaletteNames.includes(v.seasonalPalette as SeasonalPalette)
          ? v.seasonalPalette
          : "Light Spring") as SeasonalPalette,
        price: pageData.price ?? (v.price != null && v.price !== "" ? Number(v.price) : null),
        imageUrl,
        notes: String(v.notes ?? ""),
      };
    });

    return { ok: true, variants };
  } catch (err) {
    return {
      ok: false,
      error: `Analysis failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export async function saveVariants(variants: AnalyzedVariant[]): Promise<{ saved: number }> {
  const products = await readProductsFile();
  const byAsin = new Map(products.map((p) => [p.asin, p]));

  let saved = 0;
  for (const v of variants) {
    const existing = byAsin.get(v.asin);
    // Generate a unique id for truly new entries (different color = new row)
    const id = existing?.colorName === v.colorName
      ? existing.id
      : `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

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
      products[existingIdx] = product;
    } else {
      products.push(product);
    }
    saved++;
  }

  await writeProductsFile(products);
  return { saved };
}
