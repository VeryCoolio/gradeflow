export const MIN_GRADE_QUARTER_STEPS = 4;
export const MAX_GRADE_QUARTER_STEPS = 24;
export const INITIAL_GRADE_QUARTER_STEPS = 8;
export const MAX_BUFFER_POINTS = 3;

export const RATING_SYMBOLS = ["--", "-", "0", "+", "++"] as const;
export type RatingSymbol = (typeof RATING_SYMBOLS)[number];

export type Observation =
  | { readonly status: "bewertet"; readonly symbol: RatingSymbol }
  | { readonly status: "abwesend" }
  | { readonly status: "nicht_beobachtet" };

export interface GradeState {
  readonly gradeQuarterSteps: number;
  readonly bufferPoints: number;
}

export const INITIAL_GRADE_STATE: GradeState = {
  gradeQuarterSteps: INITIAL_GRADE_QUARTER_STEPS,
  bufferPoints: 0,
};
