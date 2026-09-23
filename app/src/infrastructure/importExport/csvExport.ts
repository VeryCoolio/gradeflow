import { buildClassReport } from "../../application/reporting";
import { formatGradeDecimal } from "../../domain/grading/gradeFormat";
import type { ClassRecord } from "../local/schema";

const HEADER = [
  "formatVersion",
  "classId",
  "className",
  "periodLabel",
  "studentId",
  "studentName",
  "rowType",
  "sessionId",
  "date",
  "lessonSequence",
  "status",
  "symbol",
  "gradeQuarterSteps",
  "gradeDecimal",
  "bufferPoints",
] as const;

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
  const rows: string[] = [line(HEADER)];
  for (const result of report.students) {
    const common = [
      1,
      classRecord.id,
      classRecord.name,
      classRecord.periodLabel,
      result.student.id,
      result.student.displayName,
    ];
    rows.push(
      line([
        ...common,
        "start",
        "",
        "",
        "",
        "",
        "",
        result.start.gradeQuarterSteps,
        formatGradeDecimal(result.start.gradeQuarterSteps),
        result.start.bufferPoints,
      ]),
    );
    for (const cell of result.cells) {
      const observation = cell.observation;
      rows.push(
        line([
          ...common,
          "session",
          cell.session.id,
          cell.session.date,
          cell.session.lessonSequence,
          observation?.status ?? "offen",
          observation?.status === "bewertet" ? observation.symbol : "",
          cell.after?.gradeQuarterSteps ?? "",
          cell.after ? formatGradeDecimal(cell.after.gradeQuarterSteps) : "",
          cell.after?.bufferPoints ?? "",
        ]),
      );
    }
    rows.push(
      line([
        ...common,
        "current",
        "",
        "",
        "",
        "",
        "",
        result.current.gradeQuarterSteps,
        formatGradeDecimal(result.current.gradeQuarterSteps),
        result.current.bufferPoints,
      ]),
    );
  }
  return `\uFEFF${rows.join("\r\n")}\r\n`;
}
