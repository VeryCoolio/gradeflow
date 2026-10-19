import {
  createLessonSession,
  removeLessonSession,
  swapLessonSequences,
} from "../../domain/sessions/lessonSequence";
import type { LessonSession } from "../../domain/sessions/types";
import type { Observation } from "../../domain/grading/types";
import { migrateLegacyV4 } from "./migrations/legacyV4";
import {
  assertNotebook,
  EMPTY_NOTEBOOK,
  parseNotebook,
  type NotebookV1,
} from "./schema";

export const NOTEBOOK_STORAGE_KEY = "oral-grading-notebook-v1";
export const MIGRATION_BACKUP_KEY = "oral-grading-migration-backup-v1";
export const IMPORT_REPLACEMENT_BACKUP_KEY =
  "oral-grading-import-replacement-backup-v1";
export const CLASS_DELETION_BACKUP_KEY =
  "oral-grading-class-deletion-backup-v1";
export const DAMAGED_NOTEBOOK_BACKUP_KEY =
  "oral-grading-damaged-notebook-backup-v1";
export const LEGACY_APP_KEY = "oral-grading-app-v4";
export const LEGACY_DRAFT_KEY = "oral-grading-session-drafts-v1";

export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface MigrationBackupV1 {
  readonly backupVersion: 1;
  readonly createdAt: string;
  readonly rawApp: string;
  readonly rawDrafts: string | null;
}

function parseBackup(raw: string): MigrationBackupV1 {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new RangeError("Migrationssicherung ist kein gültiges JSON.");
  }
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    !("backupVersion" in value) ||
    value.backupVersion !== 1 ||
    !("rawApp" in value) ||
    typeof value.rawApp !== "string" ||
    !("rawDrafts" in value) ||
    (value.rawDrafts !== null && typeof value.rawDrafts !== "string") ||
    !("createdAt" in value) ||
    typeof value.createdAt !== "string"
  ) {
    throw new RangeError("Migrationssicherung hat ein ungültiges Format.");
  }
  return value as MigrationBackupV1;
}

export class LocalRepository {
  constructor(
    private readonly storage: StoragePort,
    private readonly now: () => string = () => new Date().toISOString(),
    private readonly canWrite: () => boolean = () => true,
  ) {}

  private read(key: string): string | null {
    try {
      return this.storage.getItem(key);
    } catch (error) {
      throw new Error(
        "Lokales Lesen fehlgeschlagen. Der Browser erlaubt keinen Zugriff auf die Daten. Prüfe die Website-Einstellungen dieses Browsers.",
        { cause: error },
      );
    }
  }

  private write(key: string, value: string): void {
    if (!this.canWrite())
      throw new Error(
        "Dieser Tab ist nur zur Ansicht geöffnet. Schließe den bearbeitenden Tab und übernimm hier die Bearbeitung.",
      );
    try {
      this.storage.setItem(key, value);
    } catch (error) {
      throw new Error(
        "Lokales Speichern fehlgeschlagen. Die Änderung wurde nicht übernommen. Der Browser hat das Speichern verhindert; prüfe verfügbaren Speicher und Website-Einstellungen.",
        {
          cause: error,
        },
      );
    }
  }

  private remove(key: string): void {
    if (!this.canWrite())
      throw new Error("Dieser Tab hat keine Schreibberechtigung.");
    try {
      this.storage.removeItem(key);
    } catch (error) {
      throw new Error(`Lokales Löschen fehlgeschlagen: ${key}`, {
        cause: error,
      });
    }
  }

  load(): NotebookV1 {
    const current = this.read(NOTEBOOK_STORAGE_KEY);
    if (current !== null) return parseNotebook(current);

    const rawApp = this.read(LEGACY_APP_KEY);
    const rawDrafts = this.read(LEGACY_DRAFT_KEY);
    if (rawApp === null) {
      if (rawDrafts !== null) {
        throw new RangeError(
          "Legacy-Entwürfe ohne App-Zustand: automatische Migration gestoppt.",
        );
      }
      return EMPTY_NOTEBOOK;
    }

    const backup: MigrationBackupV1 = {
      backupVersion: 1,
      createdAt: this.now(),
      rawApp,
      rawDrafts,
    };
    const existingBackup = this.read(MIGRATION_BACKUP_KEY);
    if (existingBackup === null) {
      this.write(MIGRATION_BACKUP_KEY, JSON.stringify(backup));
    } else {
      const savedBackup = parseBackup(existingBackup);
      if (
        savedBackup.rawApp !== rawApp ||
        savedBackup.rawDrafts !== rawDrafts
      ) {
        throw new RangeError(
          "Legacy-Daten haben sich seit der Migrationssicherung geändert. Automatische Migration gestoppt.",
        );
      }
    }
    const migrated = migrateLegacyV4(rawApp, rawDrafts, backup.createdAt);
    this.save(migrated);
    return migrated;
  }

