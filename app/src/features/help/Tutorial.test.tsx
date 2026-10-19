// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tutorial, TUTORIAL_KEY } from "./Tutorial";
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value() {
      this.setAttribute("open", "");
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value() {
      this.removeAttribute("open");
    },
  });
});
afterEach(cleanup);
it("erscheint automatisch einmal, lässt sich durchgehen und bewusst erneut starten", async () => {
  const user = userEvent.setup();
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem() {},
  };
  const props = { storage, request: 0, onStorageError: vi.fn() };
  const first = render(<Tutorial {...props} />);
  expect(screen.getByRole("dialog").textContent).toMatch(/Willkommen/);
  expect(values.get(TUTORIAL_KEY)).toBe("gesehen");
  for (let step = 0; step < 4; step++)
    await user.click(screen.getByRole("button", { name: "Weiter" }));
  await user.click(
    screen.getByRole("button", { name: "Einführung abschließen" }),
  );
  expect(screen.queryByRole("dialog")).toBeNull();
  first.unmount();
  const again = render(<Tutorial {...props} />);
  expect(screen.queryByRole("dialog")).toBeNull();
  again.rerender(<Tutorial {...props} request={1} />);
  expect(screen.getByRole("dialog").textContent).toMatch(/Schritt 1 von 5/);
  await user.click(screen.getByRole("button", { name: "Tutorial schließen" }));
  expect(screen.queryByRole("dialog")).toBeNull();
});
