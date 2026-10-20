// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExcelJS from "exceljs";
import { App } from "./App";
import {
  CLASS_DELETION_BACKUP_KEY,
  DAMAGED_NOTEBOOK_BACKUP_KEY,
  LEGACY_APP_KEY,
  LocalRepository,
  NOTEBOOK_STORAGE_KEY,
  type StoragePort,
} from "./infrastructure/local/localRepository";
import { EMPTY_NOTEBOOK } from "./infrastructure/local/schema";
import { reportClass } from "./test/reportClass";

const now = "2026-09-23T12:00:00.000Z";

class MemoryStorage implements StoragePort {
  readonly values = new Map<string, string>();
  writes = 0;
  fail = false;
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    if (this.fail) throw new Error("simulierter Speicherfehler");
    this.values.set(key, value);
    if (key === NOTEBOOK_STORAGE_KEY) this.writes += 1;
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
}

function makeApp(
  storage = new MemoryStorage(),
  confirmDiscard = () => true,
  download?: (
    filename: string,
    contents: string | Uint8Array<ArrayBuffer>,
    mime: string,
  ) => void,
) {
  const repository = new LocalRepository(storage, () => now);
  let nextId = 0;
  const props = {
    repository,
    createId: () => `id-${++nextId}`,
    today: () => "2026-09-23",
    now: () => now,
    confirmDiscard,
    download,
  };
  return { storage, repository, props, ...render(<App {...props} />) };
}

async function importTwoStudents(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    within(screen.getByRole("navigation", { name: "Hauptseiten" })).getByRole(
      "link",
      { name: "Klasse anlegen" },
    ),
  );
  await user.click(screen.getByRole("button", { name: "Klasse importieren" }));
  await user.type(screen.getByLabelText("Klassenname"), "8b");
  await user.click(screen.getByRole("button", { name: "Bezeichnung ändern" }));
  await user.clear(screen.getByLabelText("Bewertungszeitraum"));
  await user.type(
    screen.getByLabelText("Bewertungszeitraum"),
    "Offener Zeitraum",
  );
  const contents = "Vorname;Nachname\nFiktiv;Ada\nFiktiv;Bea";
  const file = new File([contents], "klasse.csv", { type: "text/csv" });
  Object.defineProperty(file, "text", { value: async () => contents });
  await user.upload(screen.getByLabelText("Klassenliste"), file);
  expect(
    (screen.getByLabelText("Klassenliste") as HTMLInputElement).files?.[0],
  ).toBe(file);
  fireEvent.submit(screen.getByLabelText("Klassenliste").closest("form")!);
  await screen.findByRole("heading", { name: "8b" });
}

afterEach(cleanup);
beforeEach(() => {
  window.scrollTo = () => {};
  window.history.replaceState(null, "", window.location.pathname);
});

it("öffnet nach Neuladen dieselbe ältere offene Stunde und die gewählte Person", async () => {
  const user = userEvent.setup();
  const storage = new MemoryStorage();
  const repository = new LocalRepository(storage, () => now);
  const group = reportClass();
  repository.save({
    ...EMPTY_NOTEBOOK,
    currentClassId: "c1",
    classes: [
      {
        ...group,
        sessions: group.sessions.map((s) =>
          s.id === "s1"
            ? {
                ...s,
                observations: { p1: { status: "bewertet", symbol: "++" } },
              }
            : s.id === "s3"
              ? { ...s, observations: {} }
              : s,
        ),
      },
    ],
  });
  const props = { repository, workspaceStorage: storage };
  const app = render(<App {...props} />);
  await user.click(screen.getByRole("button", { name: "← Zur Klasse" }));
  await user.click(
    within(
      document.querySelector('[data-session-id="s1"]') as HTMLElement,
    ).getByRole("button", { name: "Fortsetzen" }),
  );
  await user.click(
    document.querySelector(".student-list button") as HTMLButtonElement,
  );
  app.unmount();
  render(<App {...props} />);
  expect(
    document.querySelector(".assessment-header h2")?.textContent,
  ).toContain("23.09.2026 · 1. Stunde");
  expect(document.querySelector(".grading-panel h3")?.textContent).toBe(
    "Fiktiv Ada",
  );
});

it("überschreibt eine neuere Stunde nicht bei der Klassenauswahl aus einem alten UI-Stand", async () => {
  const user = userEvent.setup();
  const storage = new MemoryStorage();
  const repository = new LocalRepository(storage, () => now);
  repository.save({
    ...EMPTY_NOTEBOOK,
    currentClassId: "c1",
    classes: [{ ...reportClass(), sessions: [] }],
  });
  render(<App repository={repository} />);
  const newer = new LocalRepository(storage, () => now);
  newer.createSession("c1", { id: "neue-stunde", date: "2026-09-25" });
  newer.saveObservation("c1", "neue-stunde", "p1", {
    status: "bewertet",
    symbol: "+",
  });
  await user.selectOptions(screen.getByLabelText("Klasse auswählen"), "c1");
  expect(newer.load().classes[0].sessions[0]?.observations.p1).toEqual({
    status: "bewertet",
    symbol: "+",
  });
});

it("behandelt geerbte Objektschlüssel nicht als gespeicherte Beobachtung", () => {
  const storage = new MemoryStorage();
  const repository = new LocalRepository(storage, () => now);
  const group = reportClass();
  repository.save({
    ...EMPTY_NOTEBOOK,
    currentClassId: "c1",
    classes: [
      {
        ...group,
        students: [{ ...group.students[0], id: "toString" }],
        sessions: [
          { ...group.sessions[0], lessonSequence: 1, observations: {} },
        ],
      },
    ],
  });
  render(<App repository={repository} />);
  expect(
    document.querySelector(".student-list button small")?.textContent,
  ).toBe("Offen");
});

