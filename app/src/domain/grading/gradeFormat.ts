import { MIN_GRADE_QUARTER_STEPS, MAX_GRADE_QUARTER_STEPS } from "./types";

function assertGrade(quarterSteps: number): void {
  if (
    !Number.isInteger(quarterSteps) ||
    quarterSteps < MIN_GRADE_QUARTER_STEPS ||
    quarterSteps > MAX_GRADE_QUARTER_STEPS
  ) {
    throw new RangeError("Ungültiger Notenwert.");
  }
}

export function formatGradeDecimal(quarterSteps: number): string {
  assertGrade(quarterSteps);
  return (quarterSteps / 4).toFixed(2).replace(".", ",");
}
