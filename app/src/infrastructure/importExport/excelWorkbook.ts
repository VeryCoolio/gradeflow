import ExcelJS from "exceljs";
import { buildClassReport } from "../../application/reporting";
import { observationLabel } from "../../application/observationPresentation";
import { RATING_GUIDE } from "../../application/ratingGuide";
import type { ClassRecord } from "../local/schema";
import { namesFromRows } from "./classListRows";
import { assertXlsxResources } from "./xlsxResources";

export const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// Excel berechnet bei verbundenen Zellen keine automatische Zeilenhöhe.
// Reserve für breite Buchstaben und explizite Zeilenumbrüche einplanen.
function textHeight(text: string, width: number, fontSize = 11): number {
  const characters = Math.max(1, Math.floor(width * 0.6 * (11 / fontSize)));
  const lines = text
    .split(/\r?\n/)
    .reduce(
      (count, line) => count + Math.max(1, Math.ceil(line.length / characters)),
      0,
    );
  return Math.max(30, Math.ceil(lines * fontSize * 1.4 + 10));
}

function styleSheet(
  sheet: ExcelJS.Worksheet,
  headerRow: number,
  widths: number[],
) {
  widths.forEach((width, index) => {
    sheet.getColumn(index + 1).width = width;
  });
  sheet.eachRow((row) => {
    row.font = { name: "Arial", size: 11 };
    if (row.number > headerRow) row.height = 30;
  });
  const row = sheet.getRow(headerRow);
  row.height = 30;
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF123446" },
    };
  });
  sheet.views = [{ state: "frozen", ySplit: headerRow }];
  sheet.eachRow((row) => {
    row.alignment = { vertical: "middle", wrapText: true };
  });
}

