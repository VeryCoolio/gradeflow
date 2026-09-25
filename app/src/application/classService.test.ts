import { describe, expect, it } from "vitest";
import { EMPTY_NOTEBOOK } from "../infrastructure/local/schema";
import { reportClass } from "../test/reportClass";
import {
  addClass,
  removeClass,
  renameStudent,
  selectClass,
  setClassArchived,
  updateClassDetails,
} from "./classService";

const now = "2026-09-23T12:00:00.000Z";

describe("Klassen und Bewertungszeitraum", () => {
  it("legt eine Klasse ohne Enddatum oder Noten-Reset an und ändert den Zeitraum", () => {
    let nextId = 0;
    const added = addClass(
      EMPTY_NOTEBOOK,
      {
        name: "  8b  ",
        periodLabel: "  Freier Zeitraum  ",
        students: ["Fiktiv Ada"],
      },
      () => `id-${++nextId}`,
      now,
    );
    expect(added.currentClassId).toBe("id-1");
    expect(added.classes[0]).toMatchObject({
      name: "8b",
      periodLabel: "Freier Zeitraum",
      archived: false,
      students: [{ id: "id-2", startGradeQuarterSteps: 8 }],
      sessions: [],
    });
    const changed = updateClassDetails(
      added,
      "id-1",
      "9b",
      "Bis ich archiviere",
      now,
    );
    expect(changed.classes[0].periodLabel).toBe("Bis ich archiviere");
    expect(selectClass(changed, "id-1").currentClassId).toBe("id-1");
    expect(
      setClassArchived(changed, "id-1", true, now).classes[0].archived,
    ).toBe(true);
  });

  it("weist leere und doppelte Klassennamen sowie mehr als 45 Personen ab", () => {
    const initial = addClass(
      EMPTY_NOTEBOOK,
      { name: "8b", periodLabel: "P1", students: ["Fiktiv Ada"] },
      () => crypto.randomUUID(),
      now,
    );
    expect(() =>
      addClass(
        initial,
        { name: " 8B ", periodLabel: "P2", students: ["Fiktiv Bea"] },
        () => crypto.randomUUID(),
        now,
      ),
    ).toThrow(/bereits vorhanden/);
    expect(() =>
      addClass(
        initial,
        { name: "9b", periodLabel: " ", students: ["Fiktiv Bea"] },
        () => crypto.randomUUID(),
        now,
      ),
    ).toThrow(/Bewertungszeitraum/);
    expect(() =>
      addClass(
        initial,
        { name: "9b", periodLabel: "P2", students: [] },
        () => crypto.randomUUID(),
        now,
      ),
    ).toThrow(/1 bis 45/);
    expect(() =>
      addClass(
        initial,
        { name: "9b", periodLabel: "P2", students: Array(46).fill("Fiktiv") },
        () => crypto.randomUUID(),
        now,
      ),
    ).toThrow(/1 bis 45/);
  });

  it("ändert einen Personennamen ohne Bewertungen zu verlieren und entfernt eine Klasse mit neuer Auswahl", () => {
    let nextId = 0;
    const first = addClass(
      EMPTY_NOTEBOOK,
      { name: "8b", periodLabel: "Offen", students: ["Fiktiv Ada"] },
      () => `id-${++nextId}`,
      now,
    );
    const second = addClass(
      first,
      { name: "9b", periodLabel: "Offen", students: ["Fiktiv Bea"] },
      () => `id-${++nextId}`,
      now,
    );
    const renamed = renameStudent(
      second,
      "id-1",
      "id-2",
      " Fiktiv  Alma ",
      now,
    );
    expect(renamed.classes[0].students[0]).toMatchObject({
      id: "id-2",
      displayName: "Fiktiv Alma",
      startGradeQuarterSteps: 8,
    });
    expect(renamed.classes[1]).toBe(second.classes[1]);
    expect(() => renameStudent(second, "id-1", "falsch", "Name", now)).toThrow(
      /existiert nicht/,
    );
    expect(() => renameStudent(second, "id-1", "id-2", " ", now)).toThrow(
      /Personenname/,
    );
    const removed = removeClass(renamed, "id-3");
    expect(removed.classes.map((item) => item.id)).toEqual(["id-1"]);
    expect(removed.currentClassId).toBe("id-1");
    expect(removeClass(removed, "id-1").currentClassId).toBeNull();
  });

  it("behält beim Umbenennen alle früheren Beobachtungen und IDs bei", () => {
    const source = reportClass();
    const notebook = {
      ...EMPTY_NOTEBOOK,
      currentClassId: source.id,
      classes: [source],
    };
    const updated = renameStudent(
      notebook,
      source.id,
      "p1",
      "Fiktiv Alma",
      now,
    );
    expect(updated.classes[0].students[0]).toMatchObject({
      id: "p1",
      displayName: "Fiktiv Alma",
    });
    expect(updated.classes[0].sessions).toBe(source.sessions);
    expect(updated.classes[0].sessions[0].observations.p1).toEqual({
      status: "bewertet",
      symbol: "-",
    });
  });
});
