import React, { useEffect, useMemo, useState } from "react";
import {
  Upload,
  Download,
  FolderOpen,
  Users,
  Calendar,
  LineChart as LineChartIcon,
  Save,
  RotateCcw,
  Trash2,
  CheckCircle2,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import {
  fetchCloudNotebook,
  getCurrentSession,
  isCloudSyncConfigured,
  onAuthStateChange,
  requestPasswordReset,
  saveCloudNotebook,
  signInWithPassword,
  signOutFromCloud,
  signUpWithPassword,
  subscribeToCloudNotebook,
  updateCloudPassword,
} from "./cloudSync.js";
const GradeChartPanel = React.lazy(() => import("./GradeChartPanel.jsx"));

const STORAGE_KEY = "oral-grading-app-v4";
const CLOUD_EMAIL_KEY = "oral-grading-cloud-email";
const DRAFT_STORAGE_KEY = "oral-grading-session-drafts-v1";
const EMPTY_APP_STATE = { classes: [], currentClassId: null };
const SUPPORT_EMAIL = "benutzerunterstuetzung@web.de";
const START_GRADE = 2.0;
const MIN_GRADE = 1.0;
const MAX_GRADE = 6.0;
const MAX_BUFFER = 3;
const MAX_STUDENTS_PER_CLASS = 45;
const SESSION_SYMBOLS = ["--", "-", "0", "+", "++"];
const CLASS_SORT_OPTIONS = {
  recent: "Zuletzt genutzt",
  name: "Name A-Z",
  status: "Status",
};

const DELTA_MAP = {
  "--": 0.5,
  "-": 0.25,
  "0": 0,
  "+": -0.25,
  "++": -0.5,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function quarterStepsFromDelta(delta) {
  return Math.round(Math.abs(delta) / 0.25);
}

function formatDateLabel(value) {
  if (!value) return "Noch kein Eintrag";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function formatDateTimeLabel(value) {
  if (!value) return "Noch nicht gespeichert";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function shortenPath(value) {
  if (!value) return "";
  if (value.length <= 64) return value;

  const parts = value.split(/[/\\]/);
  if (parts.length <= 3) return value;

  return `${parts.slice(0, 2).join("\\")}\\...\\${parts.slice(-2).join("\\")}`;
}

function formatCloudError(error) {
  if (!error) return "Unbekannter Cloud-Fehler.";

  const details = [error.message, error.details, error.hint]
    .filter(Boolean)
    .join(" | ");

  return details || JSON.stringify(error);
}

function getPasswordResetRedirectUrl() {
  const explicitUrl = import.meta.env.VITE_PASSWORD_RESET_URL?.trim();
  if (explicitUrl) return explicitUrl;
  if (typeof window === "undefined") return undefined;

  const { protocol, origin, pathname } = window.location;
  if (protocol === "http:" || protocol === "https:") {
    return `${origin}${pathname}`;
  }

  return undefined;
}

function getLegalPageHref(fileName) {
  if (typeof window === "undefined") return fileName;

  try {
    return new URL(fileName, window.location.href).toString();
  } catch {
    return fileName;
  }
}

function createDeleteRequestMailto(email = "") {
  const subject = encodeURIComponent("Anfrage zur Konto- und Datenlöschung - Mündliche Notengebung");
  const body = encodeURIComponent(
    [
      "Hallo,",
      "",
      "hiermit bitte ich um die Löschung meines Kontos und der zugehörigen Cloud-Daten für die App \"Mündliche Notengebung\".",
      "",
      `Kontoadresse: ${email || "bitte hier eintragen"}`,
      "",
      "Bitte bestätigen Sie mir die Löschung per E-Mail.",
      "",
      "Vielen Dank",
    ].join("\n")
  );

  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}

function inferClassNameFromFile(fileName) {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "");
  return withoutExtension.replace(/[_-]+/g, " ").trim() || "Unbenannte Klasse";
}

function getLastSessionDate(classItem) {
  if (!classItem?.sessions?.length) return null;

  const orderedSessions = [...classItem.sessions].sort((left, right) => {
    const byDate = String(left.date || "").localeCompare(String(right.date || ""));
    if (byDate !== 0) return byDate;
    return String(left.createdAt || "").localeCompare(String(right.createdAt || ""));
  });

  return orderedSessions[orderedSessions.length - 1]?.date ?? null;
}

function compareClasses(left, right, sortMode) {
  if (sortMode === "name") {
    return left.name.localeCompare(right.name, "de");
  }

  if (sortMode === "status") {
    if (left.completed !== right.completed) {
      return Number(left.completed) - Number(right.completed);
    }
    return left.name.localeCompare(right.name, "de");
  }

  if (left.completed !== right.completed) {
    return Number(left.completed) - Number(right.completed);
  }

  const leftDate = getLastSessionDate(left) || left.updatedAt || left.createdAt || "";
  const rightDate = getLastSessionDate(right) || right.updatedAt || right.createdAt || "";
  return rightDate.localeCompare(leftDate) || left.name.localeCompare(right.name, "de");
}

function sanitizeLegacyData(data) {
  if (!data || !Array.isArray(data.classes)) {
    return { classes: [], currentClassId: null };
  }

  return {
    currentClassId: data.currentClassId ?? data.classes[0]?.id ?? null,
    classes: data.classes.map((classItem) =>
      recalculateClassState({
        ...classItem,
        name: classItem.name ?? "Unbenannte Klasse",
        students: classItem.students ?? [],
        sessions: classItem.sessions ?? [],
      })
    ),
  };
}

function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  return lines
    .map((line) => {
      const parts = line
        .split(/[;,\t]/)
        .map((p) => p.trim())
        .filter(Boolean);

      if (parts.length >= 2) {
        return {
          firstName: parts[0],
          lastName: parts[1],
          fullName: `${parts[0]} ${parts[1]}`.trim(),
        };
      }

      return {
        firstName: "",
        lastName: parts[0],
        fullName: parts[0],
      };
    })
    .filter((s) => s.fullName)
    .filter(
      (student, index, arr) =>
        arr.findIndex((x) => x.fullName === student.fullName) === index
    );
}

function gradeToLabel(value) {
  const v = Math.round(value * 4) / 4;
  const whole = Math.floor(v);
  const frac = Number((v - whole).toFixed(2));

  if (v <= 1) return "1";
  if (v >= 6) return "6";

  if (frac === 0) return `${whole}`;
  if (frac === 0.25) return `${whole}-`;
  if (frac === 0.5) return `${whole}-${whole + 1}`;
  if (frac === 0.75) return `${whole + 1}+`;

  return v.toFixed(2).replace(".", ",");
}

function trendText(delta) {
  if (delta < 0) return "verbessert";
  if (delta > 0) return "verschlechtert";
  return "unverändert";
}

function computeNextState({ gradeBefore, bufferBefore, delta }) {
  let nextGrade = gradeBefore;
  let nextBuffer = bufferBefore;

  if (delta < 0) {
    const improvementSteps = quarterStepsFromDelta(delta);

    if (gradeBefore <= MIN_GRADE) {
      nextGrade = MIN_GRADE;
      nextBuffer = clamp(bufferBefore + improvementSteps, 0, MAX_BUFFER);
    } else {
      nextGrade = clamp(
        Math.round((gradeBefore + delta) * 4) / 4,
        MIN_GRADE,
        MAX_GRADE
      );
    }
  }

  if (delta > 0) {
    let worseningSteps = quarterStepsFromDelta(delta);

    if (gradeBefore <= MIN_GRADE && bufferBefore > 0) {
      const usedBuffer = Math.min(bufferBefore, worseningSteps);
      nextBuffer = bufferBefore - usedBuffer;
      worseningSteps -= usedBuffer;
    }

    nextGrade =
      worseningSteps > 0
        ? clamp(
            Math.round((gradeBefore + worseningSteps * 0.25) * 4) / 4,
            MIN_GRADE,
            MAX_GRADE
          )
        : gradeBefore;
  }

  return {
    nextGrade: Math.round(nextGrade * 4) / 4,
    nextBuffer: clamp(nextBuffer, 0, MAX_BUFFER),
  };
}

function buildInitialStudentState(student) {
  const startGrade = student.startGrade ?? START_GRADE;

  return {
    id: student.id ?? crypto.randomUUID(),
    name: student.name ?? "Unbenannt",
    startGrade,
    currentGrade: startGrade,
    buffer: 0,
    history: [
      {
        date: "Schuljahresstart",
        grade: startGrade,
        delta: 0,
        symbol: "Start",
        buffer: 0,
      },
    ],
  };
}

function recalculateClassState(classItem) {
  const students = (classItem.students ?? []).map((student) =>
    buildInitialStudentState(student)
  );
  const studentMap = Object.fromEntries(students.map((student) => [student.id, student]));

  const sessions = [...(classItem.sessions ?? [])]
    .map((session) => ({
      ...session,
      id: session.id ?? crypto.randomUUID(),
      createdAt: session.createdAt ?? new Date().toISOString(),
      entries: session.entries ?? {},
    }))
    .sort((left, right) => {
      const byDate = String(left.date || "").localeCompare(String(right.date || ""));
      if (byDate !== 0) return byDate;
      return String(left.createdAt || "").localeCompare(String(right.createdAt || ""));
    })
    .map((session) => {
      const nextEntries = {};

      students.forEach((student) => {
        const rawEntry = session.entries?.[student.id];
        const symbol = rawEntry?.symbol ?? rawEntry;

        if (!SESSION_SYMBOLS.includes(symbol)) return;

        const currentState = studentMap[student.id];
        const delta = DELTA_MAP[symbol];
        const { nextGrade, nextBuffer } = computeNextState({
          gradeBefore: currentState.currentGrade,
          bufferBefore: currentState.buffer,
          delta,
        });

        nextEntries[student.id] = {
          symbol,
          delta,
          gradeBefore: currentState.currentGrade,
          gradeAfter: nextGrade,
          bufferBefore: currentState.buffer,
          bufferAfter: nextBuffer,
        };

        currentState.currentGrade = nextGrade;
        currentState.buffer = nextBuffer;
        currentState.history = [
          ...currentState.history,
          {
            date: session.date,
            grade: nextGrade,
            delta,
            symbol,
            buffer: nextBuffer,
          },
        ];
      });

      return {
        ...session,
        entries: nextEntries,
      };
    });

  return {
    ...classItem,
    completed: Boolean(classItem.completed),
    createdAt: classItem.createdAt ?? new Date().toISOString(),
    updatedAt: classItem.updatedAt ?? new Date().toISOString(),
    students,
    sessions,
  };
}

function exportCsv(app) {
  if (!app.currentClassId) return;

  const classData = app.classes.find((c) => c.id === app.currentClassId);
  if (!classData) return;

  const dates = classData.sessions.map((s) => s.date);
  const header = ["Schüler/in", "Startnote", ...dates, "Puffer", "Aktuell"];

  const rows = classData.students.map((student) => {
    const values = classData.sessions.map((session) => {
      const entry = session.entries[student.id];
      return entry ? `${entry.symbol} (${gradeToLabel(entry.gradeAfter)})` : "";
    });

    return [
      student.name,
      gradeToLabel(student.startGrade ?? START_GRADE),
      ...values,
      `${student.buffer ?? 0}/3`,
      gradeToLabel(student.currentGrade ?? START_GRADE),
    ];
  });

  const csv = [header, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${classData.name.replace(/\s+/g, "_").toLowerCase()}_muendliche_noten.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function createEmptyClass(name, studentNames) {
  return recalculateClassState({
    id: crypto.randomUUID(),
    name,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    students: studentNames.map((studentName) => ({
      id: crypto.randomUUID(),
      name: studentName,
      startGrade: START_GRADE,
    })),
    sessions: [],
  });
}

function hasClasses(appState) {
  return Boolean(appState?.classes?.length);
}

function getAppUpdatedAt(appState) {
  if (!appState?.classes?.length) return "1970-01-01T00:00:00.000Z";

  return appState.classes.reduce((latest, classItem) => {
    const candidate = classItem.updatedAt || classItem.createdAt || latest;
    return candidate > latest ? candidate : latest;
  }, "1970-01-01T00:00:00.000Z");
}

function readStoredAppState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_APP_STATE;
    return sanitizeLegacyData(JSON.parse(raw));
  } catch {
    return EMPTY_APP_STATE;
  }
}

function readStoredString(key) {
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function writeStoredString(key, value) {
  try {
    if (value) {
      window.localStorage.setItem(key, value);
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Zusätzliche Komfortdaten dürfen die Oberfläche nicht blockieren.
  }
}

function writeStoredAppState(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // In der Desktop-App darf ein Storage-Problem die Oberfläche nicht blockieren.
  }
}

function sanitizeStoredDrafts(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([classId, draft]) => [
      classId,
      {
        date:
          typeof draft?.date === "string" && draft.date
            ? draft.date
            : todayIso(),
        entries: Object.fromEntries(
          Object.entries(draft?.entries ?? {}).filter(([, symbol]) =>
            SESSION_SYMBOLS.includes(symbol)
          )
        ),
      },
    ])
  );
}

function readStoredDrafts() {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return {};
    return sanitizeStoredDrafts(JSON.parse(raw));
  } catch {
    return {};
  }
}

