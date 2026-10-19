import type { ClassReport } from "../../application/reporting";
import { formatGradeDecimal } from "../../domain/grading/gradeFormat";
import {
  observationLabel,
  observationShortLabel,
} from "../../application/observationPresentation";

const SESSION_SPACING = 112;

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
  const index = report.students.indexOf(row);
  const width = Math.max(660, report.sessions.length * SESSION_SPACING + 105);
  // Identische Datumsachse für alle Personen, einschließlich unbewerteter Stunden.
  const x = (index: number) => 60 + index * SESSION_SPACING;
  const y = (quarterSteps: number) => 30 + (quarterSteps - 4) * 9;
  const points = [
    {
      x: x(0),
      y: y(row.start.gradeQuarterSteps),
      label: `Start: ${formatGradeDecimal(row.start.gradeQuarterSteps)}`,
    },
    ...row.cells.flatMap((cell, index) =>
      cell.after
        ? [
            {
              x: x(index + 1),
              y: y(cell.after.gradeQuarterSteps),
              label: `${report.lessons.get(cell.session.id)!.label}: ${formatGradeDecimal(cell.after.gradeQuarterSteps)}`,
            },
          ]
        : [],
    ),
  ];
  return (
    <section className="card">
      <h2>Verlauf</h2>
      <label htmlFor="history-student">Person</label>
      <div className="person-navigation">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onStudentChange(report.students[index - 1].student.id)}
        >
          Vorherige Person
        </button>
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
        <button
          type="button"
          disabled={index === report.students.length - 1}
          onClick={() => onStudentChange(report.students[index + 1].student.id)}
        >
          Nächste Person
        </button>
      </div>
      <p>
        <strong>{row.student.displayName}</strong> · Aktueller Stand:{" "}
        {formatGradeDecimal(row.current.gradeQuarterSteps)} · Puffer:{" "}
        {row.current.bufferPoints}/3
      </p>
      <p className="muted">
        Jede Unterrichtsstunde hat denselben horizontalen Abstand, bei allen
        Personen. Die Linie verbindet ausschließlich bewertete Stunden. AW =
        abwesend, NB = nicht beobachtet, Offen = noch nicht erfasst.
      </p>
      {!row.cells.some((cell) => cell.after) ? (
        <p className="feedback">
          Noch keine bewertete Stunde: Der Startwert bleibt bestehen.
        </p>
      ) : null}
      <div
        className="chart-scroll"
        role="region"
        aria-label={`Notenverlauf von ${row.student.displayName}`}
        tabIndex={0}
      >
        <svg
          width={width}
          height="315"
          viewBox={`0 0 ${width} 315`}
          role="img"
          aria-label={`Notenverlauf von ${row.student.displayName}: Start ${formatGradeDecimal(row.start.gradeQuarterSteps)}, aktuell ${formatGradeDecimal(row.current.gradeQuarterSteps)}`}
        >
          {Array.from({ length: 6 }, (_, index) => (
            <g key={index}>
              <line
                x1="48"
                x2={width - 25}
                y1={y((index + 1) * 4)}
                y2={y((index + 1) * 4)}
                stroke="#d9e3df"
              />
              <text
                x="15"
                y={y((index + 1) * 4) + 4}
                fontSize="12"
                fill="#3c5b67"
              >
                {index + 1}
              </text>
            </g>
          ))}
          <polyline
            points={points.map((point) => `${point.x},${point.y}`).join(" ")}
            fill="none"
            stroke="#176d58"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {points.map((point, index) => (
            <circle key={index} cx={point.x} cy={point.y} r="5" fill="#176d58">
              <title>{point.label}</title>
            </circle>
          ))}
          <text
            x={x(0)}
            y="263"
            textAnchor="middle"
            fontSize="12"
            fill="#3c5b67"
          >
            Start
          </text>
          {row.cells.map((cell, index) => (
            <g key={cell.session.id}>
              <line
                x1={x(index + 1)}
                x2={x(index + 1)}
                y1="222"
                y2="230"
                stroke="#536b75"
              />
              {!cell.after ? (
                <text
                  x={x(index + 1)}
                  y="240"
                  textAnchor="middle"
                  fontSize="11"
                  fill="#536b75"
                  aria-label={observationLabel(cell.observation)}
                >
                  <title>{`${report.lessons.get(cell.session.id)!.label}: ${observationLabel(cell.observation)}`}</title>
                  {observationShortLabel(cell.observation)}
                </text>
              ) : null}
              <text
                x={x(index + 1)}
                y="263"
                textAnchor="middle"
                fontSize="12"
                fill="#3c5b67"
                data-session-id={cell.session.id}
              >
                {cell.session.date.split("-").reverse().join(".")}
              </text>
              {report.lessons.get(cell.session.id)!.showSequence ? (
                <text
                  x={x(index + 1)}
                  y="281"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#3c5b67"
                >
                  {cell.session.lessonSequence}. Stunde
                </text>
              ) : null}
            </g>
          ))}
        </svg>
      </div>
      <h3>Bewertungen nach Datum</h3>
      <div
        className="table-scroll"
        role="region"
        aria-label={`Bewertungen nach Datum von ${row.student.displayName}`}
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              <th scope="col">Datum / Stunde</th>
              <th scope="col">Einschätzung</th>
              <th scope="col">Stand nach Bewertung</th>
              <th scope="col">Puffer</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Start</th>
              <td>Ausgangswert</td>
              <td>{formatGradeDecimal(row.start.gradeQuarterSteps)}</td>
              <td>0/3</td>
            </tr>
            {row.cells.map((cell) => (
              <tr key={cell.session.id}>
                <th scope="row">
                  {report.lessons.get(cell.session.id)!.label}
                </th>
                <td>{observationLabel(cell.observation)}</td>
                <td>
                  {cell.after
                    ? formatGradeDecimal(cell.after.gradeQuarterSteps)
                    : "Keine Bewertung"}
                </td>
                <td>{cell.after ? `${cell.after.bufferPoints}/3` : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
