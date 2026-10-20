// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClassCreation } from "./ClassCreation";
import {
  CLASS_DRAFT_KEY,
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
  await user.click(screen.getByRole("button", { name: "Klasse importieren" }));
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
