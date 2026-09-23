import { describe, expect, it } from "vitest";
import { parseClassImport } from "./classImport";

describe("Klassenlistenimport", () => {
  it("liest TXT-Namen und zweispaltige CSV-Dateien mit Umlauten und Anführungszeichen", () => {
    expect(
      parseClassImport("\uFEFFFiktiv Ada\r\nFiktiv Bea\n", "klasse.txt"),
    ).toEqual(["Fiktiv Ada", "Fiktiv Bea"]);
    expect(
      parseClassImport('"Fiktiv";"Müller"\n"Fiktiv";"O""Neal"', "klasse.csv"),
    ).toEqual(["Fiktiv Müller", 'Fiktiv O"Neal']);
  });

  it("verhindert leere, ungültige und zu große Listen", () => {
    expect(() => parseClassImport("  ", "klasse.txt")).toThrow(/leer/);
    expect(() => parseClassImport("Name", "klasse.json")).toThrow(
      /CSV- oder TXT/,
    );
    expect(() => parseClassImport("Ada;", "klasse.csv")).toThrow(/Zeile 1/);
    expect(() => parseClassImport('"Ada', "klasse.csv")).toThrow(
      /Anführungszeichen/,
    );
    expect(() =>
      parseClassImport(
        Array.from({ length: 46 }, (_, index) => `Person ${index}`).join("\n"),
        "klasse.txt",
      ),
    ).toThrow(/höchstens 45/);
  });
});