it("zeigt bei verweigertem Zugriff auf das Storage-Objekt eine Fehleransicht", () => {
  const descriptor = Object.getOwnPropertyDescriptor(window, "localStorage")!;
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get() {
      throw new DOMException("verweigert", "SecurityError");
    },
  });
  try {
    expect(() => render(<App />)).not.toThrow();
    expect(screen.getByRole("alert").textContent).toContain(
      "Lesen fehlgeschlagen",
    );
  } finally {
    Object.defineProperty(window, "localStorage", descriptor);
  }
});

it("weist eine zu große JSON-Sicherung vor dem Lesen ab", async () => {
  const user = userEvent.setup();
  const { repository } = makeApp();
  await user.click(screen.getByRole("link", { name: "Datensicherung" }));
  let read = false;
  const file = new File(["{}"], "gross.json", { type: "application/json" });
  Object.defineProperty(file, "size", { value: 5 * 1024 * 1024 + 1 });
  Object.defineProperty(file, "text", {
    value: async () => {
      read = true;
      return JSON.stringify(EMPTY_NOTEBOOK);
    },
  });
  await user.upload(screen.getByLabelText("JSON-Sicherung auswählen"), file);
  fireEvent.submit(
    screen.getByLabelText("JSON-Sicherung auswählen").closest("form")!,
  );
  expect(read).toBe(false);
  expect(screen.getByRole("alert").textContent).toContain("5 MiB");
  expect(repository.load()).toEqual(EMPTY_NOTEBOOK);
});

it("importiert eine ausgefüllte Excel-Klassenliste über den Dateiablauf", async () => {
  const user = userEvent.setup();
  const { repository } = makeApp();
  await user.click(
    within(screen.getByRole("navigation", { name: "Hauptseiten" })).getByRole(
      "link",
      { name: "Klasse anlegen" },
    ),
  );
  await user.click(screen.getByRole("button", { name: "Klasse importieren" }));
  await user.type(screen.getByLabelText("Klassenname"), "Fiktive Excel-Klasse");
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Klassenliste");
  sheet.addRow(["Vorname", "Nachname"]);
  sheet.addRow(["Fiktiv", "Ada"]);
  sheet.addRow(["Fiktiv", "Bea"]);
  const bytes = new Uint8Array(await workbook.xlsx.writeBuffer());
  const file = new File([bytes], "klasse.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  Object.defineProperty(file, "arrayBuffer", {
    value: async () => bytes.buffer,
  });
  await user.upload(screen.getByLabelText("Klassenliste"), file);
  expect(
    (screen.getByLabelText("Klassenliste") as HTMLInputElement).files?.[0],
  ).toBe(file);
  fireEvent.submit(screen.getByLabelText("Klassenliste").closest("form")!);
  await screen.findByRole("heading", { name: "Fiktive Excel-Klasse" });
  expect(
    repository.load().classes[0].students.map((person) => person.displayName),
  ).toEqual(["Fiktiv Ada", "Fiktiv Bea"]);
});

it("legt eine Klasse manuell mit zwei Namensfeldern und vorbelegtem Schuljahr an", async () => {
  const user = userEvent.setup();
  const { repository } = makeApp();
  await user.click(
    within(screen.getByRole("navigation", { name: "Hauptseiten" })).getByRole(
      "link",
      { name: "Klasse anlegen" },
    ),
  );
  await user.type(screen.getByLabelText("Klassenname"), "Fiktiv 9a");
  await user.type(screen.getByLabelText("Vorname 1"), "Fiktiv");
  await user.type(screen.getByLabelText("Nachname 1"), "Ada");
  await user.click(screen.getByRole("button", { name: "Weitere Person" }));
  await user.type(screen.getByLabelText("Vorname 2"), "Fiktiv");
  await user.type(screen.getByLabelText("Nachname 2"), "Bea");
  await user.click(
    screen.getByRole("button", { name: "Klasse lokal anlegen" }),
  );
  expect(repository.load().classes[0].periodLabel).toBe("Schuljahr 2026/27");
  expect(
    repository.load().classes[0].students.map((person) => person.displayName),
  ).toEqual(["Fiktiv Ada", "Fiktiv Bea"]);
  expect(screen.getByRole("status").textContent).toMatch(/lokal gespeichert/);
});

it("bestätigt den Abschluss erst nach erfolgreicher letzter Speicherung und führt zur Übersicht", async () => {
  const user = userEvent.setup();
  const { storage, repository } = makeApp();
  await importTwoStudents(user);
  await user.click(screen.getByRole("button", { name: "Stunde beginnen" }));
  await user.click(screen.getByRole("button", { name: "+" }));
  storage.fail = true;
  await user.click(screen.getByRole("button", { name: "Abwesend" }));
  expect(
    screen.queryByRole("heading", {
      name: "Alle Eingaben sind lokal gespeichert",
    }),
  ).toBeNull();
  expect(screen.getByText("1 von 2 Personen erfasst")).toBeTruthy();
  expect(
    Object.keys(repository.load().classes[0].sessions[0].observations),
  ).toHaveLength(1);
  storage.fail = false;
  await user.click(screen.getByRole("button", { name: "Abwesend" }));
  expect(
    screen.getByRole("heading", {
      name: "Alle Eingaben sind lokal gespeichert",
    }),
  ).toBeTruthy();
  expect(screen.queryByRole("button", { name: "+" })).toBeNull();
  expect(screen.queryByText("Stand vor dieser Stunde:")).toBeNull();
  expect(
    screen.getByRole("button", { name: "Eingaben prüfen oder korrigieren" }),
  ).toBeTruthy();
  await user.click(
    screen.getByRole("button", { name: "Zur Klassenübersicht" }),
  );
  expect(
    screen.getByRole("heading", { name: "Unterrichtsstunden" }),
  ).toBeTruthy();
  expect(screen.getByText(/2 von 2 erfasst · vollständig/)).toBeTruthy();
});

