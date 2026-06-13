import { getMatchLabel } from "@/src/lib/colorMatch";
import { getMatchTierStyles } from "@/src/lib/match-styles";

type MatchScoreBarProps = {
  score: number;
};

export function MatchScoreBar({ score }: MatchScoreBarProps) {
  const { label, tier } = getMatchLabel(score);
  const styles = getMatchTierStyles(tier);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
          <span className={`text-xs font-semibold ${styles.text}`}>
            {score}% match
          </span>
        </div>
        <span
          className={`rounded-md border px-2 py-0.5 text-[10px] font-medium ${styles.badge}`}
        >
          {label}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${styles.bar}`}
          style={{ width: `${score}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${score}% color match`}
        />
      </div>
    </div>
  );
}
