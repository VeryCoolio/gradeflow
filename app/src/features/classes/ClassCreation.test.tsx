// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClassCreation } from "./ClassCreation";
import {
  CLASS_DRAFT_KEY,
  emptyClassDraft,
  readClassDraft,
} from "../../infrastructure/local/classDraft";

afterEach(cleanup);
function storage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
}
it("nimmt einen Entwurf wieder auf und entfernt ihn erst nach erfolgreicher Klassenanlage", async () => {
  const user = userEvent.setup();
  const local = storage();
  let success = false;
  const onCreate = vi.fn(() => success);
  const props = {
    today: "2026-10-19",
    storage: local,
    onCreate,
    onDemo: vi.fn(),
    onError: vi.fn(),
  };
  const first = render(<ClassCreation {...props} />);
  await user.type(screen.getByLabelText("Klassenname"), "Fiktive 8b");
  await user.type(screen.getByLabelText("Vorname 1"), "Fiktiv");
  await user.type(screen.getByLabelText("Nachname 1"), "Ada");
  expect(screen.getByRole("status").textContent).toMatch(
    /Entwurf.*gespeichert/,
  );
  first.unmount();
  render(<ClassCreation {...props} />);
  expect((screen.getByLabelText("Klassenname") as HTMLInputElement).value).toBe(
    "Fiktive 8b",
  );
  expect((screen.getByLabelText("Nachname 1") as HTMLInputElement).value).toBe(
    "Ada",
  );
  await user.click(
    screen.getByRole("button", { name: "Klasse lokal anlegen" }),
  );
  expect(readClassDraft(local)?.name).toBe("Fiktive 8b");
  success = true;
  await user.click(
    screen.getByRole("button", { name: "Klasse lokal anlegen" }),
  );
  expect(onCreate).toHaveBeenLastCalledWith("Fiktive 8b", "Schuljahr 2026/27", [
    "Fiktiv Ada",
  ]);
  expect(local.getItem(CLASS_DRAFT_KEY)).toBeNull();
});

it("meldet einen fehlgeschlagenen Entwurfsschreibvorgang und kann dieselben Eingaben erneut sichern", async () => {
  const user = userEvent.setup();
  const local = storage();
  let fail = true;
  render(
    <ClassCreation
      today="2026-10-19"
      storage={{
        ...local,
        setItem: (key, value) => {
          if (fail) throw new Error("quota");
          local.setItem(key, value);
        },
      }}
      onCreate={() => false}
      onDemo={() => {}}
      onError={() => {}}
    />,
  );
  await user.type(screen.getByLabelText("Klassenname"), "Fiktive 8b");
  expect(screen.getByRole("alert").textContent).toMatch(
    /Entwurf nicht gespeichert/,
  );
  expect(local.getItem(CLASS_DRAFT_KEY)).toBeNull();
  fail = false;
  await user.click(
    screen.getByRole("button", { name: "Entwurf erneut speichern" }),
  );
  expect(readClassDraft(local)?.name).toBe("Fiktive 8b");
  expect(screen.queryByRole("alert")).toBeNull();
});

it("zeigt Dateifehler am Formular, verknüpft das Feld und fokussiert den Hinweis", async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn(() => true);
  render(
    <ClassCreation
      today="2026-10-20"
      onCreate={onCreate}
      onDemo={() => {}}
      onError={() => {}}
    />,
  );
  await user.type(screen.getByLabelText("Klassenname"), "Fiktiver Import");
  await user.click(
    screen.getByRole("button", { name: "Klassenliste importieren" }),
  );
  const raw = "NurEineSpalte\nFiktiv Ada";
  const file = new File([raw], "ungueltig.csv", { type: "text/csv" });
  Object.defineProperty(file, "text", { value: async () => raw });
  await user.upload(screen.getByLabelText("Klassenliste"), file);
  fireEvent.submit(
    screen
      .getByRole("button", { name: "Klasse lokal anlegen" })
      .closest("form")!,
  );
  const alert = await screen.findByRole("alert");
  expect(alert.textContent).toContain("Vorname");
  expect(document.activeElement).toBe(alert);
  expect(
    screen.getByLabelText("Klassenliste").getAttribute("aria-describedby"),
  ).toContain(alert.id);
  expect(
    screen.getByLabelText("Klassenliste").getAttribute("aria-invalid"),
  ).toBe("true");
  expect(onCreate).not.toHaveBeenCalled();
});