function writeStoredDrafts(value) {
  try {
    const sanitized = sanitizeStoredDrafts(value);
    if (Object.keys(sanitized).length) {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(sanitized));
    } else {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  } catch {
    // Entwurfsdaten dürfen die Oberfläche nicht blockieren.
  }
}

function rehydratePendingEntries(currentClass, draftEntries) {
  if (!currentClass) return {};

  return Object.fromEntries(
    currentClass.students
      .map((student) => {
        const symbol = draftEntries?.[student.id];
        if (!SESSION_SYMBOLS.includes(symbol)) return null;

        const delta = DELTA_MAP[symbol];
        const { nextGrade, nextBuffer } = computeNextState({
          gradeBefore: student.currentGrade,
          bufferBefore: student.buffer ?? 0,
          delta,
        });

        return [
          student.id,
          {
            symbol,
            delta,
            gradeBefore: student.currentGrade,
            gradeAfter: nextGrade,
            bufferBefore: student.buffer ?? 0,
            bufferAfter: nextBuffer,
          },
        ];
      })
      .filter(Boolean)
  );
}

function serializePendingEntries(pendingEntries) {
  return Object.fromEntries(
    Object.entries(pendingEntries)
      .map(([studentId, entry]) => [studentId, entry?.symbol])
      .filter(([, symbol]) => SESSION_SYMBOLS.includes(symbol))
  );
}

function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

function Card({ children, className = "" }) {
  return <div className={classNames("card", className)}>{children}</div>;
}

function CardHeader({ children, className = "" }) {
  return <div className={classNames("card-header", className)}>{children}</div>;
}

function CardTitle({ children, className = "" }) {
  return <h2 className={classNames("card-title", className)}>{children}</h2>;
}

function CardContent({ children, className = "" }) {
  return <div className={classNames("card-content", className)}>{children}</div>;
}

