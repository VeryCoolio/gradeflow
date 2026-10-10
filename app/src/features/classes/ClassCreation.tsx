import { useState, type FormEvent } from "react";
import { schoolYearLabel } from "../../application/schoolYear";
import { importClassFile } from "../../infrastructure/importExport/classImport";

export function ClassCreation({
  today,
  onCreate,
  onDemo,
  onError,
}: {
  today: string;
  onCreate: (name: string, period: string, names: string[]) => boolean;
  onDemo: () => void;
  onError: (message: string) => void;
}) {
  const [mode, setMode] = useState<"manuell" | "datei">("manuell");
  const [name, setName] = useState("");
  const [period, setPeriod] = useState(schoolYearLabel(today));
  const [customPeriod, setCustomPeriod] = useState(false);
  const [people, setPeople] = useState([{ firstName: "", lastName: "" }]);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
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
      onCreate(name, period, names);
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Die Klassenliste konnte nicht gelesen werden.",
      );
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
          onClick={() => setMode("datei")}
        >
          Klasse importieren
        </button>
      </div>
      <form onSubmit={submit}>
        <label htmlFor="class-name">Klassenname</label>
        <input
          id="class-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="z. B. 8b · Mathematik"
          required
        />
        <div className="period-default">
          <span>
            Bewertungszeitraum: <strong>{period}</strong>
          </span>
          <button type="button" onClick={() => setCustomPeriod(!customPeriod)}>
            Bezeichnung ändern
          </button>
        </div>
        {customPeriod ? (
          <>
            <label htmlFor="period-label">Bewertungszeitraum</label>
            <input
              id="period-label"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              required
            />
            <div className="actions">
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
          </>
        ) : null}
        <p className="muted">
          Die Bezeichnung setzt keine Frist. Der Zeitraum läuft weiter, bis du
          ihn selbst archivierst.
        </p>
        {mode === "manuell" ? (
          <>
            <h3>Personen ({people.length}/45)</h3>
            {people.map((person, index) => (
              <div className="name-row" key={index}>
                <div>
                  <label htmlFor={`first-${index}`}>Vorname {index + 1}</label>
                  <input
                    id={`first-${index}`}
                    autoComplete="off"
                    value={person.firstName}
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
                  <label htmlFor={`last-${index}`}>Nachname {index + 1}</label>
                  <input
                    id={`last-${index}`}
                    autoComplete="off"
                    value={person.lastName}
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
              disabled={people.length >= 45}
              onClick={() =>
                setPeople([...people, { firstName: "", lastName: "" }])
              }
            >
              Weitere Person
            </button>
          </>
        ) : (
          <div className="import-instructions">
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
                Als Excel (.xlsx) oder CSV speichern und hier auswählen. Nur ein
                Tabellenblatt; keine zusätzlichen Spalten oder Formeln.
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
            <label htmlFor="class-file">Klassenliste</label>
            <input
              id="class-file"
              type="file"
              accept=".xlsx,.csv,.txt"
              required
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            <p className="muted">
              CSV/TXT: zwei Spalten mit Semikolon, Komma oder Tabulator, UTF-8.
              Einspaltige Listen werden nicht übernommen.
            </p>
          </div>
        )}
        <button className="primary" type="submit" disabled={busy}>
          {busy ? "Klassenliste wird geprüft …" : "Klasse lokal anlegen"}
        </button>
      </form>
      <div className="demo-block">
        <h3>Erst ausprobieren</h3>
        <p>
          Eine Demo-Klasse mit 20 ausschließlich fiktiven Personen. Vorhandene
          Klassen bleiben erhalten.
        </p>
        <button type="button" onClick={onDemo}>
          Demo-Klasse mit fiktiven Namen anlegen
        </button>
      </div>
    </section>
  );
}
