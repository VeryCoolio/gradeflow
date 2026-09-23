import type { Student } from "../classes/types";
import { applyObservation, initialGradeState } from "../grading/gradingEngine";
import type { GradeState } from "../grading/types";
import {
  assertUniqueLessonSlots,
  compareLessonSessions,
  removeLessonSession,
  swapLessonSequences,
} from "./lessonSequence";
import type {
  ClassRecalculation,
  LessonEvent,
  LessonSession,
  StudentResult,
} from "./types";

export function recalculateClassState(
  students: readonly Student[],
  sessions: readonly LessonSession[],
): ClassRecalculation {
  assertUniqueLessonSlots(sessions);
  const studentIds = new Set<string>();
  for (const student of students) {
    if (!student.id.trim() || studentIds.has(student.id)) {
      throw new RangeError("Leere oder doppelte Personen-ID.");
    }
    studentIds.add(student.id);
  }

  const sortedSessions = [...sessions].sort(compareLessonSessions);
  const states = new Map<string, GradeState>();
  const events = new Map<string, LessonEvent[]>();
  for (const student of students) {
    states.set(student.id, initialGradeState());
    events.set(student.id, []);
  }

  for (const session of sortedSessions) {
    for (const [studentId, observation] of Object.entries(
      session.observations,
    )) {
      const before = states.get(studentId);
      if (!before) {
        throw new RangeError(`Unbekannte Personen-ID: ${studentId}`);
      }
      const after = applyObservation(before, observation);
      events.get(studentId)?.push({
        sessionId: session.id,
        date: session.date,
        lessonSequence: session.lessonSequence,
        observation,
        before,
        after,
      });
      states.set(studentId, after);
    }
  }

  const results: StudentResult[] = students.map((student) => ({
    studentId: student.id,
    start: initialGradeState(),
    current: states.get(student.id)!,
    events: events.get(student.id)!,
  }));
  return { sortedSessions, students: results };
}

export function recalculateWithSwappedLessonSequences(
  students: readonly Student[],
  sessions: readonly LessonSession[],
  date: string,
): ClassRecalculation {
  return recalculateClassState(students, swapLessonSequences(sessions, date));
}

export function recalculateWithoutLessonSession(
  students: readonly Student[],
  sessions: readonly LessonSession[],
  sessionId: string,
): ClassRecalculation {
  return recalculateClassState(
    students,
    removeLessonSession(sessions, sessionId),
  );
}
