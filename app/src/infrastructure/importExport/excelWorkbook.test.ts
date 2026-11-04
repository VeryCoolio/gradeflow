import { readFileSync } from "node:fs";
import ExcelJS from "exceljs";
import JSZip from "jszip";
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
    expect(ada.getCell("D6").font.size).toBeGreaterThanOrEqual(18);
    expect(workbook.worksheets[0].getCell("A6").hyperlink).toBe(
      "#'Fiktiv Ada'!A1",
    );
    expect(workbook.worksheets[0].getCell("A3").text).toMatch(
      /Tabellenblätter/,
    );
    expect(ada.getCell("B8").value).toBe("1. Stunde");
    expect(ada.getCell("F6").value).toBe(1.5);
    expect(ada.getCell("F7").value).toBe(1.75);
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

  it("gibt lange Titel vollständig in verbundenen Zellen mit passender Zeilenhöhe aus", async () => {
    const source = reportClass();
    const long = "Fiktive sehr lange Bezeichnung mit vielen breiten Wörtern "
      .repeat(4)
      .slice(0, 200);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(
      (
        await exportClassXlsx({
          ...source,
          name: long,
          periodLabel: long,
          students: source.students.map((student) => ({
            ...student,
            displayName: long,
          })),
        })
      ).buffer,
    );
    const summary = workbook.worksheets[0];
    const person = workbook.worksheets[1];
    expect(summary.getCell("D1").master.address).toBe("A1");
    expect(summary.getCell("D2").master.address).toBe("B2");
    expect(summary.getRow(6).height).toBeGreaterThan(180);
    expect(person.getCell("G1").master.address).toBe("A1");
    expect(person.getCell("D2").master.address).toBe("B2");
    expect(person.getCell("G2").master.address).toBe("F2");
    expect(person.getCell("A1").text).toBe(long);
    expect(person.getCell("B2").text).toBe(long);
    expect(person.getCell("F2").text).toBe(long);
    expect(person.getRow(1).height).toBeGreaterThan(40);
    expect(person.getRow(2).height).toBeGreaterThan(100);
    expect(person.getCell("D3").value).toBe(1.5);
    expect(person.getCell("A6").value).toBeInstanceOf(Date);
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

  it("zählt Personen statt formatierter Leerzeilen und ignoriert Farben und Rahmen", async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Klassenliste");
    sheet.addRow(["Vorname", "Nachname"]);
    for (let index = 0; index < 45; index++) {
      sheet.getRow(index * 2 + 2).values = ["Fiktiv", `Person ${index}`];
    }
    sheet.getCell("D120").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0F0FF" },
    };
    sheet.getCell("A2").border = { bottom: { style: "thin" } };
    sheet.getCell("B2").font = { color: { argb: "FF005533" } };
    await expect(
      readClassXlsx(new Uint8Array(await workbook.xlsx.writeBuffer()).buffer),
    ).resolves.toHaveLength(45);
    sheet.getRow(100).values = ["Fiktiv", "Eine Person zu viel"];
    await expect(
      readClassXlsx(new Uint8Array(await workbook.xlsx.writeBuffer()).buffer),
    ).rejects.toThrow(/höchstens 45/);
  });

  it("liest Text mit mehreren Schriftformaten und erhält Namen ohne Außenleerzeichen", async () => {
    await expect(
      readClassXlsx(
        await classList([
          ["Vorname", "Nachname"],
          [
            {
              richText: [
                { text: "  Fiktiv  " },
                { text: "Marie ", font: { bold: true } },
              ],
            },
            " von Beispiel  ",
          ],
          ["   ", "  "],
        ]),
      ),
    ).resolves.toEqual(["Fiktiv  Marie von Beispiel"]);
  });

  it("nennt nach leeren Zeilen die Excel-Zelle eines unvollständigen Namens", async () => {
    await expect(
      readClassXlsx(
        await classList([
          ["Vorname", "Nachname"],
          [],
          ["Fiktiv", "Ada"],
          [],
          ["Fiktiv"],
        ]),
      ),
    ).rejects.toThrow(/Zeile 5.*Nachname.*B5.*ergänz/);
  });

  it("liest OOXML mit ausdrücklich gebundenem Namespace-Präfix", async () => {
    const zip = await JSZip.loadAsync(
      await classList([
        ["Vorname", "Nachname"],
        ["Fiktiv Marie", "von Beispiel"],
      ]),
    );
    for (const entry of Object.values(zip.files)) {
      if (!/^xl\/.*\.xml$/.test(entry.name)) continue;
      const xml = await entry.async("string");
      if (
        !xml.includes(
          'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"',
        )
      )
        continue;
      zip.file(
        entry.name,
        xml
          .replace(
            'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"',
            'xmlns:xl="http://schemas.openxmlformats.org/spreadsheetml/2006/main"',
          )
          .replace(/<(\/?)([A-Za-z_][\w.-]*)(?=[\s/>])/g, "<$1xl:$2"),
      );
    }
    const raw = await zip.generateAsync({ type: "arraybuffer" });
    await expect(readClassXlsx(raw)).resolves.toEqual([
      "Fiktiv Marie von Beispiel",
    ]);
  });

  it("übernimmt auch nur teilweise präfixierte Personen vollständig", async () => {
    const zip = await JSZip.loadAsync(
      await classList([
        ["Vorname", "Nachname"],
        ["Fiktiv", "Ada"],
        ["Fiktiv", "Bea"],
      ]),
    );
    const sheet = await zip.file("xl/worksheets/sheet1.xml")!.async("string");
    zip.file(
      "xl/worksheets/sheet1.xml",
      sheet.replace(/<row r="3"[\s\S]*?<\/row>/, (row) =>
        row
          .replace(/<(\/?)(row|c|v)(?=[\s/>])/g, "<$1s:$2")
          .replace(
            '<s:row r="3"',
            '<s:row xmlns:s="http://schemas.openxmlformats.org/spreadsheetml/2006/main" r="3"',
          ),
      ),
    );
    await expect(
      readClassXlsx(await zip.generateAsync({ type: "arraybuffer" })),
    ).resolves.toEqual(["Fiktiv Ada", "Fiktiv Bea"]);
  });

  it("weist zusätzliche Daten auch in einer einzelnen präfixierten Zelle ab", async () => {
    const zip = await JSZip.loadAsync(
      await classList([
        ["Vorname", "Nachname"],
        ["Fiktiv", "Ada"],
        ["Fiktiv", "Bea", "Zusatzinhalt"],
      ]),
    );
    const sheet = await zip.file("xl/worksheets/sheet1.xml")!.async("string");
    zip.file(
      "xl/worksheets/sheet1.xml",
      sheet.replace(/<c r="C3"[\s\S]*?<\/c>/, (cell) =>
        cell
          .replace(/<(\/?)(c|v)(?=[\s/>])/g, "<$1s:$2")
          .replace(
            '<s:c r="C3"',
            '<s:c xmlns:s="http://schemas.openxmlformats.org/spreadsheetml/2006/main" r="C3"',
          ),
      ),
    );
    await expect(
      readClassXlsx(await zip.generateAsync({ type: "arraybuffer" })),
    ).rejects.toThrow(/C3.*zusätzliche Daten/);
  });

  it("erklärt ein nicht lesbares einzelnes Blatt mit einer konkreten Korrekturmöglichkeit", async () => {
    const zip = await JSZip.loadAsync(
      await classList([
        ["Vorname", "Nachname"],
        ["Fiktiv", "Ada"],
      ]),
    );
    const xml = await zip.file("xl/workbook.xml")!.async("string");
    zip.file(
      "xl/workbook.xml",
      xml
        .replace("r:id=", "q:id=")
        .replace(
          "<sheet ",
          '<sheet xmlns:q="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ',
        ),
    );
    await expect(
      readClassXlsx(await zip.generateAsync({ type: "arraybuffer" })),
    ).rejects.toThrow(/erneut als .xlsx.*Musterklassenliste/);
  });

  it("weist zwei deklarierte Blätter auch bei einem alternativen Relationship-Präfix ab", async () => {
    const workbook = new ExcelJS.Workbook();
    for (const name of ["Fiktive Klasse Eins", "Fiktive Klasse Zwei"]) {
      const sheet = workbook.addWorksheet(name);
      sheet.addRow(["Vorname", "Nachname"]);
      sheet.addRow(["Fiktiv", name]);
    }
    const zip = await JSZip.loadAsync(await workbook.xlsx.writeBuffer());
    const workbookXml = await zip.file("xl/workbook.xml")!.async("string");
    zip.file(
      "xl/workbook.xml",
      workbookXml.replace(
        /<sheet\b[^>]*name="Fiktive Klasse Zwei"[^>]*\/>/,
        (sheet) =>
          sheet
            .replace("r:id=", "q:id=")
            .replace(
              "<sheet ",
              '<sheet xmlns:q="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ',
            ),
      ),
    );
    expect(zip.file("xl/worksheets/sheet2.xml")).not.toBeNull();
    await expect(
      readClassXlsx(await zip.generateAsync({ type: "arraybuffer" })),
    ).rejects.toThrow(/genau ein Tabellenblatt/);
  });
});
