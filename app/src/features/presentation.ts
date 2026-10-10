import type { Observation } from "../domain/grading/types";
import { RATING_GUIDE } from "../application/ratingGuide";
import { hasVisibleLessonSequence } from "../domain/sessions/lessonSequence";
import type { LessonSession } from "../domain/sessions/types";

export function observationTone(
  observation: Observation | null | undefined,
): string {
  return observation?.status === "bewertet"
    ? RATING_GUIDE[observation.symbol].tone
    : "neutral";
}

export function observationLabel(
  observation: Observation | null | undefined,
): string {
  if (!observation) return "Offen";
  if (observation.status === "bewertet")
    return `Bewertet: ${observation.symbol}`;
  return observation.status === "abwesend" ? "Abwesend" : "Nicht beobachtet";
}

export function sessionLabel(
  session: LessonSession,
  sessions: readonly LessonSession[],
): string {
  const date = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(
    new Date(`${session.date}T12:00:00`),
  );
  return hasVisibleLessonSequence(sessions, session.date)
    ? `${date} · ${session.lessonSequence}. Stunde`
    : date;
}
