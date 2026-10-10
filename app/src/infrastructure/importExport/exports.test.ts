import { describe, expect, it } from "vitest";
import { reportClass } from "../../test/reportClass";
import { EMPTY_NOTEBOOK } from "../local/schema";
import { exportClassCsv } from "./csvExport";
import { exportNotebookJson, importNotebookJson } from "./jsonBackup";

describe("Dateiexporte", () => {
  it("exportiert Start, alle Statuswerte und aktuellen Stand mit Fachkernwerten", () => {
    const csv = exportClassCsv(reportClass());
    const lines = csv
      .trim()
      .replace(/^\uFEFF/, "")
      .split("\r\n");
    expect(lines).toHaveLength(1 + 2 * (1 + 3 + 1));
    expect(lines[0]).toContain('"Bewertungszeitraum"');
    expect(lines[0]).not.toMatch(/Id|Quarter|formatVersion|periodLabel/);
    expect(lines.join("\n")).toContain(
      '"Unterrichtsstunde";"2026-09-23";"1";"Bewertet";"\'++";"1,50";"0"',
    );
    expect(lines.join("\n")).toContain(
      '"Unterrichtsstunde";"2026-09-23";"2";"Nicht beobachtet";"";"";""',
    );
    expect(lines.join("\n")).toContain(
      '"Unterrichtsstunde";"2026-09-24";"";"Offen";"";"";""',
    );
    expect(lines.join("\n")).toContain('"Aktuell";"";"";"";"";"1,50";"0"');
  });

  it("schützt Namen mit Trennzeichen, Zeilenumbrüchen und Formeleinstiegen", () => {
    const source = reportClass();
    const csv = exportClassCsv({
      ...source,
      students: [
        { ...source.students[0], displayName: '=HYPERLINK("x");\nTest' },
        source.students[1],
      ],
    });
    expect(csv).toContain('"\'=HYPERLINK(""x"");\nTest"');
  });

  it("erstellt eine versionierte JSON-Vollsicherung und verwirft beschädigte Dateien", () => {
    const notebook = {
      ...EMPTY_NOTEBOOK,
      currentClassId: "c1",
      classes: [reportClass()],
    };
    const raw = exportNotebookJson(notebook);
    expect(importNotebookJson(raw)).toEqual(notebook);
    expect(() => importNotebookJson('{"schemaVersion":999}')).toThrow(
      /Schemaversion/,
    );
    expect(() => importNotebookJson("kaputt")).toThrow(/gültiges JSON/);
  });
});
