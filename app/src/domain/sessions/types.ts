import type { GradeState, Observation } from "../grading/types";

export interface LessonSession {
  readonly id: string;
  readonly date: string;
  readonly lessonSequence: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly observations: Readonly<Record<string, Observation>>;
}

export interface LessonEvent {
  readonly sessionId: string;
  readonly date: string;
  readonly lessonSequence: number;
  readonly observation: Observation;
  readonly before: GradeState;
  readonly after: GradeState;
}

export interface StudentResult {
  readonly studentId: string;
  readonly start: GradeState;
  readonly current: GradeState;
  readonly events: readonly LessonEvent[];
}

export interface ClassRecalculation {
  readonly sortedSessions: readonly LessonSession[];
  readonly students: readonly StudentResult[];
}
