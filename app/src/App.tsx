import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  addClass,
  selectClass,
  setClassArchived,
  updateClassDetails,
} from "./application/classService";
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
import { parseClassImport } from "./infrastructure/importExport/classImport";
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

function downloadText(filename: string, contents: string, mime: string): void {
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
  download?: (filename: string, contents: string, mime: string) => void;
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
  const [className, setClassName] = useState("");
  const [periodLabel, setPeriodLabel] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [hasPreImportBackup, setHasPreImportBackup] = useState(() => {
    try {
      return localRepository.readPreImportBackup() !== null;
    } catch {
      return false;
    }
  });
  const [dashboardView, setDashboardView] = useState<
    "stunden" | "tabelle" | "verlauf"
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
  const startingRef = useRef(false);

  const currentClass = notebook?.classes.find(
    (item) => item.id === notebook.currentClassId,
  );
  const activeSession = currentClass?.sessions.find(
    (item) => item.id === activeSessionId,
  );
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
  const report = currentClass ? buildClassReport(currentClass) : null;
  const currentGrade = report?.students.find(
    (student) => student.student.id === selectedStudent?.id,
  )?.current;

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

  async function importClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!notebook || !importFile) {
      setError("Bitte eine Klassenliste als CSV- oder TXT-Datei auswählen.");
      return;
    }
    try {
      const names = parseClassImport(await importFile.text(), importFile.name);
      const updated = addClass(
        notebook,
        { name: className, periodLabel, students: names },
        createId,
        now(),
      );
      const saved = apply(() => {
        localRepository.save(updated);
        return updated;
      }, `${names.length} Personen wurden lokal importiert.`);
      if (saved) {
        setClassName("");
        setPeriodLabel("");
        setImportFile(null);
        setActiveSessionId(null);
        setSelectedStudentId(null);
        form.reset();
      }
    } catch (caught) {
      setError(messageFrom(caught));
      setNotice("");
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
      setDashboardView("stunden");
      setHistoryStudentId(null);
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
  }

  function leaveSession(announceSaved = true) {
    setActiveSessionId(null);
    setSelectedStudentId(null);
    startingRef.current = false;
    if (announceSaved) setNotice("Der aktuelle Stand ist lokal gespeichert.");
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
        `${fileName(currentClass.name)}-stunden-v1.csv`,
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

  if (!notebook) {
    return (
      <main className="load-error">
        <h1>Mündliche Mitarbeit</h1>
        <p role="alert">{error}</p>
        <p>
          Die vorhandenen Daten wurden nicht verändert. Bitte den lokalen
          Datenstand prüfen, bevor du erneut öffnest.
        </p>
      </main>
    );
  }

  return (
    <div className="app-shell">
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
        <aside className="sidebar" aria-label="Klassen und Import">
          <section>
            <h2>Klassen</h2>
            {notebook.classes.length === 0 ? (
              <p className="muted">Noch keine Klasse vorhanden.</p>
            ) : null}
            <div className="class-list">
              {notebook.classes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-current={
                    item.id === notebook.currentClassId ? "page" : undefined
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
          <section className="import-panel">
            <h2>Klasse importieren</h2>
            <p className="muted">
              CSV oder TXT: ein Name pro Zeile oder Vorname und Nachname in zwei
              Spalten.
            </p>
            <form onSubmit={importClass}>
              <label htmlFor="class-name">Klassenname</label>
              <input
                id="class-name"
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                required
              />
              <label htmlFor="period-label">Bewertungszeitraum</label>
              <input
                id="period-label"
                value={periodLabel}
                onChange={(event) => setPeriodLabel(event.target.value)}
                placeholder="z. B. Kurs 8b"
                required
              />
              <label htmlFor="class-file">Klassenliste</label>
              <input
                id="class-file"
                type="file"
                accept=".csv,.txt,text/plain,text/csv"
                onChange={(event) =>
                  setImportFile(event.target.files?.[0] ?? null)
                }
                required
              />
              <button className="primary" type="submit">
                Klasse lokal anlegen
              </button>
            </form>
          </section>
          <section className="backup-panel">
            <h2>Datensicherung</h2>
            <p className="muted">
              Die JSON-Datei enthält alle Klassen und Stunden. Bewahre sie
              geschützt auf.
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
          </section>
        </aside>
        <main className="content">
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
          {!currentClass ? (
            <section className="empty-state">
              <h2>Mit einer Klasse beginnen</h2>
              <p>
                Importiere eine Klassenliste, um die mündliche Mitarbeit über
                einen frei gewählten Zeitraum zu dokumentieren.
              </p>
            </section>
          ) : null}
          {currentClass && !activeSession ? (
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
                      onChange={(event) => setDetailPeriod(event.target.value)}
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
                    <button type="button" onClick={exportCsv}>
                      Klasse als CSV exportieren
                    </button>
                  </div>
                )}
                <p className="muted">
                  Der Zeitraum endet nur, wenn du ihn archivierst. Noten werden
                  nicht automatisch zurückgesetzt.
                </p>
              </section>
              {!currentClass.archived ? (
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
              <nav className="view-tabs" aria-label="Klassenansichten">
                <button
                  type="button"
                  aria-current={
                    dashboardView === "stunden" ? "page" : undefined
                  }
                  onClick={() => setDashboardView("stunden")}
                >
                  Stunden
                </button>
                <button
                  type="button"
                  aria-current={
                    dashboardView === "tabelle" ? "page" : undefined
                  }
                  onClick={() => setDashboardView("tabelle")}
                >
                  Tabelle
                </button>
                <button
                  type="button"
                  aria-current={
                    dashboardView === "verlauf" ? "page" : undefined
                  }
                  onClick={() => setDashboardView("verlauf")}
                >
                  Verlauf
                </button>
              </nav>
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
          {currentClass && activeSession ? (
            <>
              <section className="card assessment-header">
                <button
                  className="text-button"
                  type="button"
                  onClick={() => leaveSession()}
                >
                  ← Zur Klasse
                </button>
                <p className="eyebrow">Unterrichtsstunde</p>
                <h2>{sessionLabel(activeSession, currentClass.sessions)}</h2>
                <p>
                  Jede Auswahl wird sofort lokal gespeichert. Du kannst die
                  Erfassung jederzeit unterbrechen.
                </p>
                <div className="progress-row">
                  <strong>
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
                      <h3>{selectedStudent.displayName}</h3>
                      <p className="current-grade">
                        Aktueller Stand:{" "}
                        <strong>
                          {currentGrade
                            ? formatGradeDecimal(currentGrade.gradeQuarterSteps)
                            : "–"}
                        </strong>
                        {currentGrade && currentGrade.bufferPoints > 0
                          ? ` · Puffer ${currentGrade.bufferPoints}/3`
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
                          Gesamtleistung in dieser Stunde bewerten
                        </legend>
                        <div className="rating-grid">
                          {RATING_SYMBOLS.map((symbol) => {
                            const selectedObservation =
                              activeSession.observations[selectedStudent.id];
                            return (
                              <button
                                key={symbol}
                                type="button"
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
                                {symbol}
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