function uniqueSheetName(name: string, used: Set<string>): string {
  const base =
    name
      .replace(/[\\/*?:[\]]/g, " ")
      .replace(/^'+|'+$/g, "")
      .trim() || "Person";
  let candidate = base.slice(0, 31);
  let number = 2;
  while (used.has(candidate.toLocaleLowerCase("de"))) {
    const suffix = ` (${number++})`;
    candidate = base.slice(0, 31 - suffix.length) + suffix;
  }
  used.add(candidate.toLocaleLowerCase("de"));
  return candidate;
}

export async function exportClassXlsx(
  classRecord: ClassRecord,
): Promise<Uint8Array<ArrayBuffer>> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Gradeflow";
  const report = buildClassReport(classRecord);
  const used = new Set(["klassenübersicht"]);
  const people = report.students.map((result) => ({
    result,
    sheetName: uniqueSheetName(result.student.displayName, used),
  }));
  const summary = workbook.addWorksheet("Klassenübersicht");
  summary.addRow([classRecord.name]);
  summary.mergeCells("A1:D1");
  summary.addRow(["Bewertungszeitraum", classRecord.periodLabel]);
  summary.mergeCells("B2:D2");
  summary.addRow([
    "Unten findest du die einzelnen Tabellenblätter je Person. Ein Klick auf einen Namen öffnet direkt das zugehörige Personenblatt.",
  ]);
  summary.mergeCells("A3:D3");
  summary.addRow([]);
  summary.addRow(["Person", "Startwert", "Aktueller Stand", "Puffer (max. 3)"]);
  people.forEach(({ result, sheetName }) =>
    summary.addRow([
      {
        text: result.student.displayName,
        hyperlink: `#'${sheetName.replace(/'/g, "''")}'!A1`,
        tooltip: "Personenblatt öffnen",
      },
      result.start.gradeQuarterSteps / 4,
      result.current.gradeQuarterSteps / 4,
      result.current.bufferPoints,
    ]),
  );
  styleSheet(summary, 5, [34, 23, 23, 23]);
  summary.getCell("A1").font = { name: "Arial", size: 14, bold: true };
  summary.getRow(1).height = textHeight(classRecord.name, 103, 14);
  summary.getRow(2).height = textHeight(classRecord.periodLabel, 69);
  summary.getColumn(2).numFmt = "0.00";
  summary.getColumn(3).numFmt = "0.00";
  summary.getRow(3).height = 40;
  people.forEach((_, index) => {
    summary.getRow(index + 6).height = textHeight(
      people[index].result.student.displayName,
      34,
      12,
    );
    summary.getCell(index + 6, 1).font = {
      name: "Arial",
      size: 12,
      color: { argb: "FF483264" },
      underline: true,
    };
  });
  for (const { result, sheetName } of people) {
    const sheet = workbook.addWorksheet(sheetName);
    sheet.addRow([result.student.displayName]);
    sheet.mergeCells("A1:G1");
    sheet.addRow([
      "Klasse",
      classRecord.name,
      null,
      null,
      "Bewertungszeitraum",
      classRecord.periodLabel,
    ]);
    sheet.mergeCells("B2:D2");
    sheet.mergeCells("F2:G2");
    sheet.addRow([
      "Startwert",
      result.start.gradeQuarterSteps / 4,
      "Aktueller Stand",
      result.current.gradeQuarterSteps / 4,
      "Puffer",
      result.current.bufferPoints,
    ]);
    sheet.getCell("B3").numFmt = "0.00";
    sheet.getCell("D3").numFmt = "0.00";
    sheet.addRow([
      { text: "Zur Klassenübersicht", hyperlink: "#'Klassenübersicht'!A1" },
    ]);
    sheet.addRow([
      "Datum",
      "Stunde",
      "Status",
      "Symbol",
      "Bedeutung",
      "Stand nach Bewertung",
      "Puffer",
    ]);
    for (const cell of result.cells) {
      const symbol =
        cell.observation?.status === "bewertet" ? cell.observation.symbol : "";
      sheet.addRow([
        new Date(`${cell.session.date}T12:00:00Z`),
        `${cell.session.lessonSequence}. Stunde`,
        cell.observation?.status === "bewertet"
          ? "Bewertet"
          : observationLabel(cell.observation),
        symbol || null,
        symbol ? RATING_GUIDE[symbol].meaning : null,
        cell.after ? cell.after.gradeQuarterSteps / 4 : null,
        cell.after?.bufferPoints ?? null,
      ]);
    }
    styleSheet(sheet, 5, [17, 17, 24, 14, 25, 25, 12]);
    sheet.getCell("A4").font = {
      name: "Arial",
      size: 11,
      underline: true,
      color: { argb: "FF483264" },
    };
    const colors: Record<string, [string, string]> = {
      "negative-strong": ["FFF5E7E7", "FF7C3E46"],
      negative: ["FFFCF2F1", "FF85464D"],
      neutral: ["FFF1EFF5", "FF5B526D"],
      positive: ["FFEFF6F0", "FF386550"],
      "positive-strong": ["FFE4EFE6", "FF315F48"],
    };
    result.cells.forEach((cell, index) => {
      const row = sheet.getRow(index + 6);
      row.height = 42;
      if (cell.observation?.status !== "bewertet") return;
      const symbol = row.getCell(4);
      const [background, foreground] =
        colors[RATING_GUIDE[cell.observation.symbol].tone];
      symbol.font = {
        name: "Consolas",
        size: 20,
        bold: true,
        color: { argb: foreground },
      };
      symbol.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: background },
      };
      symbol.alignment = { horizontal: "center", vertical: "middle" };
    });
    sheet.getCell("A1").font = { name: "Arial", size: 14, bold: true };
    sheet.getRow(1).height = textHeight(result.student.displayName, 134, 14);
    sheet.getRow(2).height = Math.max(
      44,
      textHeight(classRecord.name, 55),
      textHeight(classRecord.periodLabel, 37),
    );
    sheet.getRow(3).height = 32;
    sheet.getColumn(1).numFmt = "dd.mm.yyyy";
    sheet.getColumn(6).numFmt = "0.00";
    sheet.getCell("F3").numFmt = "0";
  }
  return new Uint8Array(await workbook.xlsx.writeBuffer());
}

export async function readClassXlsx(raw: ArrayBuffer): Promise<string[]> {
  assertXlsxResources(raw);
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(raw);
  } catch {
    throw new RangeError(
      "Diese Excel-Datei kann nicht gelesen werden. Verwende die Musterklassenliste als .xlsx oder .csv.",
    );
  }
  if (workbook.worksheets.length !== 1)
    throw new RangeError(
      "Die Klassenliste muss genau ein Tabellenblatt enthalten: Vorname und Nachname.",
    );
  const sheet = workbook.worksheets[0];
  if (sheet.rowCount > 46)
    throw new RangeError("Eine Klasse darf höchstens 45 Personen enthalten.");
  const rows: string[][] = [];
  sheet.eachRow((row, index) => {
    row.eachCell((cell, column) => {
      if (column > 2 && cell.type !== ExcelJS.ValueType.Null)
        throw new RangeError(
          `Zeile ${index}: Es sind nur Vorname und Nachname zulässig.`,
        );
    });
    const cells = [row.getCell(1), row.getCell(2)];
    if (
      cells.some(
        (cell) =>
          cell.type !== ExcelJS.ValueType.String &&
          cell.type !== ExcelJS.ValueType.Null,
      )
    )
      throw new RangeError(
        `Zeile ${index}: Bitte Namen als Text eingeben; Formeln sind nicht zulässig.`,
      );
    rows.push(cells.map((cell) => cell.text));
  });
  return namesFromRows(rows);
}
