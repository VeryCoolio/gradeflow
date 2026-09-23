import { describe, expect, it } from "vitest";
import {
  LEGACY_APP_KEY,
  LEGACY_DRAFT_KEY,
  IMPORT_REPLACEMENT_BACKUP_KEY,
  LocalRepository,
  MIGRATION_BACKUP_KEY,
  NOTEBOOK_STORAGE_KEY,
  type StoragePort,
} from "./localRepository";
import { EMPTY_NOTEBOOK, type NotebookV1 } from "./schema";

const now = "2026-09-23T12:00:00.000Z";

class MemoryStorage implements StoragePort {
  readonly items = new Map<string, string>();
  readonly writes: string[] = [];
  failKey: string | null = null;

  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    if (this.failKey === key) throw new Error("simulierter Speicherfehler");
    this.items.set(key, value);
    this.writes.push(key);
  }
  removeItem(key: string): void {
    this.items.delete(key);
  }
}

function notebook(): NotebookV1 {
  return {
    ...EMPTY_NOTEBOOK,
    currentClassId: "c1",
    classes: [
      {
        id: "c1",
        name: "Testklasse",
        periodLabel: "Freier Zeitraum",
        archived: false,
        createdAt: now,
        updatedAt: now,
        students: [
          { id: "p1", displayName: "Fiktiv A", startGradeQuarterSteps: 8 },
          { id: "p2", displayName: "Fiktiv B", startGradeQuarterSteps: 8 },
        ],
        sessions: [],
      },
    ],
  };
}

function legacyRaw(): string {
  return JSON.stringify({
    currentClassId: "c1",
    classes: [
      {
        id: "c1",
        name: "Testklasse",
        students: [{ id: "p1", name: "Fiktiv A", startGrade: 2 }],
        sessions: [],
      },
    ],
  });
}

