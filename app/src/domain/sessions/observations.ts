import type { LessonSession } from "./types";

export function observationFor(session: LessonSession, studentId: string) {
  return Object.hasOwn(session.observations, studentId)
    ? session.observations[studentId]
    : undefined;
}
