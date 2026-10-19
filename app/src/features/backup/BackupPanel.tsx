import { useRef, useState, type FormEvent } from "react";
import {
  exportNotebookJson,
  importNotebookJson,
  readNotebookBackup,
} from "../../infrastructure/importExport/jsonBackup";
import type { Download } from "../../infrastructure/importExport/browserDownloads";
import type { LocalRepository } from "../../infrastructure/local/localRepository";
import type { NotebookV1 } from "../../infrastructure/local/schema";

interface Props {
  notebook: NotebookV1 | null;
  repository: LocalRepository;
  canWrite: boolean;
  download: Download;
  confirm: (message: string) => boolean;
  onRestored: (notebook: NotebookV1, message: string) => void;
  onNotice: (message: string) => void;
  onError: (message: string) => void;
}

export function BackupPanel({
  notebook,
  repository,
  canWrite,
  download,
  confirm,
  onRestored,
  onNotice,
  onError,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const importing = useRef(false);
  const recovery = notebook === null;
  function attempt(action: () => void) {
    try {
      action();
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Die Sicherung konnte nicht verarbeitet werden.",
      );
    }
  }
  function available(read: () => unknown) {
    try {
      return read() !== null;
    } catch {
      return false;
    }
  }
  const hasPreImport = available(() => repository.readPreImportBackup());
  const hasDeletedClass = available(() => repository.readClassDeletionBackup());
  const hasMigration = available(() => repository.readMigrationBackup());
  async function importBackup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canWrite || importing.current) return;
    if (!file) {
      onError("Bitte eine JSON-Sicherung auswählen.");
      return;
    }
    const form = event.currentTarget;
    importing.current = true;
    setBusy(true);
    try {
      const raw = await readNotebookBackup(file);
      const validated = importNotebookJson(raw);
      const people = validated.classes.reduce(
        (sum, group) => sum + group.students.length,
        0,
      );
      const lessons = validated.classes.reduce(
        (sum, group) => sum + group.sessions.length,
        0,
      );
      const summary = `Die Sicherung enthält ${validated.classes.length} Klassen, ${people} Personen und ${lessons} Stunden.`;
      if (recovery) {
        if (
          !confirm(
            `${summary} Die lokale Datenbank ist nicht lesbar. Die ausgewählte JSON-Sicherung ersetzt sie. Vorhandene Rohdaten werden zuvor lokal gesichert. Wirklich fortfahren?`,
          )
        )
          return;
        onRestored(
          repository.recoverFromUnreadableNotebook(raw, true),
          "Daten aus der JSON-Sicherung wiederhergestellt.",
        );
      } else {
        if (
          notebook.classes.length &&
          !confirm(
            `${summary} Sie ersetzt den aktuellen Datenstand mit ${notebook.classes.length} Klassen. Der bisherige Stand wird zuvor lokal als Rückfall gesichert. Wirklich fortfahren?`,
          )
        )
          return;
        const updated = repository.importNotebookBackup(raw, true);
        onRestored(
          updated,
          repository.readPreImportBackup() !== null
            ? "Sicherung importiert. Der vorherige Stand bleibt lokal als Rückfall erhalten."
            : "Sicherung importiert.",
        );
      }
      setFile(null);
      form.reset();
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Die Sicherung konnte nicht gelesen werden.",
      );
    } finally {
      importing.current = false;
      setBusy(false);
    }
  }
  function restore(kind: "import" | "deletion") {
    if (!canWrite || importing.current) return;
    const message =
      kind === "import"
        ? "Den Datenstand vor dem letzten JSON-Import wiederherstellen? Der aktuell importierte Stand wird ersetzt."
        : "Den Stand vor der letzten Klassenlöschung wiederherstellen? Alle seitdem vorgenommenen Änderungen werden ersetzt.";
    if (!confirm(message)) return;
    attempt(() =>
      onRestored(
        kind === "import"
          ? repository.restorePreImportBackup(true)
          : repository.restoreClassDeletionBackup(true),
        kind === "import"
          ? "Vorheriger Datenstand wiederhergestellt."
          : "Stand vor der Klassenlöschung wiederhergestellt.",
      ),
    );
  }
  return (
    <section className="card backup-panel">
      {!recovery ? (
        <>
          <p className="eyebrow">Alle Klassen und Stunden</p>
          <h2>Datensicherung</h2>
          <p>
            Die JSON-Sicherung enthält alle Klassen, Personen und Stunden. Sie
            lässt sich hier vollständig wiederherstellen. Excel und CSV dienen
            als lesbare Berichte.
          </p>
          <p className="muted">
            Lokal in diesem Browser gespeichert. Browserdaten können gelöscht
            werden; lade deshalb regelmäßig eine Sicherung herunter und bewahre
            sie geschützt auf. Die lokale Speicherung ist kein Nachweis einer
            Verschlüsselung.
          </p>
          <button
            type="button"
            className="primary"
            onClick={() =>
              attempt(() => {
                download(
                  "gradeflow-notebook-v1.json",
                  exportNotebookJson(notebook),
                  "application/json;charset=utf-8",
                );
                onNotice("Vollständige JSON-Sicherung erstellt.");
              })
            }
          >
            Vollständige JSON-Sicherung herunterladen
          </button>
        </>
      ) : (
        <>
          <p>
            Die vorhandenen Daten wurden nicht verändert. Sichere bei Bedarf die
            Rohdaten und wähle dann eine zuvor heruntergeladene JSON-Sicherung.
          </p>
          <button
            type="button"
            onClick={() =>
              attempt(() => {
                const raw = repository.readRawNotebook();
                if (raw === null)
                  throw new RangeError("Keine Notebook-Rohdaten vorhanden.");
                download(
                  "gradeflow-unlesbare-rohdaten.json",
                  raw,
                  "application/json;charset=utf-8",
                );
                onNotice(
                  "Rohdaten heruntergeladen. Bewahre sie geschützt auf.",
                );
              })
            }
          >
            Vorhandene Notebook-Rohdaten herunterladen
          </button>
        </>
      )}
      <form onSubmit={importBackup}>
        <fieldset disabled={!canWrite || busy}>
          <legend>
            {recovery ? "Daten wiederherstellen" : "Sicherung einlesen"}
          </legend>
          <label htmlFor="backup-file">
            {recovery
              ? "JSON-Sicherung zur Wiederherstellung"
              : "JSON-Sicherung auswählen"}
          </label>
          <input
            id="backup-file"
            type="file"
            accept=".json,application/json"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            required
          />
          <p className="muted">
            Höchstens 5 MiB pro Datei. Die Sicherung wird vollständig geprüft.
            Vorhandene Stunden werden weder gekürzt noch automatisch beendet.
          </p>
          <button type="submit">
            {busy
              ? "Sicherung wird geprüft …"
              : recovery
                ? "Aus Sicherung wiederherstellen"
                : "JSON-Sicherung importieren"}
          </button>
        </fieldset>
      </form>
      {!recovery && hasPreImport ? (
        <button
          type="button"
          disabled={!canWrite || busy}
          onClick={() => restore("import")}
        >
          Stand vor letztem Import wiederherstellen
        </button>
      ) : null}
      {!recovery && hasDeletedClass ? (
        <button
          type="button"
          disabled={!canWrite || busy}
          onClick={() => restore("deletion")}
        >
          Stand vor letzter Klassenlöschung wiederherstellen
        </button>
      ) : null}
      {hasMigration ? (
        <div className="legacy-recovery">
          <p className="muted">
            Die unveränderten Daten vor der Legacy-Migration können gesichert
            oder im selben Browser wiederhergestellt werden. Das neue Notebook
            bleibt dabei erhalten.
          </p>
          <button
            type="button"
            onClick={() =>
              attempt(() => {
                const backup = repository.readMigrationBackup();
                if (!backup)
                  throw new RangeError("Keine Migrationssicherung vorhanden.");
                download(
                  "gradeflow-legacy-migrationssicherung.json",
                  `${JSON.stringify(backup, null, 2)}\n`,
                  "application/json;charset=utf-8",
                );
                onNotice("Originaldaten vor der Migration heruntergeladen.");
              })
            }
          >
            Legacy-Migrationssicherung herunterladen
          </button>
          {!recovery ? (
            <button
              type="button"
              disabled={!canWrite || busy}
              onClick={() => {
                if (
                  !confirm(
                    "Originale Legacy-Schlüssel in diesem Browser wiederherstellen? Das neue Notebook bleibt unverändert; der alte App-Ursprung muss derselbe sein.",
                  )
                )
                  return;
                attempt(() => {
                  repository.restoreLegacyBackup();
                  onNotice(
                    "Legacy-Schlüssel im selben Browser wiederhergestellt. Das neue Notebook bleibt erhalten.",
                  );
                });
              }}
            >
              Legacy-Schlüssel wiederherstellen
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
