import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  addClass,
  removeClass,
  renameStudent,
  selectClass,
  setClassArchived,
  updateClassDetails,
} from "./application/classService";
import { addDemoClass } from "./application/demoClass";
import { formatGradeDecimal } from "./domain/grading/gradeFormat";
import { RATING_SYMBOLS, type Observation } from "./domain/grading/types";
import {
  compareLessonSessions,
  hasVisibleLessonSequence,
} from "./domain/sessions/lessonSequence";
import { buildClassReport } from "./application/reporting";
import type { LessonSession } from "./domain/sessions/types";
import { StudentHistory } from "./features/history/StudentHistory";
import { observationLabel, sessionLabel } from "./features/presentation";
import { ClassTable } from "./features/table/ClassTable";
import { ClassCreation } from "./features/classes/ClassCreation";
import { RatingGuide, RATING_GUIDE } from "./features/assessment/RatingGuide";
import { applyRating } from "./domain/grading/gradingEngine";
import { schoolYearLabel } from "./application/schoolYear";
import { exportClassCsv } from "./infrastructure/importExport/csvExport";
import {
  exportNotebookJson,
  importNotebookJson,
} from "./infrastructure/importExport/jsonBackup";
import { LocalRepository } from "./infrastructure/local/localRepository";
import type { ClassRecord, NotebookV1 } from "./infrastructure/local/schema";

