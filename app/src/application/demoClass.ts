import { addClass } from "./classService";
import { schoolYearLabel } from "./schoolYear";
import { assertLessonDate } from "../domain/sessions/lessonSequence";
import type { Observation } from "../domain/grading/types";
import type { ClassRecord, NotebookV1 } from "../infrastructure/local/schema";

export const DEMO_CLASS_NAME = "Demo 8b";
export const DEMO_STUDENT_NAMES = [
  "Fiktiv Ada",
  "Fiktiv Bea",
  "Fiktiv Cem",
  "Fiktiv Dana",
  "Fiktiv Emil",
  "Fiktiv Farah",
  "Fiktiv Greta",
  "Fiktiv Hannes",
  "Fiktiv Ida",
  "Fiktiv Jonas",
  "Fiktiv Kaya",
  "Fiktiv Leon",
  "Fiktiv Mila",
  "Fiktiv Noah",
  "Fiktiv Oskar",
  "Fiktiv Paula",
  "Fiktiv Quinn",
  "Fiktiv Ria",
  "Fiktiv Sami",
  "Fiktiv Tara",
] as const;

export function addDemoClass(
  notebook: NotebookV1,
  createId: () => string,
  now: string,
): NotebookV1 {
  const activeDemo = (group: ClassRecord) =>
    !group.archived && group.demo === true;
  const existing =
    notebook.classes.find(
      (group) => group.id === notebook.currentClassId && activeDemo(group),
    ) ?? notebook.classes.find(activeDemo);
  if (existing) return { ...notebook, currentClassId: existing.id };
  let name = DEMO_CLASS_NAME;
  let number = 2;
  while (
    notebook.classes.some(
      (item) =>
        item.name.toLocaleLowerCase("de") === name.toLocaleLowerCase("de"),
    )
  )
    name = `${DEMO_CLASS_NAME} (${number++})`;
  const created = addClass(
    notebook,
    {
      name,
      periodLabel: schoolYearLabel(now.slice(0, 10)),
      students: DEMO_STUDENT_NAMES,
    },
    createId,
    now,
  );
  return {
    ...created,
    classes: created.classes.map((group) =>
      group.id === created.currentClassId ? { ...group, demo: true } : group,
    ),
  };
}

export function isDemoClass(group: ClassRecord): boolean {
  return (
    group.demo === true ||
    (/^Demo 8b(?: \(\d+\))?$/.test(group.name) &&
      group.students.length === DEMO_STUDENT_NAMES.length &&
      group.students.every(
        (student, index) => student.displayName === DEMO_STUDENT_NAMES[index],
      ))
  );
}

const DEMO_OBSERVATIONS: readonly (Observation | null)[] = [
  { status: "bewertet", symbol: "--" },
  { status: "bewertet", symbol: "-" },
  { status: "bewertet", symbol: "0" },
  { status: "bewertet", symbol: "+" },
  { status: "bewertet", symbol: "++" },
  { status: "abwesend" },
  { status: "nicht_beobachtet" },
  null,
];

export function populateDemoWeeks(
  notebook: NotebookV1,
  classId: string,
  today: string,
  createId: () => string,
  now: string,
): NotebookV1 {
  const group = notebook.classes.find((item) => item.id === classId);
  if (!group || !isDemoClass(group))
    throw new RangeError(
      "Beispielwerte sind nur für eine Demo-Klasse verfügbar.",
    );
  if (group.archived)
    throw new RangeError(
      "Die Demo-Klasse ist archiviert. Öffne sie zuerst wieder.",
    );
  if (group.demoDataGenerated && group.sessions.length)
    throw new RangeError("Die fünf Beispielwochen wurden bereits erstellt.");
  assertLessonDate(today);
  // Fünf vollständige Beispielwochen vor heute bzw. vor der ältesten vorhandenen Stunde.
  const anchorDate = [
    today,
    ...group.sessions.map((session) => session.date),
  ].sort()[0];
  const start = new Date(`${anchorDate}T12:00:00.000Z`);
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7) - 35);
  const sessions = Array.from({ length: 25 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(
      date.getUTCDate() + Math.floor(index / 5) * 7 + (index % 5),
    );
    const observations: Record<string, Observation> = {};
    group.students.forEach((student, studentIndex) => {
      const observation =
        DEMO_OBSERVATIONS[
          (index + studentIndex * 3) % DEMO_OBSERVATIONS.length
        ];
      if (observation) observations[student.id] = observation;
    });
    return {
      id: createId(),
      date: date.toISOString().slice(0, 10),
      lessonSequence: 1,
      createdAt: now,
      updatedAt: now,
      observations,
    };
  });
  return {
    ...notebook,
    classes: notebook.classes.map((item) =>
      item.id === classId
        ? {
            ...item,
            demo: true,
            demoDataGenerated: true,
            updatedAt: now,
            sessions: [...item.sessions, ...sessions],
          }
        : item,
    ),
  };
}
