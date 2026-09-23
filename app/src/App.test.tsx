// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";
import {
  LocalRepository,
  NOTEBOOK_STORAGE_KEY,
  type StoragePort,
} from "./infrastructure/local/localRepository";

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

function makeApp(storage = new MemoryStorage(), confirmDiscard = () => true) {
  const repository = new LocalRepository(storage, () => now);
  let nextId = 0;
  const props = {
    repository,
    createId: () => `id-${++nextId}`,
    today: () => "2026-09-23",
    now: () => now,
    confirmDiscard,
  };
  return { storage, repository, props, ...render(<App {...props} />) };
}

async function importTwoStudents(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Klassenname"), "8b");
  await user.type(
    screen.getByLabelText("Bewertungszeitraum"),
    "Offener Zeitraum",
  );
  const file = new File(["Fiktiv Ada\nFiktiv Bea"], "klasse.txt", {
    type: "text/plain",
  });
  Object.defineProperty(file, "text", {
    value: async () => "Fiktiv Ada\nFiktiv Bea",
  });
  await user.upload(screen.getByLabelText("Klassenliste"), file);
  expect(
    (screen.getByLabelText("Klassenliste") as HTMLInputElement).files?.[0],
  ).toBe(file);
  fireEvent.submit(screen.getByLabelText("Klassenliste").closest("form")!);
  await screen.findByRole("heading", { name: "8b" });
}

afterEach(cleanup);

describe("Kernoberfläche", () => {
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
    expect(screen.getByText("2 von 2 Personen erfasst")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Speichern$/ })).toBeNull();
    await user.click(screen.getByRole("button", { name: /Fiktiv Ada/ }));
    await user.click(screen.getByRole("button", { name: "Abwesend" }));
    expect(
      repository.load().classes[0].sessions[0].observations["id-2"],
    ).toEqual({ status: "abwesend" });
  });

  it("verhindert doppeltes Anlegen, zeigt Nummern nur bei zwei Stunden und weist die dritte ab", async () => {
    const user = userEvent.setup();
    const { repository } = makeApp();
    await importTwoStudents(user);
    const start = screen.getByRole("button", { name: "Stunde beginnen" });
    fireEvent.click(start);
    fireEvent.click(start);
    expect(repository.load().classes[0].sessions).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: /Zur Klasse/ }));
    expect(screen.queryByText(/1\. Stunde/)).toBeNull();
    await user.click(screen.getByRole("button", { name: "Stunde beginnen" }));
    expect(
      repository.load().classes[0].sessions.map((item) => item.lessonSequence),
    ).toEqual([1, 2]);
    await user.click(screen.getByRole("button", { name: /Zur Klasse/ }));
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
  });

  it("bearbeitet und archiviert einen Zeitraum ohne automatischen Endtermin", async () => {
    const user = userEvent.setup();
    const { repository } = makeApp();
    await importTwoStudents(user);
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
      expect(screen.getByText("2 von 2 Personen erfasst")).toBeTruthy(),
    );
  });
});
