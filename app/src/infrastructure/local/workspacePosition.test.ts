import { expect, it } from "vitest";
import {
  readWorkspacePosition,
  resolveWorkspace,
  workspaceHash,
  type WorkspacePosition,
} from "./workspacePosition";
import { EMPTY_NOTEBOOK } from "./schema";
import { reportClass } from "../../test/reportClass";

const position: WorkspacePosition = {
  page: "klasse",
  classId: "c1",
  view: "tabelle",
  sessionId: null,
  studentId: "p1",
  historyStudentId: "p2",
};

it("überträgt Arbeitspositionen ohne Namen oder Fachwerte über die URL", () => {
  expect(readWorkspacePosition(undefined, workspaceHash(position))).toEqual(
    position,
  );
  expect(workspaceHash(position)).not.toContain("Fiktiv");
});

it("ignoriert beschädigte Positionsdaten und verwirft ungültige Ziele ohne Datenänderung", () => {
  const storage = { getItem: () => "{kaputt", setItem() {}, removeItem() {} };
  expect(readWorkspacePosition(storage)).toBeNull();
  const notebook = {
    ...EMPTY_NOTEBOOK,
    currentClassId: "c1",
    classes: [reportClass()],
  };
  const before = JSON.stringify(notebook);
  const result = resolveWorkspace(
    { ...position, sessionId: "entfernt" },
    notebook,
  );
  expect(result.position.sessionId).toBeNull();
  expect(result.notice).toContain("nicht mehr verfügbar");
  expect(JSON.stringify(notebook)).toBe(before);
});