it("führt drei Personen per Enter durch die Namensfelder und legt die Klasse erst ausdrücklich an", async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn(() => true);
  render(
    <ClassCreation
      today="2026-10-20"
      onCreate={onCreate}
      onDemo={() => {}}
      onError={() => {}}
    />,
  );
  await user.type(
    screen.getByLabelText("Klassenname"),
    "Fiktive Tastaturklasse",
  );
  await user.tab();
  expect(document.activeElement).toBe(
    screen.getByLabelText("Bewertungszeitraum"),
  );
  for (const name of ["Schuljahr 2026/27", "1. Halbjahr", "2. Halbjahr"]) {
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name }));
  }
  await user.tab();
  expect(document.activeElement).toBe(screen.getByLabelText("Vorname 1"));
  for (const [index, lastName] of ["Ada", "Bea", "Cem"].entries()) {
    const number = index + 1;
    await user.keyboard("Fiktiv{Enter}");
    expect(document.activeElement).toBe(
      screen.getByLabelText(`Nachname ${number}`),
    );
    await user.keyboard(lastName);
    await user.keyboard("{Enter}");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Weitere Person" }),
    );
    expect(onCreate).not.toHaveBeenCalled();
    if (number < 3) {
      await user.keyboard("{Enter}");
      expect(document.activeElement).toBe(
        screen.getByLabelText(`Vorname ${number + 1}`),
      );
    }
  }
  await user.tab();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Klasse lokal anlegen" }),
  );
  await user.keyboard("{Enter}");
  expect(onCreate).toHaveBeenCalledExactlyOnceWith(
    "Fiktive Tastaturklasse",
    "Schuljahr 2026/27",
    ["Fiktiv Ada", "Fiktiv Bea", "Fiktiv Cem"],
  );
});

it("schließt auch bei vollständiger Namenszeile durch Enter nicht die Klasse ab", async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn(() => true);
  render(
    <ClassCreation
      today="2026-10-20"
      onCreate={onCreate}
      onDemo={() => {}}
      onError={() => {}}
    />,
  );
  await user.type(screen.getByLabelText("Klassenname"), "Fiktive Klasse");
  await user.type(screen.getByLabelText("Vorname 1"), "Fiktiv");
  await user.type(screen.getByLabelText("Nachname 1"), "Ada{Enter}");
  expect(onCreate).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Weitere Person" }),
  );
});

it("zeigt den vorbelegten Zeitraum unmittelbar und erhält eine freie Bezeichnung im Entwurf", async () => {
  const user = userEvent.setup();
  const local = storage();
  const onCreate = vi.fn(() => false);
  const props = {
    today: "2026-10-20",
    storage: local,
    onCreate,
    onDemo: vi.fn(),
    onError: vi.fn(),
  };
  const first = render(<ClassCreation {...props} />);
  const period = screen.getByLabelText(
    "Bewertungszeitraum",
  ) as HTMLInputElement;
  expect(period.value).toBe("Schuljahr 2026/27");
  await user.click(screen.getByRole("button", { name: "1. Halbjahr" }));
  expect(period.value).toBe("1. Halbjahr");
  expect(onCreate).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Schuljahr 2026/27" }));
  expect(period.value).toBe("Schuljahr 2026/27");
  await user.clear(period);
  await user.type(period, "Bis zur gemeinsamen Auswertung");
  await user.type(screen.getByLabelText("Klassenname"), "Fiktiver Zeitraum");
  await user.type(screen.getByLabelText("Vorname 1"), "Fiktiv");
  await user.type(screen.getByLabelText("Nachname 1"), "Ada");
  await user.click(
    screen.getByRole("button", { name: "Klasse lokal anlegen" }),
  );
  expect(onCreate).toHaveBeenCalledExactlyOnceWith(
    "Fiktiver Zeitraum",
    "Bis zur gemeinsamen Auswertung",
    ["Fiktiv Ada"],
  );
  first.unmount();
  render(<ClassCreation {...props} />);
  expect(
    (screen.getByLabelText("Bewertungszeitraum") as HTMLInputElement).value,
  ).toBe("Bis zur gemeinsamen Auswertung");
  expect(readClassDraft(local)?.period).toBe("Bis zur gemeinsamen Auswertung");
});

