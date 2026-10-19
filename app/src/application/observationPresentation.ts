import { RATING_SYMBOLS, type Observation } from "../domain/grading/types";
import { RATING_GUIDE } from "./ratingGuide";
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

export function observationShortLabel(
  observation: Observation | null | undefined,
): string {
  if (!observation) return "Offen";
  if (observation.status === "bewertet") return observation.symbol;
  return observation.status === "abwesend" ? "AW" : "NB";
}

export function sessionAssessmentSummary(session: LessonSession): string {
  const observations = Object.values(session.observations);
  const labels = [...RATING_SYMBOLS, "AW", "NB"];
  const counts = labels.flatMap((label) => {
    const count = observations.filter(
      (observation) => observationShortLabel(observation) === label,
    ).length;
    return count ? [`${count} × ${label}`] : [];
  });
  return counts.length ? counts.join(" · ") : "Noch keine Eingaben";
}

export interface LessonPresentation {
  readonly label: string;
  readonly showSequence: boolean;
}
const dateFormatter = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" });

// Call after the report's single domain validation. Lookups never revalidate all hours.
export function buildLessonIndex(
  sessions: readonly LessonSession[],
): ReadonlyMap<string, LessonPresentation> {
  const counts = new Map<string, number>();
  for (const session of sessions)
    counts.set(session.date, (counts.get(session.date) ?? 0) + 1);
  return new Map(
    sessions.map((session) => {
      const showSequence = counts.get(session.date) === 2;
      const date = dateFormatter.format(new Date(`${session.date}T12:00:00`));
      return [
        session.id,
        {
          label: `${date} · ${session.lessonSequence}. Stunde`,
          showSequence,
        },
      ];
    }),
  );
}
