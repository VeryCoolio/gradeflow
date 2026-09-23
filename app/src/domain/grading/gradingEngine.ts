import {
  INITIAL_GRADE_STATE,
  MAX_BUFFER_POINTS,
  MAX_GRADE_QUARTER_STEPS,
  MIN_GRADE_QUARTER_STEPS,
  RATING_SYMBOLS,
  type GradeState,
  type Observation,
  type RatingSymbol,
} from "./types";

const DELTA_QUARTER_STEPS: Readonly<Record<RatingSymbol, number>> = {
  "--": 2,
  "-": 1,
  "0": 0,
  "+": -1,
  "++": -2,
};

export function assertGradeState(state: GradeState): void {
  if (
    !Number.isInteger(state.gradeQuarterSteps) ||
    state.gradeQuarterSteps < MIN_GRADE_QUARTER_STEPS ||
    state.gradeQuarterSteps > MAX_GRADE_QUARTER_STEPS ||
    !Number.isInteger(state.bufferPoints) ||
    state.bufferPoints < 0 ||
    state.bufferPoints > MAX_BUFFER_POINTS ||
    (state.gradeQuarterSteps > MIN_GRADE_QUARTER_STEPS &&
      state.bufferPoints !== 0)
  ) {
    throw new RangeError("Ungültiger Noten- oder Pufferstand.");
  }
}

export function applyRating(
  state: GradeState,
  symbol: RatingSymbol,
): GradeState {
  assertGradeState(state);
  if (!RATING_SYMBOLS.includes(symbol)) {
    throw new RangeError("Ungültiges Bewertungssymbol.");
  }

  const delta = DELTA_QUARTER_STEPS[symbol];
  if (delta < 0) {
    const improvement = -delta;
    const roomToOne = state.gradeQuarterSteps - MIN_GRADE_QUARTER_STEPS;
    const appliedToGrade = Math.min(improvement, roomToOne);
    return {
      gradeQuarterSteps: state.gradeQuarterSteps - appliedToGrade,
      bufferPoints: Math.min(
        MAX_BUFFER_POINTS,
        state.bufferPoints + improvement - appliedToGrade,
      ),
    };
  }

  const consumedBuffer =
    state.gradeQuarterSteps === MIN_GRADE_QUARTER_STEPS
      ? Math.min(state.bufferPoints, delta)
      : 0;
  return {
    gradeQuarterSteps: Math.min(
      MAX_GRADE_QUARTER_STEPS,
      state.gradeQuarterSteps + delta - consumedBuffer,
    ),
    bufferPoints: state.bufferPoints - consumedBuffer,
  };
}

export function applyObservation(
  state: GradeState,
  observation: Observation,
): GradeState {
  assertGradeState(state);
  if (observation.status === "bewertet") {
    return applyRating(state, observation.symbol);
  }
  if (
    observation.status === "abwesend" ||
    observation.status === "nicht_beobachtet"
  ) {
    return { ...state };
  }
  throw new RangeError("Ungültiger Beobachtungsstatus.");
}

export function initialGradeState(): GradeState {
  return { ...INITIAL_GRADE_STATE };
}
