import { describe, expect, it } from "vitest";
import { migrateLegacyV4 } from "./legacyV4";

const migratedAt = "2026-09-23T12:00:00.000Z";

function legacyApp(
  sessions: unknown[] = [],
  students: unknown[] = [{ id: "p1", name: "Fiktiv A", startGrade: 2 }],
): string {
  return JSON.stringify({
    currentClassId: "c1",
    classes: [
      {
        id: "c1",
        name: "Testklasse",
        completed: true,
        createdAt: "2026-09-01T08:00:00.000Z",
        updatedAt: "2026-09-23T10:00:00.000Z",
        students,
        sessions,
      },
    ],
  });
}

function legacySession(
  id: string,
  date: string,
  createdAt: string,
  entries: unknown = {},
): unknown {
  return { id, date, createdAt, entries };
}

describe("Legacy-V4-Migration", () => {
  it("übernimmt Klassen, Personen und bewertete Stunden ohne berechnete Caches", () => {
    const raw = legacyApp([
      legacySession("s2", "2026-09-23", "2026-09-23T10:00:00Z", {
        p1: { symbol: "--", gradeAfter: 2.5 },
      }),
      legacySession("s1", "2026-09-23", "2026-09-23T08:00:00Z", { p1: "+" }),
    ]);
    const result = migrateLegacyV4(raw, null, migratedAt);
    expect(result.schemaVersion).toBe(1);
    expect(result.classes[0].archived).toBe(true);
    expect(result.classes[0].periodLabel).toBe("Testklasse");
    expect(result.classes[0].students[0]).toEqual({
      id: "p1",
      displayName: "Fiktiv A",
      startGradeQuarterSteps: 8,
    });
    expect(
      result.classes[0].sessions.map((session) => [
        session.id,
        session.lessonSequence,
      ]),
    ).toEqual([
      ["s1", 1],
      ["s2", 2],
    ]);
    expect(result.classes[0].sessions[0].observations.p1).toEqual({
      status: "bewertet",
      symbol: "+",
    });
    expect("gradeAfter" in result.classes[0].sessions[1].observations.p1).toBe(
      false,
    );
  });

  it("übernimmt einen offenen Entwurf als unvollständige zweite Stunde", () => {
    const raw = legacyApp(
      [legacySession("s1", "2026-09-23", "2026-09-23T08:00:00Z", {})],
      [
        { id: "p1", name: "Fiktiv A", startGrade: 2 },
        { id: "p2", name: "Fiktiv B", startGrade: 2 },
      ],
    );
    const drafts = JSON.stringify({
      c1: { date: "2026-09-23", entries: { p1: "++" } },
    });
    const result = migrateLegacyV4(raw, drafts, migratedAt);
    expect(result.classes[0].sessions[1].lessonSequence).toBe(2);
    expect(result.classes[0].sessions[1].observations).toEqual({
      p1: { status: "bewertet", symbol: "++" },
    });
    expect(result.classes[0].sessions[1].observations.p2).toBeUndefined();
  });

  it("weist mehr als zwei Legacy-Stunden je Datum ohne Kürzung zurück", () => {
    const raw = legacyApp([
      legacySession("s1", "2026-09-23", "2026-09-23T08:00:00Z"),
      legacySession("s2", "2026-09-23", "2026-09-23T09:00:00Z"),
      legacySession("s3", "2026-09-23", "2026-09-23T10:00:00Z"),
    ]);
    expect(() => migrateLegacyV4(raw, null, migratedAt)).toThrow(
      /mehr als zwei Stunden/,
    );
  });

  it("weist einen Entwurf als dritte Stunde zurück", () => {
    const raw = legacyApp([
      legacySession("s1", "2026-09-23", "2026-09-23T08:00:00Z"),
      legacySession("s2", "2026-09-23", "2026-09-23T09:00:00Z"),
    ]);
    expect(() =>
      migrateLegacyV4(
        raw,
        JSON.stringify({ c1: { date: "2026-09-23", entries: {} } }),
        migratedAt,
      ),
    ).toThrow(/mehr als zwei Stunden/);
  });

  it("ist bei gleichen Eingaben und Zeitpunkt deterministisch", () => {
    const raw = legacyApp([{ date: "2026-09-23", entries: { p1: "0" } }]);
    expect(migrateLegacyV4(raw, null, migratedAt)).toEqual(
      migrateLegacyV4(raw, null, migratedAt),
    );
    expect(
      migrateLegacyV4(raw, null, migratedAt).classes[0].sessions[0].id,
    ).toBe("legacy-session-1-1");
  });

  it("stoppt bei ungültigen oder nicht übertragbaren Informationen", () => {
    expect(() => migrateLegacyV4("{", null, migratedAt)).toThrow(
      /kein gültiges JSON/,
    );
    expect(() =>
      migrateLegacyV4(
        legacyApp([legacySession("s", "2026-09-23", migratedAt, { p1: "?" })]),
        null,
        migratedAt,
      ),
    ).toThrow(/Bewertungssymbol/);
    expect(() =>
      migrateLegacyV4(
        legacyApp([], [{ id: "p1", name: "Fiktiv A", startGrade: 3 }]),
        null,
        migratedAt,
      ),
    ).toThrow(/abweichender Startwert/);
    expect(() =>
      migrateLegacyV4(
        legacyApp(),
        JSON.stringify({ missing: { date: "2026-09-23", entries: {} } }),
        migratedAt,
      ),
    ).toThrow(/ungültig/);
  });
});