it.each(["", "   "])(
  "weist einen leeren Zeitraum %j direkt am Feld ab und erhält den Entwurf",
  async (emptyPeriod) => {
    const user = userEvent.setup();
    const local = storage();
    const onCreate = vi.fn(() => true);
    render(
      <ClassCreation
        today="2026-10-20"
        storage={local}
        onCreate={onCreate}
        onDemo={() => {}}
        onError={() => {}}
      />,
    );
    await user.type(screen.getByLabelText("Klassenname"), "Fiktiver Entwurf");
    await user.type(screen.getByLabelText("Vorname 1"), "Fiktiv");
    await user.type(screen.getByLabelText("Nachname 1"), "Ada");
    const period = screen.getByLabelText("Bewertungszeitraum");
    await user.clear(period);
    if (emptyPeriod) await user.type(period, emptyPeriod);
    await user.click(
      screen.getByRole("button", { name: "Klasse lokal anlegen" }),
    );
    const error = screen.getByRole("alert");
    expect(error.textContent).toBe(
      "Bitte gib eine Bezeichnung für den Bewertungszeitraum ein.",
    );
    expect(period.getAttribute("aria-invalid")).toBe("true");
    expect(period.getAttribute("aria-describedby")?.split(" ")).toContain(
      error.id,
    );
    expect(document.activeElement).toBe(period);
    expect(onCreate).not.toHaveBeenCalled();
    expect(readClassDraft(local)).toMatchObject({
      name: "Fiktiver Entwurf",
      period: emptyPeriod,
      people: [{ firstName: "Fiktiv", lastName: "Ada" }],
    });
    await user.clear(period);
    await user.type(period, "Freier Zeitraum");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(period.getAttribute("aria-invalid")).toBeNull();
  },
);

it("führt vom Nachnamen zur nächsten vorhandenen Person ohne eine weitere Zeile anzulegen", async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn(() => true);
  render(
    <ClassCreation
      today="2026-10-20"
      onCreate={onCreate}
      onDemo={() => {}}
      onError={() => {}}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Weitere Person" }));
  await user.type(screen.getByLabelText("Vorname 1"), "Fiktiv");
  await user.type(screen.getByLabelText("Nachname 1"), "Ada{Enter}");
  expect(document.activeElement).toBe(screen.getByLabelText("Vorname 2"));
  expect(screen.queryByLabelText("Vorname 3")).toBeNull();
  expect(onCreate).not.toHaveBeenCalled();
});

it("überspringt leere Namensfelder bei Enter nicht und schließt sie nicht ab", async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn(() => true);
  render(
    <ClassCreation
      today="2026-10-20"
      onCreate={onCreate}
      onDemo={() => {}}
      onError={() => {}}
    />,
  );
  await user.type(screen.getByLabelText("Klassenname"), "Fiktive leere Zeile");
  const first = screen.getByLabelText("Vorname 1");
  const last = screen.getByLabelText("Nachname 1");
  await user.click(first);
  await user.keyboard("{Enter}{Enter}");
  expect(document.activeElement).toBe(first);
  await user.type(first, "   {Enter}");
  expect(document.activeElement).toBe(first);
  await user.click(last);
  await user.keyboard("{Enter}");
  expect(document.activeElement).toBe(last);
  await user.type(last, "Ada{Enter}");
  expect(document.activeElement).toBe(first);
  expect(screen.queryByLabelText("Vorname 2")).toBeNull();
  expect(onCreate).not.toHaveBeenCalled();
});