it("erklärt die Bedeutung der Symbole und zeigt bei alter Stunde den Stand davor", async () => {
  const user = userEvent.setup();
  const { repository, unmount } = makeApp();
  repository.save({
    ...EMPTY_NOTEBOOK,
    currentClassId: "c1",
    classes: [
      { ...reportClass(), sessions: reportClass().sessions.slice(0, 2) },
    ],
  });
  unmount();
  render(<App repository={repository} />);
  const first = screen.getByText("23.09.2026 · 1. Stunde").closest("li")!;
  await user.click(within(first).getByRole("button", { name: "Bearbeiten" }));
  expect(screen.getByText(/Stand vor dieser Stunde/).textContent).toContain(
    "2,00",
  );
  const positive = screen.getByRole("button", { name: "++" });
  expect(positive.textContent).toMatch(/Deutlich besser.*1,50/);
  expect(positive.className).toContain("positive-strong");
  expect(screen.getByRole("button", { name: "--" }).className).toContain(
    "negative-strong",
  );
  expect(
    Array.from(
      document.querySelectorAll(".rating-grid button > strong"),
      (element) => element.textContent,
    ),
  ).toEqual(["--", "-", "0", "+", "++"]);
  expect(screen.queryByText(/^Symbole:/)).toBeNull();
  await user.click(
    screen.getByRole("link", { name: "Bewertung und Puffer erklärt" }),
  );
  expect(
    screen.getByRole("heading", {
      name: "Die Mitarbeit über die gesamte Stunde",
    }),
  ).toBeTruthy();
  expect(screen.getByText(/1,25 mit/)).toBeTruthy();
  expect(
    Array.from(
      document.querySelectorAll(".rating-tile > strong"),
      (element) => element.textContent,
    ),
  ).toEqual(["--", "-", "0", "+", "++"]);
  await user.click(
    screen.getByRole("button", { name: "← Zur laufenden Stunde" }),
  );
  expect(screen.getByRole("button", { name: "++" })).toBeTruthy();
});

