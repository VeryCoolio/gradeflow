import { assertLessonDate } from "../../../domain/sessions/lessonSequence";
import type { LessonSession } from "../../../domain/sessions/types";
import {
  RATING_SYMBOLS,
  type Observation,
  type RatingSymbol,
} from "../../../domain/grading/types";
import {
  assertNotebook,
  NOTEBOOK_SCHEMA_VERSION,
  type ClassRecord,
  type NotebookV1,
  type StudentRecord,
} from "../schema";

type MutableClassRecord = Omit<ClassRecord, "sessions"> & {
  sessions: LessonSession[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseJson(raw: string, label: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    throw new RangeError(`${label} ist kein gültiges JSON.`);
  }
}

function idOrFallback(value: unknown, fallback: string): string {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "string") throw new RangeError("Ungültige Legacy-ID.");
  return value;
}

function timestampOrFallback(value: unknown, fallback: string): string {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new RangeError("Ungültiger Legacy-Zeitpunkt.");
  }
  return value;
}

function legacySymbol(value: unknown): RatingSymbol {
  if (RATING_SYMBOLS.some((symbol) => symbol === value)) {
    return value as RatingSymbol;
  }
  throw new RangeError(`Unbekanntes Legacy-Bewertungssymbol: ${String(value)}`);
}

function observationsFromEntries(value: unknown): Record<string, Observation> {
  if (value === undefined || value === null) return {};
  if (!isRecord(value)) throw new RangeError("Ungültige Legacy-Einträge.");
  return Object.fromEntries(
    Object.entries(value).map(([studentId, rawEntry]) => {
      const rawSymbol = isRecord(rawEntry) ? rawEntry.symbol : rawEntry;
      return [
        studentId,
        { status: "bewertet", symbol: legacySymbol(rawSymbol) },
      ];
    }),
  );
}

function addLegacySession(
  sessions: LessonSession[],
  draft: Omit<LessonSession, "lessonSequence">,
  className: string,
): void {
  assertLessonDate(draft.date);
  const sameDate = sessions.filter(
    (session) => session.date === draft.date,
  ).length;
  if (sameDate === 2) {
    throw new RangeError(
      `Migration für „${className}“ am ${draft.date} gestoppt: mehr als zwei Stunden. Die Legacy-Daten bleiben gesichert.`,
    );
  }
  sessions.push({ ...draft, lessonSequence: sameDate === 0 ? 1 : 2 });
}

export function migrateLegacyV4(
  rawApp: string,
  rawDrafts: string | null,
  migratedAt: string,
): NotebookV1 {
  if (Number.isNaN(Date.parse(migratedAt))) {
    throw new RangeError("Ungültiger Migrationszeitpunkt.");
  }
  const source = parseJson(rawApp, "Legacy-App-Zustand");
  if (!isRecord(source) || !Array.isArray(source.classes)) {
    throw new RangeError("Legacy-App-Zustand ohne Klassenliste.");
  }
  const classes: MutableClassRecord[] = source.classes.map(
    (rawClass, classIndex) => {
      if (!isRecord(rawClass)) throw new RangeError("Ungültige Legacy-Klasse.");
      const id = idOrFallback(rawClass.id, `legacy-class-${classIndex + 1}`);
      const name =
        typeof rawClass.name === "string" && rawClass.name.trim()
          ? rawClass.name.trim()
          : "Unbenannte Klasse";
      if (
        rawClass.students !== undefined &&
        !Array.isArray(rawClass.students)
      ) {
        throw new RangeError(
          `Ungültige Personenliste in „${name}“. Migration gestoppt.`,
        );
      }
      if (
        rawClass.sessions !== undefined &&
        !Array.isArray(rawClass.sessions)
      ) {
        throw new RangeError(
          `Ungültige Stundenliste in „${name}“. Migration gestoppt.`,
        );
      }
      const students: StudentRecord[] = (
        Array.isArray(rawClass.students) ? rawClass.students : []
      ).map((rawStudent: unknown, studentIndex: number) => {
        if (!isRecord(rawStudent))
          throw new RangeError("Ungültige Legacy-Person.");
        if (
          rawStudent.startGrade !== undefined &&
          rawStudent.startGrade !== 2
        ) {
          throw new RangeError(
            `Migration für „${name}“ gestoppt: abweichender Startwert.`,
          );
        }
        return {
          id: idOrFallback(
            rawStudent.id,
            `legacy-student-${classIndex + 1}-${studentIndex + 1}`,
          ),
          displayName:
            typeof rawStudent.name === "string" && rawStudent.name.trim()
              ? rawStudent.name.trim()
              : "Unbenannt",
          startGradeQuarterSteps: 8,
        };
      });
      const rawSessions = Array.isArray(rawClass.sessions)
        ? rawClass.sessions
        : [];
      const prepared = rawSessions.map(
        (rawSession: unknown, sessionIndex: number) => {
          if (!isRecord(rawSession))
            throw new RangeError("Ungültige Legacy-Stunde.");
          if (typeof rawSession.date !== "string")
            throw new RangeError("Legacy-Stunde ohne Datum.");
          assertLessonDate(rawSession.date);
          return {
            id: idOrFallback(
              rawSession.id,
              `legacy-session-${classIndex + 1}-${sessionIndex + 1}`,
            ),
            date: rawSession.date,
            createdAt: timestampOrFallback(rawSession.createdAt, migratedAt),
            updatedAt: timestampOrFallback(rawSession.updatedAt, migratedAt),
            observations: observationsFromEntries(rawSession.entries),
          };
        },
      );
      prepared.sort((left, right) =>
        left.date < right.date
          ? -1
          : left.date > right.date
            ? 1
            : left.createdAt < right.createdAt
              ? -1
              : left.createdAt > right.createdAt
                ? 1
                : left.id < right.id
                  ? -1
                  : left.id > right.id
                    ? 1
                    : 0,
      );
      const sessions: LessonSession[] = [];
      for (const session of prepared) addLegacySession(sessions, session, name);
      return {
        id,
        name,
        periodLabel: name,
        archived: Boolean(rawClass.completed),
        createdAt: timestampOrFallback(rawClass.createdAt, migratedAt),
        updatedAt: timestampOrFallback(rawClass.updatedAt, migratedAt),
        students,
        sessions,
      };
    },
  );

  if (rawDrafts !== null) {
    const drafts = parseJson(rawDrafts, "Legacy-Entwürfe");
    if (!isRecord(drafts)) throw new RangeError("Ungültige Legacy-Entwürfe.");
    for (const [classId, rawDraft] of Object.entries(drafts)) {
      const classRecord = classes.find((item) => item.id === classId);
      if (
        !classRecord ||
        !isRecord(rawDraft) ||
        typeof rawDraft.date !== "string"
      ) {
        throw new RangeError(
          `Legacy-Entwurf für Klasse ${classId} ist ungültig.`,
        );
      }
      addLegacySession(
        classRecord.sessions,
        {
          id: `legacy-draft-${classId}`,
          date: rawDraft.date,
          createdAt: migratedAt,
          updatedAt: migratedAt,
          observations: observationsFromEntries(rawDraft.entries),
        },
        classRecord.name,
      );
    }
  }

  const currentClassId =
    typeof source.currentClassId === "string" &&
    classes.some((item) => item.id === source.currentClassId)
      ? source.currentClassId
      : (classes[0]?.id ?? null);
  const notebook: NotebookV1 = {
    schemaVersion: NOTEBOOK_SCHEMA_VERSION,
    currentClassId,
    classes,
  };
  assertNotebook(notebook);
  return notebook;
}
