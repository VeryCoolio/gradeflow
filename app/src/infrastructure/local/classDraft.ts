import type { StoragePort } from "./localRepository";
import { schoolYearLabel } from "../../application/schoolYear";

export const CLASS_DRAFT_KEY = "gradeflow-class-draft-v1";
export interface ClassDraft {
  version: 1;
  mode: "manuell" | "datei";
  name: string;
  period: string;
  customPeriod: boolean;
  people: { firstName: string; lastName: string }[];
  fileName: string | null;
}
export function emptyClassDraft(today: string): ClassDraft {
  return {
    version: 1,
    mode: "manuell",
    name: "",
    period: schoolYearLabel(today),
    customPeriod: false,
    people: [{ firstName: "", lastName: "" }],
    fileName: null,
  };
}
export function readClassDraft(storage?: StoragePort): ClassDraft | null {
  const raw = storage?.getItem(CLASS_DRAFT_KEY);
  if (!raw) return null;
  if (raw.length > 100_000)
    throw new RangeError("Der Klassenentwurf ist zu groß.");
  const value: unknown = JSON.parse(raw);
  const text = (v: unknown) => typeof v === "string" && v.length <= 255;
  if (!value || typeof value !== "object")
    throw new RangeError("Ungültiger Klassenentwurf.");
  const draft = value as Record<string, unknown>;
  if (
    draft.version !== 1 ||
    !["manuell", "datei"].includes(draft.mode as string) ||
    !text(draft.name) ||
    !text(draft.period) ||
    typeof draft.customPeriod !== "boolean" ||
    !(draft.fileName === null || text(draft.fileName)) ||
    !Array.isArray(draft.people) ||
    draft.people.length < 1 ||
    draft.people.length > 45 ||
    !draft.people.every((person: unknown) => {
      if (!person || typeof person !== "object") return false;
      const p = person as Record<string, unknown>;
      return text(p.firstName) && text(p.lastName);
    })
  )
    throw new RangeError("Ungültiger Klassenentwurf.");
  return draft as unknown as ClassDraft;
}
