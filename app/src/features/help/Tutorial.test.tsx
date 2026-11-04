// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../../App";
import { Tutorial, TUTORIAL_KEY } from "./Tutorial";
import { NOTEBOOK_STORAGE_KEY } from "../../infrastructure/local/localRepository";

beforeEach(() => {
  window.scrollTo = () => {};
  Element.prototype.scrollIntoView = () => {};
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function setup() {
  const values = new Map<string, string>([
    [NOTEBOOK_STORAGE_KEY, "Eigener unveränderter Datenbestand"],
  ]);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
  const download = vi.fn();
  const props = {
    storage,
    request: 0,
    onStorageError: vi.fn(),
    children: (
      <main id="main-content" tabIndex={-1}>
        Eigener Arbeitsstand
      </main>
    ),
    renderPractice: ({
      repository,
      storage: practiceStorage,
      onAction,
    }: Parameters<Parameters<typeof Tutorial>[0]["renderPractice"]>[0]) => (
      <App
        practice
        repository={repository}
        workspaceStorage={practiceStorage}
        onTutorialAction={onAction}
        download={(...args) => {
          download(...args);
          onAction("backup-downloaded");
        }}
      />
    ),
  };
  return { props, values, download };
}

it("führt durch echte Formulare und Aktionen, ohne den eigenen Datenbestand oder die URL zu verändern", async () => {
  const user = userEvent.setup();
  const { props, values, download } = setup();
  const url = window.location.href;
  render(<Tutorial {...props} />);
  const tour = () =>
    screen.getByRole("complementary", { name: "Geführtes Tutorial" });
  expect(tour().textContent).toContain("Schritt 1 von 15");
  expect(values.get(TUTORIAL_KEY)).toBe("gesehen");
  expect(screen.queryByText("Eigener Arbeitsstand")).toBeNull();
  // Unrelated actions never advance the instruction.
  await user.click(screen.getByRole("button", { name: "Tabelle" }));
  expect(tour().textContent).toContain("Schritt 1 von 15");
  await user.click(
    within(screen.getByRole("navigation", { name: "Hauptseiten" })).getByRole(
      "link",
      { name: "Klasse anlegen / importieren" },
    ),
  );
  expect(tour().textContent).toContain("Schritt 2 von 15");
  expect(
    (screen.getByRole("button", { name: "Weiter" }) as HTMLButtonElement)
      .disabled,
  ).toBe(false);
  await user.type(screen.getByLabelText("Klassenname"), "Übung 8b");
  await user.keyboard("{Enter}");
  expect(tour().textContent).toContain("Schritt 3 von 15");
  await user.type(screen.getByLabelText("Vorname 1"), "Ada");
  await user.type(screen.getByLabelText("Nachname 1"), "Beispiel");
  await user.keyboard("{Tab}");
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Weiter" }),
  );
  await user.keyboard("{Enter}");
  await user.click(
    screen.getByRole("button", { name: "Klasse lokal anlegen" }),
  );
  expect(tour().textContent).toContain("Schritt 5 von 15");
  await user.click(screen.getByRole("button", { name: "Stunde beginnen" }));
  await user.click(screen.getByRole("button", { name: "+" }));
  expect(screen.getByRole("region", { name: "Stundenabschluss" })).toBeTruthy();
  expect(tour().textContent).toContain("Schritt 7 von 15");
  await user.click(
    screen.getByRole("button", { name: "Zur Klassenübersicht" }),
  );
  await user.click(screen.getByRole("button", { name: "Tabelle" }));
  await user.click(screen.getByRole("button", { name: "Verlauf" }));
  await user.click(
    within(
      screen.getByRole("navigation", { name: "Klasse wechseln" }),
    ).getByRole("button", { name: /Übung 7a/ }),
  );
  await user.click(
    within(screen.getByRole("navigation", { name: "Hauptseiten" })).getByRole(
      "link",
      { name: "Datensicherung" },
    ),
  );
  await user.click(
    screen.getByRole("button", {
      name: "Vollständige JSON-Sicherung herunterladen",
    }),
  );
  expect(download).toHaveBeenCalledOnce();
  const exported = JSON.parse(download.mock.calls[0][1] as string);
  expect(exported.classes).toHaveLength(2);
  await user.click(screen.getByText("Hilfe und Einstieg"));
  await screen.findByRole("link", { name: "So funktioniert Gradeflow" });
  await user.click(
    screen.getByRole("link", { name: "So funktioniert Gradeflow" }),
  );
  expect(tour().textContent).toContain("Schritt 15 von 15");
  await user.click(
    screen.getByRole("button", { name: "Zurück zu meinen Klassen" }),
  );
  expect(screen.getByText("Eigener Arbeitsstand")).toBeTruthy();
  expect(values.get(NOTEBOOK_STORAGE_KEY)).toBe(
    "Eigener unveränderter Datenbestand",
  );
  expect(window.location.href).toBe(url);
});

it("erscheint einmal, lässt sich abbrechen und manuell von vorn starten", async () => {
  const user = userEvent.setup();
  const { props } = setup();
  const first = render(<Tutorial {...props} />);
  await user.keyboard("{Escape}");
  expect(screen.getByText("Eigener Arbeitsstand")).toBeTruthy();
  first.unmount();
  const again = render(<Tutorial {...props} />);
  expect(
    screen.queryByRole("complementary", { name: "Geführtes Tutorial" }),
  ).toBeNull();
  again.rerender(<Tutorial {...props} request={1} />);
  expect(
    screen.getByRole("complementary", { name: "Geführtes Tutorial" })
      .textContent,
  ).toContain("Schritt 1 von 15");
  await user.click(screen.getByRole("button", { name: "Tutorial beenden" }));
  expect(screen.getByText("Eigener Arbeitsstand")).toBeTruthy();
});

it("bleibt bei blockiertem Tutorial-Speicher bedienbar und meldet den Fehler", async () => {
  const user = userEvent.setup();
  const { props } = setup();
  render(
    <Tutorial
      {...props}
      storage={{
        ...props.storage,
        setItem() {
          throw new Error("Speicher blockiert");
        },
      }}
    />,
  );
  expect(props.onStorageError).toHaveBeenCalledOnce();
  await user.click(screen.getByRole("button", { name: "Tutorial beenden" }));
  expect(screen.getByText("Eigener Arbeitsstand")).toBeTruthy();
});

it("lässt alle Schritte ohne Eingaben oder Download ansehen und erhält eigene Daten", async () => {
  const user = userEvent.setup();
  const { props, values, download } = setup();
  const url = window.location.href;
  render(<Tutorial {...props} />);
  for (let step = 1; step < 15; step++) {
    expect(
      screen.getByRole("complementary", { name: "Geführtes Tutorial" })
        .textContent,
    ).toContain(`Schritt ${step} von 15`);
    await user.click(screen.getByRole("button", { name: "Weiter" }));
  }
  expect(
    screen.getByRole("heading", { name: "So funktioniert Gradeflow" }),
  ).toBeTruthy();
  expect(download).not.toHaveBeenCalled();
  await user.click(
    screen.getByRole("button", { name: "Zurück zu meinen Klassen" }),
  );
  expect(screen.getByText("Eigener Arbeitsstand")).toBeTruthy();
  expect(values.get(NOTEBOOK_STORAGE_KEY)).toBe(
    "Eigener unveränderter Datenbestand",
  );
  expect(window.location.href).toBe(url);
});

it("ergänzt fehlende Übungsangaben und erlaubt danach die echte markierte Aktion", async () => {
  const user = userEvent.setup();
  const { props, download } = setup();
  render(<Tutorial {...props} />);
  await user.click(screen.getByRole("button", { name: "Weiter" }));
  await user.type(screen.getByLabelText("Klassenname"), "Meine fiktive Übung");
  await user.click(screen.getByRole("button", { name: "Weiter" }));
  await user.type(screen.getByLabelText("Vorname 1"), "Fiktiv");
  await user.click(screen.getByRole("button", { name: "Weiter" }));
  expect((screen.getByLabelText("Klassenname") as HTMLInputElement).value).toBe(
    "Meine fiktive Übung",
  );
  expect((screen.getByLabelText("Vorname 1") as HTMLInputElement).value).toBe(
    "Fiktiv",
  );
  expect((screen.getByLabelText("Nachname 1") as HTMLInputElement).value).toBe(
    "Beispiel",
  );
  await user.click(
    screen.getByRole("button", { name: "Klasse lokal anlegen" }),
  );
  expect(
    screen.getByRole("heading", { name: "Meine fiktive Übung" }),
  ).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Weiter" }));
  await user.click(screen.getByRole("button", { name: "+" }));
  expect(screen.getByRole("region", { name: "Stundenabschluss" })).toBeTruthy();
  expect(download).not.toHaveBeenCalled();
});
