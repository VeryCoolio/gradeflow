import { describe, expect, it } from "vitest";
import {
  assertUniqueLessonSlots,
  compareLessonSessions,
  createLessonSession,
  hasVisibleLessonSequence,
  nextLessonSequence,
  removeLessonSession,
  swapLessonSequences,
} from "./lessonSequence";
import type { LessonSession } from "./types";

function lesson(
  id: string,
  date: string,
  lessonSequence: number,
): LessonSession {
  return {
    id,
    date,
    lessonSequence,
    createdAt: "2026-09-23T10:00:00Z",
    updatedAt: "2026-09-23T10:00:00Z",
    observations: {},
  };
}

describe("Stundennummer", () => {
  it("vergibt ohne Eintrag intern 1 und zeigt keine Nummer", () => {
    const sessions: LessonSession[] = [];
    const first = createLessonSession(sessions, {
      id: "a",
      date: "2026-09-23",
      createdAt: "2026-09-23T10:00:00Z",
      updatedAt: "2026-09-23T10:00:00Z",
      observations: {},
    });
    expect(first.lessonSequence).toBe(1);
    expect(hasVisibleLessonSequence([first], first.date)).toBe(false);
  });

  it("vergibt beim zweiten Eintrag 2 und macht die Nummern sichtbar", () => {
    const first = lesson("a", "2026-09-23", 1);
    const second = createLessonSession([first], {
      id: "b",
      date: first.date,
      createdAt: "2026-09-23T11:00:00Z",
      updatedAt: "2026-09-23T11:00:00Z",
      observations: {},
    });
    expect(second.lessonSequence).toBe(2);
    expect(hasVisibleLessonSequence([first, second], first.date)).toBe(true);
  });

  it("weist einen dritten Eintrag mit verständlicher Fehlermeldung ab", () => {
    expect(() =>
      nextLessonSequence(
        [lesson("a", "2026-09-23", 1), lesson("b", "2026-09-23", 2)],
        "2026-09-23",
      ),
    ).toThrow(/höchstens zwei Unterrichtsstunden/);
  });

  it("behandelt unterschiedliche Daten unabhängig", () => {
    expect(
      nextLessonSequence([lesson("a", "2026-09-23", 1)], "2026-09-24"),
    ).toBe(1);
    expect(
      hasVisibleLessonSequence(
        [lesson("a", "2026-09-23", 1), lesson("b", "2026-09-24", 1)],
        "2026-09-23",
      ),
    ).toBe(false);
  });

  it("weist doppelte Datum-Nummer-Kombinationen, IDs und ungültige Nummern zurück", () => {
    expect(() =>
      assertUniqueLessonSlots([
        lesson("a", "2026-09-23", 1),
        lesson("b", "2026-09-23", 1),
      ]),
    ).toThrow();
    expect(() =>
      assertUniqueLessonSlots([
        lesson("a", "2026-09-23", 1),
        lesson("a", "2026-09-24", 1),
      ]),
    ).toThrow();
    expect(() =>
      assertUniqueLessonSlots([lesson("a", "2026-09-23", 0)]),
    ).toThrow();
    expect(() =>
      assertUniqueLessonSlots([lesson("a", "2026-09-23", 1.5)]),
    ).toThrow();
    expect(() =>
      assertUniqueLessonSlots([lesson("a", "2026-09-23", 3)]),
    ).toThrow();
    expect(() =>
      assertUniqueLessonSlots([lesson("a", "2026-09-23", 2)]),
    ).toThrow();
    expect(() =>
      assertUniqueLessonSlots([lesson("a", "2026-02-30", 1)]),
    ).toThrow();
  });

  it("tauscht die Nummern atomar und lässt den Ausgangsstand unberührt", () => {
    const sessions = [
      lesson("a", "2026-09-23", 1),
      lesson("b", "2026-09-23", 2),
    ];
    const swapped = swapLessonSequences(sessions, "2026-09-23");
    expect(swapped.map((session) => session.lessonSequence)).toEqual([2, 1]);
    expect(sessions.map((session) => session.lessonSequence)).toEqual([1, 2]);
    expect(() => swapLessonSequences([sessions[0]], "2026-09-23")).toThrow();
  });

  it("normalisiert nach Löschung auf 1 und vergibt beim nächsten Eintrag wieder 2", () => {
    const sessions = [
      lesson("a", "2026-09-23", 1),
      lesson("b", "2026-09-23", 2),
    ];
    const remaining = removeLessonSession(sessions, "a");
    expect(remaining[0].lessonSequence).toBe(1);
    expect(hasVisibleLessonSequence(remaining, "2026-09-23")).toBe(false);
    expect(nextLessonSequence(remaining, "2026-09-23")).toBe(2);
    expect(sessions[1].lessonSequence).toBe(2);
  });

  it("sortiert nach Datum, Nummer und zuletzt stabiler ID", () => {
    const sorted = [
      lesson("z", "2026-09-23", 2),
      lesson("b", "2026-09-23", 1),
      lesson("a", "2026-09-23", 1),
      lesson("old", "2026-09-22", 2),
    ].sort(compareLessonSessions);
    expect(sorted.map((session) => session.id)).toEqual(["old", "a", "b", "z"]);
  });
});