it("ignoriert wiederholtes Enter und bewahrt die IME-Eingabe vor einem Fokuswechsel", async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn(() => true);
  render(
    <ClassCreation
      today="2026-10-20"
      onCreate={onCreate}
      onDemo={() => {}}
      onError={() => {}}
    />,
  );
  const first = screen.getByLabelText("Vorname 1");
  const last = screen.getByLabelText("Nachname 1");
  const more = screen.getByRole("button", { name: "Weitere Person" });
  await user.type(first, "Fiktiv");
  fireEvent.keyDown(first, { key: "Enter", isComposing: true });
  fireEvent.keyDown(first, { key: "Enter", keyCode: 229 });
  fireEvent.keyDown(first, { key: "Enter", repeat: true });
  expect(document.activeElement).toBe(first);
  await user.keyboard("{Enter}");
  expect(document.activeElement).toBe(last);
  await user.type(last, "Ada");
  fireEvent.keyDown(last, { key: "Enter", repeat: true });
  expect(document.activeElement).toBe(last);
  await user.keyboard("{Enter}");
  expect(document.activeElement).toBe(more);
  expect(fireEvent.keyDown(more, { key: "Enter", repeat: true })).toBe(false);
  expect(screen.queryByLabelText("Vorname 2")).toBeNull();
  await user.keyboard("{Enter}{Enter}{Enter}");
  expect(document.activeElement).toBe(screen.getByLabelText("Vorname 2"));
  expect(screen.queryByLabelText("Vorname 3")).toBeNull();
  expect(onCreate).not.toHaveBeenCalled();
});

it("benennt den Dateiimport mit Formaten und Spalten und trennt die Demoaktion vom Anlegen", async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn(() => true);
  const onDemo = vi.fn();
  render(
    <ClassCreation
      today="2026-10-20"
      onCreate={onCreate}
      onDemo={onDemo}
      onError={() => {}}
    />,
  );
  const importButton = screen.getByRole("button", {
    name: "Klassenliste importieren",
  });
  const hint = document.getElementById(
    importButton.getAttribute("aria-describedby")!,
  );
  expect(hint?.textContent).toContain("Excel (.xlsx), CSV oder TXT");
  expect(hint?.textContent).toContain("Vorname, Nachname");
  expect(hint?.textContent).toContain("Kopfzeile");
  await user.click(importButton);
  expect(screen.getByLabelText("Bewertungszeitraum")).toBeTruthy();
  expect(screen.getByLabelText("Klassenliste")).toBeTruthy();
  expect(
    screen.getByText(
      /20 ausschließlich fiktive Personen und zunächst keine Stunden/,
    ),
  ).toBeTruthy();
  await user.click(
    screen.getByRole("button", { name: "Demoklasse erstellen" }),
  );
  expect(onDemo).toHaveBeenCalledOnce();
  expect(onCreate).not.toHaveBeenCalled();
});

it("hält bei 45 Personen Enter im letzten Namensfeld, ohne abzuschließen oder die Grenze zu überschreiten", async () => {
  const user = userEvent.setup();
  const local = storage();
  local.setItem(
    CLASS_DRAFT_KEY,
    JSON.stringify({
      ...emptyClassDraft("2026-10-20"),
      name: "Fiktive volle Klasse",
      people: Array.from({ length: 45 }, (_, index) => ({
        firstName: "Fiktiv",
        lastName: `Person ${index + 1}`,
      })),
    }),
  );
  const onCreate = vi.fn(() => true);
  render(
    <ClassCreation
      today="2026-10-20"
      storage={local}
      onCreate={onCreate}
      onDemo={() => {}}
      onError={() => {}}
    />,
  );
  const last = screen.getByLabelText("Nachname 45");
  await user.click(last);
  await user.keyboard("{Enter}{Enter}");
  expect(document.activeElement).toBe(last);
  expect(
    (
      screen.getByRole("button", {
        name: "Weitere Person",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  expect(screen.queryByLabelText("Vorname 46")).toBeNull();
  expect(readClassDraft(local)?.people).toHaveLength(45);
  expect(onCreate).not.toHaveBeenCalled();
});
