import { buildClassReport } from "../../application/reporting";
import { formatGradeDecimal } from "../../domain/grading/gradeFormat";
import { hasVisibleLessonSequence } from "../../domain/sessions/lessonSequence";
import { observationLabel } from "../../features/presentation";
import type { ClassRecord } from "../local/schema";

function safeCell(value: string | number): string {
  let text = String(value);
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
function line(values: readonly (string | number)[]): string {
  return values.map(safeCell).join(";");
}

export function exportClassCsv(classRecord: ClassRecord): string {
  const report = buildClassReport(classRecord);
  const rows = [
    line([
      "Klasse",
      "Bewertungszeitraum",
      "Person",
      "Eintrag",
      "Datum",
      "Stunde",
      "Status",
      "Symbol",
      "Stand",
      "Puffer",
    ]),
  ];
  for (const result of report.students) {
    const common = [
      classRecord.name,
      classRecord.periodLabel,
      result.student.displayName,
    ];
    rows.push(
      line([
        ...common,
        "Start",
        "",
        "",
        "",
        "",
        formatGradeDecimal(result.start.gradeQuarterSteps),
        result.start.bufferPoints,
      ]),
    );
    for (const cell of result.cells)
      rows.push(
        line([
          ...common,
          "Unterrichtsstunde",
          cell.session.date,
          hasVisibleLessonSequence(report.sessions, cell.session.date)
            ? cell.session.lessonSequence
            : "",
          cell.observation?.status === "bewertet"
            ? "Bewertet"
            : observationLabel(cell.observation),
          cell.observation?.status === "bewertet"
            ? cell.observation.symbol
            : "",
          cell.after ? formatGradeDecimal(cell.after.gradeQuarterSteps) : "",
          cell.after?.bufferPoints ?? "",
        ]),
      );
    rows.push(
      line([
        ...common,
        "Aktuell",
        "",
        "",
        "",
        "",
        formatGradeDecimal(result.current.gradeQuarterSteps),
        result.current.bufferPoints,
      ]),
    );
  }
  return `\uFEFF${rows.join("\r\n")}\r\n`;
}
