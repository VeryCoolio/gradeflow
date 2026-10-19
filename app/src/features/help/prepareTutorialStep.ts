import { addClass } from "../../application/classService";
import {
  CLASS_DRAFT_KEY,
  emptyClassDraft,
  readClassDraft,
} from "../../infrastructure/local/classDraft";
import type {
  LocalRepository,
  StoragePort,
} from "../../infrastructure/local/localRepository";
import {
  WORKSPACE_STORAGE_KEY,
  type WorkspacePosition,
} from "../../infrastructure/local/workspacePosition";

// Only the tour's in-memory repository is passed here.
export function prepareTutorialStep(
  {
    repository,
    storage,
  }: { repository: LocalRepository; storage: StoragePort },
  next: number,
) {
  const date = new Date();
  const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const draft = readClassDraft(storage) ?? emptyClassDraft(today);
  draft.name = draft.name.trim() || "Übung 8b";
  if (next === 2 || next === 3) {
    if (next === 3) {
      draft.mode = "manuell";
      draft.people = draft.people.map((person, index) => ({
        firstName: person.firstName.trim() || (index === 0 ? "Ada" : "Fiktiv"),
        lastName:
          person.lastName.trim() ||
          (index === 0 ? "Beispiel" : `Person ${index + 1}`),
      }));
    }
    storage.setItem(CLASS_DRAFT_KEY, JSON.stringify(draft));
  }

  let notebook = repository.load();
  let group = notebook.classes.find((item) => item.id !== "tutorial-existing");
  if (next >= 4 && !group) {
    const name = notebook.classes.some(
      (item) =>
        item.name.toLocaleLowerCase("de") ===
        draft.name.toLocaleLowerCase("de"),
    )
      ? "Übung 8b"
      : draft.name;
    notebook = addClass(
      notebook,
      {
        name,
        periodLabel: draft.period,
        students: draft.people.map(
          (person) =>
            `${person.firstName.trim() || "Ada"} ${person.lastName.trim() || "Beispiel"}`,
        ),
      },
      () => crypto.randomUUID(),
      date.toISOString(),
    );
    repository.save(notebook);
    storage.removeItem(CLASS_DRAFT_KEY);
    group = notebook.classes.find((item) => item.id !== "tutorial-existing")!;
  }
  let session = group?.sessions[0];
  if (next >= 5 && group && !session) {
    notebook = repository.createSession(group.id, {
      id: crypto.randomUUID(),
      date: today,
    });
    session = notebook.classes.find((item) => item.id === group.id)!
      .sessions[0];
  }
  if (next >= 6 && group && session) {
    for (const student of group.students) {
      if (!session.observations[student.id]) {
        repository.saveObservation(group.id, session.id, student.id, {
          status: "bewertet",
          symbol: "+",
        });
      }
    }
  }
  const position: WorkspacePosition = {
    page:
      next <= 3
        ? "anlegen"
        : next >= 14
          ? "ueber"
          : next >= 11
            ? "sicherung"
            : "klasse",
    classId:
      next >= 10 ? "tutorial-existing" : (group?.id ?? "tutorial-existing"),
    view: next === 8 ? "tabelle" : next === 9 ? "verlauf" : "stunden",
    sessionId: next === 5 || next === 6 ? (session?.id ?? null) : null,
    studentId: group?.students[0]?.id ?? null,
    historyStudentId: null,
  };
  storage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(position));
}
