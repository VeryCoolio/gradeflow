import { recalculateClassState } from "../../domain/sessions/recalculate";
import type { LessonSession } from "../../domain/sessions/types";
import { RATING_SYMBOLS, type Observation } from "../../domain/grading/types";

export const NOTEBOOK_SCHEMA_VERSION = 1 as const;

export interface StudentRecord {
  readonly id: string;
  readonly displayName: string;
  readonly startGradeQuarterSteps: 8;
}

export interface ClassRecord {
  readonly demo?: true;
  readonly demoDataGenerated?: true;
  readonly id: string;
  readonly name: string;
  readonly periodLabel: string;
  readonly archived: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly students: readonly StudentRecord[];
  readonly sessions: readonly LessonSession[];
}

export interface NotebookV1 {
  readonly schemaVersion: typeof NOTEBOOK_SCHEMA_VERSION;
  readonly currentClassId: string | null;
  readonly classes: readonly ClassRecord[];
}

export const EMPTY_NOTEBOOK: NotebookV1 = {
  schemaVersion: NOTEBOOK_SCHEMA_VERSION,
  currentClassId: null,
  classes: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertText(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || !value.trim()) {
    throw new RangeError(`${label} fehlt oder ist leer.`);
  }
}

function assertTimestamp(
  value: unknown,
  label: string,
): asserts value is string {
  assertText(value, label);
  if (Number.isNaN(Date.parse(value))) {
    throw new RangeError(`${label} ist kein gültiger Zeitpunkt.`);
  }
}

function assertObservation(value: unknown): asserts value is Observation {
  if (!isRecord(value)) throw new RangeError("Ungültige Beobachtung.");
  if (value.status === "bewertet") {
    if (!RATING_SYMBOLS.some((symbol) => symbol === value.symbol)) {
      throw new RangeError("Ungültiges Bewertungssymbol.");
    }
  } else if (
    value.status !== "abwesend" &&
    value.status !== "nicht_beobachtet"
  ) {
    throw new RangeError("Ungültiger Beobachtungsstatus.");
  }
}

export function assertNotebook(value: unknown): asserts value is NotebookV1 {
  if (!isRecord(value) || value.schemaVersion !== NOTEBOOK_SCHEMA_VERSION) {
    throw new RangeError("Unbekannte oder fehlende Notebook-Schemaversion.");
  }
  if (!Array.isArray(value.classes)) {
    throw new RangeError("Die Klassenliste fehlt.");
  }
  const classIds = new Set<string>();
  for (const classValue of value.classes) {
    if (!isRecord(classValue)) throw new RangeError("Ungültige Klasse.");
    assertText(classValue.id, "Klassen-ID");
    assertText(classValue.name, "Klassenname");
    assertText(classValue.periodLabel, "Bewertungszeitraum");
    if (
      (classValue.demo !== undefined && classValue.demo !== true) ||
      (classValue.demoDataGenerated !== undefined &&
        (classValue.demoDataGenerated !== true || classValue.demo !== true))
    ) {
      throw new RangeError("Ungültige Demo-Kennzeichnung.");
    }
    assertTimestamp(classValue.createdAt, "Erstellungszeit der Klasse");
    assertTimestamp(classValue.updatedAt, "Änderungszeit der Klasse");
    if (typeof classValue.archived !== "boolean") {
      throw new RangeError("Ungültiger Archivstatus.");
    }
    if (classIds.has(classValue.id))
      throw new RangeError("Doppelte Klassen-ID.");
    classIds.add(classValue.id);
    if (
      !Array.isArray(classValue.students) ||
      classValue.students.length > 45
    ) {
      throw new RangeError(
        "Ungültige Personenliste oder mehr als 45 Personen.",
      );
    }
    if (!Array.isArray(classValue.sessions)) {
      throw new RangeError("Die Stundenliste fehlt.");
    }
    for (const student of classValue.students) {
      if (!isRecord(student)) throw new RangeError("Ungültige Person.");
      assertText(student.id, "Personen-ID");
      assertText(student.displayName, "Personenname");
      if (student.startGradeQuarterSteps !== 8) {
        throw new RangeError("Der Startwert muss 2,00 betragen.");
      }
    }
    for (const session of classValue.sessions) {
      if (!isRecord(session)) throw new RangeError("Ungültige Stunde.");
      assertText(session.id, "Sitzungs-ID");
      assertTimestamp(session.createdAt, "Erstellungszeit der Stunde");
      assertTimestamp(session.updatedAt, "Änderungszeit der Stunde");
      if (!isRecord(session.observations)) {
        throw new RangeError("Ungültige Beobachtungsliste.");
      }
      Object.values(session.observations).forEach(assertObservation);
    }
    recalculateClassState(
      classValue.students as unknown as StudentRecord[],
      classValue.sessions as unknown as LessonSession[],
    );
  }
  if (
    value.currentClassId !== null &&
    (typeof value.currentClassId !== "string" ||
      !classIds.has(value.currentClassId))
  ) {
    throw new RangeError("Die ausgewählte Klasse existiert nicht.");
  }
}

export function parseNotebook(raw: string): NotebookV1 {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new RangeError(
      "Die gespeicherten Notebook-Daten sind kein gültiges JSON.",
    );
  }
  assertNotebook(value);
  return value;
}