describe("lokales Repository", () => {
  it("liefert ohne vorhandene Daten einen leeren versionierten Stand", () => {
    const storage = new MemoryStorage();
    expect(new LocalRepository(storage, () => now).load()).toEqual(
      EMPTY_NOTEBOOK,
    );
    expect(storage.writes).toEqual([]);
  });

  it("sichert beide Legacy-Schlüssel vor der Migration und lädt danach den neuen Stand", () => {
    const storage = new MemoryStorage();
    const raw = legacyRaw();
    const drafts = JSON.stringify({
      c1: { date: "2026-09-23", entries: { p1: "+" } },
    });
    storage.items.set(LEGACY_APP_KEY, raw);
    storage.items.set(LEGACY_DRAFT_KEY, drafts);
    const repository = new LocalRepository(storage, () => now);
    const migrated = repository.load();
    expect(storage.writes).toEqual([
      MIGRATION_BACKUP_KEY,
      NOTEBOOK_STORAGE_KEY,
    ]);
    expect(repository.readMigrationBackup()).toMatchObject({
      rawApp: raw,
      rawDrafts: drafts,
    });
    expect(migrated.classes[0].sessions[0].observations.p1).toEqual({
      status: "bewertet",
      symbol: "+",
    });
    expect(repository.load()).toEqual(migrated);
    expect(storage.writes).toHaveLength(2);
  });

  it("stellt die alten Schlüssel aus der Sicherung wieder her", () => {
    const storage = new MemoryStorage();
    storage.items.set(LEGACY_APP_KEY, legacyRaw());
    storage.items.set(LEGACY_DRAFT_KEY, "{}");
    const repository = new LocalRepository(storage, () => now);
    repository.load();
    storage.items.delete(LEGACY_APP_KEY);
    storage.items.delete(LEGACY_DRAFT_KEY);
    repository.restoreLegacyBackup();
    expect(storage.getItem(LEGACY_APP_KEY)).toBe(legacyRaw());
    expect(storage.getItem(LEGACY_DRAFT_KEY)).toBe("{}");
  });

  it("überschreibt bei Migrationskonflikt keinen neuen Stand und behält die Sicherung", () => {
    const storage = new MemoryStorage();
    storage.items.set(
      LEGACY_APP_KEY,
      JSON.stringify({
        classes: [
          {
            id: "c1",
            name: "Testklasse",
            students: [],
            sessions: [
              { id: "s1", date: "2026-09-23" },
              { id: "s2", date: "2026-09-23" },
              { id: "s3", date: "2026-09-23" },
            ],
          },
        ],
      }),
    );
    const repository = new LocalRepository(storage, () => now);
    expect(() => repository.load()).toThrow(/mehr als zwei Stunden/);
    expect(storage.getItem(MIGRATION_BACKUP_KEY)).not.toBeNull();
    expect(storage.getItem(NOTEBOOK_STORAGE_KEY)).toBeNull();
  });

  it("stoppt bei seit der Sicherung veränderten Legacy-Daten", () => {
    const storage = new MemoryStorage();
    storage.items.set(LEGACY_APP_KEY, legacyRaw());
    const repository = new LocalRepository(storage, () => now);
    storage.failKey = NOTEBOOK_STORAGE_KEY;
    expect(() => repository.load()).toThrow(/Lokales Speichern fehlgeschlagen/);
    storage.failKey = null;
    storage.items.set(LEGACY_APP_KEY, JSON.stringify({ classes: [] }));
    expect(() => repository.load()).toThrow(
      /seit der Migrationssicherung geändert/,
    );
    expect(storage.getItem(NOTEBOOK_STORAGE_KEY)).toBeNull();
  });

  it("bricht ab, wenn die Sicherung oder die neue Speicherung fehlschlägt", () => {
    const storage = new MemoryStorage();
    storage.items.set(LEGACY_APP_KEY, legacyRaw());
    const repository = new LocalRepository(storage, () => now);
    storage.failKey = MIGRATION_BACKUP_KEY;
    expect(() => repository.load()).toThrow(/Lokales Speichern fehlgeschlagen/);
    expect(storage.getItem(NOTEBOOK_STORAGE_KEY)).toBeNull();
    storage.failKey = NOTEBOOK_STORAGE_KEY;
    expect(() => repository.load()).toThrow(/Lokales Speichern fehlgeschlagen/);
    expect(storage.getItem(MIGRATION_BACKUP_KEY)).not.toBeNull();
    expect(storage.getItem(NOTEBOOK_STORAGE_KEY)).toBeNull();
  });

  it("speichert jede Beobachtung sofort und setzt eine unvollständige Stunde nach Neuladen fort", () => {
    const storage = new MemoryStorage();
    const repository = new LocalRepository(storage, () => now);
    repository.save(notebook());
    repository.createSession("c1", { id: "s1", date: "2026-09-23" });
    const writesBefore = storage.writes.length;
    repository.saveObservation("c1", "s1", "p1", {
      status: "bewertet",
      symbol: "+",
    });
    expect(storage.writes).toHaveLength(writesBefore + 1);
    const reloaded = new LocalRepository(storage, () => now).load();
    expect(reloaded.classes[0].sessions[0].observations).toEqual({
      p1: { status: "bewertet", symbol: "+" },
    });
    expect(reloaded.classes[0].sessions[0].observations.p2).toBeUndefined();
    repository.saveObservation("c1", "s1", "p1", { status: "abwesend" });
    repository.saveObservation("c1", "s1", "p2", {
      status: "nicht_beobachtet",
    });
    expect(
      new LocalRepository(storage, () => now).load().classes[0].sessions[0]
        .observations,
    ).toEqual({
      p1: { status: "abwesend" },
      p2: { status: "nicht_beobachtet" },
    });
  });

  it("entfernt eine alte Beobachtung mit einem Schreibvorgang und berechnet später erneut", () => {
    const storage = new MemoryStorage();
    const repository = new LocalRepository(storage, () => now);
    repository.save(notebook());
    repository.createSession("c1", { id: "s1", date: "2026-09-23" });
    repository.saveObservation("c1", "s1", "p1", {
      status: "bewertet",
      symbol: "++",
    });
    repository.createSession("c1", { id: "s2", date: "2026-09-24" });
    repository.saveObservation("c1", "s2", "p1", {
      status: "bewertet",
      symbol: "+",
    });
    const before = storage.writes.length;
    const changed = repository.removeObservation("c1", "s1", "p1");
    expect(storage.writes).toHaveLength(before + 1);
    expect(changed.classes[0].sessions[0].observations.p1).toBeUndefined();
    expect(() => repository.removeObservation("c1", "s1", "p1")).toThrow(
      /existiert nicht/,
    );
    expect(repository.load().classes[0].sessions[1].observations.p1).toEqual({
      status: "bewertet",
      symbol: "+",
    });
  });

  it("prüft JSON-Sicherungen vor dem Ersetzen und erhält einen Rückfallstand", () => {
    const storage = new MemoryStorage();
    const repository = new LocalRepository(storage, () => now);
    repository.save(notebook());
    const originalRaw = storage.getItem(NOTEBOOK_STORAGE_KEY)!;
    const imported: NotebookV1 = {
      ...notebook(),
      currentClassId: null,
      classes: [],
    };
    expect(() => repository.importNotebookBackup("defekt", true)).toThrow(
      /gültiges JSON/,
    );
    expect(storage.getItem(IMPORT_REPLACEMENT_BACKUP_KEY)).toBeNull();
    expect(() =>
      repository.importNotebookBackup(JSON.stringify(imported)),
    ).toThrow(/Bestätigung/);
    expect(storage.getItem(NOTEBOOK_STORAGE_KEY)).toBe(originalRaw);
    expect(
      repository.importNotebookBackup(JSON.stringify(imported), true),
    ).toEqual(imported);
    expect(storage.getItem(IMPORT_REPLACEMENT_BACKUP_KEY)).toBe(originalRaw);
    expect(() => repository.restorePreImportBackup()).toThrow(/bestätigt/);
    expect(repository.restorePreImportBackup(true)).toEqual(notebook());
  });

  it("bricht einen JSON-Import ab, wenn die Rückfallsicherung nicht geschrieben werden kann", () => {
    const storage = new MemoryStorage();
    const repository = new LocalRepository(storage, () => now);
    repository.save(notebook());
    const originalRaw = storage.getItem(NOTEBOOK_STORAGE_KEY);
    storage.failKey = IMPORT_REPLACEMENT_BACKUP_KEY;
    expect(() =>
      repository.importNotebookBackup(JSON.stringify(EMPTY_NOTEBOOK), true),
    ).toThrow(/Lokales Speichern fehlgeschlagen/);
    expect(storage.getItem(NOTEBOOK_STORAGE_KEY)).toBe(originalRaw);
  });

  it("vergibt dieselbe Datum-Nummer-Kombination in verschiedenen Klassen unabhängig", () => {
    const storage = new MemoryStorage();
    const repository = new LocalRepository(storage, () => now);
    const firstClass = notebook().classes[0];
    repository.save({
      ...notebook(),
      classes: [
        firstClass,
        { ...firstClass, id: "c2", name: "Zweite Testklasse" },
      ],
    });
    repository.createSession("c1", { id: "s1", date: "2026-09-23" });
    const result = repository.createSession("c2", {
      id: "s2",
      date: "2026-09-23",
    });
    expect(
      result.classes.map(
        (classRecord) => classRecord.sessions[0].lessonSequence,
      ),
    ).toEqual([1, 1]);
  });

  it("zeigt Speicherfehler an und lässt den letzten gültigen Stand erhalten", () => {
    const storage = new MemoryStorage();
    const repository = new LocalRepository(storage, () => now);
    repository.save(notebook());
    repository.createSession("c1", { id: "s1", date: "2026-09-23" });
    const before = storage.getItem(NOTEBOOK_STORAGE_KEY);
    storage.failKey = NOTEBOOK_STORAGE_KEY;
    expect(() =>
      repository.saveObservation("c1", "s1", "p1", {
        status: "bewertet",
        symbol: "+",
      }),
    ).toThrow(/Lokales Speichern fehlgeschlagen/);
    expect(storage.getItem(NOTEBOOK_STORAGE_KEY)).toBe(before);
  });

  it("speichert Tausch und Löschung in jeweils einem Schreibvorgang", () => {
    const storage = new MemoryStorage();
    const repository = new LocalRepository(storage, () => now);
    repository.save(notebook());
    repository.createSession("c1", { id: "s1", date: "2026-09-23" });
    repository.createSession("c1", { id: "s2", date: "2026-09-23" });
    expect(() =>
      repository.createSession("c1", { id: "s3", date: "2026-09-23" }),
    ).toThrow(/höchstens zwei/);
    const beforeSwap = storage.writes.length;
    repository.swapSessions("c1", "2026-09-23");
    expect(storage.writes).toHaveLength(beforeSwap + 1);
    expect(
      repository
        .load()
        .classes[0].sessions.map((session) => session.lessonSequence),
    ).toEqual([2, 1]);
    repository.deleteSession("c1", "s1");
    expect(repository.load().classes[0].sessions[0].lessonSequence).toBe(1);
    expect(
      repository.createSession("c1", { id: "s3", date: "2026-09-23" })
        .classes[0].sessions[1].lessonSequence,
    ).toBe(2);
  });

  it("weist beschädigte versionierte Daten ab, ohne sie zu überschreiben", () => {
    const storage = new MemoryStorage();
    storage.items.set(NOTEBOOK_STORAGE_KEY, "{kaputt");
    const repository = new LocalRepository(storage, () => now);
    expect(() => repository.load()).toThrow(/kein gültiges JSON/);
    expect(storage.writes).toEqual([]);
    expect(storage.getItem(NOTEBOOK_STORAGE_KEY)).toBe("{kaputt");
    storage.items.set(
      NOTEBOOK_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 99, classes: [] }),
    );
    expect(() => repository.load()).toThrow(/Schemaversion/);
  });
});
