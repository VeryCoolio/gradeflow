import { describe, expect, it } from "vitest";
import {
  recalculateClassState,
  recalculateWithSwappedLessonSequences,
  recalculateWithoutLessonSession,
} from "./recalculate";
import type { LessonSession } from "./types";
import type { Observation } from "../grading/types";

function lesson(
  id: string,
  date: string,
  lessonSequence: number,
  observation: Observation,
): LessonSession {
  return {
    id,
    date,
    lessonSequence,
    createdAt: `${date}T08:00:00Z`,
    updatedAt: `${date}T08:00:00Z`,
    observations: { student: observation },
  };
}

const students = [{ id: "student" }];

describe("chronologische Neuberechnung", () => {
  it("beginnt ohne Stunde bei 2,00 und kennt keinen automatischen Reset", () => {
    const empty = recalculateClassState(students, []);
    expect(empty.students[0].start.gradeQuarterSteps).toBe(8);
    expect(empty.students[0].current.gradeQuarterSteps).toBe(8);
    const acrossYears = recalculateClassState(students, [
      lesson("a", "2025-06-01", 1, { status: "bewertet", symbol: "+" }),
      lesson("b", "2026-09-01", 1, { status: "bewertet", symbol: "+" }),
    ]);
    expect(acrossYears.students[0].current.gradeQuarterSteps).toBe(6);
  });

  it("sortiert gleiche Daten nach Stundennummer unabhängig von Eingabereihenfolge", () => {
    const first = lesson("first", "2026-09-23", 1, {
      status: "bewertet",
      symbol: "--",
    });
    const second = lesson("second", "2026-09-23", 2, {
      status: "bewertet",
      symbol: "+",
    });
    const result = recalculateClassState(students, [second, first]);
    expect(result.sortedSessions.map((session) => session.id)).toEqual([
      "first",
      "second",
    ]);
    expect(
      result.students[0].events.map((event) => event.after.gradeQuarterSteps),
    ).toEqual([10, 9]);
    expect(result).toEqual(recalculateClassState(students, [second, first]));
    expect([second, first].map((session) => session.lessonSequence)).toEqual([
      2, 1,
    ]);
  });

  it("behält abwesend und nicht_beobachtet als getrennte Ereignisse ohne Rechenwirkung", () => {
    const result = recalculateClassState(students, [
      lesson("a", "2026-09-23", 1, { status: "abwesend" }),
      lesson("b", "2026-09-23", 2, { status: "nicht_beobachtet" }),
      lesson("c", "2026-09-24", 1, { status: "bewertet", symbol: "0" }),
    ]);
    expect(
      result.students[0].events.map((event) => event.observation.status),
    ).toEqual(["abwesend", "nicht_beobachtet", "bewertet"]);
    expect(
      result.students[0].events.every(
        (event) => event.after.gradeQuarterSteps === 8,
      ),
    ).toBe(true);
  });

  it("verarbeitet unvollständige Stunden ohne fehlende Beobachtungen zu erfinden", () => {
    const result = recalculateClassState(
      [{ id: "student" }, { id: "other" }],
      [lesson("a", "2026-09-23", 1, { status: "bewertet", symbol: "+" })],
    );
    expect(result.students[0].current.gradeQuarterSteps).toBe(7);
    expect(result.students[1].events).toEqual([]);
    expect(result.students[1].current.gradeQuarterSteps).toBe(8);
  });

  it("berechnet nach Änderung einer älteren Bewertung alle Folgewerte neu", () => {
    const original = [
      lesson("a", "2026-09-23", 1, { status: "bewertet", symbol: "+" }),
      lesson("b", "2026-09-24", 1, { status: "bewertet", symbol: "++" }),
    ];
    const before = recalculateClassState(students, original);
    const changed = [
      {
        ...original[0],
        observations: {
          student: { status: "bewertet" as const, symbol: "--" as const },
        },
      },
      original[1],
    ];
    const after = recalculateClassState(students, changed);
    expect(before.students[0].events[1].before.gradeQuarterSteps).toBe(7);
    expect(after.students[0].events[1].before.gradeQuarterSteps).toBe(10);
    expect(after.students[0].current.gradeQuarterSteps).toBe(8);
  });

  it("berechnet nach atomarem Tausch den ganzen Verlauf neu", () => {
    const sessions = [
      lesson("a", "2026-09-23", 1, { status: "bewertet", symbol: "--" }),
      lesson("b", "2026-09-23", 2, { status: "bewertet", symbol: "++" }),
    ];
    const result = recalculateWithSwappedLessonSequences(
      students,
      sessions,
      "2026-09-23",
    );
    expect(result.sortedSessions.map((session) => session.id)).toEqual([
      "b",
      "a",
    ]);
    expect(
      result.students[0].events.map((event) => event.after.gradeQuarterSteps),
    ).toEqual([6, 8]);
    expect(sessions[0].lessonSequence).toBe(1);
  });

  it("berechnet nach Entfernen einer alten Stunde den verbleibenden Verlauf neu", () => {
    const sessions = [
      lesson("a", "2026-09-23", 1, { status: "bewertet", symbol: "--" }),
      lesson("b", "2026-09-23", 2, { status: "bewertet", symbol: "+" }),
    ];
    expect(
      recalculateClassState(students, sessions).students[0].current
        .gradeQuarterSteps,
    ).toBe(9);
    expect(
      recalculateWithoutLessonSession(students, sessions, "a").students[0]
        .current.gradeQuarterSteps,
    ).toBe(7);
    expect(
      recalculateWithoutLessonSession(students, sessions, "a").sortedSessions[0]
        .lessonSequence,
    ).toBe(1);
  });

  it("weist unbekannte Personen und doppelte Stunden zurück", () => {
    const unknown = {
      ...lesson("a", "2026-09-23", 1, { status: "abwesend" }),
      observations: { missing: { status: "abwesend" as const } },
    };
    expect(() => recalculateClassState(students, [unknown])).toThrow();
    expect(() =>
      recalculateClassState(students, [
        lesson("a", "2026-09-23", 1, { status: "abwesend" }),
        lesson("b", "2026-09-23", 1, { status: "abwesend" }),
      ]),
    ).toThrow();
  });
});