  save(notebook: NotebookV1): void {
    assertNotebook(notebook);
    this.write(NOTEBOOK_STORAGE_KEY, JSON.stringify(notebook));
  }

  update(change: (current: NotebookV1) => NotebookV1): NotebookV1 {
    const updated = change(this.load());
    this.save(updated);
    return updated;
  }

  saveAfterClassDeletion(deletedClassId: string, updated: NotebookV1): void {
    const current = this.load();
    if (!current.classes.some((item) => item.id === deletedClassId)) {
      throw new RangeError("Die zu löschende Klasse existiert nicht.");
    }
    if (
      updated.classes.length !== current.classes.length - 1 ||
      updated.classes.some((item) => item.id === deletedClassId)
    ) {
      throw new RangeError("Der neue Stand entfernt nicht genau diese Klasse.");
    }
    assertNotebook(updated);
    this.write(CLASS_DELETION_BACKUP_KEY, JSON.stringify(current));
    this.save(updated);
  }

  readClassDeletionBackup(): NotebookV1 | null {
    const raw = this.read(CLASS_DELETION_BACKUP_KEY);
    return raw === null ? null : parseNotebook(raw);
  }

  restoreClassDeletionBackup(confirmed = false): NotebookV1 {
    if (!confirmed)
      throw new RangeError("Wiederherstellung muss bestätigt werden.");
    const previous = this.readClassDeletionBackup();
    if (!previous)
      throw new RangeError("Keine Klassenlöschsicherung vorhanden.");
    this.save(previous);
    return previous;
  }

  readRawNotebook(): string | null {
    return this.read(NOTEBOOK_STORAGE_KEY);
  }

  recoverFromUnreadableNotebook(raw: string, confirmed = false): NotebookV1 {
    if (!confirmed)
      throw new RangeError("Wiederherstellung muss bestätigt werden.");
    const imported = parseNotebook(raw);
    const currentRaw = this.read(NOTEBOOK_STORAGE_KEY);
    if (currentRaw !== null) {
      this.write(DAMAGED_NOTEBOOK_BACKUP_KEY, currentRaw);
    }
    this.save(imported);
    return imported;
  }

  createSession(
    classId: string,
    session: Pick<LessonSession, "id" | "date">,
  ): NotebookV1 {
    const notebook = this.load();
    const classRecord = notebook.classes.find((item) => item.id === classId);
    if (!classRecord) throw new RangeError(`Unbekannte Klassen-ID: ${classId}`);
    const timestamp = this.now();
    const newSession = createLessonSession(classRecord.sessions, {
      ...session,
      createdAt: timestamp,
      updatedAt: timestamp,
      observations: {},
    });
    const updated: NotebookV1 = {
      ...notebook,
      classes: notebook.classes.map((item) =>
        item.id === classId
          ? {
              ...item,
              updatedAt: timestamp,
              sessions: [...item.sessions, newSession],
            }
          : item,
      ),
    };
    this.save(updated);
    return updated;
  }

  saveObservation(
    classId: string,
    sessionId: string,
    studentId: string,
    observation: Observation,
  ): NotebookV1 {
    const notebook = this.load();
    const classRecord = notebook.classes.find((item) => item.id === classId);
    if (!classRecord) throw new RangeError(`Unbekannte Klassen-ID: ${classId}`);
    if (!classRecord.students.some((student) => student.id === studentId)) {
      throw new RangeError(`Unbekannte Personen-ID: ${studentId}`);
    }
    if (!classRecord.sessions.some((session) => session.id === sessionId)) {
      throw new RangeError(`Unbekannte Sitzungs-ID: ${sessionId}`);
    }
    const timestamp = this.now();
    const updated: NotebookV1 = {
      ...notebook,
      classes: notebook.classes.map((item) =>
        item.id === classId
          ? {
              ...item,
              updatedAt: timestamp,
              sessions: item.sessions.map((session) =>
                session.id === sessionId
                  ? {
                      ...session,
                      updatedAt: timestamp,
                      observations: {
                        ...session.observations,
                        [studentId]: observation,
                      },
                    }
                  : session,
              ),
            }
          : item,
      ),
    };
    this.save(updated);
    return updated;
  }

