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

export async function analyzeAmazonUrl(url: string): Promise<AnalyzeResult> {
  const asin = extractAsin(url);
  if (!asin) {
    return { ok: false, error: "Could not find an ASIN in that URL. Make sure it's an Amazon product link." };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "ANTHROPIC_API_KEY is not set. Add it to your .env.local file." };
  }

  // Fetch the Amazon page server-side
  let pageHtml = "";
  try {
    const res = await fetch(`https://www.amazon.com/dp/${asin}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (res.ok) {
      const full = await res.text();
      // Strip scripts/styles to reduce token usage, keep structure
      pageHtml = full
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .slice(0, 60000);
    }
  } catch {
    // Continue without HTML — Claude will work from URL/ASIN alone
  }

  const client = new Anthropic({ apiKey });

  const paletteList = seasonalPaletteNames.join(", ");

  const prompt = `You are helping categorize Amazon clothing products for a seasonal color analysis shopping site.

ASIN: ${asin}
Amazon URL: https://www.amazon.com/dp/${asin}
${pageHtml ? `\nPage HTML (truncated):\n${pageHtml}` : "\n(Page HTML unavailable — use your general knowledge of Amazon products to identify likely color options for this type of item.)"}

IMPORTANT: Return ALL color variations for this product — most clothing items on Amazon have 5–15+ color options. Do NOT return just one. If the page HTML is unavailable, use your knowledge of typical color options for this type of clothing item and return at least 6–10 common colors (e.g. black, white, navy, red, green, beige, pink, blue, grey, burgundy). It is better to include more variants than to miss some.

For each color variant return a JSON object with:
- productName: full product name (same for all variants)
- brand: brand name
- category: pick the best match from: "Women's Dresses", "Women's Maxi Dresses", "Women's Tops", "Women's T-Shirts", "Women's Blouses", "Women's Blazers", "Women's Skirts", "Women's Pants", "Women's Shorts", "Women's Cardigans", "Women's Sweaters", "Women's Coats", "Women's Jumpsuits", "Women's Polo Shirts", "Men's T-Shirts", "Men's Shirts", "Men's Pants", "Men's Shorts", "Men's Blazers", "Men's Sweaters", "Men's Coats", "Unisex Tops", "Unisex Bottoms"
- asin: the ASIN (use the same ASIN for all unless you know the per-variant ASIN)
- colorName: the color name as Amazon lists it
- hex: your best hex estimate for this color (e.g. "Navy Blue" → "#1a2d5a", "Ivory" → "#FFFFF0")
- seasonalPalette: which of these 12 palettes best fits this color: ${paletteList}
- price: price as a number (e.g. 29.99), or null if unknown
- imageUrl: product image URL if visible in the HTML, otherwise ""
- notes: any relevant notes, or ""

Return ONLY a valid JSON array, no explanation or markdown fences.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    // Strip markdown code fences if present
    const json = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const raw = JSON.parse(json) as Record<string, unknown>[];

    if (!Array.isArray(raw) || raw.length === 0) {
      return { ok: false, error: "Claude did not return any product variants. The page may have been blocked." };
    }

    const variants: AnalyzedVariant[] = raw.map((v) => ({
      productName: String(v.productName ?? ""),
      brand: String(v.brand ?? ""),
      category: String(v.category ?? ""),
      asin: String(v.asin ?? asin),
      amazonUrl: `https://www.amazon.com/dp/${String(v.asin ?? asin)}`,
      affiliateUrl: buildAffiliateUrl(String(v.asin ?? asin)),
      colorName: String(v.colorName ?? ""),
      hex: String(v.hex ?? "#888888"),
      seasonalPalette: (seasonalPaletteNames.includes(v.seasonalPalette as SeasonalPalette)
        ? v.seasonalPalette
        : "Light Spring") as SeasonalPalette,
      price: v.price != null && v.price !== "" ? Number(v.price) : null,
      imageUrl: String(v.imageUrl ?? ""),
      notes: String(v.notes ?? ""),
    }));

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
