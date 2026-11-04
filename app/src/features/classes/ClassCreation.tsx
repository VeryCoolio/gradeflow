import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { schoolYearLabel } from "../../application/schoolYear";
import { importClassFile } from "../../infrastructure/importExport/classImport";
import {
  CLASS_DRAFT_KEY,
  emptyClassDraft,
  readClassDraft,
  type ClassDraft,
} from "../../infrastructure/local/classDraft";
import type { StoragePort } from "../../infrastructure/local/localRepository";

export function ClassCreation({
  today,
  canWrite = true,
  error = "",
  storage,
  onCreate,
  onDemo,
  onError,
}: {
  today: string;
  canWrite?: boolean;
  error?: string;
  storage?: StoragePort;
  onCreate: (name: string, period: string, names: string[]) => boolean;
  onDemo: () => void;
  onError: (message: string) => void;
}) {
  const [initial] = useState(() => {
    try {
      return { draft: readClassDraft(storage), error: "" };
    } catch {
      return {
        draft: null,
        error:
          "Der vorhandene Entwurf konnte nicht gelesen werden. Angelegte Klassen bleiben erhalten.",
      };
    }
  });
  const [draft, setDraft] = useState<ClassDraft>(
    () => initial.draft ?? emptyClassDraft(today),
  );
  const [draftStatus, setDraftStatus] = useState(
    initial.draft
      ? "Lokalen Entwurf wieder aufgenommen. Die Klasse ist noch nicht angelegt."
      : "Noch keine Klasse angelegt. Deine Eingaben werden als lokaler Entwurf gesichert.",
  );
  const [draftError, setDraftError] = useState(initial.error);
  const { mode, name, period, people } = draft;
  function update(patch: Partial<ClassDraft>) {
    if (!canWrite) return;
    const next = { ...draft, ...patch };
    setDraft(next);
    if (!storage) {
      setDraftStatus(
        "Eingaben sind noch nicht als Klasse angelegt. In dieser Ansicht ist keine Entwurfsspeicherung eingerichtet.",
      );
      return;
    }
    try {
      storage.setItem(CLASS_DRAFT_KEY, JSON.stringify(next));
      setDraftError("");
      setDraftStatus(
        "Entwurf in diesem Browser gespeichert. Die Klasse ist noch nicht angelegt.",
      );
    } catch {
      setDraftError(
        "Entwurf nicht gespeichert. Lass diese Ansicht geöffnet und versuche es erneut, bevor du neu lädst.",
      );
    }
  }
  const setMode = (mode: ClassDraft["mode"]) => update({ mode });
  const setName = (name: string) => update({ name });
  const setPeriod = (period: string) => {
    setPeriodError("");
    update({ period });
  };
  const setPeople = (people: ClassDraft["people"]) => update({ people });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [periodError, setPeriodError] = useState("");
  const [fileProblem, setFileProblem] = useState(false);
  const periodField = useRef<HTMLInputElement>(null);
  const firstNameFields = useRef<(HTMLInputElement | null)[]>([]);
  const lastNameFields = useRef<(HTMLInputElement | null)[]>([]);
  const morePeople = useRef<HTMLButtonElement>(null);
  const pendingFirstFocus = useRef<number | null>(null);
  const errorMessage = error || formError;
  const errorSummary = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (pendingFirstFocus.current !== null) {
      firstNameFields.current[pendingFirstFocus.current]?.focus();
      pendingFirstFocus.current = null;
    }
  }, [people.length]);
  useEffect(() => {
    if (errorMessage) {
      errorSummary.current?.focus();
      errorSummary.current?.scrollIntoView?.({ block: "nearest" });
    }
  }, [errorMessage]);
  function addPerson() {
    if (!canWrite || busy || people.length >= 45) return;
    pendingFirstFocus.current = people.length;
    setPeople([...people, { firstName: "", lastName: "" }]);
  }
  function advanceName(
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
    field: "firstName" | "lastName",
  ) {
    if (
      event.key !== "Enter" ||
      event.nativeEvent.isComposing ||
      event.nativeEvent.keyCode === 229
    )
      return;
    event.preventDefault();
    if (event.repeat || !event.currentTarget.value.trim()) return;
    const next =
      field === "firstName"
        ? lastNameFields.current[index]
        : !people[index].firstName.trim()
          ? firstNameFields.current[index]
          : (firstNameFields.current[index + 1] ?? morePeople.current);
    next?.focus();
  }
  function requirePeriod() {
    setPeriodError(
      "Bitte gib eine Bezeichnung für den Bewertungszeitraum ein.",
    );
    periodField.current?.focus();
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || !canWrite) return;
    if (!period.trim()) {
      requirePeriod();
      return;
    }
    setFormError("");
    setFileProblem(false);
    onError("");
    setBusy(true);
    try {
      let names: string[];
      if (mode === "datei") {
        if (!file) throw new RangeError("Bitte eine Klassenliste auswählen.");
        names = await importClassFile(file);
      } else {
        names = people.map((person, index) => {
          if (!person.firstName.trim() || !person.lastName.trim())
            throw new RangeError(
              `Person ${index + 1}: Bitte Vorname und Nachname ausfüllen oder die Zeile entfernen.`,
            );
          return `${person.firstName.trim()} ${person.lastName.trim()}`;
        });
      }
      if (onCreate(name, period, names)) {
        try {
          storage?.removeItem(CLASS_DRAFT_KEY);
        } catch {
          onError(
            "Die Klasse wurde angelegt. Der alte Entwurf konnte nicht entfernt werden; lege ihn nicht erneut an.",
          );
        }
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Die Klassenliste konnte nicht gelesen werden.";
      setFormError(message);
      setFileProblem(mode === "datei");
      onError(message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card creation-page">
      <p className="eyebrow">Neue Klasse</p>
      <h2>Klasse anlegen</h2>
      <p>
        Gib einen Klassennamen ein und füge die Personen hinzu. Jede Person
        startet bei 2,00.
      </p>
      <div
        className={`draft-status ${draftError ? "error" : ""}`}
        role={draftError ? "alert" : "status"}
      >
        <strong>{draftError || draftStatus}</strong>
        <p>
          Mit „Klasse lokal anlegen“ übernimmst du den Entwurf. Bereits
          angelegte Klassen sind im Klassenregister erreichbar.
        </p>
        {draftError && canWrite ? (
          <button type="button" onClick={() => update({})}>
            Entwurf erneut speichern
          </button>
        ) : null}
      </div>
      <div className="view-tabs" aria-label="Art der Klassenerstellung">
        <button
          type="button"
          aria-pressed={mode === "manuell"}
          onClick={() => setMode("manuell")}
        >
          Namen selbst eingeben
        </button>
        <button
          type="button"
          aria-pressed={mode === "datei"}
          aria-describedby="class-import-hint"
          onClick={() => setMode("datei")}
        >
          Klassenliste importieren
        </button>
      </div>
      <p id="class-import-hint" className="muted">
        Import: Excel (.xlsx), CSV oder TXT mit Kopfzeile und genau zwei
        Spalten: Vorname, Nachname.
      </p>
      <form
        onSubmit={submit}
        aria-describedby={errorMessage ? "class-creation-error" : undefined}
      >
        <fieldset disabled={!canWrite || busy}>
          <legend className="sr-only">Klasse und Personen</legend>
          <label htmlFor="class-name">Klassenname</label>
          <input
            id="class-name"
            maxLength={200}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="z. B. 8b · Mathematik"
            required
          />
          <label htmlFor="period-label">Bewertungszeitraum</label>
          <input
            id="period-label"
            ref={periodField}
            maxLength={200}
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            onInvalid={(event) => {
              event.preventDefault();
              requirePeriod();
            }}
            aria-invalid={Boolean(periodError) || undefined}
            aria-describedby={`period-hint${periodError ? " period-error" : ""}`}
            required
          />
          {periodError ? (
            <p id="period-error" className="feedback error" role="alert">
              {periodError}
            </p>
          ) : null}
          <div
            className="actions"
            aria-label="Vorschläge für den Bewertungszeitraum"
          >
            {[schoolYearLabel(today), "1. Halbjahr", "2. Halbjahr"].map(
              (label) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => setPeriod(label)}
                >
                  {label}
                </button>
              ),
            )}
          </div>
          <p id="period-hint" className="muted">
            Du kannst das Schuljahr, ein Halbjahr oder eine freie Bezeichnung
            eintragen. Der Zeitraum hat kein automatisches Ende und läuft
            weiter, bis du ihn selbst archivierst.
          </p>
          {mode === "manuell" ? (
            <>
              <h3>Personen ({people.length}/45)</h3>
              {people.map((person, index) => (
                <div className="name-row" key={index}>
                  <div>
                    <label htmlFor={`first-${index}`}>
                      Vorname {index + 1}
                    </label>
                    <input
                      id={`first-${index}`}
                      ref={(element) => {
                        firstNameFields.current[index] = element;
                      }}
                      maxLength={100}
                      autoComplete="off"
                      value={person.firstName}
                      onKeyDown={(event) =>
                        advanceName(event, index, "firstName")
                      }
                      onChange={(event) =>
                        setPeople(
                          people.map((entry, at) =>
                            at === index
                              ? { ...entry, firstName: event.target.value }
                              : entry,
                          ),
                        )
                      }
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor={`last-${index}`}>
                      Nachname {index + 1}
                    </label>
                    <input
                      id={`last-${index}`}
                      ref={(element) => {
                        lastNameFields.current[index] = element;
                      }}
                      maxLength={100}
                      autoComplete="off"
                      value={person.lastName}
                      onKeyDown={(event) =>
                        advanceName(event, index, "lastName")
                      }
                      onChange={(event) =>
                        setPeople(
                          people.map((entry, at) =>
                            at === index
                              ? { ...entry, lastName: event.target.value }
                              : entry,
                          ),
                        )
                      }
                      required
                    />
                  </div>
                  <button
                    type="button"
                    disabled={people.length === 1}
                    aria-label={`Person ${index + 1} entfernen`}
                    onClick={() =>
                      setPeople(people.filter((_, at) => at !== index))
                    }
                  >
                    Entfernen
                  </button>
                </div>
              ))}
              <button
                type="button"
                ref={morePeople}
                disabled={people.length >= 45}
                onClick={addPerson}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && event.repeat)
                    event.preventDefault();
                }}
              >
                Weitere Person
              </button>
              <p className="muted">
                Enter führt zum nächsten Namensfeld oder zu „Weitere Person“.
                Mit „Klasse lokal anlegen“ schließt du die Eingabe ab.
              </p>
            </>
          ) : (
            <div className="import-instructions">
              <label htmlFor="class-file">Klassenliste</label>
              <input
                id="class-file"
                aria-invalid={fileProblem || undefined}
                aria-describedby={
                  fileProblem
                    ? "class-import-hint class-creation-error"
                    : "class-import-hint"
                }
                type="file"
                accept=".xlsx,.csv,.txt"
                required
                onChange={(event) => {
                  setFormError("");
                  setFileProblem(false);
                  onError("");
                  const selected = event.target.files?.[0] ?? null;
                  setFile(selected);
                  update({ fileName: selected?.name ?? null });
                }}
              />
              {draft.fileName && !file ? (
                <p className="feedback">
                  Zuletzt ausgewählt: {draft.fileName}. Bitte die Datei nach dem
                  Neuladen erneut auswählen.
                </p>
              ) : null}
              <h3>Klassenliste vorbereiten</h3>
              <ol>
                <li>Musterklassenliste herunterladen.</li>
                <li>
                  Spalte A: <strong>Vorname</strong>. Spalte B:{" "}
                  <strong>Nachname</strong>. Die Überschriften in Zeile 1
                  beibehalten.
                </li>
                <li>
                  Ab Zeile 2 je Person eine Zeile ausfüllen. Beide Felder sind
                  erforderlich. Höchstens 45 Personen.
                </li>
                <li>
                  Als Excel (.xlsx) oder CSV speichern und hier auswählen. Nur
                  ein Tabellenblatt; keine zusätzlichen Spalten oder Formeln.
                </li>
              </ol>
              <div className="actions">
                <a
                  className="button-link"
                  href="./musterklassenliste.xlsx"
                  download
                >
                  Musterklassenliste (Excel)
                </a>
                <a
                  className="button-link"
                  href="./musterklassenliste.csv"
                  download
                >
                  Musterklassenliste (CSV)
                </a>
              </div>
              <p className="muted">
                CSV/TXT: zwei Spalten mit Semikolon, Komma oder Tabulator,
                UTF-8. Einspaltige Listen werden nicht übernommen.
              </p>
            </div>
          )}
          {errorMessage ? (
            <div
              id="class-creation-error"
              ref={errorSummary}
              className="feedback error"
              role="alert"
              tabIndex={-1}
            >
              <p>{errorMessage}</p>
              <p>
                Prüfe die Angaben und wähle bei Bedarf eine korrigierte Datei.
                Deine Eingaben bleiben erhalten.
              </p>
            </div>
          ) : null}
          <button
            data-tour="create-class"
            className="primary"
            type="submit"
            disabled={busy}
          >
            {busy ? "Klassenliste wird geprüft …" : "Klasse lokal anlegen"}
          </button>
        </fieldset>
      </form>
      <div className="demo-block">
        <h3>Erst ausprobieren</h3>
        <p>
          Eine neue Demoklasse enthält 20 ausschließlich fiktive Personen und
          zunächst keine Stunden. Beispielstunden ergänzt du anschließend
          gesondert in dieser Klasse. Eine vorhandene Demoklasse wird wieder
          geöffnet; ihre Eingaben bleiben erhalten.
        </p>
        <button type="button" disabled={!canWrite || busy} onClick={onDemo}>
          Demoklasse erstellen
        </button>
      </div>
    </section>
  );
}