function localToday(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function messageFrom(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Ein unbekannter Fehler ist aufgetreten.";
}

function downloadText(
  filename: string,
  contents: string | Uint8Array<ArrayBuffer>,
  mime: string,
): void {
  const url = URL.createObjectURL(new Blob([contents], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fileName(value: string): string {
  return (
    value
      .trim()
      .replace(/[^\p{L}\p{N}-]+/gu, "_")
      .replace(/^_+|_+$/g, "") || "klasse"
  );
}

function firstIncompleteSession(
  classRecord: ClassRecord,
): LessonSession | undefined {
  return [...classRecord.sessions]
    .filter(
      (session) =>
        Object.keys(session.observations).length < classRecord.students.length,
    )
    .sort(
      (a, b) =>
        b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
    )[0];
}

interface AppProps {
  repository?: LocalRepository;
  createId?: () => string;
  today?: () => string;
  now?: () => string;
  confirmDiscard?: (message: string) => boolean;
  download?: (
    filename: string,
    contents: string | Uint8Array<ArrayBuffer>,
    mime: string,
  ) => void;
}

export function App({
  repository,
  createId = () => crypto.randomUUID(),
  today = localToday,
  now = () => new Date().toISOString(),
  confirmDiscard = (message) => window.confirm(message),
  download = downloadText,
}: AppProps) {
  const localRepository = useMemo(
    () => repository ?? new LocalRepository(window.localStorage),
    [repository],
  );
  const [loadResult] = useState(() => {
    try {
      return { notebook: localRepository.load(), error: "" };
    } catch (error) {
      return { notebook: null, error: messageFrom(error) };
    }
  });
  const [notebook, setNotebook] = useState<NotebookV1 | null>(
    loadResult.notebook,
  );
  const [error, setError] = useState(loadResult.error);
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState<
    "klasse" | "anlegen" | "sicherung" | "hilfe"
  >("klasse");
  const [exporting, setExporting] = useState(false);
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [recoveryFile, setRecoveryFile] = useState<File | null>(null);
  const [hasPreImportBackup, setHasPreImportBackup] = useState(() => {
    try {
      return localRepository.readPreImportBackup() !== null;
    } catch {
      return false;
    }
  });
  const [hasClassDeletionBackup, setHasClassDeletionBackup] = useState(() => {
    try {
      return localRepository.readClassDeletionBackup() !== null;
    } catch {
      return false;
    }
  });
  const [hasMigrationBackup] = useState(() => {
    try {
      return localRepository.readMigrationBackup() !== null;
    } catch {
      return false;
    }
  });
  const [dashboardView, setDashboardView] = useState<
    "stunden" | "tabelle" | "verlauf" | "personen" | "einstellungen"
  >("stunden");
  const [historyStudentId, setHistoryStudentId] = useState<string | null>(null);
  const [lessonDate, setLessonDate] = useState(today);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    const selected = loadResult.notebook?.classes.find(
      (item) => item.id === loadResult.notebook?.currentClassId,
    );
    return selected && !selected.archived
      ? (firstIncompleteSession(selected)?.id ?? null)
      : null;
  });
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [editingDetails, setEditingDetails] = useState(false);
  const [detailName, setDetailName] = useState("");
  const [detailPeriod, setDetailPeriod] = useState("");
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const startingRef = useRef(false);
  const completionRef = useRef<HTMLButtonElement>(null);

  const currentClass = notebook?.classes.find(
    (item) => item.id === notebook.currentClassId,
  );
  const activeSession = currentClass?.sessions.find(
    (item) => item.id === activeSessionId,
  );
  useEffect(() => {
    const main = document.getElementById("main-content");
    main?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [page, dashboardView, currentClass?.id, activeSessionId]);
  const firstOpenStudent = currentClass?.students.find(
    (student) => activeSession && !activeSession.observations[student.id],
  );
  const selectedStudent =
    currentClass?.students.find(
      (student) => student.id === selectedStudentId,
    ) ??
    firstOpenStudent ??
    currentClass?.students[0];
  const capturedCount = activeSession
    ? Object.keys(activeSession.observations).length
    : 0;
  useEffect(() => {
    if (
      activeSessionId &&
      capturedCount === currentClass?.students.length &&
      !error
    ) {
      completionRef.current?.focus();
      completionRef.current?.scrollIntoView?.({ block: "center" });
    }
  }, [activeSessionId, capturedCount, currentClass?.students.length, error]);
  const report = currentClass ? buildClassReport(currentClass) : null;
  const currentGrade = report?.students.find(
    (student) => student.student.id === selectedStudent?.id,
  )?.current;

  const gradeBeforeLesson =
    currentClass && activeSession
      ? (buildClassReport({
          ...currentClass,
          sessions: currentClass.sessions.filter(
            (session) => compareLessonSessions(session, activeSession) < 0,
          ),
        }).students.find(
          (student) => student.student.id === selectedStudent?.id,
        )?.current ?? { gradeQuarterSteps: 8, bufferPoints: 0 })
      : { gradeQuarterSteps: 8, bufferPoints: 0 };

  function apply(action: () => NotebookV1, success: string): NotebookV1 | null {
    try {
      const updated = action();
      setNotebook(updated);
      setError("");
      setNotice(success);
      return updated;
    } catch (caught) {
      setError(messageFrom(caught));
      setNotice("");
      return null;
    }
  }

  function createClass(
    name: string,
    periodLabel: string,
    names: string[],
  ): boolean {
    if (!notebook) return false;
    const saved = apply(() => {
      const updated = addClass(
        notebook,
        { name, periodLabel, students: names },
        createId,
        now(),
      );
      localRepository.save(updated);
      return updated;
    }, `Klasse mit ${names.length} Personen angelegt und lokal gespeichert.`);
    if (!saved) return false;
    setPage("klasse");
    setDashboardView("stunden");
    setActiveSessionId(null);
    setSelectedStudentId(null);
    startingRef.current = false;
    return true;
  }

  function createDemoClass() {
    if (!notebook) return;
    if (
      apply(() => {
        const updated = addDemoClass(notebook, createId, now());
        localRepository.save(updated);
        return updated;
      }, "Demo-Klasse mit ausschließlich fiktiven Namen lokal angelegt.")
    ) {
      setActiveSessionId(null);
      setSelectedStudentId(null);
      setDashboardView("stunden");
      setPage("klasse");
      startingRef.current = false;
    }
  }

  function chooseClass(classId: string) {
    if (!notebook) return;
    const updated = selectClass(notebook, classId);
    if (
      apply(() => {
        localRepository.save(updated);
        return updated;
      }, "Klasse ausgewählt.")
    ) {
      const selected = updated.classes.find((item) => item.id === classId)!;
      setActiveSessionId(
        selected.archived
          ? null
          : (firstIncompleteSession(selected)?.id ?? null),
      );
      setSelectedStudentId(null);
      setEditingDetails(false);
      setEditingStudentId(null);
      setDashboardView("stunden");
      setHistoryStudentId(null);
      setPage("klasse");
      startingRef.current = false;
    }
  }

  function saveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!notebook || !currentClass) return;
    if (
      apply(() => {
        const updated = updateClassDetails(
          notebook,
          currentClass.id,
          detailName,
          detailPeriod,
          now(),
        );
        localRepository.save(updated);
        return updated;
      }, "Klasse und Bewertungszeitraum gespeichert.")
    ) {
      setEditingDetails(false);
    }
  }

  function saveStudentName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!notebook || !currentClass || !editingStudentId) return;
    if (
      apply(() => {
        const updated = renameStudent(
          notebook,
          currentClass.id,
          editingStudentId,
          studentName,
          now(),
        );
        localRepository.save(updated);
        return updated;
      }, "Personenname lokal gespeichert.")
    ) {
      setEditingStudentId(null);
      setStudentName("");
    }
  }

  function deleteCurrentClass() {
    if (!notebook || !currentClass) return;
    if (
      !confirmDiscard(
        `Klasse ${currentClass.name} samt aller Stunden wirklich löschen? Der bisherige Stand wird zuvor lokal als Rückfall gesichert.`,
      )
    )
      return;
    const classId = currentClass.id;
    if (
      apply(() => {
        const updated = removeClass(notebook, classId);
        localRepository.saveAfterClassDeletion(classId, updated);
        return updated;
      }, "Klasse gelöscht. Der vorherige Stand kann lokal wiederhergestellt werden.")
    ) {
      setHasClassDeletionBackup(true);
      setActiveSessionId(null);
      setSelectedStudentId(null);
      setEditingStudentId(null);
      setDashboardView("stunden");
    }
  }

  function restoreDeletedClass() {
    if (
      !confirmDiscard(
        "Den Stand vor der letzten Klassenlöschung wiederherstellen? Alle seitdem vorgenommenen Änderungen werden ersetzt.",
      )
    )
      return;
    if (
      apply(
        () => localRepository.restoreClassDeletionBackup(true),
        "Stand vor der Klassenlöschung wiederhergestellt.",
      )
    ) {
      setActiveSessionId(null);
      setSelectedStudentId(null);
      setEditingStudentId(null);
      setDashboardView("stunden");
    }
  }

  function archiveClass() {
    if (!notebook || !currentClass) return;
    const archived = !currentClass.archived;
    if (
      archived &&
      !confirmDiscard(
        "Bewertungszeitraum wirklich archivieren? Die Daten bleiben erhalten.",
      )
    )
      return;
    if (
      apply(
        () => {
          const updated = setClassArchived(
            notebook,
            currentClass.id,
            archived,
            now(),
          );
          localRepository.save(updated);
          return updated;
        },
        archived
          ? "Bewertungszeitraum archiviert."
          : "Bewertungszeitraum wieder geöffnet.",
      )
    ) {
      setActiveSessionId(null);
      setSelectedStudentId(null);
      startingRef.current = false;
    }
  }

  function startSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentClass || currentClass.archived || startingRef.current) return;
    startingRef.current = true;
    const id = createId();
    const updated = apply(
      () =>
        localRepository.createSession(currentClass.id, {
          id,
          date: lessonDate,
        }),
      "Stunde angelegt und lokal gespeichert.",
    );
    if (updated) {
      setActiveSessionId(id);
      setSelectedStudentId(null);
    } else {
      startingRef.current = false;
    }
  }

  function recordObservation(observation: Observation, clickCount: number) {
    if (clickCount > 1) return;
    if (!currentClass || !activeSession || !selectedStudent) return;
    const updated = apply(
      () =>
        localRepository.saveObservation(
          currentClass.id,
          activeSession.id,
          selectedStudent.id,
          observation,
        ),
      `${selectedStudent.displayName}: lokal gespeichert.`,
    );
    if (!updated) return;
    const updatedSession = updated.classes
      .find((item) => item.id === currentClass.id)!
      .sessions.find((item) => item.id === activeSession.id)!;
    const next = currentClass.students.find(
      (student) => !updatedSession.observations[student.id],
    );
    setSelectedStudentId(next?.id ?? selectedStudent.id);
    if (!next)
      setNotice(
        "Alle Personen sind erfasst. Die gesamte Stunde ist lokal gespeichert.",
      );
  }

  function leaveSession(announceSaved = true) {
    setActiveSessionId(null);
    setSelectedStudentId(null);
    startingRef.current = false;
    if (announceSaved && !error)
      setNotice("Der aktuelle Stand ist lokal gespeichert.");
  }

  function discardSession() {
    if (!currentClass || !activeSession) return;
    if (!confirmDiscard("Diese Stunde samt aller Eingaben wirklich verwerfen?"))
      return;
    if (
      apply(
        () => localRepository.deleteSession(currentClass.id, activeSession.id),
        "Die Stunde wurde verworfen.",
      )
    )
      leaveSession(false);
  }

  function removeCurrentObservation() {
    if (!currentClass || !activeSession || !selectedStudent) return;
    if (!activeSession.observations[selectedStudent.id]) return;
    if (
      !confirmDiscard(
        `Eintrag für ${selectedStudent.displayName} in dieser Stunde wirklich entfernen?`,
      )
    )
      return;
    apply(
      () =>
        localRepository.removeObservation(
          currentClass.id,
          activeSession.id,
          selectedStudent.id,
        ),
      "Eintrag entfernt. Der Verlauf wurde neu berechnet.",
    );
  }

  function swapSessions(date: string) {
    if (!currentClass) return;
    apply(
      () => localRepository.swapSessions(currentClass.id, date),
      "Stundenreihenfolge getauscht. Der Verlauf wurde neu berechnet.",
    );
  }

  function deleteStoredSession(session: LessonSession) {
    if (!currentClass) return;
    if (
      !confirmDiscard(
        `${sessionLabel(session, currentClass.sessions)} samt aller Einträge wirklich löschen?`,
      )
    )
      return;
    apply(
      () => localRepository.deleteSession(currentClass.id, session.id),
      "Stunde gelöscht. Der Verlauf wurde neu berechnet.",
    );
  }

  function exportCsv() {
    if (!currentClass) return;
    try {
      download(
        `${fileName(currentClass.name)}-stunden-v2.csv`,
        exportClassCsv(currentClass),
        "text/csv;charset=utf-8",
      );
      setError("");
      setNotice("CSV-Datei erstellt.");
    } catch (caught) {
      setError(messageFrom(caught));
      setNotice("");
    }
  }

  async function exportExcel() {
    if (!currentClass || exporting) return;
    setExporting(true);
    setNotice("Excel-Bericht wird erstellt …");
    try {
      const { exportClassXlsx, XLSX_MIME } =
        await import("./infrastructure/importExport/excelWorkbook");
      const contents = await exportClassXlsx(currentClass);
      download(
        `${fileName(currentClass.name)}-klassenbericht.xlsx`,
        contents,
        XLSX_MIME,
      );
      setError("");
      setNotice(
        "Excel-Bericht erstellt: Klassenübersicht und ein Tabellenblatt pro Person. Der Download wurde gestartet.",
      );
    } catch (caught) {
      setError(messageFrom(caught));
      setNotice("");
    } finally {
      setExporting(false);
    }
  }

  function exportJson() {
    if (!notebook) return;
    try {
      download(
        "gradeflow-notebook-v1.json",
        exportNotebookJson(notebook),
        "application/json;charset=utf-8",
      );
      setError("");
      setNotice("Vollständige JSON-Sicherung erstellt.");
    } catch (caught) {
      setError(messageFrom(caught));
      setNotice("");
    }
  }

  function exportMigrationBackup() {
    try {
      const backup = localRepository.readMigrationBackup();
      if (!backup) throw new RangeError("Keine Migrationssicherung vorhanden.");
      download(
        "gradeflow-legacy-migrationssicherung.json",
        `${JSON.stringify(backup, null, 2)}\n`,
        "application/json;charset=utf-8",
      );
      setError("");
      setNotice("Originaldaten vor der Migration heruntergeladen.");
    } catch (caught) {
      setError(messageFrom(caught));
      setNotice("");
    }
  }

  function restoreLegacyKeys() {
    if (
      !confirmDiscard(
        "Originale Legacy-Schlüssel in diesem Browser wiederherstellen? Das neue Notebook bleibt unverändert; der alte App-Ursprung muss derselbe sein.",
      )
    )
      return;
    try {
      localRepository.restoreLegacyBackup();
      setError("");
      setNotice(
        "Legacy-Schlüssel im selben Browser wiederhergestellt. Das neue Notebook bleibt erhalten.",
      );
    } catch (caught) {
      setError(messageFrom(caught));
      setNotice("");
    }
  }

  async function importBackup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!backupFile) {
      setError("Bitte eine JSON-Sicherung auswählen.");
      return;
    }
    try {
      const raw = await backupFile.text();
      const validated = importNotebookJson(raw);
      if (
        notebook?.classes.length &&
        !confirmDiscard(
          `Die Sicherung enthält ${validated.classes.length} Klassen. Sie ersetzt den aktuellen Datenstand mit ${notebook.classes.length} Klassen. Der bisherige Stand wird zuvor lokal als Rückfall gesichert. Wirklich fortfahren?`,
        )
      )
        return;
      const imported = apply(
        () => localRepository.importNotebookBackup(raw, true),
        "Sicherung importiert.",
      );
      if (imported) {
        const hasFallback = localRepository.readPreImportBackup() !== null;
        setHasPreImportBackup(hasFallback);
        if (hasFallback)
          setNotice(
            "Sicherung importiert. Der vorherige Stand bleibt lokal als Rückfall erhalten.",
          );
        setBackupFile(null);
        setActiveSessionId(null);
        setSelectedStudentId(null);
        setDashboardView("stunden");
        setHistoryStudentId(null);
        form.reset();
      }
    } catch (caught) {
      setError(messageFrom(caught));
      setNotice("");
    }
  }

  function restorePreImportBackup() {
    if (
      !confirmDiscard(
        "Den Datenstand vor dem letzten JSON-Import wiederherstellen? Der aktuell importierte Stand wird ersetzt.",
      )
    )
      return;
    if (
      apply(
        () => localRepository.restorePreImportBackup(true),
        "Vorheriger Datenstand wiederhergestellt.",
      )
    ) {
      setActiveSessionId(null);
      setSelectedStudentId(null);
      setDashboardView("stunden");
      setHistoryStudentId(null);
    }
  }

  function downloadUnreadableRaw() {
    try {
      const raw = localRepository.readRawNotebook();
      if (raw === null)
        throw new RangeError("Keine Notebook-Rohdaten vorhanden.");
      download(
        "gradeflow-unlesbare-rohdaten.json",
        raw,
        "application/json;charset=utf-8",
      );
      setNotice("Rohdaten heruntergeladen. Bewahre sie geschützt auf.");
    } catch (caught) {
      setError(messageFrom(caught));
    }
  }

  async function recoverUnreadableNotebook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!recoveryFile) {
      setError("Bitte eine JSON-Sicherung auswählen.");
      return;
    }
    try {
      const raw = await recoveryFile.text();
      importNotebookJson(raw);
      if (
        !confirmDiscard(
          "Die lokale Datenbank ist nicht lesbar. Die ausgewählte JSON-Sicherung ersetzt sie. Vorhandene Rohdaten werden zuvor lokal gesichert. Wirklich fortfahren?",
        )
      )
        return;
      const imported = localRepository.recoverFromUnreadableNotebook(raw, true);
      setNotebook(imported);
      setError("");
      setNotice("Daten aus der JSON-Sicherung wiederhergestellt.");
      setRecoveryFile(null);
      setActiveSessionId(null);
      setSelectedStudentId(null);
    } catch (caught) {
      setError(messageFrom(caught));
    }
  }

  if (!notebook) {
    return (
      <main className="load-error">
        <h1>Mündliche Mitarbeit</h1>
        <p role="alert">{error}</p>
        <p>
          Die vorhandenen Daten wurden nicht verändert. Sichere bei Bedarf die
          Rohdaten und wähle dann eine zuvor heruntergeladene JSON-Sicherung.
        </p>
        <button type="button" onClick={downloadUnreadableRaw}>
          Vorhandene Notebook-Rohdaten herunterladen
        </button>
        {hasMigrationBackup ? (
          <button type="button" onClick={exportMigrationBackup}>
            Legacy-Migrationssicherung herunterladen
          </button>
        ) : null}
        {notice ? <p role="status">{notice}</p> : null}
        <form onSubmit={recoverUnreadableNotebook}>
          <label htmlFor="recovery-file">
            JSON-Sicherung zur Wiederherstellung
          </label>
          <input
            id="recovery-file"
            type="file"
            accept=".json,application/json"
            onChange={(event) =>
              setRecoveryFile(event.target.files?.[0] ?? null)
            }
            required
          />
          <button type="submit">Aus Sicherung wiederherstellen</button>
        </form>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Zum Inhalt springen
      </a>
      <header className="topbar">
        <div>
          <p className="eyebrow">Gradeflow · lokal</p>
          <h1>Mündliche Mitarbeit</h1>
        </div>
        <p className="scope">
          Dokumentation der gesamten Unterrichtsstunde. Keine mündlichen
          Prüfungen, Referate oder Präsentationen.
        </p>
      </header>
      <div className="layout">
        <aside className="sidebar" aria-label="Hauptnavigation">
          <p className="eyebrow">Arbeitsbereich</p>
          <nav className="primary-nav" aria-label="Hauptseiten">
            {(
              [
                ["klasse", "Meine Klassen"],
                ["anlegen", "Klasse anlegen"],
                ["sicherung", "Datensicherung"],
                ["hilfe", "Bewertung verstehen"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-current={page === key ? "page" : undefined}
                onClick={() => {
                  setPage(key);
                  setError("");
                  setNotice("");
                }}
              >
                {label}
              </button>
            ))}
          </nav>
          <section className="sidebar-classes">
            <h2>Klassen</h2>
            {!notebook.classes.length ? (
              <p className="muted">Noch keine Klasse vorhanden.</p>
            ) : null}
            <div className="class-list">
              {notebook.classes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-current={
                    page === "klasse" && item.id === notebook.currentClassId
                      ? "page"
                      : undefined
                  }
                  onClick={() => chooseClass(item.id)}
                >
                  <strong>{item.name}</strong>
                  <small>
                    {item.periodLabel}
                    {item.archived ? " · archiviert" : ""}
                  </small>
                </button>
              ))}
            </div>
          </section>
          <p className="local-hint">
            Auf diesem Gerät gespeichert · ohne Cloud
          </p>
        </aside>
        <main className="content" id="main-content" tabIndex={-1}>
          {error ? (
            <p className="feedback error" role="alert">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="feedback success" role="status">
              {notice}
            </p>
          ) : null}
          {page === "anlegen" ? (
            <ClassCreation
              today={today()}
              onCreate={createClass}
              onDemo={createDemoClass}
              onError={(message) => {
                setError(message);
                setNotice("");
              }}
            />
          ) : null}
          {page === "sicherung" ? (
            <section className="card backup-panel">
              <p className="eyebrow">
                Alle Klassen sichern und wiederherstellen
              </p>
              <h2>Datensicherung</h2>
              <p className="muted">
                Die vollständige Sicherung enthält alle Klassen, Personen und
                Stunden als JSON-Datei und kann hier wieder eingelesen werden.
                Der Excel-Bericht einer Klasse ist über die Klassenübersicht
                erreichbar und dient zum Lesen und Weiterverarbeiten. Bewahre
                beide Dateien geschützt auf.
              </p>
              <button type="button" onClick={exportJson}>
                Vollständige JSON-Sicherung herunterladen
              </button>
              <form onSubmit={importBackup}>
                <label htmlFor="backup-file">JSON-Sicherung auswählen</label>
                <input
                  id="backup-file"
                  type="file"
                  accept=".json,application/json"
                  onChange={(event) =>
                    setBackupFile(event.target.files?.[0] ?? null)
                  }
                  required
                />
                <button type="submit">JSON-Sicherung importieren</button>
              </form>
              {hasPreImportBackup ? (
                <button type="button" onClick={restorePreImportBackup}>
                  Stand vor letztem Import wiederherstellen
                </button>
              ) : null}
              {hasClassDeletionBackup ? (
                <button type="button" onClick={restoreDeletedClass}>
                  Stand vor letzter Klassenlöschung wiederherstellen
                </button>
              ) : null}
              {hasMigrationBackup ? (
                <div className="legacy-recovery">
                  <p className="muted">
                    Die unveränderten Daten vor der Legacy-Migration können
                    gesichert oder im selben Browser wiederhergestellt werden.
                    Das neue Notebook bleibt dabei erhalten.
                  </p>
                  <button type="button" onClick={exportMigrationBackup}>
                    Legacy-Migrationssicherung herunterladen
                  </button>
                  <button type="button" onClick={restoreLegacyKeys}>
                    Legacy-Schlüssel wiederherstellen
                  </button>
                </div>
              ) : null}
            </section>
          ) : null}
          {page === "hilfe" ? (
            <>
              <button
                type="button"
                className="text-button"
                onClick={() => setPage("klasse")}
              >
                {activeSession
                  ? "← Zur laufenden Stunde"
                  : "← Zur Klassenübersicht"}
              </button>
              <RatingGuide />
            </>
          ) : null}
          {page === "klasse" && !currentClass ? (
            <section className="empty-state">
              <h2>Mit einer Klasse beginnen</h2>
              <p>
                Lege eine Klasse manuell an oder importiere eine Klassenliste.
                Du kannst die Bedienung auch mit 20 fiktiven Personen
                ausprobieren.
              </p>
              <div className="actions">
                <button
                  className="primary"
                  type="button"
                  onClick={() => setPage("anlegen")}
                >
                  Klasse anlegen
                </button>
                {notebook.classes.length === 0 ? (
                  <button type="button" onClick={createDemoClass}>
                    Demo-Klasse mit fiktiven Namen anlegen
                  </button>
                ) : null}
              </div>
            </section>
          ) : null}
          {page === "klasse" && currentClass && !activeSession ? (
            <>
              <section className="card class-overview">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">
                      {currentClass.archived
                        ? "Archiviert"
                        : "Aktiver Bewertungszeitraum"}
                    </p>
                    <h2>{currentClass.name}</h2>
                    <p>{currentClass.periodLabel}</p>
                  </div>
                  <span className="count-pill">
                    {currentClass.students.length} Personen
                  </span>
                </div>
                <div className="actions">
                  <button
                    className="primary"
                    type="button"
                    disabled={exporting}
                    onClick={exportExcel}
                  >
                    {exporting
                      ? "Excel wird erstellt …"
                      : "Klasse als Excel exportieren"}
                  </button>
                  <button type="button" onClick={exportCsv}>
                    Klasse als CSV exportieren
                  </button>
                </div>
                <p className="muted">
                  Der Zeitraum endet nur durch deine Archivierung. Kein
                  automatischer Noten-Reset.
                </p>
              </section>
              <nav className="view-tabs" aria-label="Klassenansichten">
                {(
                  [
                    ["stunden", "Stunden"],
                    ["tabelle", "Tabelle"],
                    ["verlauf", "Verlauf"],
                    ["personen", "Personen"],
                    ["einstellungen", "Klasse bearbeiten"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    aria-current={dashboardView === key ? "page" : undefined}
                    onClick={() => setDashboardView(key)}
                  >
                    {label}
                  </button>
                ))}
              </nav>
              {dashboardView === "einstellungen" ? (
                <section className="card">
                  <h2>Klasse und Bewertungszeitraum</h2>{" "}
                  {editingDetails ? (
                    <form className="details-form" onSubmit={saveDetails}>
                      <label htmlFor="detail-name">Klassenname</label>
                      <input
                        id="detail-name"
                        value={detailName}
                        onChange={(event) => setDetailName(event.target.value)}
                        required
                      />
                      <label htmlFor="detail-period">Bewertungszeitraum</label>
                      <input
                        id="detail-period"
                        value={detailPeriod}
                        onChange={(event) =>
                          setDetailPeriod(event.target.value)
                        }
                        required
                      />
                      <div className="actions">
                        <button className="primary" type="submit">
                          Änderungen speichern
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDetails(false)}
                        >
                          Abbrechen
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="actions">
                      <button
                        type="button"
                        onClick={() => {
                          setDetailName(currentClass.name);
                          setDetailPeriod(currentClass.periodLabel);
                          setEditingDetails(true);
                        }}
                      >
                        Namen und Zeitraum bearbeiten
                      </button>
                      <button type="button" onClick={archiveClass}>
                        {currentClass.archived
                          ? "Zeitraum wieder öffnen"
                          : "Zeitraum archivieren"}
                      </button>

                      <button type="button" onClick={deleteCurrentClass}>
                        Klasse löschen
                      </button>
                    </div>
                  )}
                  <p className="muted">
                    Der Zeitraum endet nur, wenn du ihn archivierst. Noten
                    werden nicht automatisch zurückgesetzt.
                  </p>
                  <p className="muted">
                    Der errechnete Stand unterstützt die Dokumentation. Die
                    pädagogische Bewertung und eine Endnote entscheidet die
                    Lehrkraft.
                  </p>
                  <div className="actions">
                    <button
                      type="button"
                      onClick={() => {
                        setDetailPeriod(schoolYearLabel(today()));
                        setDetailName(currentClass.name);
                        setEditingDetails(true);
                      }}
                    >
                      Aktuelles Schuljahr als Bezeichnung
                    </button>
                  </div>
                </section>
              ) : null}
              {dashboardView === "personen" ? (
                <section className="card class-students">
                  <h2>Personennamen bearbeiten</h2>
                  <p className="muted">
                    Namen lassen sich korrigieren; bisherige Stunden und
                    Bewertungen bleiben erhalten.
                  </p>
                  <ul>
                    {currentClass.students.map((student) => (
                      <li key={student.id}>
                        <span>{student.displayName}</span>
                        <button
                          type="button"
                          aria-label={`Namen von ${student.displayName} bearbeiten`}
                          onClick={() => {
                            setEditingStudentId(student.id);
                            setStudentName(student.displayName);
                          }}
                        >
                          Namen bearbeiten
                        </button>
                      </li>
                    ))}
                  </ul>
                  {editingStudentId ? (
                    <form
                      onSubmit={saveStudentName}
                      className="student-name-form"
                    >
                      <label htmlFor="student-name">Neuer Personenname</label>
                      <input
                        id="student-name"
                        value={studentName}
                        onChange={(event) => setStudentName(event.target.value)}
                        required
                      />
                      <div className="actions">
                        <button className="primary" type="submit">
                          Namen speichern
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingStudentId(null)}
                        >
                          Abbrechen
                        </button>
                      </div>
                    </form>
                  ) : null}
                </section>
              ) : null}
              {dashboardView === "stunden" ? (
                <section className="scope-card">
                  <h3>Mündliche Mitarbeit während der ganzen Stunde</h3>
                  <p>
                    Eine zusammenfassende Einschätzung pro Person, im Vergleich
                    zum bisherigen Stand. Keine Einzelwortmeldungen, Prüfungen
                    oder Referate.
                  </p>
                  <button type="button" onClick={() => setPage("hilfe")}>
                    Symbole und Berechnung verstehen
                  </button>
                </section>
              ) : null}
              {dashboardView === "stunden" && !currentClass.archived ? (
                <section className="card">
                  <h2>Neue Unterrichtsstunde</h2>
                  <form className="new-session" onSubmit={startSession}>
                    <label htmlFor="lesson-date">Datum</label>
                    <input
                      id="lesson-date"
                      type="date"
                      value={lessonDate}
                      onChange={(event) => setLessonDate(event.target.value)}
                      required
                    />
                    <button className="primary" type="submit">
                      Stunde beginnen
                    </button>
                  </form>
                  <p className="muted">
                    Pro Klasse und Datum sind höchstens zwei Stunden möglich.
                  </p>
                </section>
              ) : null}

              {dashboardView === "stunden" ? (
                <section className="card">
                  <h2>Unterrichtsstunden</h2>
                  {currentClass.sessions.length === 0 ? (
                    <p className="muted">Noch keine Stunde angelegt.</p>
                  ) : (
                    <ul className="session-list">
                      {[...currentClass.sessions]
                        .sort(compareLessonSessions)
                        .reverse()
                        .map((session) => {
                          const complete =
                            Object.keys(session.observations).length ===
                            currentClass.students.length;
                          return (
                            <li key={session.id}>
                              <span>
                                <strong>
                                  {sessionLabel(session, currentClass.sessions)}
                                </strong>
                                <small>
                                  {Object.keys(session.observations).length} von{" "}
                                  {currentClass.students.length} erfasst ·{" "}
                                  {complete ? "vollständig" : "laufend"}
                                </small>
                              </span>
                              {!currentClass.archived ? (
                                <div className="session-actions">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveSessionId(session.id);
                                      setSelectedStudentId(null);
                                    }}
                                  >
                                    {complete ? "Bearbeiten" : "Fortsetzen"}
                                  </button>
                                  {session.lessonSequence === 1 &&
                                  hasVisibleLessonSequence(
                                    currentClass.sessions,
                                    session.date,
                                  ) ? (
                                    <button
                                      type="button"
                                      onClick={() => swapSessions(session.date)}
                                    >
                                      Reihenfolge tauschen
                                    </button>
                                  ) : null}
                                  <button
                                    type="button"
                                    onClick={() => deleteStoredSession(session)}
                                  >
                                    Stunde löschen
                                  </button>
                                </div>
                              ) : null}
                            </li>
                          );
                        })}
                    </ul>
                  )}
                </section>
              ) : null}
              {dashboardView === "tabelle" && report ? (
                <ClassTable report={report} />
              ) : null}
              {dashboardView === "verlauf" && report ? (
                <StudentHistory
                  report={report}
                  studentId={
                    historyStudentId ?? report.students[0]?.student.id ?? ""
                  }
                  onStudentChange={setHistoryStudentId}
                />
              ) : null}
            </>
          ) : null}
          {page === "klasse" && currentClass && activeSession ? (
            <>
              <section className="card assessment-header">
                <button
                  className="text-button"
                  type="button"
                  onClick={() => leaveSession()}
                >
                  ← Zur Klasse
                </button>
                <p className="eyebrow">
                  {currentClass.name} · Unterrichtsstunde
                </p>
                <h2>{sessionLabel(activeSession, currentClass.sessions)}</h2>
                <p>
                  Jede Auswahl wird sofort lokal gespeichert. Du kannst die
                  Erfassung jederzeit unterbrechen.
                </p>
                <div className="progress-row">
                  <strong aria-live="polite" aria-atomic="true">
                    {capturedCount} von {currentClass.students.length} Personen
                    erfasst
                  </strong>
                  <span>
                    {capturedCount === currentClass.students.length
                      ? "Vollständig"
                      : "Laufende Erfassung"}
                  </span>
                </div>
                <progress
                  max={currentClass.students.length}
                  value={capturedCount}
                >
                  {capturedCount} von {currentClass.students.length}
                </progress>
              </section>
              {capturedCount === currentClass.students.length && !error ? (
                <section className="card completion-panel">
                  <p className="eyebrow">Stunde vollständig</p>
                  <h2>Alle Eingaben sind lokal gespeichert</h2>
                  <p>
                    Alle {capturedCount} Personen sind erfasst. Du kannst zur
                    Klassenübersicht zurückkehren oder unten einen Eintrag
                    korrigieren.
                  </p>
                  <button
                    className="primary"
                    type="button"
                    ref={completionRef}
                    onClick={() => leaveSession()}
                  >
                    Zur Klassenübersicht
                  </button>
                </section>
              ) : null}
              <div className="assessment-layout">
                <section className="card student-list">
                  <h3>Personen</h3>
                  {currentClass.students.map((student, index) => (
                    <button
                      key={student.id}
                      type="button"
                      className={
                        student.id === selectedStudent?.id ? "selected" : ""
                      }
                      aria-current={
                        student.id === selectedStudent?.id ? "step" : undefined
                      }
                      onClick={() => setSelectedStudentId(student.id)}
                    >
                      <span>
                        {index + 1}. {student.displayName}
                      </span>
                      <small>
                        {observationLabel(
                          activeSession.observations[student.id],
                        )}
                      </small>
                    </button>
                  ))}
                </section>
                <section className="card grading-panel">
                  {selectedStudent ? (
                    <>
                      <p className="eyebrow">Aktuelle Person</p>
                      <h3 aria-live="polite" aria-atomic="true">
                        {selectedStudent.displayName}
                      </h3>
                      <p className="current-grade">
                        Stand vor dieser Stunde:{" "}
                        <strong>
                          {currentGrade
                            ? formatGradeDecimal(
                                gradeBeforeLesson.gradeQuarterSteps,
                              )
                            : "–"}
                        </strong>
                        {currentGrade && gradeBeforeLesson.bufferPoints > 0
                          ? ` · Puffer ${gradeBeforeLesson.bufferPoints}/3`
                          : ""}
                      </p>
                      <p>
                        Gewählter Status:{" "}
                        <strong>
                          {observationLabel(
                            activeSession.observations[selectedStudent.id],
                          )}
                        </strong>
                      </p>
                      {activeSession.observations[selectedStudent.id] ? (
                        <button
                          type="button"
                          className="remove-observation"
                          onClick={removeCurrentObservation}
                        >
                          Eintrag entfernen
                        </button>
                      ) : null}
                      <fieldset>
                        <legend>
                          Mitarbeit der ganzen Stunde – relativ zum bisherigen
                          Stand
                        </legend>
                        <div className="rating-grid">
                          {RATING_SYMBOLS.map((symbol) => {
                            const selectedObservation =
                              activeSession.observations[selectedStudent.id];
                            return (
                              <button
                                key={symbol}
                                type="button"
                                aria-label={symbol}
                                aria-describedby={`rating-${symbol}`}
                                className={`rating-option ${RATING_GUIDE[symbol].tone}`}
                                aria-pressed={
                                  selectedObservation?.status === "bewertet" &&
                                  selectedObservation.symbol === symbol
                                }
                                onClick={(event) =>
                                  recordObservation(
                                    {
                                      status: "bewertet",
                                      symbol,
                                    },
                                    event.detail,
                                  )
                                }
                              >
                                <strong>{symbol}</strong>
                                <span id={`rating-${symbol}`}>
                                  {RATING_GUIDE[symbol].meaning}
                                </span>
                                <small>
                                  Ergebnis:{" "}
                                  {formatGradeDecimal(
                                    applyRating(gradeBeforeLesson, symbol)
                                      .gradeQuarterSteps,
                                  )}{" "}
                                  · Puffer{" "}
                                  {
                                    applyRating(gradeBeforeLesson, symbol)
                                      .bufferPoints
                                  }
                                  /3
                                </small>
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>
                      <fieldset>
                        <legend>Ohne Bewertung dokumentieren</legend>
                        <div className="status-grid">
                          <button
                            type="button"
                            aria-pressed={
                              activeSession.observations[selectedStudent.id]
                                ?.status === "abwesend"
                            }
                            onClick={(event) =>
                              recordObservation(
                                { status: "abwesend" },
                                event.detail,
                              )
                            }
                          >
                            Abwesend
                          </button>
                          <button
                            type="button"
                            aria-pressed={
                              activeSession.observations[selectedStudent.id]
                                ?.status === "nicht_beobachtet"
                            }
                            onClick={(event) =>
                              recordObservation(
                                { status: "nicht_beobachtet" },
                                event.detail,
                              )
                            }
                          >
                            Nicht beobachtet
                          </button>
                        </div>
                      </fieldset>
                      <p className="muted">
                        Symbole: ++ deutlich besser, + etwas besser, 0 ungefähr
                        gleich, - etwas schlechter, -- deutlich schlechter als
                        der bisherige Stand. Bei Note 1,00 können bis zu drei
                        Pufferpunkte entstehen.
                      </p>
                      <button type="button" onClick={() => setPage("hilfe")}>
                        Bewertung und Puffer erklärt
                      </button>
                    </>
                  ) : null}
                </section>
              </div>
              {capturedCount < currentClass.students.length ? (
                <section className="discard-area">
                  <button type="button" onClick={discardSession}>
                    Laufende Stunde verwerfen
                  </button>
                  <p>
                    Nur nach Bestätigung. Bereits erfasste Eingaben dieser
                    Stunde gehen dabei verloren.
                  </p>
                </section>
              ) : null}
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
