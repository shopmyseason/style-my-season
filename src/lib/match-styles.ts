import type { MatchTier } from "@/src/lib/colorMatch";

export function getMatchTierStyles(tier: MatchTier) {
  switch (tier) {
    case "excellent":
      return {
        bar: "bg-gradient-to-r from-rose-400 to-rose-600",
        text: "text-rose-700",
        badge: "bg-rose-50 text-rose-800 border-rose-100",
        dot: "bg-rose-500",
      };
    case "good":
      return {
        bar: "bg-gradient-to-r from-emerald-400 to-emerald-600",
        text: "text-emerald-700",
        badge: "bg-emerald-50 text-emerald-800 border-emerald-100",
        dot: "bg-emerald-500",
      };
    case "possible":
      return {
        bar: "bg-gradient-to-r from-amber-300 to-amber-500",
        text: "text-amber-800",
        badge: "bg-amber-50 text-amber-900 border-amber-100",
        dot: "bg-amber-500",
      };
    case "poor":
      return {
        bar: "bg-gradient-to-r from-gray-300 to-gray-400",
        text: "text-gray-600",
        badge: "bg-gray-50 text-gray-700 border-gray-100",
        dot: "bg-gray-400",
      };
  }
}
