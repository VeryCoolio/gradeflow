import type { NotebookV1 } from "./schema";
import type { StoragePort } from "./localRepository";

export const WORKSPACE_STORAGE_KEY = "gradeflow-workspace-v1";
export const PAGES = ["klasse", "anlegen", "sicherung", "hilfe"] as const;
export const CLASS_VIEWS = [
  "stunden",
  "tabelle",
  "verlauf",
  "personen",
  "einstellungen",
] as const;
export type Page = (typeof PAGES)[number];
export type ClassView = (typeof CLASS_VIEWS)[number];

export interface WorkspacePosition {
  readonly page: Page;
  readonly classId: string | null;
  readonly view: ClassView;
  readonly sessionId: string | null;
  readonly studentId: string | null;
  readonly historyStudentId: string | null;
}

function validPosition(value: unknown): value is WorkspacePosition {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  return (
    PAGES.includes(p.page as Page) &&
    CLASS_VIEWS.includes(p.view as ClassView) &&
    [p.classId, p.sessionId, p.studentId, p.historyStudentId].every(
      (id) =>
        id === null ||
        (typeof id === "string" && id.length > 0 && id.length <= 1024),
    )
  );
}

export function readWorkspacePosition(
  storage?: StoragePort,
  hash = "",
): WorkspacePosition | null {
  if (hash.length < 16_384 && hash.includes("seite=")) {
    const params = new URLSearchParams(hash.slice(1));
    const fromUrl = {
      page: params.get("seite"),
      classId: params.get("klasse"),
      view: params.get("ansicht"),
      sessionId: params.get("stunde"),
      studentId: params.get("person"),
      historyStudentId: params.get("verlauf"),
    };
    if (validPosition(fromUrl)) return fromUrl;
  }
  try {
    const raw = storage?.getItem(WORKSPACE_STORAGE_KEY);
    if (raw && raw.length < 16_384) {
      const value: unknown = JSON.parse(raw);
      if (validPosition(value)) return value;
    }
  } catch {
    /* Beschädigte Positionsdaten verändern keine Fachdaten. */
  }
  return null;
}

export function workspaceHash(position: WorkspacePosition): string {
  const params = new URLSearchParams({
    seite: position.page,
    ansicht: position.view,
  });
  for (const [key, value] of [
    ["klasse", position.classId],
    ["stunde", position.sessionId],
    ["person", position.studentId],
    ["verlauf", position.historyStudentId],
  ]) {
    if (value) params.set(key!, value);
  }
  return `#${params}`;
}

export function resolveWorkspace(
  position: WorkspacePosition | null,
  notebook: NotebookV1 | null,
) {
  const fallbackId =
    notebook?.currentClassId ?? notebook?.classes[0]?.id ?? null;
  if (!position) {
    const group = notebook?.classes.find((c) => c.id === fallbackId);
    const open =
      group && !group.archived
        ? [...group.sessions]
            .filter(
              (s) => Object.keys(s.observations).length < group.students.length,
            )
            .sort(
              (a, b) =>
                b.createdAt.localeCompare(a.createdAt) ||
                b.id.localeCompare(a.id),
            )[0]
        : null;
    return {
      position: {
        page: "klasse",
        classId: fallbackId,
        view: "stunden",
        sessionId: open?.id ?? null,
        studentId: null,
        historyStudentId: null,
      } as WorkspacePosition,
      notice: "",
    };
  }
  if (!notebook) return { position, notice: "" };
  const group = notebook.classes.find((c) => c.id === position.classId);
  if (!group) {
    return {
      position: {
        ...position,
        ...(position.classId
          ? { page: "klasse" as const, view: "stunden" as const }
          : {}),
        classId: fallbackId,
        sessionId: null,
        studentId: null,
        historyStudentId: null,
      },
      notice: position.classId
        ? "Die zuletzt geöffnete Klasse ist nicht mehr vorhanden. Die Klassenübersicht wurde geöffnet."
        : "",
    };
  }
  const session = group.sessions.find((s) => s.id === position.sessionId);
  const invalidSession = Boolean(
    position.sessionId && (!session || group.archived),
  );
  return {
    position: {
      ...position,
      ...(invalidSession
        ? { page: "klasse" as const, view: "stunden" as const }
        : {}),
      sessionId: invalidSession ? null : position.sessionId,
      studentId: group.students.some((s) => s.id === position.studentId)
        ? position.studentId
        : null,
      historyStudentId: group.students.some(
        (s) => s.id === position.historyStudentId,
      )
        ? position.historyStudentId
        : null,
    },
    notice: invalidSession
      ? "Die zuletzt bearbeitete Stunde ist nicht mehr verfügbar oder die Klasse wurde archiviert. Die Klassenübersicht wurde geöffnet."
      : "",
  };
}