describe("Kernoberfläche", () => {
  it("bleibt nach abgelehntem Klassenwechsel bei einer nicht gespeicherten Eingabe", async () => {
    const user = userEvent.setup();
    const storage = new MemoryStorage();
    const repository = new LocalRepository(storage, () => now);
    repository.save({
      ...EMPTY_NOTEBOOK,
      currentClassId: "c1",
      classes: [
        reportClass(),
        { ...reportClass(), id: "c2", name: "Fiktive zweite Klasse" },
      ],
    });
    let question = "";
    render(
      <App
        repository={repository}
        confirmDiscard={(message) => {
          question = message;
          return false;
        }}
      />,
    );
    const before = repository.readRawNotebook();
    storage.fail = true;
    await user.click(screen.getByRole("button", { name: "Abwesend" }));
    expect(screen.getByRole("alert").textContent).toMatch(/nicht gespeichert/);
    await user.selectOptions(screen.getByLabelText("Klasse auswählen"), "c2");
    expect(question).toMatch(/nicht gespeichert/);
    expect(
      (screen.getByLabelText("Klasse auswählen") as HTMLSelectElement).value,
    ).toBe("c1");
    expect(repository.readRawNotebook()).toBe(before);
    expect(
      screen.getByRole("button", { name: "Eingabe erneut speichern" }),
    ).toBeTruthy();
  });

  it("importiert eine Klasse, speichert jede Auswahl sofort und setzt eine unvollständige Stunde nach Neuladen fort", async () => {
    const user = userEvent.setup();
    const { storage, repository, props, unmount } = makeApp();
    await importTwoStudents(user);
    expect(repository.load().classes[0].students).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Stunde beginnen" }));
    expect(screen.getByText("0 von 2 Personen erfasst")).toBeTruthy();
    const before = storage.writes;
    await user.click(screen.getByRole("button", { name: "++" }));
    expect(storage.writes).toBe(before + 1);
    expect(
      repository.load().classes[0].sessions[0].observations["id-2"],
    ).toEqual({ status: "bewertet", symbol: "++" });
    expect(screen.getByRole("heading", { name: "Fiktiv Bea" })).toBeTruthy();
    unmount();
    render(<App {...props} />);
    expect(screen.getByRole("heading", { name: "Fiktiv Bea" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Nicht beobachtet" }));
    expect(
      repository.load().classes[0].sessions[0].observations["id-3"],
    ).toEqual({ status: "nicht_beobachtet" });
    expect(
      screen.getByRole("heading", {
        name: "Alle Eingaben sind lokal gespeichert",
      }),
    ).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: "Eingaben prüfen oder korrigieren" }),
    );
    expect(screen.queryByRole("button", { name: /^Speichern$/ })).toBeNull();
    await user.click(screen.getByRole("button", { name: /Fiktiv Ada/ }));
    await user.click(screen.getByRole("button", { name: "Abwesend" }));
    expect(
      repository.load().classes[0].sessions[0].observations["id-2"],
    ).toEqual({ status: "abwesend" });
  });

  it("verhindert doppeltes Anlegen, zeigt Nummern durchgehend und weist die dritte Stunde ab", async () => {
    const user = userEvent.setup();
    const { repository } = makeApp();
    await importTwoStudents(user);
    const start = screen.getByRole("button", { name: "Stunde beginnen" });
    fireEvent.click(start);
    fireEvent.click(start);
    expect(repository.load().classes[0].sessions).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: /^← Zur Klasse$/ }));
    expect(screen.getByText(/1\. Stunde/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Stunde beginnen" }));
    expect(
      repository.load().classes[0].sessions.map((item) => item.lessonSequence),
    ).toEqual([1, 2]);
    await user.click(screen.getByRole("button", { name: /^← Zur Klasse$/ }));
    expect(screen.getByText(/1\. Stunde/)).toBeTruthy();
    expect(screen.getByText(/2\. Stunde/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Stunde beginnen" }));
    expect(screen.getByRole("alert").textContent).toMatch(/höchstens zwei/);
    expect(repository.load().classes[0].sessions).toHaveLength(2);
  });

  it("überträgt einen versehentlichen Doppelklick auf ein Symbol nicht auf die nächste Person", async () => {
    const user = userEvent.setup();
    const { repository } = makeApp();
    await importTwoStudents(user);
    await user.click(screen.getByRole("button", { name: "Stunde beginnen" }));
    await user.dblClick(screen.getByRole("button", { name: "++" }));
    expect(repository.load().classes[0].sessions[0].observations).toEqual({
      "id-2": { status: "bewertet", symbol: "++" },
    });
  });

  it("verwirft eine laufende Stunde nur nach Bestätigung", async () => {
    const user = userEvent.setup();
    let allowed = false;
    const { repository } = makeApp(undefined, () => allowed);
    await importTwoStudents(user);
    await user.click(screen.getByRole("button", { name: "Stunde beginnen" }));
    await user.click(screen.getByRole("button", { name: "+" }));
    await user.click(
      screen.getByRole("button", { name: "Laufende Stunde verwerfen" }),
    );
    expect(repository.load().classes[0].sessions).toHaveLength(1);
    allowed = true;
    await user.click(
      screen.getByRole("button", { name: "Laufende Stunde verwerfen" }),
    );
    expect(repository.load().classes[0].sessions).toHaveLength(0);
  });

  it("zeigt Speicherfehler an und belässt die Oberfläche beim letzten gespeicherten Stand", async () => {
    const user = userEvent.setup();
    const { storage, repository } = makeApp();
    await importTwoStudents(user);
    await user.click(screen.getByRole("button", { name: "Stunde beginnen" }));
    storage.fail = true;
    await user.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByRole("alert").textContent).toMatch(
      /Lokales Speichern fehlgeschlagen/,
    );
    expect(screen.getByText("0 von 2 Personen erfasst")).toBeTruthy();
    expect(repository.load().classes[0].sessions[0].observations).toEqual({});
    expect(screen.getByRole("alert").textContent).toContain("Fiktiv Ada");
    await user.click(document.querySelectorAll(".student-list button")[1]);
    storage.fail = false;
    await user.click(
      screen.getByRole("button", { name: "Eingabe erneut speichern" }),
    );
    expect(repository.load().classes[0].sessions[0].observations).toEqual({
      "id-2": { status: "bewertet", symbol: "+" },
    });
    expect(document.querySelector(".grading-panel h3")?.textContent).toBe(
      "Fiktiv Bea",
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("bearbeitet und archiviert einen Zeitraum ohne automatischen Endtermin", async () => {
    const user = userEvent.setup();
    const { repository } = makeApp();
    await importTwoStudents(user);
    await user.click(screen.getByRole("button", { name: "Klasse bearbeiten" }));
    await user.click(
      screen.getByRole("button", { name: "Namen und Zeitraum bearbeiten" }),
    );
    await user.clear(
      screen.getByLabelText("Bewertungszeitraum", {
        selector: "#detail-period",
      }),
    );
    await user.type(
      screen.getByLabelText("Bewertungszeitraum", {
        selector: "#detail-period",
      }),
      "Bis zur Archivierung",
    );
    await user.click(
      screen.getByRole("button", { name: "Änderungen speichern" }),
    );
    expect(repository.load().classes[0].periodLabel).toBe(
      "Bis zur Archivierung",
    );
    await user.click(
      screen.getByRole("button", { name: "Zeitraum archivieren" }),
    );
    expect(repository.load().classes[0].archived).toBe(true);
    expect(
      screen.queryByRole("button", { name: "Stunde beginnen" }),
    ).toBeNull();
  });

  it("lässt die vollständige Erfassung per Tastatur zu", async () => {
    const user = userEvent.setup();
    makeApp();
    expect(
      screen
        .getByRole("link", { name: "Zum Inhalt springen" })
        .getAttribute("href"),
    ).toBe("#main-content");
    await importTwoStudents(user);
    const start = screen.getByRole("button", { name: "Stunde beginnen" });
    for (
      let index = 0;
      index < 40 && document.activeElement !== start;
      index += 1
    )
      await user.tab();
    expect(document.activeElement).toBe(start);
    await user.keyboard("{Enter}");
    const grade = screen.getByRole("button", { name: "++" });
    for (
      let index = 0;
      index < 40 && document.activeElement !== grade;
      index += 1
    )
      await user.tab();
    expect(document.activeElement).toBe(grade);
    await user.keyboard("{Enter}");
    const absent = screen.getByRole("button", { name: "Abwesend" });
    for (
      let index = 0;
      index < 40 && document.activeElement !== absent;
      index += 1
    )
      await user.tab();
    expect(document.activeElement).toBe(absent);
    await user.keyboard("{Enter}");
    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          name: "Alle Eingaben sind lokal gespeichert",
        }),
      ).toBeTruthy(),
    );
  });

  it("zeigt Tabelle und Verlauf aus dem Fachkern und berechnet nach Korrektur einer frühen Stunde alles neu", async () => {
    const user = userEvent.setup();
    const repository = new LocalRepository(new MemoryStorage(), () => now);
    const classRecord = {
      ...reportClass(),
      sessions: reportClass().sessions.slice(0, 2),
    };
    repository.save({
      ...EMPTY_NOTEBOOK,
      currentClassId: "c1",
      classes: [classRecord],
    });
    const downloads: string[] = [];
    render(
      <App
        repository={repository}
        download={(_name, contents) => downloads.push(String(contents))}
        confirmDiscard={() => true}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Tabelle" }));
    await user.click(screen.getByRole("button", { name: "Mit Notenverlauf" }));
    const row = screen.getByRole("row", { name: /Fiktiv Ada/ });
    expect(
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual([
      "2,00",
      "Bewertet: ++Stand: 1,50",
      "Bewertet: -Stand: 1,75",
      "1,75",
      "0/3",
    ]);
    expect(screen.getByRole("row", { name: /Fiktiv Bea/ }).textContent).toMatch(
      /Abwesend.*Nicht beobachtet/,
    );

    await user.click(screen.getByRole("button", { name: "Verlauf" }));
    expect(
      screen.getByRole("img", { name: /Notenverlauf von Fiktiv Ada/ }),
    ).toBeTruthy();
    await user.selectOptions(screen.getByLabelText("Person"), "p2");
    expect(screen.getByRole("cell", { name: "Nicht beobachtet" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Stunden" }));
    const first = screen.getByText("23.09.2026 · 1. Stunde").closest("li")!;
    await user.click(within(first).getByRole("button", { name: "Bearbeiten" }));
    await user.click(screen.getByRole("button", { name: /Fiktiv Ada/ }));
    await user.click(screen.getByRole("button", { name: "--" }));
    await user.click(screen.getByRole("button", { name: /^← Zur Klasse$/ }));
    await user.click(screen.getByRole("button", { name: "Tabelle" }));
    await user.click(screen.getByRole("button", { name: "Mit Notenverlauf" }));
    expect(screen.getByRole("row", { name: /Fiktiv Ada/ }).textContent).toMatch(
      /Stand: 2,50.*Stand: 2,75.*2,75/,
    );
    await user.click(
      screen.getByRole("button", { name: "Klasse als CSV exportieren" }),
    );
    expect(downloads[0]).toContain('"Aktuell";"";"";"";"";"2,75";"0"');

    await user.click(screen.getByRole("button", { name: "Stunden" }));
    const firstAgain = screen
      .getByText("23.09.2026 · 1. Stunde")
      .closest("li")!;
    await user.click(
      within(firstAgain).getByRole("button", { name: "Bearbeiten" }),
    );
    await user.click(screen.getByRole("button", { name: /Fiktiv Ada/ }));
    await user.click(screen.getByRole("button", { name: "Eintrag entfernen" }));
    expect(
      repository
        .load()
        .classes[0].sessions.find((session) => session.id === "s1")
        ?.observations.p1,
    ).toBeUndefined();
    await user.click(screen.getByRole("button", { name: /^← Zur Klasse$/ }));
    await user.click(screen.getByRole("button", { name: "Tabelle" }));
    await user.click(screen.getByRole("button", { name: "Mit Notenverlauf" }));
    expect(screen.getByRole("row", { name: /Fiktiv Ada/ }).textContent).toMatch(
      /Offen.*Stand: 2,25.*2,25/,
    );
  });

  it("tauscht zwei Stunden atomar und normalisiert nach Löschung die verbleibende Nummer", async () => {
    const user = userEvent.setup();
    const repository = new LocalRepository(new MemoryStorage(), () => now);
    const classRecord = {
      ...reportClass(),
      sessions: reportClass().sessions.slice(0, 2),
    };
    repository.save({
      ...EMPTY_NOTEBOOK,
      currentClassId: "c1",
      classes: [classRecord],
    });
    render(<App repository={repository} confirmDiscard={() => true} />);
    expect(
      Array.from(document.querySelectorAll(".session-list li"), (element) =>
        element.getAttribute("data-session-id"),
      ),
    ).toEqual(["s1", "s2"]);
    expect(
      screen.getByText("23.09.2026 · 1. Stunde").closest("li")?.textContent,
    ).toContain("1 × ++ · 1 × AW");
    expect(
      screen.getByText("23.09.2026 · 1. Stunde").closest("li")?.textContent,
    ).toContain("Fiktiv Ada: ++");
    await user.click(
      screen.getByRole("button", { name: "Reihenfolge tauschen" }),
    );
    expect(
      repository
        .load()
        .classes[0].sessions.map((session) => session.lessonSequence),
    ).toEqual([1, 2]);
    expect(
      repository
        .load()
        .classes[0].sessions.find((session) => session.id === "s1")
        ?.lessonSequence,
    ).toBe(2);
    expect(
      Array.from(document.querySelectorAll(".session-list li"), (element) =>
        element.getAttribute("data-session-id"),
      ),
    ).toEqual(["s2", "s1"]);
    expect(
      screen.getByText("23.09.2026 · 1. Stunde").closest("li")?.textContent,
    ).toContain("1 × - · 1 × NB");
    expect(
      screen.getByText("23.09.2026 · 1. Stunde").closest("li")?.textContent,
    ).toContain("Fiktiv Ada: -");
    expect(screen.getByText(/Tausch gespeichert/)).toBeTruthy();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Reihenfolge tauschen" }),
    );
    expect(
      repository
        .load()
        .classes[0].sessions.find((session) => session.id === "s1")
        ?.observations,
    ).toEqual(
      classRecord.sessions.find((session) => session.id === "s1")?.observations,
    );
    await user.click(screen.getByRole("button", { name: "Tabelle" }));
    await user.click(screen.getByRole("button", { name: "Mit Notenverlauf" }));
    expect(screen.getByRole("row", { name: /Fiktiv Ada/ }).textContent).toMatch(
      /Stand: 2,25.*Stand: 1,75/,
    );
    await user.click(screen.getByRole("button", { name: "Stunden" }));
    const second = screen.getByText("23.09.2026 · 2. Stunde").closest("li")!;
    await user.click(
      within(second).getByRole("button", { name: "Stunde löschen" }),
    );
    expect(repository.load().classes[0].sessions).toHaveLength(1);
    expect(repository.load().classes[0].sessions[0].lessonSequence).toBe(1);
    expect(screen.getByText(/1\. Stunde/)).toBeTruthy();
  });

  it("exportiert JSON, warnt vor Ersetzen, weist defekte Dateien ab und bietet den Rückfall an", async () => {
    const user = userEvent.setup();
    let allowed = false;
    const downloads: string[] = [];
    const { repository } = makeApp(
      undefined,
      () => allowed,
      (_name, contents) => downloads.push(String(contents)),
    );
    await importTwoStudents(user);
    await user.click(screen.getByRole("link", { name: "Datensicherung" }));
    await user.click(
      screen.getByRole("button", {
        name: "Vollständige JSON-Sicherung herunterladen",
      }),
    );
    expect(JSON.parse(downloads[0]).classes).toHaveLength(1);
    const upload = async (raw: string) => {
      const file = new File([raw], "sicherung.json", {
        type: "application/json",
      });
      Object.defineProperty(file, "text", { value: async () => raw });
      await user.upload(
        screen.getByLabelText("JSON-Sicherung auswählen"),
        file,
      );
      fireEvent.submit(
        screen.getByLabelText("JSON-Sicherung auswählen").closest("form")!,
      );
    };
    await upload("kaputt");
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toMatch(/gültiges JSON/),
    );
    expect(repository.load().classes).toHaveLength(1);
    await upload(JSON.stringify(EMPTY_NOTEBOOK));
    expect(repository.load().classes).toHaveLength(1);
    allowed = true;
    await upload(JSON.stringify(EMPTY_NOTEBOOK));
    await waitFor(() => expect(repository.load().classes).toHaveLength(0));
    await user.click(
      screen.getByRole("button", {
        name: "Stand vor letztem Import wiederherstellen",
      }),
    );
    expect(repository.load().classes).toHaveLength(1);
  });

  it("legt eine feste Demo-Klasse an und korrigiert einen Personennamen ohne Datenverlust", async () => {
    const user = userEvent.setup();
    const { repository } = makeApp();
    await user.click(
      screen.getByRole("button", {
        name: "Demo-Klasse mit fiktiven Namen anlegen",
      }),
    );
    expect(
      repository
        .load()
        .classes[0].students.map((student) => student.displayName),
    ).toHaveLength(20);
    await user.click(screen.getByRole("button", { name: "Personen" }));
    await user.click(
      screen.getByRole("button", { name: "Namen von Fiktiv Ada bearbeiten" }),
    );
    expect(document.activeElement).toBe(
      screen.getByLabelText("Neuer Personenname"),
    );
    await user.clear(screen.getByLabelText("Neuer Personenname"));
    await user.type(screen.getByLabelText("Neuer Personenname"), "Fiktiv Alma");
    await user.click(screen.getByRole("button", { name: "Namen speichern" }));
    expect(repository.load().classes[0].students[0]).toMatchObject({
      id: "id-2",
      displayName: "Fiktiv Alma",
    });
  });

  it("löscht eine Klasse nur nach Bestätigung und stellt den vorherigen Stand wieder her", async () => {
    const user = userEvent.setup();
    let allowed = false;
    const { repository, storage } = makeApp(undefined, () => allowed);
    await importTwoStudents(user);
    await user.click(screen.getByRole("button", { name: "Klasse bearbeiten" }));
    await user.click(screen.getByRole("button", { name: "Klasse löschen" }));
    expect(repository.load().classes).toHaveLength(1);
    expect(storage.getItem(CLASS_DELETION_BACKUP_KEY)).toBeNull();
    allowed = true;
    await user.click(screen.getByRole("button", { name: "Klasse löschen" }));
    expect(repository.load().classes).toHaveLength(0);
    expect(storage.getItem(CLASS_DELETION_BACKUP_KEY)).not.toBeNull();
    await user.click(screen.getByRole("link", { name: "Datensicherung" }));
    await user.click(
      screen.getByRole("button", {
        name: "Stand vor letzter Klassenlöschung wiederherstellen",
      }),
    );
    expect(repository.load().classes).toHaveLength(1);
  });

  it("rettet einen unlesbaren Stand nur mit valider JSON-Datei und sichert die Rohdaten", async () => {
    const user = userEvent.setup();
    const storage = new MemoryStorage();
    storage.setItem(NOTEBOOK_STORAGE_KEY, "beschädigt");
    let allowed = false;
    const downloads: string[] = [];
    const { repository } = makeApp(
      storage,
      () => allowed,
      (_name, contents) => downloads.push(String(contents)),
    );
    expect(screen.getByRole("alert").textContent).toMatch(/gültiges JSON/);
    await user.click(
      screen.getByRole("button", {
        name: "Vorhandene Notebook-Rohdaten herunterladen",
      }),
    );
    expect(downloads).toEqual(["beschädigt"]);
    const upload = async (raw: string) => {
      const file = new File([raw], "sicherung.json", {
        type: "application/json",
      });
      Object.defineProperty(file, "text", { value: async () => raw });
      await user.upload(
        screen.getByLabelText("JSON-Sicherung zur Wiederherstellung"),
        file,
      );
      fireEvent.submit(
        screen
          .getByLabelText("JSON-Sicherung zur Wiederherstellung")
          .closest("form")!,
      );
    };
    await upload("kaputt");
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toMatch(/gültiges JSON/),
    );
    expect(storage.getItem(NOTEBOOK_STORAGE_KEY)).toBe("beschädigt");
    await upload(JSON.stringify(EMPTY_NOTEBOOK));
    expect(storage.getItem(NOTEBOOK_STORAGE_KEY)).toBe("beschädigt");
    allowed = true;
    await upload(JSON.stringify(EMPTY_NOTEBOOK));
    await waitFor(() => expect(repository.load()).toEqual(EMPTY_NOTEBOOK));
    expect(storage.getItem(DAMAGED_NOTEBOOK_BACKUP_KEY)).toBe("beschädigt");
  });

  it("stellt eine Legacy-Migrationssicherung als Datei und Rückfall im selben Browser bereit", async () => {
    const user = userEvent.setup();
    const storage = new MemoryStorage();
    const legacyRaw = JSON.stringify({
      currentClassId: "c1",
      classes: [
        {
          id: "c1",
          name: "Fiktive Altklasse",
          students: [{ id: "p1", name: "Fiktiv Ada", startGrade: 2 }],
          sessions: [],
        },
      ],
    });
    storage.setItem(LEGACY_APP_KEY, legacyRaw);
    const downloads: string[] = [];
    makeApp(
      storage,
      () => true,
      (_name, contents) => downloads.push(String(contents)),
    );
    await user.click(screen.getByRole("link", { name: "Datensicherung" }));
    await user.click(
      screen.getByRole("button", {
        name: "Legacy-Migrationssicherung herunterladen",
      }),
    );
    expect(JSON.parse(downloads[0]).rawApp).toBe(legacyRaw);
    storage.removeItem(LEGACY_APP_KEY);
    await user.click(
      screen.getByRole("button", { name: "Legacy-Schlüssel wiederherstellen" }),
    );
    expect(storage.getItem(LEGACY_APP_KEY)).toBe(legacyRaw);
  });
});

it("täuscht bei einem fehlgeschlagenen Stundentausch keine geänderte Reihenfolge vor", async () => {
  const user = userEvent.setup();
  const storage = new MemoryStorage();
  const repository = new LocalRepository(storage, () => now);
  repository.save({
    ...EMPTY_NOTEBOOK,
    currentClassId: "c1",
    classes: [
      { ...reportClass(), sessions: reportClass().sessions.slice(0, 2) },
    ],
  });
  render(<App repository={repository} />);
  storage.fail = true;
  await user.click(
    screen.getByRole("button", { name: "Reihenfolge tauschen" }),
  );
  expect(screen.getByRole("alert").textContent).toContain(
    "Lokales Speichern fehlgeschlagen",
  );
  expect(screen.queryByText(/Tausch gespeichert/)).toBeNull();
  expect(
    screen.getByText("23.09.2026 · 1. Stunde").closest("li")?.textContent,
  ).toContain("1 × ++ · 1 × AW");
  expect(
    repository.load().classes[0].sessions.find((session) => session.id === "s1")
      ?.lessonSequence,
  ).toBe(1);
  storage.fail = false;
  await user.click(
    screen.getByRole("button", { name: "Reihenfolge tauschen" }),
  );
  expect(screen.getByText(/Tausch gespeichert/)).toBeTruthy();
  expect(
    screen.getByText("23.09.2026 · 1. Stunde").closest("li")?.textContent,
  ).toContain("1 × - · 1 × NB");
});

it("erreicht vom Stundeninhalt aus das erste Symbol vor der ergänzenden Personenliste", async () => {
  const user = userEvent.setup();
  makeApp();
  await importTwoStudents(user);
  await user.click(screen.getByRole("button", { name: "Stunde beginnen" }));
  document.getElementById("main-content")!.focus();
  await user.tab();
  expect(document.activeElement?.textContent).toBe("← Zur Klasse");
  await user.tab();
  expect(document.activeElement?.getAttribute("aria-label")).toBe("--");
});

it("findet ältere Stunden außerhalb der sichtbaren Liste und bearbeitet sie mit vollständigem Bezug", async () => {
  const user = userEvent.setup();
  const storage = new MemoryStorage();
  const repository = new LocalRepository(storage, () => now);
  const source = reportClass();
  const sessions = Array.from({ length: 24 }, (_, index) => ({
    ...source.sessions[0],
    id: `s${index + 1}`,
    date: `2026-09-${String(index + 1).padStart(2, "0")}`,
    lessonSequence: 1,
  }));
  repository.save({
    ...EMPTY_NOTEBOOK,
    currentClassId: "c1",
    classes: [{ ...source, sessions }],
  });
  render(<App repository={repository} />);
  expect(document.querySelectorAll(".session-list li")).toHaveLength(20);
  await user.click(screen.getByRole("button", { name: "Ältere Stunden" }));
  expect(document.querySelectorAll(".session-list li")).toHaveLength(4);
  fireEvent.change(screen.getByLabelText("Stunden an einem Datum suchen"), {
    target: { value: "2026-09-01" },
  });
  expect(document.querySelectorAll(".session-list li")).toHaveLength(1);
  await user.click(screen.getByRole("button", { name: "Bearbeiten" }));
  expect(screen.getByText(/Stand vor dieser Stunde/).textContent).toContain(
    "2,00",
  );
  await user.click(screen.getByRole("button", { name: "--" }));
  expect(repository.load().classes[0].sessions).toHaveLength(24);
  expect(repository.load().classes[0].sessions[0].observations.p1).toEqual({
    status: "bewertet",
    symbol: "--",
  });
});

it("erklärt bereits beim Start die Rückkehr von einer nicht mehr vorhandenen Stunde", () => {
  const storage = new MemoryStorage();
  const repository = new LocalRepository(storage, () => now);
  repository.save({
    ...EMPTY_NOTEBOOK,
    currentClassId: "c1",
    classes: [reportClass()],
  });
  storage.setItem(
    "gradeflow-workspace-v1",
    JSON.stringify({
      page: "klasse",
      view: "tabelle",
      classId: "c1",
      sessionId: "entfernte-stunde",
      studentId: "p1",
      historyStudentId: null,
    }),
  );
  render(<App repository={repository} workspaceStorage={storage} />);
  expect(screen.getByRole("status").textContent).toContain(
    "nicht mehr verfügbar",
  );
  expect(screen.getByRole("button", { name: "Stunde beginnen" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "++" })).toBeNull();
});

it("erhält eine fehlgeschlagene Bewertung über Rückweg, Hauptnavigation und Hilfe", async () => {
  const user = userEvent.setup();
  const { storage, repository } = makeApp();
  await importTwoStudents(user);
  await user.click(screen.getByRole("button", { name: "Stunde beginnen" }));
  storage.fail = true;
  await user.click(screen.getByRole("button", { name: "+" }));
  await user.click(screen.getByRole("button", { name: "← Zur Klasse" }));
  await user.click(screen.getByRole("link", { name: "Datensicherung" }));
  expect(screen.getByRole("alert").textContent).toContain("Fiktiv Ada");
  await user.click(
    screen.getByRole("button", { name: "Zur nicht gespeicherten Eingabe" }),
  );
  await user.click(document.querySelectorAll(".student-list button")[1]);
  storage.fail = false;
  await user.click(
    screen.getByRole("button", { name: "Eingabe erneut speichern" }),
  );
  expect(repository.load().classes[0].sessions[0].observations).toEqual({
    "id-2": { status: "bewertet", symbol: "+" },
  });
  expect(screen.getByRole("heading", { name: "Fiktiv Bea" })).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
});

it("kann die ursprüngliche Eingabe von einer anderen Seite wiederholen und warnt vor Neuladen", async () => {
  const user = userEvent.setup();
  const { storage, repository } = makeApp();
  await importTwoStudents(user);
  await user.click(screen.getByRole("button", { name: "Stunde beginnen" }));
  storage.fail = true;
  await user.click(screen.getByRole("button", { name: "Abwesend" }));
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
  await user.click(screen.getByRole("link", { name: "Datensicherung" }));
  storage.fail = false;
  await user.click(
    screen.getByRole("button", { name: "Eingabe erneut speichern" }),
  );
  expect(repository.load().classes[0].sessions[0].observations).toEqual({
    "id-2": { status: "abwesend" },
  });
  expect(screen.getByRole("heading", { name: "Datensicherung" })).toBeTruthy();
  const after = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(after);
  expect(after.defaultPrevented).toBe(false);
});

it("schützt ungespeicherte Klassendetails vor Navigation und Neuladen", async () => {
  const user = userEvent.setup();
  let allowed = false;
  let questions = 0;
  const { repository } = makeApp(undefined, () => {
    questions += 1;
    return allowed;
  });
  await user.click(
    screen.getByRole("button", {
      name: "Demo-Klasse mit fiktiven Namen anlegen",
    }),
  );
  await user.click(screen.getByRole("button", { name: "Klasse bearbeiten" }));
  await user.click(
    screen.getByRole("button", { name: "Namen und Zeitraum bearbeiten" }),
  );
  await user.clear(screen.getByLabelText("Klassenname"));
  await user.type(screen.getByLabelText("Klassenname"), "Fiktive Änderung");
  await user.click(screen.getByRole("link", { name: "Datensicherung" }));
  expect((screen.getByLabelText("Klassenname") as HTMLInputElement).value).toBe(
    "Fiktive Änderung",
  );
  expect(questions).toBe(1);
  const before = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(before);
  expect(before.defaultPrevented).toBe(true);
  allowed = true;
  await user.click(screen.getByRole("link", { name: "Datensicherung" }));
  expect(screen.getByRole("heading", { name: "Datensicherung" })).toBeTruthy();
  expect(questions).toBe(2);
  expect(repository.load().classes[0].name).not.toBe("Fiktive Änderung");
});

it("behält einen bearbeiteten Personennamen bei abgelehntem Personen- und Ansichtswechsel", async () => {
  const user = userEvent.setup();
  makeApp(undefined, () => false);
  await user.click(
    screen.getByRole("button", {
      name: "Demo-Klasse mit fiktiven Namen anlegen",
    }),
  );
  await user.click(screen.getByRole("button", { name: "Personen" }));
  await user.click(
    screen.getByRole("button", { name: "Namen von Fiktiv Ada bearbeiten" }),
  );
  await user.clear(screen.getByLabelText("Neuer Personenname"));
  await user.type(
    screen.getByLabelText("Neuer Personenname"),
    "Fiktive Eingabe",
  );
  await user.click(
    screen.getByRole("button", { name: "Namen von Fiktiv Bea bearbeiten" }),
  );
  expect(
    (screen.getByLabelText("Neuer Personenname") as HTMLInputElement).value,
  ).toBe("Fiktive Eingabe");
  await user.click(screen.getByRole("button", { name: "Tabelle" }));
  expect(screen.getByLabelText("Neuer Personenname")).toBeTruthy();
});

it("erhält Tabellenmodus und Größe nach Ansichtswechsel und erneutem Öffnen", async () => {
  const user = userEvent.setup();
  const storage = new MemoryStorage();
  const source = reportClass();
  storage.setItem(
    NOTEBOOK_STORAGE_KEY,
    JSON.stringify({
      ...EMPTY_NOTEBOOK,
      currentClassId: source.id,
      classes: [source],
    }),
  );
  storage.setItem("gradeflow-tutorial-v2", "gesehen");
  const repository = new LocalRepository(storage, () => now);
  const props = { repository, workspaceStorage: storage };
  const first = render(<App {...props} />);
  await user.click(screen.getByRole("link", { name: "Meine Klassen" }));
  await user.click(screen.getByRole("button", { name: "Tabelle" }));
  await user.click(screen.getByRole("button", { name: "Mit Notenverlauf" }));
  await user.selectOptions(screen.getByLabelText("Tabellengröße"), "large");
  await user.selectOptions(screen.getByLabelText("Stunden pro Ansicht"), "20");
  await user.click(screen.getByRole("button", { name: "Verlauf" }));
  await user.click(screen.getByRole("button", { name: "Tabelle" }));
  expect(
    screen
      .getByRole("button", { name: "Mit Notenverlauf" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  expect(
    (screen.getByLabelText("Tabellengröße") as HTMLSelectElement).value,
  ).toBe("large");
  first.unmount();
  render(<App {...props} />);
  expect(
    (screen.getByLabelText("Stunden pro Ansicht") as HTMLSelectElement).value,
  ).toBe("20");
  expect(
    screen
      .getByRole("region", { name: "Stundentabelle" })
      .classList.contains("table-size-large"),
  ).toBe(true);
  const link = screen.getByRole("link", { name: "Datensicherung" });
  expect(link.getAttribute("href")).toContain("seite=sicherung");
  await user.click(link);
  expect(screen.getByRole("heading", { name: "Datensicherung" })).toBeTruthy();
});