  removeObservation(
    classId: string,
    sessionId: string,
    studentId: string,
  ): NotebookV1 {
    const notebook = this.load();
    const classRecord = notebook.classes.find((item) => item.id === classId);
    const session = classRecord?.sessions.find((item) => item.id === sessionId);
    if (!session || !Object.hasOwn(session.observations, studentId)) {
      throw new RangeError("Der zu entfernende Eintrag existiert nicht.");
    }
    const timestamp = this.now();
    const updated: NotebookV1 = {
      ...notebook,
      classes: notebook.classes.map((item) =>
        item.id === classId
          ? {
              ...item,
              updatedAt: timestamp,
              sessions: item.sessions.map((existing) => {
                if (existing.id !== sessionId) return existing;
                const observations = { ...existing.observations };
                delete observations[studentId];
                return { ...existing, updatedAt: timestamp, observations };
              }),
            }
          : item,
      ),
    };
    this.save(updated);
    return updated;
  }

  swapSessions(classId: string, date: string): NotebookV1 {
    return this.changeSessions(classId, (sessions) =>
      swapLessonSequences(sessions, date),
    );
  }

  deleteSession(classId: string, sessionId: string): NotebookV1 {
    return this.changeSessions(classId, (sessions) =>
      removeLessonSession(sessions, sessionId),
    );
  }

  private changeSessions(
    classId: string,
    change: (sessions: readonly LessonSession[]) => readonly LessonSession[],
  ): NotebookV1 {
    const notebook = this.load();
    if (!notebook.classes.some((item) => item.id === classId)) {
      throw new RangeError(`Unbekannte Klassen-ID: ${classId}`);
    }
    const timestamp = this.now();
    const updated: NotebookV1 = {
      ...notebook,
      classes: notebook.classes.map((item) =>
        item.id === classId
          ? { ...item, updatedAt: timestamp, sessions: change(item.sessions) }
          : item,
      ),
    };
    this.save(updated);
    return updated;
  }

  readMigrationBackup(): MigrationBackupV1 | null {
    const raw = this.read(MIGRATION_BACKUP_KEY);
    return raw === null ? null : parseBackup(raw);
  }

  restoreLegacyBackup(): void {
    const backup = this.readMigrationBackup();
    if (!backup) throw new RangeError("Keine Migrationssicherung vorhanden.");
    this.write(LEGACY_APP_KEY, backup.rawApp);
    if (backup.rawDrafts === null) {
      this.remove(LEGACY_DRAFT_KEY);
    } else {
      this.write(LEGACY_DRAFT_KEY, backup.rawDrafts);
    }
  }

  importNotebookBackup(raw: string, allowReplace = false): NotebookV1 {
    const imported = parseNotebook(raw);
    const current = this.load();
    if (current.classes.length > 0 && !allowReplace) {
      throw new RangeError(
        "Die Sicherung würde vorhandene Klassen ersetzen. Bestätigung erforderlich.",
      );
    }
    const currentRaw = this.read(NOTEBOOK_STORAGE_KEY);
    if (currentRaw !== null) {
      this.write(IMPORT_REPLACEMENT_BACKUP_KEY, currentRaw);
    }
    this.save(imported);
    return imported;
  }

  readPreImportBackup(): NotebookV1 | null {
    const raw = this.read(IMPORT_REPLACEMENT_BACKUP_KEY);
    return raw === null ? null : parseNotebook(raw);
  }

  restorePreImportBackup(confirmed = false): NotebookV1 {
    if (!confirmed)
      throw new RangeError("Wiederherstellung muss bestätigt werden.");
    const raw = this.read(IMPORT_REPLACEMENT_BACKUP_KEY);
    if (raw === null)
      throw new RangeError("Keine frühere Sicherung vorhanden.");
    const previous = parseNotebook(raw);
    this.save(previous);
    return previous;
  }
}
