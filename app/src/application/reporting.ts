import {
  buildLessonIndex,
  type LessonPresentation,
} from "./observationPresentation";
import type { GradeState, Observation } from "../domain/grading/types";
import { recalculateClassState } from "../domain/sessions/recalculate";
import type { LessonSession } from "../domain/sessions/types";
import type {
  ClassRecord,
  StudentRecord,
} from "../infrastructure/local/schema";

export interface ReportCell {
  readonly session: LessonSession;
  readonly observation: Observation | null;
  readonly before: GradeState;
  readonly after: GradeState | null;
}

export interface StudentReport {
  readonly student: StudentRecord;
  readonly start: GradeState;
  readonly current: GradeState;
  readonly cells: readonly ReportCell[];
}

export interface ClassReport {
  readonly lessons: ReadonlyMap<string, LessonPresentation>;
  readonly sessions: readonly LessonSession[];
  readonly students: readonly StudentReport[];
}

export function buildClassReport(classRecord: ClassRecord): ClassReport {
  const calculation = recalculateClassState(
    classRecord.students,
    classRecord.sessions,
  );
  return {
    lessons: buildLessonIndex(calculation.sortedSessions),
    sessions: calculation.sortedSessions,
    students: calculation.students.map((result) => {
      const student = classRecord.students.find(
        (candidate) => candidate.id === result.studentId,
      )!;
      const eventBySession = new Map(
        result.events.map((event) => [event.sessionId, event]),
      );
      let previous = result.start;
      return {
        student,
        start: result.start,
        current: result.current,
        cells: calculation.sortedSessions.map((session) => {
          const event = eventBySession.get(session.id);
          const before = previous;
          if (event) previous = event.after;
          return {
            session,
            before,
            observation: event?.observation ?? null,
            after:
              event?.observation.status === "bewertet" ? event.after : null,
          };
        }),
      };
    }),
  };
}
