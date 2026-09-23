import type { ClassReport } from "../../application/reporting";
import { formatGradeDecimal } from "../../domain/grading/gradeFormat";
import { observationLabel, sessionLabel } from "../presentation";

export function StudentHistory({
  report,
  studentId,
  onStudentChange,
}: {
  report: ClassReport;
  studentId: string;
  onStudentChange: (id: string) => void;
}) {
  const row =
    report.students.find((student) => student.student.id === studentId) ??
    report.students[0];
  if (!row) return null;
  const width = Math.max(560, (report.sessions.length + 1) * 72 + 80);
  const x = (index: number) => 50 + index * 72;
  const y = (quarterSteps: number) => 30 + (quarterSteps - 4) * 9;
  const points = [
    { x: x(0), y: y(row.start.gradeQuarterSteps), label: "Start: 2,00" },
    ...row.cells.flatMap((cell, index) =>
      cell.after
        ? [
            {
              x: x(index + 1),
              y: y(cell.after.gradeQuarterSteps),
              label: `${sessionLabel(cell.session, report.sessions)}: ${formatGradeDecimal(cell.after.gradeQuarterSteps)}`,
            },
          ]
        : [],
    ),
  ];
  return (
    <section className="card">
      <h2>Verlauf</h2>
      <label htmlFor="history-student">Person</label>
      <select
        id="history-student"
        value={row.student.id}
        onChange={(event) => onStudentChange(event.target.value)}
      >
        {report.students.map((student) => (
          <option key={student.student.id} value={student.student.id}>
            {student.student.displayName}
          </option>
        ))}
      </select>
      <p className="muted">
        Die Linie verbindet nur bewertete Stunden. Abwesenheit, Nichtbeobachtung
        und offene Einträge erscheinen in der Ereignisliste.
      </p>
      <div
        className="chart-scroll"
        role="region"
        aria-label={`Notenverlauf von ${row.student.displayName}`}
        tabIndex={0}
      >
        <svg
          width={width}
          height="250"
          viewBox={`0 0 ${width} 250`}
          role="img"
          aria-label={`Notenverlauf von ${row.student.displayName}: Start ${formatGradeDecimal(row.start.gradeQuarterSteps)}, aktuell ${formatGradeDecimal(row.current.gradeQuarterSteps)}`}
        >
          {Array.from({ length: 6 }, (_, index) => {
            const grade = index + 1;
            const position = y(grade * 4);
            return (
              <g key={grade}>
                <line
                  x1="48"
                  x2={width - 25}
                  y1={position}
                  y2={position}
                  stroke="#d9e3df"
                />
                <text x="15" y={position + 4} fontSize="12" fill="#3c5b67">
                  {grade}
                </text>
              </g>
            );
          })}
          <polyline
            points={points.map((point) => `${point.x},${point.y}`).join(" ")}
            fill="none"
            stroke="#176d58"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {points.map((point, index) => (
            <circle
              key={`${point.label}-${index}`}
              cx={point.x}
              cy={point.y}
              r="5"
              fill="#176d58"
            >
              <title>{point.label}</title>
            </circle>
          ))}
        </svg>
      </div>
      <h3>Ereignisse</h3>
      <ol className="history-events">
        <li>
          <strong>Start</strong>
          <span>{formatGradeDecimal(row.start.gradeQuarterSteps)}</span>
        </li>
        {row.cells.map((cell) => (
          <li key={cell.session.id}>
            <strong>{sessionLabel(cell.session, report.sessions)}</strong>
            <span>
              {observationLabel(cell.observation)}
              {cell.after
                ? ` · Stand ${formatGradeDecimal(cell.after.gradeQuarterSteps)} · Puffer ${cell.after.bufferPoints}/3`
                : ""}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
