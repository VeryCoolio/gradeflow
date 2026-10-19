import { describe, expect, it } from "vitest";
import {
  NotebookCoordinator,
  type NotebookAccess,
} from "./notebookCoordinator";

function sharedLocks() {
  let held = false;
  return {
    request: async (
      _name: string,
      _options: LockOptions,
      callback: (lock: Lock | null) => Promise<void>,
    ) => {
      if (held) return callback(null);
      held = true;
      try {
        await callback({ name: "test", mode: "exclusive" });
      } finally {
        held = false;
      }
    },
  } as Pick<LockManager, "request">;
}

describe("originweiter Schreibschutz", () => {
  it("erteilt nur einem Tab Zugriff und gibt ihn beim Schließen frei", async () => {
    const locks = sharedLocks();
    const first: NotebookAccess[] = [],
      second: NotebookAccess[] = [];
    const a = new NotebookCoordinator(locks, (s) => first.push(s));
    const b = new NotebookCoordinator(locks, (s) => second.push(s));
    a.request();
    b.request();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(first.at(-1)).toBe("writable");
    expect(second.at(-1)).toBe("readonly");
    a.stop();
    await new Promise((resolve) => setTimeout(resolve, 0));
    b.request();
    expect(second.at(-1)).toBe("writable");
    b.stop();
  });

  it("verweigert unsicheren Ersatzbetrieb ohne Lock-API", () => {
    const states: NotebookAccess[] = [];
    new NotebookCoordinator(undefined, (s) => states.push(s)).request();
    expect(states).toEqual(["unsupported"]);
  });

  it("öffnet einen bereits abgebauten StrictMode-Versuch nicht erneut", () => {
    const states: NotebookAccess[] = [];
    const coordinator = new NotebookCoordinator(sharedLocks(), (s) =>
      states.push(s),
    );
    coordinator.stop();
    coordinator.request();
    expect(states).toEqual([]);
  });
});
