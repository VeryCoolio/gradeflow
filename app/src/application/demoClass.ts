import { addClass } from "./classService";
import type { NotebookV1 } from "../infrastructure/local/schema";

export const DEMO_CLASS_NAME = "Demo 8b";
export const DEMO_STUDENT_NAMES = [
  "Fiktiv Ada",
  "Fiktiv Bea",
  "Fiktiv Cem",
  "Fiktiv Dana",
] as const;

export function addDemoClass(
  notebook: NotebookV1,
  createId: () => string,
  now: string,
): NotebookV1 {
  return addClass(
    notebook,
    {
      name: DEMO_CLASS_NAME,
      periodLabel: "Usability-Test",
      students: DEMO_STUDENT_NAMES,
    },
    createId,
    now,
  );
}
