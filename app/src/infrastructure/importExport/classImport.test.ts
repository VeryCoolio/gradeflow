import { describe, expect, it } from "vitest";
import { parseClassImport } from "./classImport";

describe("Klassenlistenimport", () => {
  it("liest genau Vorname und Nachname mit Kopfzeile, Umlauten und Anführungszeichen", () => {
    expect(
      parseClassImport(
        "\uFEFFVorname;Nachname\r\nFiktiv;Ada\nFiktiv;Bea",
        "klasse.csv",
      ),
    ).toEqual(["Fiktiv Ada", "Fiktiv Bea"]);
    expect(
      parseClassImport(
        'Vorname,Nachname\n"Fiktiv","Müller"\n"Fiktiv","O""Neal"',
        "klasse.csv",
      ),
    ).toEqual(["Fiktiv Müller", 'Fiktiv O"Neal']);
    expect(
      parseClassImport("Vorname\tNachname\nFiktiv\tAda", "klasse.txt"),
    ).toEqual(["Fiktiv Ada"]);
  });
  it("weist fehlende, vertauschte und zusätzliche Spalten sowie einspaltige Altlisten ab", () => {
    for (const text of [
      "Fiktiv Ada",
      "Nachname;Vorname\nAda;Fiktiv",
      "Vorname;Nachname;ID\nFiktiv;Ada;1",
    ])
      expect(() => parseClassImport(text, "klasse.csv")).toThrow(
        /Vorname.*Nachname/,
      );
    expect(() =>
      parseClassImport("Vorname;Nachname\nFiktiv;", "klasse.csv"),
    ).toThrow(/Zeile 2/);
    expect(() =>
      parseClassImport("Vorname;Nachname\nFiktiv;Ada;Extra", "klasse.csv"),
    ).toThrow(/Zeile 2/);
  });
  it("verhindert leere, ungültige und zu große Listen, erlaubt genau 45 Personen", () => {
    expect(() => parseClassImport(" ", "klasse.csv")).toThrow(/leer/);
    expect(() => parseClassImport("Vorname;Nachname", "klasse.csv")).toThrow(
      /noch keine Personen/,
    );
    expect(() => parseClassImport("Name", "klasse.json")).toThrow(
      /CSV- oder TXT/,
    );
    expect(() =>
      parseClassImport('Vorname;Nachname\n"Fiktiv;Ada', "klasse.csv"),
    ).toThrow(/Anführungszeichen/);
    const rows = Array.from(
      { length: 46 },
      (_, index) => `Fiktiv;Person${index}`,
    );
    expect(() =>
      parseClassImport("Vorname;Nachname\n" + rows.join("\n"), "klasse.csv"),
    ).toThrow(/höchstens 45/);
    expect(
      parseClassImport(
        "Vorname;Nachname\n" + rows.slice(0, 45).join("\n"),
        "klasse.csv",
      ),
    ).toHaveLength(45);
  });
});
