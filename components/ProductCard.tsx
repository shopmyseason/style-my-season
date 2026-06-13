import Image from "next/image";
import type { Product } from "@/lib/types";
import { MatchScoreBar } from "./MatchScoreBar";
import { getTopMatchingPalettes } from "@/lib/score-products";

type ProductCardProps = {
  product: Product;
  matchScore: number;
  hasAvoidWarning?: boolean;
  selectedPalette?: string | null;
};

function hexIsLight(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 160;
}

const PALETTE_SEASON: Record<string, string> = {
  "Light Spring": "Spring", "Warm Spring": "Spring", "Clear Spring": "Spring",
  "Light Summer": "Summer", "Soft Summer": "Summer", "Cool Summer": "Summer",
  "Soft Autumn": "Autumn", "Warm Autumn": "Autumn", "Deep Autumn": "Autumn",
  "Clear Winter": "Winter", "Cool Winter": "Winter", "Deep Winter": "Winter",
};

const SEASON_DOT: Record<string, string> = {
  Spring: "bg-amber-400",
  Summer: "bg-sky-400",
  Autumn: "bg-orange-400",
  Winter: "bg-violet-400",
};

const SEASON_TEXT: Record<string, string> = {
  Spring: "text-amber-800",
  Summer: "text-sky-800",
  Autumn: "text-orange-800",
  Winter: "text-violet-800",
};

export function ProductCard({
  product,
  matchScore,
  hasAvoidWarning = false,
  selectedPalette = null,
}: ProductCardProps) {
  const productUrl = product.affiliateUrl || product.amazonUrl;
  const textColor = hexIsLight(product.hex) ? "#4a4a4a" : "#f5f5f5";
  const topPalettes = getTopMatchingPalettes(product.hex).slice(0, 3);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-200/50">

      {/* Image — linked to product */}
      <a
        href={productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative aspect-[4/5] overflow-hidden block"
        style={{
          background: `linear-gradient(145deg, ${product.hex}cc 0%, ${product.hex} 100%)`,
        }}
        tabIndex={-1}
        aria-hidden
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.productName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
            <span
              className="h-14 w-14 rounded-full shadow-lg ring-4 ring-white/30"
              style={{ backgroundColor: product.hex }}
            />
            <span className="text-sm font-medium opacity-80" style={{ color: textColor }}>
              {product.colorName}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {hasAvoidWarning && (
          <div className="absolute bottom-3 left-3 right-3">
            <span className="flex items-center justify-center gap-1.5 rounded-lg bg-amber-50/95 px-3 py-1.5 text-[11px] font-medium text-amber-900 shadow-sm ring-1 ring-amber-200/80 backdrop-blur-sm">
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              Not ideal for this palette
            </span>
          </div>
        )}
      </a>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {product.category}
          </p>
          <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-gray-900 transition-colors group-hover:text-rose-800">
            <a href={productUrl} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-2">
              {product.productName}
            </a>
          </h3>
          {product.price != null && (
            <p className="text-xl font-semibold tracking-tight text-gray-900">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(product.price)}
            </p>
          )}
          {/* Color swatch — below price */}
          <div className="flex items-center gap-2 pt-0.5">
            <span
              className="h-4 w-4 shrink-0 rounded-full border border-black/10 shadow-inner"
              style={{ backgroundColor: product.hex }}
              title={product.colorName}
            />
            <span className="text-sm text-gray-500">{product.colorName}</span>
          </div>
        </div>

        {selectedPalette && <MatchScoreBar score={matchScore} />}

        {/* Top matching palettes */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Best palette matches
          </p>
          <ol className="space-y-1">
            {topPalettes.map((p, i) => {
              const season = PALETTE_SEASON[p.name] ?? "Spring";
              return (
                <li key={p.name} className="flex items-center gap-2">
                  <span className="w-3 text-[10px] font-medium text-gray-300 tabular-nums">{i + 1}</span>
                  <span className={`h-2 w-2 shrink-0 rounded-full ${SEASON_DOT[season]}`} />
                  <span className={`flex-1 text-xs font-medium ${SEASON_TEXT[season]}`}>{p.name}</span>
                  <span className="text-[11px] tabular-nums text-gray-400">{p.score}%</span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-auto border-t border-gray-50 pt-4">
          <a
            href={productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-xl bg-gray-900 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow-md"
          >
            View Product
          </a>
        </div>
      </div>
    </article>
  );
}
