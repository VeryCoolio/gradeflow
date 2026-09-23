import type { ClassRecord } from "../infrastructure/local/schema";

const now = "2026-09-23T12:00:00.000Z";

export function reportClass(): ClassRecord {
  return {
    id: "c1",
    name: "Fiktive Klasse",
    periodLabel: "Offen",
    archived: false,
    createdAt: now,
    updatedAt: now,
    students: [
      { id: "p1", displayName: "Fiktiv Ada", startGradeQuarterSteps: 8 },
      { id: "p2", displayName: "Fiktiv Bea", startGradeQuarterSteps: 8 },
    ],
    sessions: [
      {
        id: "s2",
        date: "2026-09-23",
        lessonSequence: 2,
        createdAt: now,
        updatedAt: now,
        observations: {
          p1: { status: "bewertet", symbol: "-" },
          p2: { status: "nicht_beobachtet" },
        },
      },
      {
        id: "s1",
        date: "2026-09-23",
        lessonSequence: 1,
        createdAt: now,
        updatedAt: now,
        observations: {
          p1: { status: "bewertet", symbol: "++" },
          p2: { status: "abwesend" },
        },
      },
      {
        id: "s3",
        date: "2026-09-24",
        lessonSequence: 1,
        createdAt: now,
        updatedAt: now,
        observations: { p1: { status: "bewertet", symbol: "+" } },
      },
    ],
  };
}
