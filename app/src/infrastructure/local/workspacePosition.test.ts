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

it("erhält Tabellenpräferenzen in URL und Speicherung und normalisiert ungültige Werte", () => {
  const withTable: WorkspacePosition = {
    ...position,
    table: { compact: false, size: "large", windowSize: 20, page: 2 },
  };
  expect(readWorkspacePosition(undefined, workspaceHash(withTable))).toEqual(
    withTable,
  );
  const storage = {
    getItem: () => JSON.stringify(withTable),
    setItem() {},
    removeItem() {},
  };
  expect(readWorkspacePosition(storage)).toEqual(withTable);
  const invalid = readWorkspacePosition(
    undefined,
    workspaceHash(position) +
      "&tabellenmodus=kaputt&tabellengroesse=riesig&stundenfenster=-1&tabellenseite=NaN",
  );
  expect(invalid?.table).toEqual({
    compact: true,
    size: "normal",
    windowSize: 10,
    page: 0,
  });
  expect(invalid?.classId).toBe(position.classId);
  expect(
    readWorkspacePosition({
      ...storage,
      getItem: () =>
        JSON.stringify({
          ...withTable,
          table: {
            page: -9,
            compact: "false",
            size: "riesig",
            windowSize: "20",
          },
        }),
    })?.table,
  ).toEqual({ compact: true, size: "normal", windowSize: 10, page: 0 });
});
