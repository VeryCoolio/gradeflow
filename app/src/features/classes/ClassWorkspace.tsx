import { countLabel } from "../../application/countLabel";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { compareLessonSessions } from "../../domain/sessions/lessonSequence";
import { observationFor } from "../../domain/sessions/observations";
import type { LessonSession } from "../../domain/sessions/types";
import type { ClassRecord } from "../../infrastructure/local/schema";
import type {
  ClassView,
  TableOptions,
} from "../../infrastructure/local/workspacePosition";
import type { ClassReport } from "../../application/reporting";
import { schoolYearLabel } from "../../application/schoolYear";
import {
  sessionAssessmentSummary,
  observationShortLabel,
} from "../../application/observationPresentation";
import { ClassTable } from "../table/ClassTable";
import { StudentHistory } from "../history/StudentHistory";

const viewLabels = [
  ["stunden", "Stunden"],
  ["tabelle", "Tabelle"],
  ["verlauf", "Verlauf"],
  ["personen", "Personen"],
  ["einstellungen", "Klasse bearbeiten"],
] as const;

interface Props {
  tableOptions: TableOptions;
  setTableOptions: (options: TableOptions) => void;
  registerNavigationGuard: (guard: () => boolean) => () => void;
  confirmNavigation: (message: string) => boolean;
  currentClass: ClassRecord;
  report: ClassReport;
  dashboardView: ClassView;
  setDashboardView: (view: ClassView) => void;
  canWrite: boolean;
  lessonDate: string;
  setLessonDate: (date: string) => void;
  today: () => string;
  historyStudentId: string | null;
  setHistoryStudentId: (id: string) => void;
  lastSwap: { classId: string; date: string } | null;
  error: string;
  exporting: boolean;
  actions: {
    saveDetails: (name: string, period: string) => boolean;
    saveStudentName: (id: string, name: string) => boolean;
    archiveClass: () => void;
    deleteCurrentClass: () => void;
    startSession: (event: FormEvent<HTMLFormElement>) => void;
    openSession: (id: string) => void;
    swapSessions: (date: string) => void;
    deleteStoredSession: (session: LessonSession) => void;
    exportExcel: () => void;
    exportCsv: () => void;
  };
}
export function ClassWorkspace({
  tableOptions,
  setTableOptions,
  registerNavigationGuard,
  confirmNavigation,
  currentClass,
  report,
  dashboardView,
  setDashboardView,
  canWrite,
  lessonDate,
  setLessonDate,
  today,
  historyStudentId,
  setHistoryStudentId,
  lastSwap,
  error,
  exporting,
  actions,
}: Props) {
  const {
    archiveClass,
    deleteCurrentClass,
    startSession,
    swapSessions,
    deleteStoredSession,
    exportExcel,
    exportCsv,
  } = actions;
  const [editingDetails, setEditingDetails] = useState(false);
  const [detailName, setDetailName] = useState("");
  const [detailPeriod, setDetailPeriod] = useState("");
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const swapButtonRef = useRef<HTMLButtonElement>(null);
  const studentInput = useRef<HTMLInputElement>(null);
  const studentTrigger = useRef<HTMLButtonElement>(null);
  const detailsDirty =
    editingDetails &&
    (detailName !== currentClass.name ||
      detailPeriod !== currentClass.periodLabel);
  const studentDirty = Boolean(
    editingStudentId &&
    studentName !==
      currentClass.students.find((person) => person.id === editingStudentId)
        ?.displayName,
  );
  const dirty = detailsDirty || studentDirty;
  const canLeaveEditor = useCallback(() => {
    if (!dirty) return true;
    if (
      !confirmNavigation(
        "Ungespeicherte Namens- oder Zeitraumänderung verwerfen? Mit Abbrechen bleibt deine Eingabe erhalten.",
      )
    ) {
      studentInput.current?.focus();
      return false;
    }
    setEditingDetails(false);
    setEditingStudentId(null);
    return true;
  }, [dirty, confirmNavigation]);
  useEffect(
    () => registerNavigationGuard(canLeaveEditor),
    [registerNavigationGuard, canLeaveEditor],
  );
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    if (editingStudentId && dashboardView === "personen") {
      studentInput.current?.focus();
      studentInput.current?.scrollIntoView?.({ block: "nearest" });
    }
  }, [editingStudentId, dashboardView]);
  function closeStudentEditor() {
    setEditingStudentId(null);
    studentTrigger.current?.focus();
  }
  useEffect(() => {
    if (lastSwap?.classId === currentClass.id) swapButtonRef.current?.focus();
  }, [lastSwap, currentClass.id]);
  function saveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (actions.saveDetails(detailName, detailPeriod)) setEditingDetails(false);
  }
  function saveStudentName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      editingStudentId &&
      actions.saveStudentName(editingStudentId, studentName)
    ) {
      closeStudentEditor();
      setStudentName("");
    }
  }
  const [dateFilter, setDateFilter] = useState("");
  const [lessonPage, setLessonPage] = useState(0);
  const filteredSessions = useMemo(
    () =>
      [...currentClass.sessions]
        .filter((session) => !dateFilter || session.date === dateFilter)
        .sort(
          (a, b) => b.date.localeCompare(a.date) || compareLessonSessions(a, b),
        ),
    [currentClass.sessions, dateFilter],
  );
  const pageCount = Math.max(1, Math.ceil(filteredSessions.length / 20));
  const currentPage = Math.min(lessonPage, pageCount - 1);
  const visibleSessions = filteredSessions.slice(
    currentPage * 20,
    (currentPage + 1) * 20,
  );
  return (
    <>
      <section
        className={`card class-overview ${currentClass.archived ? "is-archived" : ""}`}
      >
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
            {countLabel(currentClass.students.length, "Person", "Personen")}
          </span>
        </div>
      </section>
      <div className="workspace-toolbar">
        <nav className="view-tabs" aria-label="Klassenansichten">
          {viewLabels.map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-current={dashboardView === key ? "page" : undefined}
              data-tour={`view-${key}`}
              onClick={() => setDashboardView(key)}
            >
              {label}
            </button>
          ))}
        </nav>
        <label className="mobile-view-picker">
          <span className="sr-only">Klassenansicht</span>
          <select
            aria-label="Klassenansicht"
            data-tour="view-select"
            value={dashboardView}
            onChange={(event) =>
              setDashboardView(event.target.value as ClassView)
            }
          >
            {viewLabels.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <details className="report-menu">
          <summary>Exportieren</summary>
          <div
            className="report-downloads actions"
            aria-label="Klassenberichte"
          >
            <button type="button" disabled={exporting} onClick={exportExcel}>
              {exporting
                ? "Excel wird erstellt …"
                : "Klasse als Excel exportieren"}
            </button>
            <button type="button" onClick={exportCsv}>
              Klasse als CSV exportieren
            </button>
          </div>
        </details>
      </div>
      {dashboardView === "einstellungen" ? (
        <div className="class-settings">
          <section className="card">
            <h2>Klasse und Bewertungszeitraum</h2>
            <p className="muted">
              Ändere die Bezeichnungen deiner Klasse. Personen, Stunden und
              bisherige Eingaben bleiben erhalten.
            </p>
            <dl className="settings-details">
              <div>
                <dt>Klassenname</dt>
                <dd>{currentClass.name}</dd>
              </div>
              <div>
                <dt>Bewertungszeitraum</dt>
                <dd>{currentClass.periodLabel}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{currentClass.archived ? "Archiviert" : "Geöffnet"}</dd>
              </div>
            </dl>
            <fieldset disabled={!canWrite}>
              <legend>Bezeichnungen ändern</legend>
              {editingDetails ? (
                <form className="details-form" onSubmit={saveDetails}>
                  {detailsDirty ? (
                    <p className="feedback" role="status">
                      Ungespeicherte Änderungen
                    </p>
                  ) : null}
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
              )}
              <p>
                Ein Schuljahr oder Halbjahr ist eine Bezeichnung und löst keinen
                Noten-Reset aus.
              </p>
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
            </fieldset>
          </section>
          <section className="card settings-archive">
            <h3>
              Bewertungszeitraum{" "}
              {currentClass.archived ? "wieder öffnen" : "abschließen"}
            </h3>
            <p>
              Archivierte Klassen bleiben lesbar und exportierbar. Du kannst den
              Zeitraum später wieder öffnen. Es gibt kein automatisches
              Enddatum.
            </p>
            <button type="button" disabled={!canWrite} onClick={archiveClass}>
              {currentClass.archived
                ? "Zeitraum wieder öffnen"
                : "Zeitraum archivieren"}
            </button>
          </section>
          <section className="card settings-danger">
            <h3>Klasse löschen</h3>
            <p>
              Entfernt diese Klasse mit ihren Personen und Stunden nach einer
              Bestätigung. Der vorherige Datenstand wird zunächst lokal als
              Rückfall gespeichert.
            </p>
            <button
              type="button"
              disabled={!canWrite}
              onClick={deleteCurrentClass}
            >
              Klasse löschen
            </button>
          </section>
        </div>
      ) : null}
      {dashboardView === "personen" ? (
        <section className="card class-students">
          <fieldset disabled={!canWrite}>
            <h2>Personennamen bearbeiten</h2>
            <p className="muted">
              Namen lassen sich korrigieren; bisherige Stunden und Bewertungen
              bleiben erhalten.
            </p>
            <ul>
              {currentClass.students.map((student) => (
                <li key={student.id}>
                  <span>{student.displayName}</span>
                  <button
                    type="button"
                    aria-label={`Namen von ${student.displayName} bearbeiten`}
                    onClick={(event) => {
                      if (editingStudentId !== student.id && !canLeaveEditor())
                        return;
                      studentTrigger.current = event.currentTarget;
                      setEditingStudentId(student.id);
                      setStudentName(student.displayName);
                    }}
                  >
                    Namen bearbeiten
                  </button>
                  {editingStudentId === student.id ? (
                    <form
                      onSubmit={saveStudentName}
                      className="student-name-form"
                    >
                      {studentDirty ? (
                        <p role="status">Ungespeicherte Änderungen</p>
                      ) : null}
                      <label htmlFor="student-name">Neuer Personenname</label>
                      <input
                        ref={studentInput}
                        id="student-name"
                        value={studentName}
                        onChange={(event) => setStudentName(event.target.value)}
                        required
                      />
                      <div className="actions">
                        <button className="primary" type="submit">
                          Namen speichern
                        </button>
                        <button type="button" onClick={closeStudentEditor}>
                          Abbrechen
                        </button>
                      </div>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          </fieldset>
        </section>
      ) : null}
      {dashboardView === "stunden" && !currentClass.archived ? (
        <section className="card">
          <h2>Neue Unterrichtsstunde</h2>
          <p className="muted">
            Eine Einschätzung pro Person für die gesamte Stunde, relativ zum
            bisherigen Stand.
          </p>
          <form className="new-session" onSubmit={startSession}>
            <fieldset disabled={!canWrite}>
              <label htmlFor="lesson-date">Datum</label>
              <input
                id="lesson-date"
                type="date"
                value={lessonDate}
                onChange={(event) => setLessonDate(event.target.value)}
                required
              />
              <button
                data-tour="start-lesson"
                className="primary"
                type="submit"
              >
                Stunde beginnen
              </button>
            </fieldset>
          </form>
          <p className="muted">
            Pro Klasse und Datum sind höchstens zwei Stunden möglich.
          </p>
        </section>
      ) : null}

      {dashboardView === "stunden" ? (
        <section className="card">
          <h2>Unterrichtsstunden</h2>
          {currentClass.sessions.length > 0 ? (
            <div className="lesson-search">
              <label htmlFor="lesson-search">
                Stunden an einem Datum suchen
              </label>
              <input
                id="lesson-search"
                type="date"
                value={dateFilter}
                onChange={(event) => {
                  setDateFilter(event.target.value);
                  setLessonPage(0);
                }}
              />
              {dateFilter ? (
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter("");
                    setLessonPage(0);
                  }}
                >
                  Alle Daten anzeigen
                </button>
              ) : null}
            </div>
          ) : null}
          {dateFilter && filteredSessions.length === 0 ? (
            <p role="status">An diesem Datum ist keine Stunde vorhanden.</p>
          ) : null}
          {filteredSessions.length > 20 ? (
            <nav
              className="table-pagination"
              aria-label="Stundenliste blättern"
            >
              <button
                type="button"
                disabled={currentPage === 0}
                onClick={() => setLessonPage(currentPage - 1)}
              >
                Neuere Stunden
              </button>
              <p role="status">
                Stunden {currentPage * 20 + 1}–
                {Math.min((currentPage + 1) * 20, filteredSessions.length)} von{" "}
                {filteredSessions.length}
              </p>
              <button
                type="button"
                disabled={currentPage === pageCount - 1}
                onClick={() => setLessonPage(currentPage + 1)}
              >
                Ältere Stunden
              </button>
            </nav>
          ) : null}

          {currentClass.sessions.length ? (
            <p className="muted">
              Neueste Daten zuerst; am selben Datum die erste vor der zweiten
              Stunde. Die Zusammenfassung zeigt die Eingaben: AW = abwesend, NB
              = nicht beobachtet.
            </p>
          ) : null}
          {currentClass.sessions.length === 0 ? (
            <p className="muted">Noch keine Stunde angelegt.</p>
          ) : (
            <ul className="session-list">
              {visibleSessions.map((session) => {
                const complete =
                  Object.keys(session.observations).length ===
                  currentClass.students.length;
                return (
                  <li key={session.id} data-session-id={session.id}>
                    <span>
                      <strong>{report.lessons.get(session.id)!.label}</strong>
                      <small>
                        {Object.keys(session.observations).length} von{" "}
                        {currentClass.students.length} erfasst ·{" "}
                        {complete ? "vollständig" : "laufend"}
                      </small>
                      <small className="session-summary">
                        {sessionAssessmentSummary(session)}
                      </small>
                      <small className="session-excerpt">
                        Auszug:{" "}
                        {currentClass.students
                          .slice(0, 2)
                          .map(
                            (student) =>
                              `${student.displayName}: ${observationShortLabel(observationFor(session, student.id))}`,
                          )
                          .join(" · ")}
                      </small>
                      {session.lessonSequence === 1 &&
                      report.lessons.get(session.id)!.showSequence &&
                      lastSwap?.classId === currentClass.id &&
                      lastSwap.date === session.date &&
                      !error ? (
                        <small className="order-feedback">
                          Tausch gespeichert. Die bisherige zweite Stunde steht
                          jetzt zuerst.
                        </small>
                      ) : null}
                    </span>
                    {!currentClass.archived ? (
                      <div className="session-actions">
                        <button
                          type="button"
                          onClick={() => {
                            actions.openSession(session.id);
                          }}
                        >
                          {complete ? "Bearbeiten" : "Fortsetzen"}
                        </button>
                        {session.lessonSequence === 1 &&
                        report.lessons.get(session.id)!.showSequence ? (
                          <button
                            type="button"
                            disabled={!canWrite}
                            onClick={() => swapSessions(session.date)}
                            ref={
                              lastSwap?.classId === currentClass.id &&
                              lastSwap.date === session.date
                                ? swapButtonRef
                                : undefined
                            }
                          >
                            Reihenfolge tauschen
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={!canWrite}
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
        <ClassTable
          report={report}
          options={tableOptions}
          onOptionsChange={setTableOptions}
        />
      ) : null}
      {dashboardView === "verlauf" && report ? (
        <StudentHistory
          report={report}
          studentId={historyStudentId ?? report.students[0]?.student.id ?? ""}
          onStudentChange={setHistoryStudentId}
        />
      ) : null}
    </>
  );
}
