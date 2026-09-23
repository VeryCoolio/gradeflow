import { describe, expect, it } from "vitest";
import {
  applyObservation,
  applyRating,
  initialGradeState,
} from "./gradingEngine";
import { formatGradeDecimal } from "./gradeFormat";
import type { GradeState, RatingSymbol } from "./types";

describe("Bewertungsmodell", () => {
  it("beginnt fest bei 2,00 ohne Puffer", () => {
    expect(initialGradeState()).toEqual({
      gradeQuarterSteps: 8,
      bufferPoints: 0,
    });
  });

  it.each([
    ["--", 10],
    ["-", 9],
    ["0", 8],
    ["+", 7],
    ["++", 6],
  ] as const)(
    "wendet %s als ganzzahlige Viertelschritte an",
    (symbol, grade) => {
      expect(applyRating(initialGradeState(), symbol)).toEqual({
        gradeQuarterSteps: grade,
        bufferPoints: 0,
      });
    },
  );

  it("begrenzt den Notenwert auf 1,00 und 6,00", () => {
    expect(
      applyRating({ gradeQuarterSteps: 24, bufferPoints: 0 }, "--"),
    ).toEqual({
      gradeQuarterSteps: 24,
      bufferPoints: 0,
    });
    expect(applyRating({ gradeQuarterSteps: 5, bufferPoints: 0 }, "+")).toEqual(
      {
        gradeQuarterSteps: 4,
        bufferPoints: 0,
      },
    );
  });

  it("übernimmt bei 1,25 und ++ einen Viertelschritt in den Puffer", () => {
    expect(
      applyRating({ gradeQuarterSteps: 5, bufferPoints: 0 }, "++"),
    ).toEqual({
      gradeQuarterSteps: 4,
      bufferPoints: 1,
    });
  });

  it("baut an der Note 1 mit + und ++ höchstens drei Pufferpunkte auf", () => {
    let state: GradeState = { gradeQuarterSteps: 4, bufferPoints: 0 };
    state = applyRating(state, "+");
    expect(state.bufferPoints).toBe(1);
    state = applyRating(state, "++");
    expect(state.bufferPoints).toBe(3);
    expect(applyRating(state, "++")).toEqual(state);
  });

  it("verbraucht Puffer zuerst mit - und --", () => {
    const full: GradeState = { gradeQuarterSteps: 4, bufferPoints: 3 };
    expect(applyRating(full, "-")).toEqual({
      gradeQuarterSteps: 4,
      bufferPoints: 2,
    });
    expect(applyRating(full, "--")).toEqual({
      gradeQuarterSteps: 4,
      bufferPoints: 1,
    });
  });

  it("deckt -- mit einem Pufferpunkt nur teilweise", () => {
    expect(
      applyRating({ gradeQuarterSteps: 4, bufferPoints: 1 }, "--"),
    ).toEqual({
      gradeQuarterSteps: 5,
      bufferPoints: 0,
    });
  });

  it("verändert mit 0, abwesend und nicht_beobachtet weder Note noch Puffer", () => {
    const before = { gradeQuarterSteps: 4, bufferPoints: 2 };
    expect(applyRating(before, "0")).toEqual(before);
    expect(applyObservation(before, { status: "abwesend" })).toEqual(before);
    expect(applyObservation(before, { status: "nicht_beobachtet" })).toEqual(
      before,
    );
    expect(before).toEqual({ gradeQuarterSteps: 4, bufferPoints: 2 });
  });

  it("weist unmögliche Zustände und Symbole zurück", () => {
    expect(() =>
      applyRating({ gradeQuarterSteps: 5, bufferPoints: 1 }, "+"),
    ).toThrow();
    expect(() =>
      applyRating({ gradeQuarterSteps: 4.5, bufferPoints: 0 }, "+"),
    ).toThrow();
    expect(() =>
      applyRating({ gradeQuarterSteps: 25, bufferPoints: 0 }, "-"),
    ).toThrow();
    expect(() =>
      applyRating(initialGradeState(), "?" as RatingSymbol),
    ).toThrow();
  });

  it("formatiert Viertelschritte ohne Gleitkommaspeicherung", () => {
    expect(formatGradeDecimal(5)).toBe("1,25");
    expect(formatGradeDecimal(8)).toBe("2,00");
    expect(formatGradeDecimal(24)).toBe("6,00");
    expect(() => formatGradeDecimal(3)).toThrow();
  });
});
