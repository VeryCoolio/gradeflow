import { useState } from "react";
import type { ClassReport } from "../../application/reporting";
import { formatGradeDecimal } from "../../domain/grading/gradeFormat";
import {
  observationLabel,
  observationShortLabel,
  observationTone,
} from "../../application/observationPresentation";

import {
  DEFAULT_TABLE_OPTIONS,
  type TableOptions,
} from "../../infrastructure/local/workspacePosition";

export function ClassTable({
  report,
  options,
  onOptionsChange,
}: {
  report: ClassReport;
  options?: TableOptions;
  onOptionsChange?: (options: TableOptions) => void;
}) {
  const [localOptions, setLocalOptions] = useState(DEFAULT_TABLE_OPTIONS);
  const settings = options ?? localOptions;
  const { compact, size, windowSize, page } = settings;
  function change(patch: Partial<TableOptions>) {
    const next = { ...settings, ...patch };
    if (onOptionsChange) onOptionsChange(next);
    else setLocalOptions(next);
  }
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
      <details className="table-options">
        <summary>Ansicht und Legende</summary>
        <div className="table-controls">
          <div className="table-modes" aria-label="Tabellenansicht">
            <button
              type="button"
              aria-pressed={compact}
              onClick={() => change({ compact: true })}
            >
              Kompakt
            </button>
            <button
              type="button"
              aria-pressed={!compact}
              onClick={() => change({ compact: false })}
            >
              Mit Notenverlauf
            </button>
          </div>
          <label>
            Stunden pro Ansicht
            <select
              value={windowSize}
              onChange={(event) => {
                change({
                  windowSize: Number(
                    event.target.value,
                  ) as TableOptions["windowSize"],
                  page: 0,
                });
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
              onChange={(event) =>
                change({ size: event.target.value as TableOptions["size"] })
              }
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
      </details>
      <p className="compact-legend">
        AW: abwesend · NB: nicht beobachtet · Offen: noch nicht erfasst
      </p>
      <div className="table-pagination">
        <button
          type="button"
          disabled={start === 0}
          onClick={() => change({ page: currentPage + 1 })}
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
          onClick={() => change({ page: currentPage - 1 })}
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
                  <small>{session.lessonSequence}. Stunde</small>
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