function Badge({ children }) {
  return <span className="badge">{children}</span>;
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={classNames("tab-btn", active && "tab-btn-active")}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function App() {
  const isDesktopShell = Boolean(window.desktopApp?.platform);
  const [app, setApp] = useState(() => readStoredAppState());

  const [activeTab, setActiveTab] = useState("bewertung");
  const [editingClassName, setEditingClassName] = useState("");
  const [uploadFeedback, setUploadFeedback] = useState("");
  const [sessionDate, setSessionDate] = useState(todayIso());
  const [pendingEntries, setPendingEntries] = useState({});
  const [draftSessions, setDraftSessions] = useState(() => readStoredDrafts());
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [studentDrafts, setStudentDrafts] = useState({});
  const [sessionDrafts, setSessionDrafts] = useState({});
  const [classSortMode, setClassSortMode] = useState("recent");
  const [deleteConfirmClassId, setDeleteConfirmClassId] = useState(null);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() =>
    window.matchMedia?.("(display-mode: standalone)")?.matches ?? false
  );
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [desktopDataReady, setDesktopDataReady] = useState(() => !isDesktopShell);
  const [storageFeedback, setStorageFeedback] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [storageInfo, setStorageInfo] = useState(null);
  const [cloudUser, setCloudUser] = useState(null);
  const [cloudAuthReady, setCloudAuthReady] = useState(() => !isCloudSyncConfigured());
  const [cloudReady, setCloudReady] = useState(() => !isCloudSyncConfigured());
  const [cloudBusy, setCloudBusy] = useState(false);
  const [cloudMode, setCloudMode] = useState("login");
  const [cloudEmail, setCloudEmail] = useState(() => readStoredString(CLOUD_EMAIL_KEY));
  const [cloudPassword, setCloudPassword] = useState("");
  const [cloudRecoveryMode, setCloudRecoveryMode] = useState(false);
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryPasswordConfirm, setRecoveryPasswordConfirm] = useState("");
  const [cloudMessage, setCloudMessage] = useState(
    isCloudSyncConfigured()
      ? "Cloud-Sync wird vorbereitet."
      : "Cloud-Sync ist vorbereitet, braucht aber noch deine Supabase-Zugangsdaten in der App-Konfiguration."
  );
  const [lastCloudSyncAt, setLastCloudSyncAt] = useState(null);
  const [syncTick, setSyncTick] = useState(0);
  const skipNextCloudSaveRef = React.useRef(false);
  const appRef = React.useRef(app);

  useEffect(() => {
    appRef.current = app;
  }, [app]);

  useEffect(() => {
    writeStoredString(CLOUD_EMAIL_KEY, cloudEmail.trim());
  }, [cloudEmail]);

  useEffect(() => {
    writeStoredAppState(app);
  }, [app]);

  useEffect(() => {
    writeStoredDrafts(draftSessions);
  }, [draftSessions]);

  useEffect(() => {
    let cancelled = false;

    async function loadDesktopState() {
      if (!isDesktopShell || !window.desktopApp?.loadData) {
        setDesktopDataReady(true);
        return;
      }

      try {
        const [paths, stored] = await Promise.all([
          window.desktopApp.getStorageInfo?.(),
          window.desktopApp.loadData(),
        ]);

        if (cancelled) return;

        setStorageInfo(paths ?? null);

        if (stored?.data) {
          const sanitized = sanitizeLegacyData(stored.data);
          setApp(sanitized);
          writeStoredAppState(sanitized);
          setStorageFeedback(
            stored.source === "documents"
              ? "Sicherung aus dem Dokumente-Ordner geladen."
              : "Gespeicherte Daten dieser App geladen."
          );
        } else if (paths?.backupFile) {
          setStorageFeedback("Neue Daten werden automatisch als Datei gesichert.");
        }
      } catch {
        if (!cancelled) {
          setStorageFeedback("Dateisicherung konnte nicht geladen werden. Lokale Daten bleiben erhalten.");
        }
      } finally {
        if (!cancelled) {
          setDesktopDataReady(true);
        }
      }
    }

    loadDesktopState();

    return () => {
      cancelled = true;
    };
  }, [isDesktopShell]);

  useEffect(() => {
    if (!isDesktopShell || !desktopDataReady || !window.desktopApp?.saveData) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await window.desktopApp.saveData(app);
        setLastSavedAt(result?.savedAt ?? new Date().toISOString());

        if (result?.backupFile) {
          setStorageInfo((previous) => ({
            ...(previous ?? {}),
            ...result,
          }));
        }
      } catch {
        setStorageFeedback("Automatische Dateisicherung fehlgeschlagen.");
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [app, desktopDataReady, isDesktopShell]);

  useEffect(() => {
    if (!isCloudSyncConfigured()) {
      setCloudAuthReady(true);
      setCloudReady(true);
      return;
    }

    let cancelled = false;

    async function loadSession() {
      try {
        const {
          data: { session },
        } = await getCurrentSession();

        if (cancelled) return;

        setCloudUser(session?.user ?? null);
        if (session?.user?.email) {
          setCloudEmail(session.user.email);
        }
        setCloudMessage(
          session?.user
            ? "Anmeldung erkannt. Cloud-Daten werden abgeglichen."
            : "Bitte anmelden, damit Windows, Android und später iOS dieselben Daten nutzen."
        );
      } catch (error) {
        if (!cancelled) {
          setCloudMessage(`Cloud-Sitzung konnte nicht geladen werden: ${formatCloudError(error)}`);
        }
      } finally {
        if (!cancelled) {
          setCloudAuthReady(true);
        }
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = onAuthStateChange((event, session) => {
      setCloudUser(session?.user ?? null);
      setCloudReady(false);
      if (session?.user?.email) {
        setCloudEmail(session.user.email);
      }

      if (event === "PASSWORD_RECOVERY") {
        setCloudRecoveryMode(true);
        setCloudMessage("Bitte jetzt ein neues Passwort festlegen.");
        return;
      }

      setCloudRecoveryMode(false);
      setCloudMessage(
        session?.user
          ? "Anmeldung erfolgreich. Cloud-Daten werden abgeglichen."
          : "Abgemeldet. Lokale Sicherung bleibt auf diesem Gerät erhalten."
      );
    });

    return () => {
      cancelled = true;
      subscription?.unsubscribe?.();
    };
  }, [desktopDataReady]);

  useEffect(() => {
    if (!isCloudSyncConfigured() || !cloudAuthReady || !desktopDataReady) {
      return;
    }

    if (!cloudUser) {
      setCloudReady(true);
      return;
    }

    let cancelled = false;

    async function reconcileCloudState() {
      setCloudBusy(true);

      try {
        const remoteRecord = await fetchCloudNotebook(cloudUser.id);
        const localState = appRef.current;
        const localUpdatedAt = getAppUpdatedAt(localState);

        if (!remoteRecord?.data) {
          if (hasClasses(localState)) {
            await saveCloudNotebook(cloudUser.id, localState, localUpdatedAt);
            if (!cancelled) {
              setLastCloudSyncAt(localUpdatedAt);
              setCloudMessage("Lokale Daten wurden erstmalig in die Cloud übernommen.");
            }
          } else if (!cancelled) {
            setCloudMessage("Cloud-Sync ist bereit. Lege Klassen an oder importiere eine Sicherung.");
          }

          return;
        }

        const remoteState = sanitizeLegacyData(remoteRecord.data);
        const remoteUpdatedAt = remoteRecord.updatedAt ?? getAppUpdatedAt(remoteState);

        if (hasClasses(localState) && localUpdatedAt > remoteUpdatedAt) {
          await saveCloudNotebook(cloudUser.id, localState, localUpdatedAt);
          if (!cancelled) {
            setLastCloudSyncAt(localUpdatedAt);
            setCloudMessage("Neuere lokale Daten wurden in die Cloud hochgeladen.");
          }
          return;
        }

        skipNextCloudSaveRef.current = true;
        writeStoredAppState(remoteState);
        setApp(remoteState);

        if (!cancelled) {
          setLastCloudSyncAt(remoteUpdatedAt);
          setCloudMessage("Cloud-Daten wurden geladen.");
        }
      } catch (error) {
        if (!cancelled) {
          setCloudMessage(
            `Cloud-Daten konnten nicht abgeglichen werden: ${formatCloudError(error)}`
          );
        }
      } finally {
        if (!cancelled) {
          setCloudBusy(false);
          setCloudReady(true);
        }
      }
    }

    reconcileCloudState();

    return () => {
      cancelled = true;
    };
  }, [cloudUser, cloudAuthReady, desktopDataReady, syncTick]);

  useEffect(() => {
    if (!isCloudSyncConfigured() || !cloudUser || !cloudReady) {
      return;
    }

    if (skipNextCloudSaveRef.current) {
      skipNextCloudSaveRef.current = false;
      return;
    }

    let cancelled = false;
    const updatedAt = getAppUpdatedAt(app);
    const timeoutId = window.setTimeout(async () => {
      setCloudBusy(true);

      try {
        await saveCloudNotebook(cloudUser.id, app, updatedAt);
        if (!cancelled) {
          setLastCloudSyncAt(updatedAt);
          setCloudMessage("Cloud synchronisiert.");
        }
      } catch (error) {
        if (!cancelled) {
          setCloudMessage(`Cloud-Sync fehlgeschlagen: ${formatCloudError(error)}`);
        }
      } finally {
        if (!cancelled) {
          setCloudBusy(false);
        }
      }
    }, 700);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [app, cloudReady, cloudUser]);

  useEffect(() => {
    if (!isCloudSyncConfigured() || !cloudUser || !cloudReady) {
      return;
    }

    return subscribeToCloudNotebook(cloudUser.id, (remoteRecord) => {
      if (!remoteRecord?.data) return;

      const incomingState = sanitizeLegacyData(remoteRecord.data);
      const incomingUpdatedAt = remoteRecord.updated_at ?? getAppUpdatedAt(incomingState);
      const localUpdatedAt = getAppUpdatedAt(appRef.current);

      if (incomingUpdatedAt <= localUpdatedAt) return;

      skipNextCloudSaveRef.current = true;
      writeStoredAppState(incomingState);
      setApp(incomingState);
      setLastCloudSyncAt(incomingUpdatedAt);
      setCloudMessage("Änderungen von einem anderen Gerät wurden übernommen.");
    });
  }, [cloudReady, cloudUser]);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPromptEvent(event);
    }

    function handleInstalled() {
      setIsInstalled(true);
      setInstallPromptEvent(null);
    }

    function handleOnlineStatus() {
      setIsOnline(navigator.onLine);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  const sortedClasses = useMemo(
    () => [...app.classes].sort((left, right) => compareClasses(left, right, classSortMode)),
    [app.classes, classSortMode]
  );

  const currentClass = useMemo(
    () => app.classes.find((c) => c.id === app.currentClassId) ?? null,
    [app]
  );

  const activeStudent = useMemo(() => {
    if (!currentClass) return null;
    return currentClass.students.find((student) => !pendingEntries[student.id]) ?? null;
  }, [currentClass, pendingEntries]);

  useEffect(() => {
    const currentDraft = currentClass ? draftSessions[currentClass.id] : null;

    setPendingEntries(
      currentClass ? rehydratePendingEntries(currentClass, currentDraft?.entries) : {}
    );
    setSessionDate(currentDraft?.date ?? todayIso());
    setSelectedStudentId(currentClass?.students?.[0]?.id ?? null);
    setEditingClassName(currentClass?.name ?? "");
    setStudentDrafts(
      Object.fromEntries(
        (currentClass?.students ?? []).map((student) => [student.id, student.name])
      )
    );
    setSessionDrafts(
      Object.fromEntries(
        (currentClass?.sessions ?? []).map((session) => [
          session.id,
          {
            date: session.date,
            entries: Object.fromEntries(
              (currentClass?.students ?? []).map((student) => [
                student.id,
                session.entries?.[student.id]?.symbol ?? "",
              ])
            ),
          },
        ])
      )
    );
    setDeleteConfirmClassId(null);
  }, [currentClass]);

  useEffect(() => {
    if (activeStudent) {
      setSelectedStudentId(activeStudent.id);
    }
  }, [activeStudent]);

  function persistCurrentDraft(nextEntries, nextDate = sessionDate || todayIso()) {
    if (!currentClass) return;

    const serializedEntries = serializePendingEntries(nextEntries);

    setDraftSessions((prev) => {
      if (!Object.keys(serializedEntries).length) {
        const next = { ...prev };
        delete next[currentClass.id];
        return next;
      }

      return {
        ...prev,
        [currentClass.id]: {
          date: nextDate,
          entries: serializedEntries,
        },
      };
    });
  }

  function handleSessionDateChange(value) {
    const nextDate = value || todayIso();
    setSessionDate(nextDate);
    persistCurrentDraft(pendingEntries, nextDate);
  }

  function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const students = parseCsv(text);

      if (!students.length) {
        setUploadFeedback("Keine gültigen Schülerdaten erkannt.");
        return;
      }

      const names = students.slice(0, MAX_STUDENTS_PER_CLASS).map((s) => s.fullName);
      const className = inferClassNameFromFile(file.name);
      const newClass = createEmptyClass(className, names);

      setApp((prev) => ({
        classes: [...prev.classes, newClass],
        currentClassId: newClass.id,
      }));

      setUploadFeedback(() => {
        if (students.length > MAX_STUDENTS_PER_CLASS) {
          return `${names.length} Schüler/innen aus "${className}" übernommen. Mehr als ${MAX_STUDENTS_PER_CLASS} sind pro Klasse nicht erlaubt.`;
        }

        return `${names.length} Schüler/innen in "${className}" übernommen.`;
      });
      event.target.value = "";
    };

    reader.readAsText(file, "utf-8");
  }

  function applySymbol(symbol) {
    if (!currentClass || !activeStudent) return;

    const delta = DELTA_MAP[symbol];
    const previousEntry = pendingEntries[activeStudent.id];

    const gradeBefore = previousEntry?.gradeAfter ?? activeStudent.currentGrade;
    const bufferBefore = previousEntry?.bufferAfter ?? activeStudent.buffer ?? 0;

    const { nextGrade, nextBuffer } = computeNextState({
      gradeBefore,
      bufferBefore,
      delta,
    });

    const nextPendingEntries = {
      ...pendingEntries,
      [activeStudent.id]: {
        symbol,
        delta,
        gradeBefore,
        gradeAfter: nextGrade,
        bufferBefore,
        bufferAfter: nextBuffer,
      },
    };

    setPendingEntries(nextPendingEntries);
    persistCurrentDraft(nextPendingEntries);
  }

  function resetSession() {
    setPendingEntries({});
    persistCurrentDraft({});
  }

  function saveSession() {
    if (!currentClass || !Object.keys(pendingEntries).length) return;

    const date = sessionDate || todayIso();

    setApp((prev) => ({
      ...prev,
      classes: prev.classes.map((classItem) => {
        if (classItem.id !== currentClass.id) return classItem;

        return recalculateClassState({
          ...classItem,
          updatedAt: new Date().toISOString(),
          sessions: [
            ...classItem.sessions,
            {
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              date,
              entries: Object.fromEntries(
                Object.entries(pendingEntries).map(([studentId, entry]) => [
                  studentId,
                  { symbol: entry.symbol },
                ])
              ),
            },
          ],
        });
      }),
    }));

    setPendingEntries({});
    persistCurrentDraft({});
  }

  function renameCurrentClass() {
    if (!currentClass || !editingClassName.trim()) return;

    setApp((prev) => ({
      ...prev,
      classes: prev.classes.map((classItem) =>
        classItem.id === currentClass.id
          ? {
              ...classItem,
              name: editingClassName.trim(),
              updatedAt: new Date().toISOString(),
            }
          : classItem
      ),
    }));
  }

  function updateStudentName(studentId, name) {
    setStudentDrafts((prev) => ({ ...prev, [studentId]: name }));
  }

  function saveStudentEdits() {
    if (!currentClass) return;

    setApp((prev) => ({
      ...prev,
      classes: prev.classes.map((classItem) => {
        if (classItem.id !== currentClass.id) return classItem;

        return recalculateClassState({
          ...classItem,
          updatedAt: new Date().toISOString(),
          students: classItem.students.map((student) => ({
            ...student,
            name: studentDrafts[student.id]?.trim() || student.name,
          })),
          sessions: classItem.sessions.map((session) => ({
            ...session,
            date: sessionDrafts[session.id]?.date || session.date,
            entries: Object.fromEntries(
              classItem.students
                .map((student) => {
                  const symbol = sessionDrafts[session.id]?.entries?.[student.id] ?? "";
                  return symbol ? [student.id, { symbol }] : null;
                })
                .filter(Boolean)
            ),
          })),
        });
      }),
    }));

    setEditMode(false);
  }

  function updateSessionDraft(sessionId, studentId, symbol) {
    setSessionDrafts((prev) => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        entries: {
          ...prev[sessionId]?.entries,
          [studentId]: symbol,
        },
      },
    }));
  }

  function updateSessionDateDraft(sessionId, value) {
    setSessionDrafts((prev) => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        date: value,
      },
    }));
  }

  function selectClass(classId) {
    setApp((prev) => ({
      ...prev,
      currentClassId: classId,
    }));
  }

  function toggleClassCompleted(classId) {
    setApp((prev) => ({
      ...prev,
      classes: prev.classes.map((classItem) =>
        classItem.id === classId
          ? {
              ...classItem,
              completed: !classItem.completed,
              updatedAt: new Date().toISOString(),
            }
          : classItem
      ),
    }));
  }

  function requestDeleteClass(classId) {
    if (deleteConfirmClassId !== classId) {
      setDeleteConfirmClassId(classId);
      return;
    }

    if (!window.confirm("Klasse wirklich dauerhaft löschen?")) return;

    setApp((prev) => {
      const remainingClasses = prev.classes.filter((classItem) => classItem.id !== classId);
      const nextCurrentId =
        prev.currentClassId === classId ? remainingClasses[0]?.id ?? null : prev.currentClassId;

      return {
        classes: remainingClasses,
        currentClassId: nextCurrentId,
      };
    });

    setDraftSessions((prev) => {
      const next = { ...prev };
      delete next[classId];
      return next;
    });

    setDeleteConfirmClassId(null);
  }

  async function handleInstallApp() {
    if (!installPromptEvent) return;

    await installPromptEvent.prompt();
    await installPromptEvent.userChoice;
    setInstallPromptEvent(null);
  }

  async function handleCloudAuthSubmit(event) {
    event.preventDefault();

    if (!isCloudSyncConfigured()) {
      setCloudMessage("Cloud-Sync ist noch nicht konfiguriert. Lege zuerst die Supabase-Zugangsdaten in .env an.");
      return;
    }

    const email = cloudEmail.trim();
    if (!email || !cloudPassword.trim()) {
      setCloudMessage("Bitte E-Mail und Passwort eingeben.");
      return;
    }

    setCloudBusy(true);

    try {
      // Defensive cleanup: on devices with a previously linked account,
      // remove stale local auth state before signing in again.
      await signOutFromCloud("local");

      const action =
        cloudMode === "signup"
          ? signUpWithPassword(email, cloudPassword)
          : signInWithPassword(email, cloudPassword);

      const { data, error } = await action;

      if (error) {
        throw error;
      }

      setCloudUser(data?.user ?? data?.session?.user ?? null);
      setCloudEmail(email);
      setCloudPassword("");
      setCloudReady(false);
      setCloudMessage(
        cloudMode === "signup"
          ? "Konto erstellt. Bitte prüfe gegebenenfalls deine E-Mail und melde dich dann an."
          : "Anmeldung erfolgreich. Die Daten werden jetzt synchronisiert."
      );
    } catch (error) {
      setCloudMessage(formatCloudError(error) || "Anmeldung fehlgeschlagen.");
    } finally {
      setCloudBusy(false);
    }
  }

  async function handleSwitchCloudAccount() {
    if (!isCloudSyncConfigured()) return;

    setCloudBusy(true);
    try {
      await signOutFromCloud("local");
      setCloudUser(null);
      setCloudReady(false);
      setCloudRecoveryMode(false);
      setRecoveryPassword("");
      setRecoveryPasswordConfirm("");
      setCloudMode("login");
      setCloudPassword("");
      setCloudEmail("");
      setLastCloudSyncAt(null);
      setCloudMessage("Du kannst jetzt ein anderes Konto auf diesem Gerät anmelden.");
    } catch (error) {
      setCloudMessage(`Konto-Wechsel fehlgeschlagen: ${formatCloudError(error)}`);
    } finally {
      setCloudBusy(false);
    }
  }

  async function handlePasswordResetRequest() {
    if (!isCloudSyncConfigured()) {
      setCloudMessage("Cloud-Sync ist noch nicht konfiguriert. Lege zuerst die Supabase-Zugangsdaten in .env an.");
      return;
    }

    const email = cloudEmail.trim();
    if (!email) {
      setCloudMessage("Bitte zuerst eine E-Mail-Adresse eingeben.");
      return;
    }

    setCloudBusy(true);

    try {
      const { error } = await requestPasswordReset(email, getPasswordResetRedirectUrl());
      if (error) {
        throw error;
      }

      setCloudMessage(
        "E-Mail zum Zurücksetzen gesendet. Bitte prüfe auch den Spam-Ordner."
      );
    } catch (error) {
      setCloudMessage(`Passwort-Reset fehlgeschlagen: ${formatCloudError(error)}`);
    } finally {
      setCloudBusy(false);
    }
  }

  async function handlePasswordUpdate(event) {
    event.preventDefault();

    if (recoveryPassword.trim().length < 8) {
      setCloudMessage("Das neue Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    if (recoveryPassword !== recoveryPasswordConfirm) {
      setCloudMessage("Die beiden neuen Passwörter stimmen nicht überein.");
      return;
    }

    setCloudBusy(true);

    try {
      const { error } = await updateCloudPassword(recoveryPassword);
      if (error) {
        throw error;
      }

      setRecoveryPassword("");
      setRecoveryPasswordConfirm("");
      setCloudRecoveryMode(false);
      setSyncTick((value) => value + 1);
      setCloudMessage("Passwort aktualisiert. Die Cloud-Daten werden jetzt erneut abgeglichen.");
    } catch (error) {
      setCloudMessage(`Neues Passwort konnte nicht gespeichert werden: ${formatCloudError(error)}`);
    } finally {
      setCloudBusy(false);
    }
  }

  async function handleCloudSignOut() {
    if (!isCloudSyncConfigured()) return;

    setCloudBusy(true);

    try {
      await signOutFromCloud();
      setCloudUser(null);
      setCloudReady(false);
      setCloudRecoveryMode(false);
      setRecoveryPassword("");
      setRecoveryPasswordConfirm("");
      setLastCloudSyncAt(null);
      setCloudMessage("Abgemeldet. Die lokalen Daten bleiben auf diesem Gerät erhalten.");
    } catch (error) {
      setCloudMessage(formatCloudError(error) || "Abmeldung fehlgeschlagen.");
    } finally {
      setCloudBusy(false);
    }
  }

  function handleManualCloudSync() {
    if (!cloudUser) {
      setCloudMessage("Bitte zuerst anmelden.");
      return;
    }

    setCloudMessage("Cloud-Abgleich wird manuell gestartet.");
    setSyncTick((value) => value + 1);
  }

  function handleDeleteAccountRequest() {
    const mailto = createDeleteRequestMailto(cloudUser?.email ?? cloudEmail.trim());
    window.location.href = mailto;
  }

  async function handleBackupExport() {
    if (!isDesktopShell || !window.desktopApp?.exportData) return;

    try {
      const result = await window.desktopApp.exportData(app);
      if (result?.canceled) return;

      setStorageFeedback(`Sicherung exportiert: ${result.filePath}`);
    } catch {
      setStorageFeedback("Sicherung konnte nicht exportiert werden.");
    }
  }

  async function handleBackupImport() {
    if (!isDesktopShell || !window.desktopApp?.importData) return;

    if (
      app.classes.length &&
      !window.confirm(
        "Die importierte Sicherung ersetzt die aktuell geladenen Klassen. Fortfahren?"
      )
    ) {
      return;
    }

    try {
      const result = await window.desktopApp.importData();
      if (result?.canceled || !result?.data) return;

      const sanitized = sanitizeLegacyData(result.data);
      setApp(sanitized);
      writeStoredAppState(sanitized);
      setLastSavedAt(new Date().toISOString());
      setStorageInfo((previous) => ({
        ...(previous ?? {}),
        ...result,
      }));
      setStorageFeedback(`Sicherung importiert: ${result.filePath}`);
    } catch {
      setStorageFeedback("Die ausgewählte Sicherung konnte nicht importiert werden.");
    }
  }

  async function handleOpenBackupFolder() {
    if (!isDesktopShell || !window.desktopApp?.openBackupFolder) return;

    try {
      const result = await window.desktopApp.openBackupFolder();
      if (result?.backupFile) {
        setStorageInfo((previous) => ({
          ...(previous ?? {}),
          ...result,
        }));
      }
    } catch {
      setStorageFeedback("Der Sicherungsordner konnte nicht geöffnet werden.");
    }
  }

  const chartStudent = useMemo(() => {
    if (!currentClass) return null;
    return (
      currentClass.students.find((s) => s.id === selectedStudentId) ??
      currentClass.students[0] ??
      null
    );
  }, [currentClass, selectedStudentId]);

  const chartData = useMemo(() => {
    if (!chartStudent) return [];

    const firstSessionPoint = chartStudent.history.find((point) => point.symbol !== "Start");
    if (!firstSessionPoint) return [];

    return chartStudent.history
      .map((point, index) => {
        const isoDate = point.symbol === "Start" ? firstSessionPoint.date : point.date;
        const [year, month, day] = String(isoDate).split("-").map(Number);
        const baseTimestamp = new Date(year, month - 1, day, 12, 0, 0, 0).getTime();

        return {
          index,
          timestamp: point.symbol === "Start" ? baseTimestamp - 60 * 1000 : baseTimestamp,
          date: formatDateLabel(isoDate),
          grade: point.grade,
          label: gradeToLabel(point.grade),
          symbol: point.symbol,
          buffer: point.buffer ?? 0,
          isStart: point.symbol === "Start",
        };
      })
      .filter((point) => Number.isFinite(point.timestamp));
  }, [chartStudent]);

  const pendingCount = Object.keys(pendingEntries).length;
  const totalStudents = currentClass?.students.length ?? 0;
  const completion = currentClass
    ? Math.round((pendingCount / Math.max(totalStudents, 1)) * 100)
    : 0;
  const allStudentsRated = Boolean(currentClass) && pendingCount === totalStudents;
  const lastSessionLabel = currentClass ? formatDateLabel(getLastSessionDate(currentClass)) : "-";
  const canInstallApp = Boolean(installPromptEvent) && !isInstalled;

  const averageGrade = useMemo(() => {
    if (!currentClass?.students?.length) return null;

    return (
      currentClass.students.reduce(
        (sum, student) => sum + (student.currentGrade ?? START_GRADE),
        0
      ) / currentClass.students.length
    );
  }, [currentClass]);

  const storageStatusLabel = isDesktopShell
    ? lastSavedAt
      ? `Automatisch gespeichert: ${formatDateTimeLabel(lastSavedAt)}`
      : desktopDataReady
        ? "Noch keine Dateisicherung gespeichert."
        : "Dateisicherung wird geladen..."
    : "";
  const backupPathLabel = storageInfo?.backupFile
    ? shortenPath(storageInfo.backupFile)
    : "";
  const cloudAvailable = isCloudSyncConfigured();
    const cloudSyncTimeLabel = lastCloudSyncAt
      ? formatDateTimeLabel(lastCloudSyncAt)
      : "Noch kein Cloud-Abgleich";
    const impressumHref = getLegalPageHref("impressum.html");
    const privacyHref = getLegalPageHref("privacy-policy.html");
    const deletionHref = getLegalPageHref("account-deletion.html");
  
  return (
      <div className={classNames("app-shell", isDesktopShell && "desktop-shell")}>
        <style>{`
        html, body, #root {
          min-height: 100%;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif;
          color: #1f2937;
          background:
            radial-gradient(circle at top left, rgba(226, 173, 86, 0.24), transparent 30%),
            radial-gradient(circle at 92% 10%, rgba(39, 79, 111, 0.18), transparent 24%),
            linear-gradient(180deg, #f6efe3 0%, #eef2f5 52%, #e5ebf0 100%);
        }
        button, input, select {
          font: inherit;
        }
        .app-shell {
          min-height: 100vh;
          padding: 28px;
        }
          .container {
            max-width: 1720px;
            width: 100%;
            margin: 0 auto;
            display: grid;
            gap: 24px;
          }
          .legal-footer {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 12px 18px;
            padding: 16px 20px;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.72);
            border: 1px solid rgba(37, 58, 78, 0.12);
            box-shadow: 0 18px 40px rgba(37, 58, 78, 0.08);
          }
          .legal-footer a,
          .legal-inline a {
            color: #1f5d91;
            text-decoration: none;
            font-weight: 700;
          }
          .legal-footer a:hover,
          .legal-inline a:hover {
            text-decoration: underline;
          }
          .legal-inline {
            margin-top: 12px;
            line-height: 1.6;
          }
          .header {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            align-items: flex-start;
          flex-wrap: wrap;
          padding: 30px;
          border-radius: 34px;
          background:
            linear-gradient(135deg, rgba(24, 42, 63, 0.96) 0%, rgba(37, 67, 98, 0.92) 58%, rgba(78, 103, 120, 0.86) 100%);
          color: #f8fafc;
          box-shadow: 0 26px 60px rgba(17, 24, 39, 0.16);
          position: relative;
          overflow: hidden;
        }
        .header::after {
          content: "";
          position: absolute;
          right: -80px;
          top: -110px;
          width: 320px;
          height: 320px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(236, 198, 120, 0.26), transparent 66%);
        }
        .headline {
          margin: 0;
          max-width: 12ch;
          font-size: clamp(2.3rem, 5vw, 4.2rem);
          line-height: 0.96;
          letter-spacing: -0.05em;
          position: relative;
          z-index: 1;
        }
        .muted {
          color: #5d6d7d;
          margin: 16px 0 0 0;
          line-height: 1.7;
        }
        .muted-small {
          color: #6f7f8f;
          margin: 12px 0 0 0;
          font-size: 0.92rem;
          line-height: 1.6;
        }
        .header .muted,
        .header .muted-small {
          position: relative;
          z-index: 1;
        }
        .header .muted {
          color: rgba(226, 232, 240, 0.84);
          max-width: 60ch;
        }
        .header .muted-small {
          color: rgba(226, 232, 240, 0.7);
        }
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }
        .layout {
          display: grid;
          grid-template-columns: minmax(300px, 340px) minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }
        .layout > *,
        .hero-stats > *,
        .grid-main > *,
        .grid-chart > *,
        .tabs,
        .card {
          min-width: 0;
        }
        .card {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-radius: 28px;
          box-shadow: 0 18px 38px rgba(70, 88, 109, 0.1);
          backdrop-filter: blur(16px);
        }
        .card-header {
          padding: 24px 24px 0 24px;
        }
        .card-title {
          margin: 0;
          font-size: 1.16rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #1f3146;
        }
        .card-content {
          padding: 24px;
        }
        .row {
          display: flex;
          gap: 12px;
          align-items: center;
          min-width: 0;
          flex-wrap: wrap;
        }
        .row-between {
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: space-between;
          min-width: 0;
          flex-wrap: wrap;
        }
        .stack {
          display: grid;
          gap: 16px;
        }
        .field {
          display: grid;
          gap: 8px;
        }
        .label {
          font-size: 0.92rem;
          font-weight: 700;
          color: #30465f;
        }
        .input, .select {
          width: 100%;
          border: 1px solid rgba(189, 199, 209, 0.95);
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          padding: 13px 14px;
          outline: none;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .input:focus, .select:focus {
          border-color: #30546f;
          box-shadow: 0 0 0 4px rgba(48, 84, 111, 0.12);
        }
        .button {
          border: none;
          background: linear-gradient(135deg, #1f3a57 0%, #2d5b7b 100%);
          color: #f8fafc;
          border-radius: 16px;
          padding: 12px 16px;
          cursor: pointer;
          font-weight: 800;
          letter-spacing: 0.01em;
          transition: transform 150ms ease, box-shadow 150ms ease, opacity 150ms ease;
          box-shadow: 0 14px 26px rgba(31, 58, 87, 0.16);
        }
        .button:hover {
          transform: translateY(-1px);
        }
        .button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .button-outline {
          background: rgba(255, 255, 255, 0.8);
          color: #1f3146;
          border: 1px solid rgba(183, 194, 205, 0.94);
          box-shadow: none;
        }
        .button-secondary {
          background: linear-gradient(135deg, #e5eaef 0%, #f6f8fa 100%);
          color: #30465f;
          box-shadow: none;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #e9b75d 0%, #d57b4c 100%);
          color: #fffdf8;
          font-weight: 800;
          font-size: 0.95rem;
          box-shadow: 0 16px 28px rgba(213, 123, 76, 0.2);
          position: relative;
          z-index: 1;
        }
        .divider-top {
          border-top: 1px solid rgba(214, 221, 228, 0.86);
          padding-top: 16px;
        }
        .storage-box {
          border: 1px solid rgba(212, 220, 227, 0.92);
          border-radius: 18px;
          padding: 14px 16px;
          background: rgba(246, 249, 252, 0.9);
        }
        .storage-line {
          margin: 0;
          color: #607080;
          font-size: 0.9rem;
          line-height: 1.55;
          word-break: break-word;
        }
        .storage-line + .storage-line {
          margin-top: 8px;
        }
        .auth-form {
          display: grid;
          gap: 12px;
        }
        .auth-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .auth-toggle {
          border: none;
          background: transparent;
          color: #2d5b7b;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          text-align: left;
        }
        .auth-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .tabs {
          display: grid;
          gap: 16px;
        }
        .tab-panel {
          display: grid;
          gap: 16px;
          min-width: 0;
        }
        .tabs-list {
          background: rgba(27, 45, 66, 0.94);
          padding: 6px;
          border-radius: 20px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          box-shadow: 0 18px 30px rgba(30, 45, 63, 0.18);
        }
        .tab-btn {
          border: none;
          background: transparent;
          padding: 12px;
          border-radius: 14px;
          cursor: pointer;
          font-weight: 800;
          color: rgba(226, 232, 240, 0.74);
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tab-btn-active {
          background: linear-gradient(135deg, #efc66e 0%, #e28d58 100%);
          color: #fffdf8;
        }
        .session-toolbar {
          display: grid;
          gap: 16px;
          grid-template-columns: minmax(210px, 260px) minmax(0, 1fr);
          align-items: end;
        }
        .grid-main {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr);
          gap: 24px;
        }
        .grid-chart {
          display: grid;
          grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
          gap: 24px;
        }
        .status-box {
          border: 1px solid rgba(225, 213, 197, 0.92);
          border-radius: 30px;
          padding: 34px;
          background:
            linear-gradient(145deg, rgba(255, 249, 241, 0.97) 0%, rgba(247, 242, 233, 0.93) 100%);
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .status-box::after {
          content: "";
          position: absolute;
          width: 280px;
          height: 280px;
          right: -90px;
          top: -90px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(232, 184, 91, 0.2), transparent 65%);
        }
        .status-name-label {
          margin: 0 0 10px 0;
          color: #8c6b49;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-size: 0.75rem;
          font-weight: 800;
          position: relative;
          z-index: 1;
        }
        .status-name {
          margin: 0;
          font-size: clamp(2.25rem, 4vw, 3.2rem);
          line-height: 0.98;
          letter-spacing: -0.05em;
          color: #1f3146;
          position: relative;
          z-index: 1;
        }
        .status-meta {
          margin-top: 18px;
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          color: #506174;
          position: relative;
          z-index: 1;
        }
        .status-meta span {
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(220, 210, 195, 0.84);
        }
        .score-buttons {
          margin-top: 26px;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          position: relative;
          z-index: 1;
        }
        .score-button {
          min-height: 92px;
          border-radius: 22px;
          font-size: 1.3rem;
          font-weight: 900;
          box-shadow: none;
        }
        .score-buttons .score-button:nth-child(1) {
          background: linear-gradient(180deg, #f7ddd9 0%, #fff1ee 100%);
          color: #8e4738;
        }
        .score-buttons .score-button:nth-child(2) {
          background: linear-gradient(180deg, #f7ead1 0%, #fff7ea 100%);
          color: #8b6631;
        }
        .score-buttons .score-button:nth-child(3) {
          background: linear-gradient(180deg, #e7ecef 0%, #f8fafc 100%);
          color: #56687a;
        }
        .score-buttons .score-button:nth-child(4) {
          background: linear-gradient(180deg, #dfeee2 0%, #f4fbf5 100%);
          color: #3f6f46;
        }
        .score-buttons .score-button:nth-child(5) {
          background: linear-gradient(180deg, #dcebf1 0%, #f0fbfd 100%);
          color: #2e6274;
        }
        .hint {
          margin-top: 18px;
          color: #617283;
          font-size: 0.88rem;
          line-height: 1.6;
          position: relative;
          z-index: 1;
        }
        .empty-box {
          border: 2px dashed rgba(194, 204, 214, 0.95);
          border-radius: 28px;
          padding: 34px;
          text-align: center;
          color: #647586;
          background: rgba(255, 255, 255, 0.56);
        }
        .student-list {
          display: grid;
          gap: 12px;
        }
        .student-row {
          border: 1px solid rgba(210, 218, 225, 0.88);
          border-radius: 22px;
          padding: 16px 18px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          flex-wrap: wrap;
          background: rgba(255, 255, 255, 0.68);
          transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
        }
        .student-row:hover {
          transform: translateY(-1px);
          border-color: rgba(53, 92, 122, 0.32);
          box-shadow: 0 12px 24px rgba(73, 93, 117, 0.08);
        }
        .active-class-row {
          border-color: rgba(48, 84, 111, 0.42);
          box-shadow: 0 12px 24px rgba(48, 84, 111, 0.12);
        }
        .class-list-button {
          border: none;
          background: transparent;
          padding: 0;
          margin: 0;
          text-align: left;
          width: 100%;
          color: inherit;
          cursor: pointer;
          flex: 1 1 220px;
          min-width: 0;
        }
        .class-list-button strong {
          color: #1f3146;
        }
        .student-meta {
          color: #6b7b8b;
          font-size: 0.87rem;
          margin-top: 6px;
        }
        .pill {
          background: rgba(31, 49, 70, 0.08);
          color: #1f3146;
          border-radius: 999px;
          padding: 7px 12px;
          font-weight: 800;
          white-space: nowrap;
        }
        .progress-wrap {
          display: grid;
          gap: 8px;
        }
        .progress-bar {
          width: 100%;
          height: 13px;
          background: rgba(205, 213, 221, 0.72);
          border-radius: 999px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #2c5776 0%, #d27c4d 100%);
        }
        .table-wrap {
          overflow-x: auto;
          border: 1px solid rgba(209, 217, 225, 0.92);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.74);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 760px;
          font-size: 0.95rem;
        }
        th, td {
          text-align: left;
          padding: 13px 15px;
          border-bottom: 1px solid rgba(223, 228, 233, 0.92);
        }
        thead {
          background: linear-gradient(180deg, rgba(236, 240, 244, 0.96), rgba(228, 233, 238, 0.96));
        }
        tbody tr:nth-child(even) {
          background: rgba(246, 249, 251, 0.8);
        }
        tbody tr:hover {
          background: rgba(239, 245, 249, 0.94);
        }
        .edit-box {
          margin-bottom: 16px;
          border: 1px solid rgba(212, 219, 226, 0.92);
          border-radius: 22px;
          padding: 18px;
          background: linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(240, 244, 247, 0.9));
        }
        .edit-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .chart-student-btn {
          width: 100%;
          border: 1px solid rgba(208, 216, 223, 0.88);
          background: rgba(255, 255, 255, 0.7);
          border-radius: 20px;
          padding: 15px 16px;
          text-align: left;
          cursor: pointer;
          transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
        }
        .chart-student-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(53, 92, 122, 0.34);
        }
        .chart-student-btn.active {
          background: linear-gradient(135deg, #20354a 0%, #2c5878 100%);
          color: white;
          border-color: #20354a;
          box-shadow: 0 16px 28px rgba(32, 53, 74, 0.16);
        }
        .chart-box {
          height: 390px;
          width: 100%;
        }
        .stats-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(4, 1fr);
        }
        .stat-card {
          border: 1px solid rgba(211, 219, 226, 0.94);
          border-radius: 22px;
          padding: 18px;
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 0 12px 24px rgba(73, 93, 117, 0.06);
        }
        .stat-label {
          margin: 0;
          color: #6b7b8b;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 800;
        }
        .stat-value {
          margin: 10px 0 0 0;
          font-size: 1.75rem;
          font-weight: 800;
          color: #1f3146;
        }
        .icon-title {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .placeholder-card {
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #647586;
          border: 2px dashed rgba(194, 204, 214, 0.92);
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.52);
        }
        .empty-box p {
          margin: 8px 0 0 0;
        }

        .desktop-shell {
          padding: 18px 22px 28px 22px;
        }
        .desktop-shell .container {
          gap: 18px;
        }
        .desktop-shell .header {
          padding: 22px 28px;
          border-radius: 30px;
        }
        .desktop-shell .headline {
          max-width: 14ch;
          font-size: clamp(2rem, 3.8vw, 3.8rem);
        }
        .desktop-shell .muted {
          margin-top: 10px;
          line-height: 1.55;
        }
        .desktop-shell .muted-small {
          margin-top: 8px;
          line-height: 1.45;
        }
        .desktop-shell .hero-stats .stat-card {
          padding: 14px 18px;
          border-radius: 20px;
        }
        .desktop-shell .hero-stats .stat-value {
          margin-top: 8px;
          font-size: 1.1rem;
          line-height: 1.2;
        }
        .desktop-shell .layout {
          gap: 18px;
          grid-template-columns: minmax(280px, 320px) minmax(0, 1fr);
        }
        .desktop-shell .card-header {
          padding: 18px 20px 0 20px;
        }
        .desktop-shell .card-content {
          padding: 18px 20px 20px 20px;
        }
        .desktop-shell .grid-main,
        .desktop-shell .grid-chart {
          gap: 18px;
        }
        .desktop-shell .status-box {
          padding: 24px;
          border-radius: 24px;
        }
        .desktop-shell .status-name {
          font-size: clamp(2rem, 2.8vw, 3rem);
        }
        .desktop-shell .score-buttons {
          margin-top: 18px;
          gap: 10px;
        }
        .desktop-shell .score-button {
          min-height: 74px;
        }
        .desktop-shell .hint {
          margin-top: 14px;
          font-size: 0.84rem;
          line-height: 1.45;
        }
        .desktop-shell .student-row {
          padding: 12px 14px;
          border-radius: 18px;
        }
        .desktop-shell .chart-box {
          height: 320px;
        }

        @media (max-width: 1100px) {
          .hero-stats,
          .layout,
          .grid-main,
          .grid-chart,
          .session-toolbar {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .app-shell {
            padding: 12px;
          }
          .container {
            gap: 14px;
          }
          .header {
            padding: 20px;
            border-radius: 24px;
          }
          .headline {
            max-width: none;
            font-size: clamp(2rem, 11vw, 3rem);
            line-height: 0.94;
          }
          .muted,
          .muted-small {
            line-height: 1.5;
          }
          .header,
          .card-header,
          .card-content {
            padding-left: 16px;
            padding-right: 16px;
          }
          .hero-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .hero-stats .stat-card {
            padding: 16px;
            border-radius: 18px;
          }
          .hero-stats .stat-value {
            font-size: 0.98rem;
            line-height: 1.2;
            word-break: break-word;
          }
          .tabs-list {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 6px;
            border-radius: 18px;
          }
          .tab-btn {
            font-size: 0.9rem;
            padding: 10px 8px;
          }
          .row-between {
            flex-wrap: wrap;
            align-items: flex-start;
          }
          .badge {
            padding: 10px 14px;
            font-size: 0.92rem;
          }
          .button {
            width: 100%;
            justify-content: center;
          }
          .auth-actions > * {
            flex: 1 1 100%;
          }
          .status-box {
            padding: 20px;
            border-radius: 22px;
          }
          .status-name {
            font-size: clamp(2rem, 10vw, 2.8rem);
          }
          .score-buttons {
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 8px;
            margin-top: 18px;
          }
          .score-button {
            min-height: 72px;
            padding: 10px 8px;
            font-size: 1.05rem;
          }
          .hint {
            font-size: 0.82rem;
            line-height: 1.45;
          }
          .edit-grid,
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .student-row {
            padding: 14px;
            border-radius: 18px;
          }
          .pill {
            padding: 6px 10px;
          }
          .table-wrap {
            font-size: 0.92rem;
          }
          .chart-box {
            height: 280px;
          }
          .legal-footer {
            padding: 14px 16px;
            gap: 10px 14px;
            font-size: 0.92rem;
          }
        }

        @media (max-width: 460px) {
          .hero-stats,
          .edit-grid,
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .tabs-list {
            grid-template-columns: 1fr;
          }
          .score-buttons {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .score-button {
            min-height: 68px;
          }
          .chart-box {
            height: 250px;
          }
        }
      `}</style>

      <div className="container">
        <div className="header">
          <div>
            <h1 className="headline">Mündliche Notengebung</h1>
            <p className="muted">
              Klassen importieren, nach jeder Stunde Schüler/innen bewerten und
              den Verlauf automatisch dokumentieren.
            </p>
            <p className="muted-small">
              Tipp: Lade eine CSV- oder TXT-Datei hoch, wähle danach die Klasse
              und speichere jede Stunde als eigenen Datumseintrag.
            </p>
          </div>
          <div className="row" style={{ alignItems: "center", flexWrap: "wrap" }}>
            <Badge>Startnote: {gradeToLabel(START_GRADE)}</Badge>
            <Badge>{isOnline ? "Online" : "Offline"}</Badge>
            {canInstallApp ? (
              <button
                type="button"
                className="button"
                onClick={handleInstallApp}
              >
                App installieren
              </button>
            ) : null}
          </div>
        </div>

        <div className="hero-stats">
          <StatCard label="Klassen" value={app.classes.length} />
          <StatCard
            label="Schüler/innen"
            value={currentClass ? currentClass.students.length : "-"}
          />
          <StatCard
            label="Letztes Datum"
            value={currentClass ? lastSessionLabel : "-"}
          />
          <StatCard
            label="Durchschnitt"
            value={averageGrade ? gradeToLabel(averageGrade) : "-"}
          />
        </div>

        <div className="layout">
          <div className="tabs sidebar-column">
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="icon-title">
                    <Upload size={18} />
                    Klasse importieren
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="stack">
                <div className="field">
                  <label className="label">Datei hochladen</label>
                  <input
                    className="input"
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                  />
                  <p className="muted-small">
                    Der Klassenname wird direkt aus dem Dateinamen übernommen.
                    Pro Klasse sind maximal {MAX_STUDENTS_PER_CLASS} Schüler/innen erlaubt.
                  </p>
                </div>

                {uploadFeedback ? <p className="muted">{uploadFeedback}</p> : null}

                <div className="field divider-top">
                  <label className="label">Cloud-Synchronisierung</label>
                  <p className="muted-small" style={{ marginTop: 0 }}>
                    Mit einem Konto können Windows, Android und später auch iOS
                    dieselben Klassen und Bewertungen verwenden.
                  </p>

                    <div className="storage-box">
                      <p className="storage-line">
                        <strong>Status:</strong> {cloudMessage}
                      </p>
                    <p className="storage-line">
                      <strong>Letzter Cloud-Abgleich:</strong> {cloudSyncTimeLabel}
                    </p>
                    {cloudUser ? (
                      <p className="storage-line">
                        <strong>Angemeldet als:</strong> {cloudUser.email}
                        </p>
                      ) : null}
                    </div>
                    <p className="muted-small legal-inline">
                      Rechtliches:
                      {" "}
                      <a href={impressumHref} target="_blank" rel="noreferrer">
                        Impressum
                      </a>
                      {" | "}
                      <a href={privacyHref} target="_blank" rel="noreferrer">
                        Datenschutz
                      </a>
                      {" | "}
                      <a href={deletionHref} target="_blank" rel="noreferrer">
                        Datenlöschung
                      </a>
                    </p>
  
                    {cloudAvailable ? (
                      cloudRecoveryMode ? (
                      <form className="auth-form" onSubmit={handlePasswordUpdate}>
                        <p className="muted-small" style={{ marginTop: 0 }}>
                          Lege jetzt ein neues Passwort fest. Danach bleibt deine
                          Anmeldung auf diesem Gerät gespeichert.
                        </p>
                        <input
                          className="input"
                          type="password"
                          placeholder="Neues Passwort"
                          value={recoveryPassword}
                          onChange={(e) => setRecoveryPassword(e.target.value)}
                        />
                        <input
                          className="input"
                          type="password"
                          placeholder="Neues Passwort wiederholen"
                          value={recoveryPasswordConfirm}
                          onChange={(e) => setRecoveryPasswordConfirm(e.target.value)}
                        />
                        <div className="auth-actions">
                          <button className="button" type="submit" disabled={cloudBusy}>
                            {cloudBusy ? "Bitte warten..." : "Passwort speichern"}
                          </button>
                        </div>
                      </form>
                      ) : cloudUser ? (
                        <div className="auth-actions">
                          <button
                            type="button"
                            className="button button-outline"
                            onClick={handleSwitchCloudAccount}
                            disabled={cloudBusy}
                          >
                            Konto wechseln
                          </button>
                          <button
                            type="button"
                            className="button button-outline"
                          onClick={handleManualCloudSync}
                          disabled={cloudBusy}
                        >
                          <span className="icon-title">
                            <RefreshCw size={16} />
                            Jetzt synchronisieren
                          </span>
                        </button>
                        <button
                          type="button"
                          className="button button-outline"
                          onClick={handleCloudSignOut}
                          disabled={cloudBusy}
                        >
                          Abmelden
                        </button>
                        <button
                          type="button"
                          className="button button-outline"
                          onClick={handleDeleteAccountRequest}
                        >
                          Konto-Löschung anfragen
                        </button>
                      </div>
                    ) : (
                      <form className="auth-form" onSubmit={handleCloudAuthSubmit}>
                        <p className="muted-small" style={{ marginTop: 0 }}>
                          Wenn du einmal angemeldet bist, bleibt dein Konto auf
                          diesem Gerät gespeichert.
                        </p>
                        <input
                          className="input"
                          type="email"
                          placeholder="E-Mail"
                          value={cloudEmail}
                          onChange={(e) => setCloudEmail(e.target.value)}
                        />
                        <input
                          className="input"
                          type="password"
                          placeholder="Passwort"
                          value={cloudPassword}
                          onChange={(e) => setCloudPassword(e.target.value)}
                        />
                        <div className="auth-actions">
                          <button className="button" type="submit" disabled={cloudBusy}>
                            {cloudBusy
                              ? "Bitte warten..."
                              : cloudMode === "signup"
                                ? "Konto erstellen"
                                : "Anmelden"}
                          </button>
                          <button
                            type="button"
                            className="auth-toggle"
                            onClick={handlePasswordResetRequest}
                            disabled={cloudBusy}
                          >
                            Passwort vergessen?
                          </button>
                          <button
                            type="button"
                            className="auth-toggle"
                            onClick={() =>
                              setCloudMode((prev) => (prev === "login" ? "signup" : "login"))
                            }
                            disabled={cloudBusy}
                          >
                            {cloudMode === "login"
                              ? "Noch kein Konto? Konto erstellen"
                              : "Schon ein Konto? Jetzt anmelden"}
                          </button>
                        </div>
                      </form>
                    )
                  ) : (
                    <div className="storage-box">
                      <p className="storage-line">
                        Für den echten Gerätesync fehlen noch die Supabase-Zugangsdaten
                        in der Datei <strong>.env</strong>.
                      </p>
                    </div>
                  )}
                </div>

                {isDesktopShell ? (
                  <div className="field divider-top">
                    <label className="label">Datensicherung</label>
                    <p className="muted-small" style={{ marginTop: 0 }}>
                      Die App speichert automatisch als echte Datei auf diesem PC.
                      Du kannst die Sicherung auch exportieren und auf einen anderen
                      Rechner kopieren.
                    </p>
                    <div className="stack">
                      <div className="row">
                        <button
                          type="button"
                          className="button button-outline"
                          onClick={handleBackupExport}
                        >
                          <span className="icon-title">
                            <Download size={16} />
                            Sicherung exportieren
                          </span>
                        </button>
                        <button
                          type="button"
                          className="button button-outline"
                          onClick={handleBackupImport}
                        >
                          <span className="icon-title">
                            <Upload size={16} />
                            Sicherung importieren
                          </span>
                        </button>
                      </div>
                      <div className="row">
                        <button
                          type="button"
                          className="button button-outline"
                          onClick={handleOpenBackupFolder}
                        >
                          <span className="icon-title">
                            <FolderOpen size={16} />
                            Sicherungsordner öffnen
                          </span>
                        </button>
                      </div>
                      <div className="storage-box">
                        <p className="storage-line">
                          <strong>Status:</strong> {storageStatusLabel}
                        </p>
                        {storageFeedback ? (
                          <p className="storage-line">
                            <strong>Hinweis:</strong> {storageFeedback}
                          </p>
                        ) : null}
                        {backupPathLabel ? (
                          <p className="storage-line">
                            <strong>Datei:</strong> {backupPathLabel}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}

                {currentClass ? (
                  <div className="field divider-top">
                    <label className="label">Aktuelle Klasse umbenennen</label>
                    <div className="row">
                      <input
                        className="input"
                        value={editingClassName}
                        onChange={(e) => setEditingClassName(e.target.value)}
                      />
                      <button className="button" onClick={renameCurrentClass}>
                        Speichern
                      </button>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="row-between">
                  <span className="icon-title">
                    <Users size={18} />
                    Klassenliste
                  </span>
                  <span className="icon-title" style={{ color: "#6b7b8b" }}>
                    <ArrowUpDown size={16} />
                    {sortedClasses.length}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="stack">
                <div className="field">
                  <label className="label">Sortierung</label>
                  <select
                    className="select"
                    value={classSortMode}
                    onChange={(e) => setClassSortMode(e.target.value)}
                  >
                    {Object.entries(CLASS_SORT_OPTIONS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="student-list">
                  {sortedClasses.length ? (
                    sortedClasses.map((classItem) => {
                      const isActive = currentClass?.id === classItem.id;
                      const lastDate = formatDateLabel(getLastSessionDate(classItem));

                      return (
                        <div
                          key={classItem.id}
                          className={classNames("student-row", isActive && "active-class-row")}
                        >
                          <button
                            type="button"
                            className="class-list-button"
                            onClick={() => selectClass(classItem.id)}
                          >
                            <div className="row-between">
                              <strong>{classItem.name}</strong>
                              <span className="pill">
                                {classItem.completed ? "Erledigt" : "Offen"}
                              </span>
                            </div>
                            <div className="student-meta">
                              Letzter Eintrag: {lastDate} | {classItem.students.length} Schüler/innen
                            </div>
                          </button>

                          <div className="row">
                            <button
                              type="button"
                            className="button button-outline"
                            onClick={() => toggleClassCompleted(classItem.id)}
                          >
                              {classItem.completed ? "Wieder öffnen" : "Erledigt"}
                            </button>
                            <button
                              type="button"
                              className={classNames(
                                "button",
                                deleteConfirmClassId === classItem.id
                                  ? "button-secondary"
                                  : "button-outline"
                              )}
                              onClick={() => requestDeleteClass(classItem.id)}
                            >
                              <span className="icon-title">
                                <Trash2 size={16} />
                                {deleteConfirmClassId === classItem.id
                                  ? "Wirklich löschen"
                                  : "Löschen"}
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="placeholder-card">
                      Noch keine Klassen importiert.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="tabs main-column">
            <div className="tabs-list">
              <TabButton
                active={activeTab === "bewertung"}
                onClick={() => setActiveTab("bewertung")}
              >
                Bewertung
              </TabButton>
              <TabButton
                active={activeTab === "tabelle"}
                onClick={() => setActiveTab("tabelle")}
              >
                Tabelle
              </TabButton>
              <TabButton
                active={activeTab === "verlauf"}
                onClick={() => setActiveTab("verlauf")}
              >
                Verlauf
              </TabButton>
            </div>

            {activeTab === "bewertung" && (
              <div className="tab-panel">
                {!currentClass ? (
                  <Card>
                    <CardContent className="placeholder-card">
                      Bitte zuerst eine Klasse importieren.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid-main">
                    <Card>
                      <CardHeader>
                        <CardTitle className="row-between">
                          <span className="icon-title">
                            <Users size={18} />
                            {currentClass.name}
                          </span>
                          <span className="muted-small">
                            {pendingCount}/{totalStudents} bewertet
                          </span>
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="stack">
                        <div className="session-toolbar">
                          <div className="field">
                            <label className="label">Datum der Stunde</label>
                            <div className="row">
                              <Calendar size={16} color="#64748b" />
                                <input
                                  className="input"
                                  type="date"
                                  value={sessionDate}
                                  onChange={(e) => handleSessionDateChange(e.target.value)}
                                />
                            </div>
                          </div>

                          <div className="progress-wrap">
                            <label className="label">Fortschritt</label>
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${completion}%` }}
                              />
                            </div>
                            <p className="muted-small">
                              Nach dem Speichern wird automatisch eine neue Spalte
                              mit diesem Datum erzeugt.
                            </p>
                          </div>
                        </div>

                        {activeStudent && !allStudentsRated ? (
                          <div className="status-box">
                            <p className="status-name-label">Aktueller Name</p>
                            <h2 className="status-name">{activeStudent.name}</h2>

                            <div className="status-meta">
                              <span>
                                Aktuell:{" "}
                                <strong>
                                  {gradeToLabel(activeStudent.currentGrade)}
                                </strong>
                              </span>
                              <span>
                                Puffer:{" "}
                                <strong>
                                  {pendingEntries[activeStudent.id]?.bufferAfter ??
                                    activeStudent.buffer ??
                                    0}
                                  /3
                                </strong>
                              </span>

                              {pendingEntries[activeStudent.id] ? (
                                <>
                                  <span>
                                    Neu:{" "}
                                    <strong>
                                      {gradeToLabel(
                                        pendingEntries[activeStudent.id].gradeAfter
                                      )}
                                    </strong>
                                  </span>
                                  <span>
                                    Neuer Puffer:{" "}
                                    <strong>
                                      {
                                        pendingEntries[activeStudent.id]
                                          .bufferAfter
                                      }
                                      /3
                                    </strong>
                                  </span>
                                </>
                              ) : null}
                            </div>

                            <div className="score-buttons">
                              {SESSION_SYMBOLS.map((symbol) => (
                                <button
                                  key={symbol}
                                  className={classNames(
                                    "button score-button",
                                    symbol === "0" && "button-secondary"
                                  )}
                                  onClick={() => applySymbol(symbol)}
                                >
                                  {symbol}
                                </button>
                              ))}
                            </div>

                            <div className="hint">
                              -- = +0,5 schlechter | - = +0,25 schlechter | 0 =
                              unverändert | + = -0,25 besser | ++ = -0,5 besser
                              <br />
                              An der Note 1 können bis zu 3 Puffer gesammelt
                              werden. Erst wenn kein Puffer mehr vorhanden ist,
                              führt ein Minus wieder zu einer schlechteren Note.
                            </div>
                          </div>
                        ) : (
                          <div className="empty-box">
                            <div>
                              <CheckCircle2 size={32} />
                              <p>Alle Schüler/innen wurden für diese Stunde erfasst.</p>
                              <p className="muted-small">
                                Die letzte Bewertungs-Karte verschwindet jetzt bewusst.
                                Du kannst die Stunde direkt speichern.
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="row" style={{ flexWrap: "wrap" }}>
                          <button
                            className="button"
                            onClick={saveSession}
                            disabled={!pendingCount}
                          >
                            <span className="icon-title">
                              <Save size={16} />
                              Stunde speichern
                            </span>
                          </button>

                          <button
                            className="button button-outline"
                            onClick={resetSession}
                          >
                            <span className="icon-title">
                              <RotateCcw size={16} />
                              Eingaben zurücksetzen
                            </span>
                          </button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Zwischenstand</CardTitle>
                      </CardHeader>

                      <CardContent className="student-list">
                        {currentClass.students.map((student) => {
                          const pending = pendingEntries[student.id];
                          const shownGrade = pending?.gradeAfter ?? student.currentGrade;

                          return (
                            <div key={student.id} className="student-row">
                              <div>
                                <div style={{ fontWeight: 600 }}>{student.name}</div>
                                <div className="student-meta">
                                  {pending
                                    ? `${pending.symbol} | ${trendText(
                                        pending.delta
                                      )} | Puffer ${pending.bufferAfter ?? 0}/3`
                                    : `noch offen | Puffer ${student.buffer ?? 0}/3`}
                                </div>
                              </div>

                              <div className="pill">
                                {gradeToLabel(shownGrade)}
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {activeTab === "tabelle" && (
              <div className="tab-panel">
                {!currentClass ? (
                    <Card>
                      <CardContent className="placeholder-card">
                      Keine Klasse ausgewählt.
                    </CardContent>
                  </Card>
                ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="row-between">
                          <span>Notentabelle</span>
                          <div className="row" style={{ flexWrap: "wrap" }}>
                            <button
                              className="button button-outline"
                            onClick={() => setEditMode((prev) => !prev)}
                          >
                            {editMode
                              ? "Bearbeitung schließen"
                              : "Namen und Einträge bearbeiten"}
                          </button>
                          <button
                            className="button button-outline"
                            onClick={() => exportCsv(app)}
                          >
                            CSV exportieren
                          </button>
                        </div>
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      {editMode ? (
                        <div className="edit-box">
                          <div className="row-between" style={{ marginBottom: 16 }}>
                            <h3 style={{ margin: 0 }}>Schülernamen bearbeiten</h3>
                            <button className="button" onClick={saveStudentEdits}>
                              Änderungen speichern
                            </button>
                          </div>

                          <div className="edit-grid">
                            {currentClass.students.map((student) => (
                              <div key={student.id} className="field">
                                <label className="label">{student.name}</label>
                                <input
                                  className="input"
                                  value={studentDrafts[student.id] ?? student.name}
                                  onChange={(e) =>
                                    updateStudentName(student.id, e.target.value)
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Schüler/in</th>
                              <th>Start</th>
                              {currentClass.sessions.map((session) => (
                                <th key={session.id}>
                                  {editMode ? (
                                    <input
                                      className="input"
                                      type="date"
                                      value={sessionDrafts[session.id]?.date ?? session.date}
                                      onChange={(e) =>
                                        updateSessionDateDraft(session.id, e.target.value)
                                      }
                                    />
                                  ) : (
                                    formatDateLabel(session.date)
                                  )}
                                </th>
                              ))}
                              <th>Puffer</th>
                              <th>Aktuell</th>
                            </tr>
                          </thead>

                          <tbody>
                            {currentClass.students.map((student) => (
                              <tr key={student.id}>
                                <td style={{ fontWeight: 600 }}>{student.name}</td>
                                <td>{gradeToLabel(student.startGrade)}</td>

                                {currentClass.sessions.map((session) => {
                                  const entry = session.entries[student.id];

                                  return (
                                    <td key={session.id}>
                                      {editMode ? (
                                        <select
                                          className="select"
                                          value={
                                            sessionDrafts[session.id]?.entries?.[student.id] ?? ""
                                          }
                                          onChange={(e) =>
                                            updateSessionDraft(
                                              session.id,
                                              student.id,
                                              e.target.value
                                            )
                                          }
                                        >
                                          <option value="">-</option>
                                          {SESSION_SYMBOLS.map((symbol) => (
                                            <option key={symbol} value={symbol}>
                                              {symbol}
                                            </option>
                                          ))}
                                        </select>
                                      ) : entry ? (
                                        `${entry.symbol} -> ${gradeToLabel(entry.gradeAfter)}`
                                      ) : (
                                        "-"
                                      )}
                                    </td>
                                  );
                                })}

                                <td>{student.buffer ?? 0}/3</td>
                                <td style={{ fontWeight: 700 }}>
                                  {gradeToLabel(student.currentGrade)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "verlauf" && (
              <div className="tab-panel">
                {!currentClass ? (
                    <Card>
                      <CardContent className="placeholder-card">
                      Keine Klasse ausgewählt.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid-chart">
                    <Card>
                      <CardHeader>
                        <CardTitle>Schülerauswahl</CardTitle>
                      </CardHeader>

                      <CardContent className="student-list">
                        {currentClass.students.map((student) => (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => setSelectedStudentId(student.id)}
                            className={classNames(
                              "chart-student-btn",
                              selectedStudentId === student.id && "active"
                            )}
                          >
                            <div className="row-between">
                              <span>{student.name}</span>
                              <span>{gradeToLabel(student.currentGrade)}</span>
                            </div>
                          </button>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>
                          <span className="icon-title">
                            <LineChartIcon size={18} />
                            Notenverlauf{" "}
                            {chartStudent ? `- ${chartStudent.name}` : ""}
                          </span>
                        </CardTitle>
                      </CardHeader>

                      <CardContent>
                        <React.Suspense
                          fallback={
                            <div className="placeholder-card">
                              Verlauf wird geladen...
                            </div>
                          }
                        >
                          <GradeChartPanel
                            chartStudent={chartStudent}
                            chartData={chartData}
                            startLabel={chartStudent ? gradeToLabel(chartStudent.startGrade) : "-"}
                            currentLabel={chartStudent ? gradeToLabel(chartStudent.currentGrade) : "-"}
                            bufferLabel={chartStudent ? `${chartStudent.buffer ?? 0}/3` : "-"}
                            entryCount={chartStudent ? chartStudent.history.length - 1 : 0}
                          />
                        </React.Suspense>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="legal-footer">
            <a href={impressumHref} target="_blank" rel="noreferrer">
              Impressum
            </a>
            <a href={privacyHref} target="_blank" rel="noreferrer">
              Datenschutz
            </a>
            <a href={deletionHref} target="_blank" rel="noreferrer">
              Konto- und Datenlöschung
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

