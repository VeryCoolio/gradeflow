import type { ClassReport } from "../../application/reporting";
import { formatGradeDecimal } from "../../domain/grading/gradeFormat";
import {
  observationLabel,
  observationTone,
  sessionLabel,
} from "../presentation";

export function ClassTable({ report }: { report: ClassReport }) {
  return (
    <section className="card">
      <h2>Stundentabelle</h2>
      <p className="muted">
        Jede Spalte zeigt eine Unterrichtsstunde. Ein leerer Eintrag ist
        ausdrücklich als „Offen“ gekennzeichnet.
      </p>
      <div
        className="table-scroll"
        role="region"
        aria-label="Stundentabelle"
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              <th scope="col">Person</th>
              <th scope="col">Start</th>
              {report.sessions.map((session) => (
                <th key={session.id} scope="col">
                  {sessionLabel(session, report.sessions)}
                </th>
              ))}
              <th scope="col">Aktuell</th>
              <th scope="col">Puffer</th>
            </tr>
          </thead>
          <tbody>
            {report.students.map((row) => (
              <tr key={row.student.id}>
                <th scope="row">{row.student.displayName}</th>
                <td>{formatGradeDecimal(row.start.gradeQuarterSteps)}</td>
                {row.cells.map((cell) => (
                  <td key={cell.session.id}>
                    <span
                      className={`observation-badge ${observationTone(cell.observation)}`}
                    >
                      {observationLabel(cell.observation)}
                    </span>
                    {cell.after ? (
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
                <td>
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
