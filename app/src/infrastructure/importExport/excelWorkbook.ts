import ExcelJS from "exceljs";
import { buildClassReport } from "../../application/reporting";
import { observationLabel } from "../../application/observationPresentation";
import { RATING_GUIDE } from "../../application/ratingGuide";
import type { ClassRecord } from "../local/schema";
import { namesFromRows } from "./classListRows";
import { assertXlsxResources } from "./xlsxResources";

export const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

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
  const summary = workbook.addWorksheet("Klassenübersicht");
  summary.addRow([classRecord.name]);
  summary.addRow(["Bewertungszeitraum", classRecord.periodLabel]);
  summary.addRow([
    "Berechneter Stand der mündlichen Mitarbeit. Die Endnote entscheidet die Lehrkraft.",
  ]);
  summary.mergeCells("A3:D3");
  summary.addRow([]);
  summary.addRow(["Person", "Startwert", "Aktueller Stand", "Puffer (max. 3)"]);
  report.students.forEach((result) =>
    summary.addRow([
      result.student.displayName,
      result.start.gradeQuarterSteps / 4,
      result.current.gradeQuarterSteps / 4,
      result.current.bufferPoints,
    ]),
  );
  styleSheet(summary, 5, [34, 23, 23, 23]);
  summary.getColumn(2).numFmt = "0.00";
  summary.getColumn(3).numFmt = "0.00";
  summary.getRow(3).height = 32;
  const used = new Set(["klassenübersicht"]);
  for (const result of report.students) {
    const sheet = workbook.addWorksheet(
      uniqueSheetName(result.student.displayName, used),
    );
    sheet.addRow([result.student.displayName]);
    sheet.addRow([
      "Klasse",
      classRecord.name,
      "Bewertungszeitraum",
      classRecord.periodLabel,
    ]);
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
    sheet.addRow([]);
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
        report.lessons.get(cell.session.id)!.showSequence
          ? cell.session.lessonSequence
          : null,
        cell.observation?.status === "bewertet"
          ? "Bewertet"
          : observationLabel(cell.observation),
        symbol || null,
        symbol ? RATING_GUIDE[symbol].meaning : null,
        cell.after ? cell.after.gradeQuarterSteps / 4 : null,
        cell.after?.bufferPoints ?? null,
      ]);
    }
    styleSheet(sheet, 5, [17, 12, 24, 12, 25, 25, 12]);
    sheet.getRow(1).height = 28;
    sheet.getRow(2).height = 44;
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
