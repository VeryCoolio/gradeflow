import { describe, expect, it } from "vitest";
import type { ClassRecord } from "../infrastructure/local/schema";
import { reportClass } from "../test/reportClass";
import { buildClassReport } from "./reporting";

describe("gemeinsamer Klassenbericht", () => {
  it("ordnet Stunden chronologisch und hält Status und berechnete Werte getrennt", () => {
    const report = buildClassReport(reportClass());
    expect(report.sessions.map((session) => session.id)).toEqual([
      "s1",
      "s2",
      "s3",
    ]);
    expect(
      report.students[0].cells.map((cell) => cell.after?.gradeQuarterSteps),
    ).toEqual([6, 7, 6]);
    expect(report.students[0].current).toEqual({
      gradeQuarterSteps: 6,
      bufferPoints: 0,
    });
    expect(
      report.students[1].cells.map(
        (cell) => cell.observation?.status ?? "offen",
      ),
    ).toEqual(["abwesend", "nicht_beobachtet", "offen"]);
    expect(report.students[1].cells.map((cell) => cell.after)).toEqual([
      null,
      null,
      null,
    ]);
    expect(report.students[1].current.gradeQuarterSteps).toBe(8);
  });

  it("berechnet nach Korrektur der ersten Stunde alle späteren Werte neu", () => {
    const source = reportClass();
    const changed: ClassRecord = {
      ...source,
      sessions: source.sessions.map((session) =>
        session.id === "s1"
          ? {
              ...session,
              observations: {
                ...session.observations,
                p1: { status: "bewertet" as const, symbol: "--" as const },
              },
            }
          : session,
      ),
    };
    expect(
      buildClassReport(changed).students[0].cells.map(
        (cell) => cell.after?.gradeQuarterSteps,
      ),
    ).toEqual([10, 11, 10]);
  });
});
