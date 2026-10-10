import { addClass } from "./classService";
import { schoolYearLabel } from "./schoolYear";
import type { NotebookV1 } from "../infrastructure/local/schema";

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
  let name = DEMO_CLASS_NAME;
  let number = 2;
  while (
    notebook.classes.some(
      (item) =>
        item.name.toLocaleLowerCase("de") === name.toLocaleLowerCase("de"),
    )
  )
    name = `${DEMO_CLASS_NAME} (${number++})`;
  return addClass(
    notebook,
    {
      name,
      periodLabel: schoolYearLabel(now.slice(0, 10)),
      students: DEMO_STUDENT_NAMES,
    },
    createId,
    now,
  );
}
