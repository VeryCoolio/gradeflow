import type { RatingSymbol } from "../domain/grading/types";

export const RATING_GUIDE: Record<
  RatingSymbol,
  { meaning: string; change: string; tone: string }
> = {
  "--": {
    meaning: "Deutlich schlechter",
    change: "+0,50",
    tone: "negative-strong",
  },
  "-": { meaning: "Etwas schlechter", change: "+0,25", tone: "negative" },
  "0": { meaning: "Etwa gleich", change: "±0,00", tone: "neutral" },
  "+": { meaning: "Etwas besser", change: "−0,25", tone: "positive" },
  "++": {
    meaning: "Deutlich besser",
    change: "−0,50",
    tone: "positive-strong",
  },
};
