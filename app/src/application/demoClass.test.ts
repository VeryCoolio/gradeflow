import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseClassImport } from "../infrastructure/importExport/classImport";
import { assertNotebook, EMPTY_NOTEBOOK } from "../infrastructure/local/schema";
import { addClass } from "./classService";
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

it("öffnet eine umbenannte Demo erneut, ohne Klassen oder vorhandene Beobachtungen zu duplizieren", () => {
  let id = 0;
  const createId = () => `demo-${++id}`;
  const now = "2026-11-04T12:00:00.000Z";
  const created = addDemoClass(EMPTY_NOTEBOOK, createId, now);
  const populated = populateDemoWeeks(
    created,
    created.currentClassId!,
    "2026-11-04",
    createId,
    now,
  );
  const source = {
    ...populated,
    classes: [{ ...populated.classes[0], name: "Meine Übungsklasse" }],
  };
  const before = JSON.stringify(source);
  const count = id;
  const repeated = addDemoClass(source, createId, now);
  const again = addDemoClass(repeated, createId, now);
  expect(again.classes).toHaveLength(1);
  expect(again.classes[0]).toBe(source.classes[0]);
  expect(again.currentClassId).toBe(source.currentClassId);
  expect(id).toBe(count);
  expect(JSON.stringify(source)).toBe(before);
});

it("erhält normale und archivierte Klassen mit demselben Namen und wählt eine vorhandene aktive Demo", () => {
  let id = 0;
  const createId = () => `demo-${++id}`;
  const now = "2026-11-04T12:00:00.000Z";
  const regular = addClass(
    EMPTY_NOTEBOOK,
    {
      name: "Demo 8b",
      periodLabel: "Freier Zeitraum",
      students: ["Fiktiv eigene Person"],
    },
    createId,
    now,
  );
  const created = addDemoClass(regular, createId, now);
  expect(created.classes[1].name).toBe("Demo 8b (2)");
  expect(created.classes[0]).toBe(regular.classes[0]);
  const archived = {
    ...created,
    currentClassId: regular.currentClassId,
    classes: [created.classes[0], { ...created.classes[1], archived: true }],
  };
  const next = addDemoClass(archived, createId, now);
  expect(next.classes).toHaveLength(3);
  expect(next.classes[1]).toBe(archived.classes[1]);
  expect(next.classes[2].name).toBe("Demo 8b (3)");
  const fromRegular = addDemoClass(
    { ...next, currentClassId: regular.currentClassId },
    createId,
    now,
  );
  expect(fromRegular.classes).toBe(next.classes);
  expect(fromRegular.currentClassId).toBe(next.classes[2].id);
});

it("bevorzugt die gewählte aktive Demo, wenn mehrere bereits vorhanden sind", () => {
  let id = 0;
  const createId = () => `demo-${++id}`;
  const now = "2026-11-04T12:00:00.000Z";
  const created = addDemoClass(EMPTY_NOTEBOOK, createId, now);
  const second = {
    ...created.classes[0],
    id: "zweite-demo",
    name: "Weitere Übungsklasse",
  };
  const source = {
    ...created,
    currentClassId: second.id,
    classes: [...created.classes, second],
  };
  const reopened = addDemoClass(source, createId, now);
  expect(reopened.currentClassId).toBe(second.id);
  expect(reopened.classes).toBe(source.classes);
});

it("behält eine importierte Beispielnamensliste ohne Demomarkierung samt Bewertungen als eigene Klasse", () => {
  let id = 0;
  const createId = () => `demo-${++id}`;
  const now = "2026-11-04T12:00:00.000Z";
  const imported = addClass(
    EMPTY_NOTEBOOK,
    {
      name: "Demo 8b",
      periodLabel: "Mein eigener Zeitraum",
      students: DEMO_STUDENT_NAMES,
    },
    createId,
    now,
  );
  const group = imported.classes[0];
  const original = {
    ...group,
    sessions: [
      {
        id: "vorhandene-stunde",
        date: "2026-11-03",
        lessonSequence: 1,
        createdAt: now,
        updatedAt: now,
        observations: {
          [group.students[0].id]: {
            status: "bewertet" as const,
            symbol: "+" as const,
          },
        },
      },
    ],
  };
  const source = { ...imported, classes: [original] };
  const before = JSON.stringify(source);
  const result = addDemoClass(source, createId, now);
  assertNotebook(result);
  expect(result.classes).toHaveLength(2);
  expect(result.classes[0]).toBe(original);
  expect(result.classes[1]).toMatchObject({
    name: "Demo 8b (2)",
    demo: true,
    sessions: [],
  });
  expect(result.currentClassId).toBe(result.classes[1].id);
  expect(JSON.stringify(source)).toBe(before);
  expect(isDemoClass(original)).toBe(true);
});

it("weist Beispielstunden für archivierte Demos ohne Datenänderung und neue IDs ab", () => {
  let id = 0;
  const createId = () => `demo-${++id}`;
  const now = "2026-11-04T12:00:00.000Z";
  const created = addDemoClass(EMPTY_NOTEBOOK, createId, now);
  const source = {
    ...created,
    classes: [{ ...created.classes[0], archived: true }],
  };
  const before = JSON.stringify(source);
  const count = id;
  expect(() =>
    populateDemoWeeks(
      source,
      source.currentClassId!,
      "2026-11-04",
      createId,
      now,
    ),
  ).toThrow(/archiviert/);
  expect(id).toBe(count);
  expect(JSON.stringify(source)).toBe(before);
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
  const other = {
    ...first,
    id: "andere-klasse",
    name: "Andere Demo",
    students: first.students.map((student) => ({
      ...student,
      id: `andere-${student.id}`,
    })),
  };
  const source = {
    ...created,
    classes: [{ ...first, sessions: [existing] }, other],
  };
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
  expect(result.classes[1]).toBe(other);
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
