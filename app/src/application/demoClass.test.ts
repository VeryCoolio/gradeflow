import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseClassImport } from "../infrastructure/importExport/classImport";
import { assertNotebook, EMPTY_NOTEBOOK } from "../infrastructure/local/schema";
import {
  addDemoClass,
  DEMO_STUDENT_NAMES,
  isDemoClass,
  populateDemoWeeks,
} from "./demoClass";

describe("fiktiver Testdatensatz", () => {
  it("verwendet für Schaltfläche und CSV genau dieselben 20 fiktiven Namen", () => {
    let number = 0;
    const notebook = addDemoClass(
      EMPTY_NOTEBOOK,
      () => `demo-${++number}`,
      "2026-09-25T12:00:00.000Z",
    );
    const csvNames = parseClassImport(
      readFileSync(
        new URL("../../public/demo-klasse.csv", import.meta.url),
        "utf8",
      ),
      "demo-klasse.csv",
    );
    expect(csvNames).toEqual(DEMO_STUDENT_NAMES);
    expect(
      notebook.classes[0].students.map((item) => item.displayName),
    ).toEqual(csvNames);
    expect(
      notebook.classes[0].students.map((item) => item.startGradeQuarterSteps),
    ).toEqual(Array(20).fill(8));
    expect(notebook.classes[0].sessions).toEqual([]);
  });
});

it("ergänzt einmalig fünf Wochen mit allen Statusarten und erhält vorhandene Eingaben", () => {
  let id = 0;
  const createId = () => `demo-${++id}`;
  const now = "2026-10-20T12:00:00.000Z";
  const created = addDemoClass(EMPTY_NOTEBOOK, createId, now);
  const first = created.classes[0];
  const existing = {
    id: "bestehend",
    date: "2026-10-19",
    lessonSequence: 1,
    createdAt: now,
    updatedAt: now,
    observations: {
      [first.students[0].id]: {
        status: "bewertet" as const,
        symbol: "+" as const,
      },
    },
  };
  const source = { ...created, classes: [{ ...first, sessions: [existing] }] };
  const before = JSON.stringify(source);
  const result = populateDemoWeeks(
    source,
    first.id,
    "2026-10-20",
    createId,
    now,
  );
  assertNotebook(result);
  expect(JSON.stringify(source)).toBe(before);
  expect(result.classes[0].sessions[0]).toEqual(existing);
  const generated = result.classes[0].sessions.slice(1);
  expect(generated).toHaveLength(25);
  expect(new Set(generated.map((s) => s.date)).size).toBe(25);
  expect(generated[0].date).toBe("2026-09-14");
  expect(generated.at(-1)?.date).toBe("2026-10-16");
  expect(
    generated.every(
      (s) => ![0, 6].includes(new Date(`${s.date}T12:00Z`).getUTCDay()),
    ),
  ).toBe(true);
  const observations = generated.flatMap((s) => Object.values(s.observations));
  expect(new Set(observations.map((o) => o.status))).toEqual(
    new Set(["bewertet", "abwesend", "nicht_beobachtet"]),
  );
  expect(
    new Set(
      observations.flatMap((o) => (o.status === "bewertet" ? [o.symbol] : [])),
    ),
  ).toEqual(new Set(["--", "-", "0", "+", "++"]));
  expect(
    generated.some(
      (s) => Object.keys(s.observations).length < first.students.length,
    ),
  ).toBe(true);
  expect(() =>
    populateDemoWeeks(result, first.id, "2026-10-20", createId, now),
  ).toThrow(/bereits/);
  expect(() =>
    populateDemoWeeks(
      { ...created, classes: [{ ...first, name: "8b", demo: undefined }] },
      first.id,
      "2026-10-20",
      createId,
      now,
    ),
  ).toThrow(/nur/);
  expect(isDemoClass({ ...first, demo: undefined })).toBe(true);
  expect(
    isDemoClass({
      ...first,
      demo: undefined,
      students: [{ ...first.students[0], displayName: "Fiktiv andere Person" }],
    }),
  ).toBe(false);
});
