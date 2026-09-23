import type { ClassRecord, NotebookV1 } from "../infrastructure/local/schema";

function requiredName(value: string, label: string): string {
  const result = value.trim().replace(/\s+/g, " ");
  if (!result) throw new RangeError(`${label} darf nicht leer sein.`);
  return result;
}

function existingClass(notebook: NotebookV1, classId: string): ClassRecord {
  const classRecord = notebook.classes.find((item) => item.id === classId);
  if (!classRecord)
    throw new RangeError("Die ausgewählte Klasse existiert nicht.");
  return classRecord;
}

export function addClass(
  notebook: NotebookV1,
  input: { name: string; periodLabel: string; students: readonly string[] },
  id: () => string,
  now: string,
): NotebookV1 {
  const name = requiredName(input.name, "Klassenname");
  const periodLabel = requiredName(input.periodLabel, "Bewertungszeitraum");
  if (
    notebook.classes.some(
      (item) =>
        item.name.toLocaleLowerCase("de") === name.toLocaleLowerCase("de"),
    )
  ) {
    throw new RangeError("Dieser Klassenname ist bereits vorhanden.");
  }
  if (input.students.length === 0 || input.students.length > 45) {
    throw new RangeError("Eine Klasse benötigt 1 bis 45 Personen.");
  }
  const classRecord: ClassRecord = {
    id: id(),
    name,
    periodLabel,
    archived: false,
    createdAt: now,
    updatedAt: now,
    students: input.students.map((displayName) => ({
      id: id(),
      displayName: requiredName(displayName, "Personenname"),
      startGradeQuarterSteps: 8,
    })),
    sessions: [],
  };
  return {
    ...notebook,
    currentClassId: classRecord.id,
    classes: [...notebook.classes, classRecord],
  };
}

export function selectClass(notebook: NotebookV1, classId: string): NotebookV1 {
  existingClass(notebook, classId);
  return { ...notebook, currentClassId: classId };
}

export function updateClassDetails(
  notebook: NotebookV1,
  classId: string,
  nameInput: string,
  periodInput: string,
  now: string,
): NotebookV1 {
  existingClass(notebook, classId);
  const name = requiredName(nameInput, "Klassenname");
  const periodLabel = requiredName(periodInput, "Bewertungszeitraum");
  if (
    notebook.classes.some(
      (item) =>
        item.id !== classId &&
        item.name.toLocaleLowerCase("de") === name.toLocaleLowerCase("de"),
    )
  ) {
    throw new RangeError("Dieser Klassenname ist bereits vorhanden.");
  }
  return {
    ...notebook,
    classes: notebook.classes.map((item) =>
      item.id === classId
        ? { ...item, name, periodLabel, updatedAt: now }
        : item,
    ),
  };
}

export function setClassArchived(
  notebook: NotebookV1,
  classId: string,
  archived: boolean,
  now: string,
): NotebookV1 {
  existingClass(notebook, classId);
  return {
    ...notebook,
    classes: notebook.classes.map((item) =>
      item.id === classId ? { ...item, archived, updatedAt: now } : item,
    ),
  };
}
