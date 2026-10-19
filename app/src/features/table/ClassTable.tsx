import { useState } from "react";
import type { ClassReport } from "../../application/reporting";
import { formatGradeDecimal } from "../../domain/grading/gradeFormat";
import {
  observationLabel,
  observationShortLabel,
  observationTone,
} from "../../application/observationPresentation";

export function ClassTable({ report }: { report: ClassReport }) {
  const [compact, setCompact] = useState(true);
  const [size, setSize] = useState("normal");
  const [windowSize, setWindowSize] = useState(10);
  const [page, setPage] = useState(0);
  const total = report.sessions.length;
  const pageSize = windowSize || Math.max(1, total);
  const currentPage = Math.min(
    page,
    Math.max(0, Math.ceil(total / pageSize) - 1),
  );
  const end = total - currentPage * pageSize;
  const start = Math.max(0, end - pageSize);
  const sessions = report.sessions.slice(start, end);
  return (
    <section className="card class-table">
      <h2>Stundentabelle</h2>
      <div className="table-controls">
        <div className="table-modes" aria-label="Tabellenansicht">
          <button
            type="button"
            aria-pressed={compact}
            onClick={() => setCompact(true)}
          >
            Kompakt
          </button>
          <button
            type="button"
            aria-pressed={!compact}
            onClick={() => setCompact(false)}
          >
            Mit Notenverlauf
          </button>
        </div>
        <label>
          Stunden pro Ansicht
          <select
            value={windowSize}
            onChange={(event) => {
              setWindowSize(Number(event.target.value));
              setPage(0);
            }}
          >
            <option value={10}>10 Stunden</option>
            <option value={20}>20 Stunden</option>
            <option value={0}>Alle Stunden</option>
          </select>
        </label>
        <label>
          Tabellengröße
          <select
            value={size}
            onChange={(event) => setSize(event.target.value)}
          >
            <option value="small">Klein</option>
            <option value="normal">Normal</option>
            <option value="large">Groß</option>
          </select>
        </label>
      </div>
      <p className="table-legend">
        <strong>AW</strong> Abwesend · <strong>NB</strong> Nicht beobachtet ·{" "}
        <strong>Offen</strong> Noch nicht erfasst. 0 ist eine bewertete Stunde
        ohne Änderung. Der aktuelle Stand berücksichtigt immer alle Stunden.
      </p>
      <div className="table-pagination">
        <button
          type="button"
          disabled={start === 0}
          onClick={() => setPage(currentPage + 1)}
        >
          Ältere Stunden
        </button>
        <p role="status">
          {total
            ? `Stunden ${start + 1}–${end} von ${total}`
            : "Noch keine Stunden"}
        </p>
        <button
          type="button"
          disabled={currentPage === 0}
          onClick={() => setPage(currentPage - 1)}
        >
          Neuere Stunden
        </button>
      </div>
      <div
        className={`table-scroll class-report-scroll table-size-${size} ${compact ? "compact-table" : "detailed-table"}`}
        role="region"
        aria-label="Stundentabelle"
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              <th scope="col" className="person-column">
                Person
              </th>
              <th scope="col">Start</th>
              {sessions.map((session) => (
                <th
                  key={session.id}
                  scope="col"
                  aria-label={report.lessons.get(session.id)!.label}
                >
                  <time dateTime={session.date}>
                    {session.date.slice(2).split("-").reverse().join(".")}
                  </time>
                  {report.lessons.get(session.id)!.showSequence ? (
                    <small>{session.lessonSequence}. Stunde</small>
                  ) : null}
                </th>
              ))}
              <th scope="col" className="current-column">
                Aktuell
              </th>
              <th scope="col">Puffer</th>
            </tr>
          </thead>
          <tbody>
            {report.students.map((row) => (
              <tr key={row.student.id}>
                <th scope="row" className="person-column">
                  {row.student.displayName}
                </th>
                <td>{formatGradeDecimal(row.start.gradeQuarterSteps)}</td>
                {row.cells.slice(start, end).map((cell) => (
                  <td key={cell.session.id}>
                    <span
                      className={`observation-code ${observationTone(cell.observation)}`}
                      aria-label={observationLabel(cell.observation)}
                      title={observationLabel(cell.observation)}
                    >
                      {compact
                        ? observationShortLabel(cell.observation)
                        : observationLabel(cell.observation)}
                    </span>
                    {!compact && cell.after ? (
                      <small>
                        Stand:{" "}
                        {formatGradeDecimal(cell.after.gradeQuarterSteps)}
                        {cell.after.bufferPoints > 0
                          ? ` · Puffer ${cell.after.bufferPoints}/3`
                          : ""}
                      </small>
                    ) : null}
                  </td>
                ))}
                <td className="current-column">
                  <strong>
                    {formatGradeDecimal(row.current.gradeQuarterSteps)}
                  </strong>
                </td>
                <td>{row.current.bufferPoints}/3</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
