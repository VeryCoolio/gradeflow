import { AppNavigation } from "./components/AppNavigation";
import { ClassSwitcher } from "./components/ClassSwitcher";
import { AboutPage, DataPage } from "./features/help/InfoPages";
import { Tutorial, type TutorialAction } from "./features/help/Tutorial";
import { AssessmentWorkspace } from "./features/assessment/AssessmentWorkspace";
import { ClassWorkspace } from "./features/classes/ClassWorkspace";
import { BackupPanel } from "./features/backup/BackupPanel";
import {
  downloadText,
  fileName,
} from "./infrastructure/importExport/browserDownloads";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  addClass,
  removeClass,
  renameStudent,
  selectClass,
  setClassArchived,
  updateClassDetails,
} from "./application/classService";
import { addDemoClass } from "./application/demoClass";
import { type Observation } from "./domain/grading/types";
import { buildClassReport } from "./application/reporting";
import type { LessonSession } from "./domain/sessions/types";
import { observationShortLabel } from "./application/observationPresentation";
import { ClassCreation } from "./features/classes/ClassCreation";
import { RatingGuide } from "./features/assessment/RatingGuide";
import { exportClassCsv } from "./infrastructure/importExport/csvExport";
import type {
  LocalRepository,
  StoragePort,
} from "./infrastructure/local/localRepository";
import { useNotebook } from "./features/useNotebook";
import { useWorkspace } from "./features/useWorkspace";
import { browserStorage } from "./infrastructure/local/browserStorage";
import type { Page, ClassView } from "./infrastructure/local/workspacePosition";
import { observationFor } from "./domain/sessions/observations";
import type { NotebookV1 } from "./infrastructure/local/schema";

