import { readFileSync } from "node:fs";
import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import { reportClass } from "../../test/reportClass";
import { exportClassXlsx, readClassXlsx } from "./excelWorkbook";

async function classList(rows: unknown[][]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Klassenliste");
  rows.forEach((row) => sheet.addRow(row));
  return new Uint8Array(await workbook.xlsx.writeBuffer()).buffer;
}

describe("Excel-Dateien", () => {
  it("exportiert echte XLSX-Blätter mit Fachkernwerten, deutschen Labels und ohne IDs", async () => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load((await exportClassXlsx(reportClass())).buffer);
    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([
      "Klassenübersicht",
      "Fiktiv Ada",
      "Fiktiv Bea",
    ]);
    const ada = workbook.worksheets[1];
    expect(ada.getCell("D3").value).toBe(1.5);
    expect(ada.getCell("A6").value).toBeInstanceOf(Date);
    expect(ada.getCell("A6").numFmt).toBe("dd.mm.yyyy");
    expect(ada.getCell("D6").value).toBe("++");
    expect(ada.getCell("F6").value).toBe(1.5);
    expect(ada.getCell("F7").value).toBe(1.75);
    expect(ada.getCell("B8").value).toBeNull();
    expect(workbook.worksheets[2].getCell("C6").value).toBe("Abwesend");
    expect(workbook.worksheets[2].getCell("C7").value).toBe("Nicht beobachtet");
    expect(workbook.worksheets[2].getCell("C8").value).toBe("Offen");
    expect(workbook.worksheets[2].getCell("F6").value).toBeNull();
    expect(workbook.worksheets[2].getCell("D6").value).toBeNull();
    expect(workbook.worksheets[2].getCell("F3").numFmt).toBe("0");
    for (const sheet of workbook.worksheets)
      sheet.eachRow((row) =>
        row.eachCell((cell) => {
          expect(cell.type).not.toBe(ExcelJS.ValueType.Formula);
          expect(String(cell.value)).not.toMatch(
            /^(c1|p1|s1|periodLabel|studentId|classId)$/,
          );
        }),
      );
  });

  it("behandelt lange und gleiche Blattnamen sowie Formelzeichen als Text", async () => {
    const source = reportClass();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(
      (
        await exportClassXlsx({
          ...source,
          students: source.students.map((student) => ({
            ...student,
            displayName: "=Fiktiv[Beispiel]/" + "A".repeat(40),
          })),
        })
      ).buffer,
    );
    expect(new Set(workbook.worksheets.map((sheet) => sheet.name)).size).toBe(
      3,
    );
    expect(workbook.worksheets.every((sheet) => sheet.name.length <= 31)).toBe(
      true,
    );
    expect(workbook.worksheets[1].getCell("A1").type).toBe(
      ExcelJS.ValueType.String,
    );
  });

  it("liest Vorname und Nachname aus einem XLSX-Blatt und verwirft ungültige Daten", async () => {
    expect(
      await readClassXlsx(
        await classList([
          ["Vorname", "Nachname"],
          ["Fiktiv", "Ada"],
        ]),
      ),
    ).toEqual(["Fiktiv Ada"]);
    for (const rows of [
      [
        ["Nachname", "Vorname"],
        ["Ada", "Fiktiv"],
      ],
      [
        ["Vorname", "Nachname"],
        ["Fiktiv", ""],
      ],
      [
        ["Vorname", "Nachname"],
        ["Fiktiv", "Ada", "Extra"],
      ],
      [
        ["Vorname", "Nachname"],
        ["Fiktiv", "Ada"],
        [null, null, "Nicht stillschweigend ignorieren"],
      ],
      [
        ["Vorname", "Nachname"],
        [{ formula: '"Fiktiv"', result: "Fiktiv" }, "Ada"],
      ],
    ])
      await expect(readClassXlsx(await classList(rows))).rejects.toThrow();
    await expect(readClassXlsx(new ArrayBuffer(3))).rejects.toThrow(
      /nicht gelesen/,
    );
    await expect(
      readClassXlsx(
        await classList([
          ["Vorname", "Nachname"],
          ...Array.from({ length: 46 }, (_, index) => [
            "Fiktiv",
            `Person${index}`,
          ]),
        ]),
      ),
    ).rejects.toThrow(/höchstens 45/);
    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet("A");
    workbook.addWorksheet("B");
    await expect(
      readClassXlsx(new Uint8Array(await workbook.xlsx.writeBuffer()).buffer),
    ).rejects.toThrow(/genau ein/);
  });

  it("liefert eine leere Vorlage mit genau den beiden Überschriften", async () => {
    const workbook = new ExcelJS.Workbook();
    const template = readFileSync(
      new URL("../../../public/musterklassenliste.xlsx", import.meta.url),
    );
    await workbook.xlsx.load(new Uint8Array(template).buffer);
    expect(workbook.worksheets).toHaveLength(1);
    expect(workbook.worksheets[0].getCell("A1").value).toBe("Vorname");
    expect(workbook.worksheets[0].getCell("B1").value).toBe("Nachname");
    expect(workbook.worksheets[0].getCell("A2").value).toBeNull();
    workbook.worksheets[0].getCell("A2").value = "Fiktiv";
    workbook.worksheets[0].getCell("B2").value = "Ada";
    expect(
      await readClassXlsx(
        new Uint8Array(await workbook.xlsx.writeBuffer()).buffer,
      ),
    ).toEqual(["Fiktiv Ada"]);
  });
});