function localToday(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function messageFrom(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Ein unbekannter Fehler ist aufgetreten.";
}

interface AppProps {
  practice?: boolean;
  onTutorialAction?: (action: TutorialAction) => void;
  repository?: LocalRepository;
  workspaceStorage?: StoragePort;
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
  practice = false,
  onTutorialAction,
  repository,
  workspaceStorage,
  createId = () => crypto.randomUUID(),
  today = localToday,
  now = () => new Date().toISOString(),
  confirmDiscard = (message) => window.confirm(message),
  download = downloadText,
}: AppProps) {
  const {
    repository: localRepository,
    notebook,
    setNotebook,
    error,
    setError,
    access,
    canWrite,
    requestAccess,
  } = useNotebook(repository);
  const {
    position,
    warning: workspaceWarning,
    change: changeWorkspace,
  } = useWorkspace(
    notebook,
    workspaceStorage ?? (repository ? undefined : browserStorage),
    canWrite,
    !practice,
  );
  const {
    page,
    classId,
    view: dashboardView,
    sessionId: activeSessionId,
    studentId: selectedStudentId,
    historyStudentId,
  } = position;
  const setPage = (page: Page) => changeWorkspace({ page });
  const setDashboardView = (view: ClassView) => changeWorkspace({ view });
  const setActiveSessionId = (sessionId: string | null) =>
    changeWorkspace({ sessionId });
  const setSelectedStudentId = (studentId: string | null) =>
    changeWorkspace({ studentId });
  const setHistoryStudentId = (historyStudentId: string | null) =>
    changeWorkspace({ historyStudentId });
  const [notice, setNotice] = useState("");
  const [tutorialRequest, setTutorialRequest] = useState(0);
  const tutorialStorageError = useCallback(
    () =>
      setNotice(
        "Der Tutorial-Status konnte nicht gespeichert werden. Die Einführung kann beim nächsten Besuch erneut erscheinen.",
      ),
    [],
  );
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);
  const [lastSwap, setLastSwap] = useState<{
    classId: string;
    date: string;
  } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [lessonDate, setLessonDate] = useState(today);
  const startingRef = useRef(false);
  const [failedObservation, setFailedObservation] = useState<{
    studentId: string;
    observation: Observation;
  } | null>(null);

  const currentClass = notebook?.classes.find((item) => item.id === classId);
  const activeSession = currentClass?.sessions.find(
    (item) => item.id === activeSessionId,
  );
  useEffect(() => {
    const main = document.getElementById("main-content");
    main?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [page, dashboardView, currentClass?.id, activeSessionId]);
  const firstOpenStudent = currentClass?.students.find(
    (student) => activeSession && !observationFor(activeSession, student.id),
  );
  const selectedStudent =
    currentClass?.students.find(
      (student) => student.id === selectedStudentId,
    ) ??
    firstOpenStudent ??
    currentClass?.students[0];
  const report = useMemo(
    () => (currentClass ? buildClassReport(currentClass) : null),
    [currentClass],
  );
  const gradeBeforeLesson = report?.students
    .find((row) => row.student.id === selectedStudent?.id)
    ?.cells.find((cell) => cell.session.id === activeSessionId)?.before ?? {
    gradeQuarterSteps: 8,
    bufferPoints: 0,
  };

  const lastError = useRef("");
  function apply(action: () => NotebookV1, success: string): NotebookV1 | null {
    try {
      const updated = action();
      setNotebook(updated);
      if (
        updated.classes.length > (notebook?.classes.length ?? 0) ||
        !updated.classes.some((c) => c.id === classId)
      ) {
        changeWorkspace({
          classId: updated.currentClassId,
          sessionId: null,
          studentId: null,
        });
      }
      setError("");
      setNotice(success);
      return updated;
    } catch (caught) {
      lastError.current = messageFrom(caught);
      setError(lastError.current);
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
      return localRepository.update((current) =>
        addClass(
          current,
          { name, periodLabel, students: names },
          createId,
          now(),
        ),
      );
    }, `Klasse mit ${names.length} Personen angelegt und lokal gespeichert.`);
    if (!saved) return false;
    setPage("klasse");
    setDashboardView("stunden");
    setActiveSessionId(null);
    setSelectedStudentId(null);
    startingRef.current = false;
    onTutorialAction?.("class-created");
    return true;
  }

  function createDemoClass() {
    if (!notebook) return;
    if (
      apply(() => {
        return localRepository.update((current) =>
          addDemoClass(current, createId, now()),
        );
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
    if (
      failedObservation &&
      !confirmDiscard(
        "Die letzte Eingabe wurde nicht gespeichert. Trotzdem zu einer anderen Klasse wechseln?",
      )
    )
      return;
    const updated = apply(
      () => selectClass(localRepository.load(), classId),
      "Klasse ausgewählt.",
    );
    if (updated) {
      changeWorkspace({ classId, sessionId: null });
      setFailedObservation(null);
      setSelectedStudentId(null);
      setDashboardView("stunden");
      setHistoryStudentId(null);
      setPage("klasse");
      startingRef.current = false;
      onTutorialAction?.("class-switched");
    }
  }

  function saveDetails(name: string, period: string): boolean {
    if (!currentClass) return false;
    return !!apply(
      () =>
        localRepository.update((current) =>
          updateClassDetails(current, currentClass.id, name, period, now()),
        ),
      "Klasse und Bewertungszeitraum gespeichert.",
    );
  }
  function saveStudentName(studentId: string, name: string): boolean {
    if (!currentClass) return false;
    return !!apply(
      () =>
        localRepository.update((current) =>
          renameStudent(current, currentClass.id, studentId, name, now()),
        ),
      "Personenname lokal gespeichert.",
    );
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
        const updated = removeClass(localRepository.load(), classId);
        localRepository.saveAfterClassDeletion(classId, updated);
        return updated;
      }, "Klasse gelöscht. Der vorherige Stand kann lokal wiederhergestellt werden.")
    ) {
      setActiveSessionId(null);
      setSelectedStudentId(null);
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
          return localRepository.update((current) =>
            setClassArchived(current, currentClass.id, archived, now()),
          );
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
      setReviewSessionId(null);
      setActiveSessionId(id);
      setSelectedStudentId(null);
      onTutorialAction?.("lesson-started");
    } else {
      startingRef.current = false;
    }
  }

  function recordObservation(
    observation: Observation,
    clickCount: number,
    student = selectedStudent,
  ) {
    if (clickCount > 1) return;
    if (!currentClass || !activeSession || !student) return;
    const updated = apply(
      () =>
        localRepository.saveObservation(
          currentClass.id,
          activeSession.id,
          student.id,
          observation,
        ),
      `${student.displayName}: ${observationShortLabel(observation)} lokal gespeichert.`,
    );
    if (!updated) {
      setFailedObservation({ studentId: student.id, observation });
      setError(
        `Die Eingabe für ${student.displayName} wurde nicht gespeichert. ${lastError.current}`,
      );
      return;
    }
    setFailedObservation(null);
    onTutorialAction?.("observation-saved");
    const updatedSession = updated.classes
      .find((item) => item.id === currentClass.id)!
      .sessions.find((item) => item.id === activeSession.id)!;
    const next = currentClass.students.find(
      (student) => !observationFor(updatedSession, student.id),
    );
    setSelectedStudentId(next?.id ?? student.id);
    if (!next)
      setNotice(
        "Alle Personen sind erfasst. Die gesamte Stunde ist lokal gespeichert.",
      );
  }

  function retryObservation() {
    const student = currentClass?.students.find(
      (person) => person.id === failedObservation?.studentId,
    );
    if (failedObservation && student)
      recordObservation(failedObservation.observation, 1, student);
  }
  function leaveSession(announceSaved = true) {
    onTutorialAction?.("lesson-left");
    setFailedObservation(null);
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
    if (!observationFor(activeSession, selectedStudent.id)) return;
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
    const updated = apply(
      () => localRepository.swapSessions(currentClass.id, date),
      `${date.split("-").reverse().join(".")}: Stunden getauscht und lokal gespeichert. Die bisherige zweite Stunde ist jetzt die erste; der Verlauf wurde neu berechnet.`,
    );
    if (updated) setLastSwap({ classId: currentClass.id, date });
  }

  function deleteStoredSession(session: LessonSession) {
    if (!currentClass) return;
    if (
      !confirmDiscard(
        `${report!.lessons.get(session.id)!.label} samt aller Einträge wirklich löschen?`,
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

  if (access === "waiting" && notebook) {
    return (
      <main className="load-error">
        <h1>Mündliche Mitarbeit</h1>
        <p role="status">Lokale Daten werden vorbereitet …</p>
      </main>
    );
  }

  const backupProps = {
    repository: localRepository,
    canWrite,
    download,
    confirm: confirmDiscard,
    onRestored: (updated: NotebookV1, message: string) => {
      setNotebook(updated);
      changeWorkspace({
        classId: updated.currentClassId,
        sessionId: null,
        studentId: null,
        historyStudentId: null,
        view: "stunden",
        ...(!notebook ? { page: "klasse" as const } : {}),
      });
      setError("");
      setNotice(message);
      setFailedObservation(null);
    },
    onNotice: (message: string) => {
      setError("");
      setNotice(message);
    },
    onError: (message: string) => {
      setError(message);
      setNotice("");
    },
  };
  if (!notebook) {
    return (
      <main className="load-error">
        <h1>Mündliche Mitarbeit</h1>
        <p role="alert">{error}</p>
        {notice ? <p role="status">{notice}</p> : null}
        <BackupPanel {...backupProps} notebook={null} />
      </main>
    );
  }

  const application = (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Zum Inhalt springen
      </a>
      <AppNavigation
        page={page}
        classes={notebook.classes}
        classId={classId}
        onTutorial={() => setTutorialRequest((value) => value + 1)}
        onHelpOpen={() => onTutorialAction?.("help-opened")}
        onClass={chooseClass}
        onPage={(next) => {
          changeWorkspace({
            page: next,
            ...(next === "klasse" ? { sessionId: null, studentId: null } : {}),
          });
          setError("");
          setNotice("");
          setFailedObservation(null);
          if (next === "anlegen" || next === "sicherung" || next === "ueber")
            onTutorialAction?.(`page-${next}`);
        }}
      />
      <div className="layout">
        <ClassSwitcher
          classes={notebook.classes}
          classId={classId}
          onClass={chooseClass}
        />
        <main className="content" id="main-content" tabIndex={-1}>
          {!canWrite ? (
            <aside
              className="feedback readonly-notice"
              aria-label="Nur zur Ansicht"
            >
              <strong>
                {access === "readonly"
                  ? "Dieser Tab ist zur Ansicht geöffnet."
                  : "Bearbeitung ist in diesem Browser derzeit nicht verfügbar."}
              </strong>
              <p>
                {access === "readonly"
                  ? "Ein anderer Tab bearbeitet diese Daten. Neue Eingaben werden hier angezeigt. Schließe den anderen Tab, um hier weiterzuarbeiten."
                  : "Der Browser konnte den Schutz vor gleichzeitigem Überschreiben nicht bereitstellen. Verwende einen aktuellen Browser im lokalen Betrieb. Deine Daten bleiben erhalten und können heruntergeladen werden."}
              </p>
              {access === "readonly" || access === "error" ? (
                <button type="button" onClick={requestAccess}>
                  Bearbeitung hier übernehmen
                </button>
              ) : null}
            </aside>
          ) : null}

          {workspaceWarning ? (
            <p className="feedback" role="status">
              {workspaceWarning}
            </p>
          ) : null}
          {error && !(page === "klasse" && activeSession) ? (
            <p className="feedback error" role="alert">
              {error}
            </p>
          ) : null}
          {notice && !(page === "klasse" && activeSession) ? (
            <p className="feedback success" role="status">
              {notice}
            </p>
          ) : null}
          {page === "anlegen" ? (
            <ClassCreation
              today={today()}
              canWrite={canWrite}
              storage={
                workspaceStorage ?? (repository ? undefined : browserStorage)
              }
              onCreate={createClass}
              onDemo={createDemoClass}
              onError={(message) => {
                setError(message);
                setNotice("");
              }}
            />
          ) : null}
          {page === "sicherung" ? (
            <BackupPanel {...backupProps} notebook={notebook} />
          ) : null}
          {page === "ueber" ? <AboutPage /> : null}
          {page === "daten" ? (
            <DataPage onBackup={() => setPage("sicherung")} />
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
                  <button
                    type="button"
                    disabled={!canWrite}
                    onClick={createDemoClass}
                  >
                    Demo-Klasse mit fiktiven Namen anlegen
                  </button>
                ) : null}
              </div>
            </section>
          ) : null}
          {page === "klasse" &&
          currentClass &&
          activeSession &&
          selectedStudent ? (
            <AssessmentWorkspace
              key={activeSession.id}
              initialReview={reviewSessionId === activeSession.id}
              group={currentClass}
              session={activeSession}
              student={selectedStudent}
              before={gradeBeforeLesson}
              label={report!.lessons.get(activeSession.id)!.label}
              canWrite={canWrite}
              error={error}
              notice={notice}
              canRetry={failedObservation !== null}
              onRetry={retryObservation}
              onSelect={setSelectedStudentId}
              onRecord={recordObservation}
              onLeave={() => leaveSession()}
              onRemove={removeCurrentObservation}
              onDiscard={discardSession}
            />
          ) : null}
          {page === "klasse" && currentClass && !activeSession && report ? (
            <ClassWorkspace
              key={currentClass.id}
              currentClass={currentClass}
              report={report}
              dashboardView={dashboardView}
              setDashboardView={(view) => {
                setDashboardView(view);
                if (view === "tabelle" || view === "verlauf")
                  onTutorialAction?.(`view-${view}`);
              }}
              canWrite={canWrite}
              lessonDate={lessonDate}
              setLessonDate={setLessonDate}
              today={today}
              historyStudentId={historyStudentId}
              setHistoryStudentId={setHistoryStudentId}
              lastSwap={lastSwap}
              error={error}
              exporting={exporting}
              actions={{
                saveDetails,
                saveStudentName,
                archiveClass,
                deleteCurrentClass,
                startSession,
                openSession: (id) => {
                  setReviewSessionId(id);
                  setActiveSessionId(id);
                  setSelectedStudentId(null);
                  setError("");
                  setNotice("");
                  setFailedObservation(null);
                },
                swapSessions,
                deleteStoredSession,
                exportExcel,
                exportCsv,
              }}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
  if (practice) return application;
  return (
    <Tutorial
      storage={workspaceStorage ?? (repository ? undefined : browserStorage)}
      request={tutorialRequest}
      onStorageError={tutorialStorageError}
      autoStart={!repository}
      renderPractice={({
        repository: practiceRepository,
        storage,
        onAction,
      }) => (
        <App
          practice
          repository={practiceRepository}
          workspaceStorage={storage}
          onTutorialAction={onAction}
          today={today}
          now={now}
          download={(filename, contents, mime) => {
            download(`uebung-${filename}`, contents, mime);
            if (filename.endsWith(".json")) onAction("backup-downloaded");
          }}
        />
      )}
    >
      {application}
    </Tutorial>
  );
}
