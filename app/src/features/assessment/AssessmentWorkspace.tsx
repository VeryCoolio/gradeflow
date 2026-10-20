import { countLabel } from "../../application/countLabel";
import { useEffect, useRef, useState } from "react";
import { applyRating } from "../../domain/grading/gradingEngine";
import { formatGradeDecimal } from "../../domain/grading/gradeFormat";
import {
  RATING_SYMBOLS,
  type GradeState,
  type Observation,
} from "../../domain/grading/types";
import { observationFor } from "../../domain/sessions/observations";
import type { LessonSession } from "../../domain/sessions/types";
import type {
  ClassRecord,
  StudentRecord,
} from "../../infrastructure/local/schema";
import {
  observationLabel,
  sessionAssessmentSummary,
} from "../../application/observationPresentation";
import { RATING_GUIDE } from "./RatingGuide";

interface Props {
  initialReview?: boolean;
  group: ClassRecord;
  session: LessonSession;
  student: StudentRecord;
  before: GradeState;
  label: string;
  canWrite: boolean;
  error: string;
  notice: string;
  canRetry: boolean;
  onRetry: () => void;
  onSelect: (id: string) => void;
  onRecord: (observation: Observation, clicks: number) => void;
  onLeave: () => void;
  onRemove: () => void;
  onDiscard: () => void;
}

export function AssessmentWorkspace({
  initialReview = false,
  group,
  session,
  student,
  before,
  label,
  canWrite,
  error,
  notice,
  canRetry,
  onRetry,
  onSelect,
  onRecord,
  onLeave,
  onRemove,
  onDiscard,
}: Props) {
  const [wide, setWide] = useState(
    () => window.matchMedia?.("(min-width: 900px)").matches ?? true,
  );
  const [reviewing, setReviewing] = useState(initialReview);
  const dialog = useRef<HTMLDialogElement>(null);
  const completion = useRef<HTMLButtonElement>(null);
  const context = useRef<HTMLDivElement>(null);
  const firstRating = useRef<HTMLButtonElement>(null);
  const captured = Object.keys(session.observations).length;
  const complete = captured === group.students.length;
  const selected = observationFor(session, student.id);

  useEffect(() => {
    const media = window.matchMedia?.("(min-width: 900px)");
    if (!media) return;
    const update = () => {
      setWide(media.matches);
      dialog.current?.close();
    };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (complete && !error && !reviewing) {
      completion.current?.focus();
      completion.current?.scrollIntoView?.({ block: "center" });
    }
  }, [complete, error, reviewing]);

  const roster = (
    <section className="student-list" aria-label="Personen dieser Stunde">
      <h3>
        Personen · {captured}/{group.students.length}
      </h3>
      {group.students.map((person, index) => (
        <button
          key={person.id}
          type="button"
          className={person.id === student.id ? "selected" : ""}
          aria-current={person.id === student.id ? "step" : undefined}
          onClick={() => {
            onSelect(person.id);
            dialog.current?.close();
            queueMicrotask(() => {
              firstRating.current?.focus();
              context.current?.scrollIntoView?.({ block: "start" });
            });
          }}
        >
          <span>
            {index + 1}. {person.displayName}
          </span>
          <small>{observationLabel(observationFor(session, person.id))}</small>
        </button>
      ))}
    </section>
  );

  if (complete && !error && !reviewing)
    return (
      <section
        className="card completion-panel completion-summary"
        aria-label="Stundenabschluss"
      >
        <p className="eyebrow">Stunde vollständig</p>
        <h2>Alle Eingaben sind lokal gespeichert</h2>
        <p className="completion-context">
          <strong>{group.name}</strong> · {label}
        </p>
        <p>
          {captured === 1 ? "Die Person ist" : `Alle ${captured} Personen sind`}{" "}
          erfasst. Die Erfassung dieser Stunde ist abgeschlossen.
        </p>
        <dl className="completion-counts">
          <div>
            <dt>Bewertet</dt>
            <dd>
              {
                Object.values(session.observations).filter(
                  (o) => o.status === "bewertet",
                ).length
              }
            </dd>
          </div>
          <div>
            <dt>Abwesend</dt>
            <dd>
              {
                Object.values(session.observations).filter(
                  (o) => o.status === "abwesend",
                ).length
              }
            </dd>
          </div>
          <div>
            <dt>Nicht beobachtet</dt>
            <dd>
              {
                Object.values(session.observations).filter(
                  (o) => o.status === "nicht_beobachtet",
                ).length
              }
            </dd>
          </div>
        </dl>
        <p>{sessionAssessmentSummary(session)}</p>
        <button
          className="primary"
          type="button"
          ref={completion}
          data-tour="lesson-complete"
          onClick={onLeave}
        >
          Zur Klassenübersicht
        </button>
        <div className="completion-review">
          <p>Du möchtest eine Eingabe korrigieren?</p>
          <button type="button" onClick={() => setReviewing(true)}>
            Eingaben prüfen oder korrigieren
          </button>
        </div>
      </section>
    );

  return (
    <div className="assessment-workspace">
      <button
        className="text-button assessment-back"
        type="button"
        onClick={onLeave}
      >
        ← Zur Klasse
      </button>
      {complete ? (
        <div className="review-notice">
          <p>Du prüfst eine bereits vollständig erfasste Stunde.</p>
          <button type="button" onClick={() => setReviewing(false)}>
            Zur Abschlussübersicht
          </button>
        </div>
      ) : null}
      <div className="assessment-layout">
        <section
          className="card grading-panel"
          onFocusCapture={(event) => {
            if (context.current?.contains(event.target)) return;
            const top = event.target.getBoundingClientRect().top;
            const bottom = context.current?.getBoundingClientRect().bottom ?? 0;
            if (top < bottom) window.scrollBy({ top: top - bottom - 12 });
          }}
        >
          <div className="assessment-context assessment-header" ref={context}>
            <div className="lesson-context">
              <div>
                <p className="eyebrow">{group.name}</p>
                <h2>{label}</h2>
              </div>
              <p
                className="assessment-progress"
                aria-live="polite"
                aria-atomic="true"
              >
                {captured} von{" "}
                {countLabel(group.students.length, "Person", "Personen")}{" "}
                erfasst
              </p>
            </div>
            <progress
              max={group.students.length}
              value={captured}
              aria-label="Erfasste Personen"
            >
              {captured} von {group.students.length}
            </progress>
            <div className="assessment-person">
              <h3 aria-live="polite" aria-atomic="true">
                {student.displayName}
              </h3>
              <p className="observation-status">
                Gewählter Status: <strong>{observationLabel(selected)}</strong>
              </p>
            </div>
            <div className="person-context">
              <p className="current-grade">
                Stand vor dieser Stunde:{" "}
                <strong>{formatGradeDecimal(before.gradeQuarterSteps)}</strong>
                <small> · Puffer {before.bufferPoints}/3</small>
              </p>
            </div>
            {error ? (
              <div className="feedback error" role="alert">
                {canRetry ? (
                  <>
                    <p>Die Eingabe wurde nicht gespeichert.</p>
                    <details>
                      <summary>Fehlerdetails</summary>
                      <p>{error}</p>
                    </details>
                  </>
                ) : (
                  <p>{error}</p>
                )}
                {canRetry && canWrite ? (
                  <button type="button" onClick={onRetry}>
                    Eingabe erneut speichern
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="save-status" role="status">
                {notice ||
                  (canWrite
                    ? "Jede Auswahl wird sofort lokal gespeichert."
                    : "Nur zur Ansicht · Eingaben sind gesperrt.")}
              </p>
            )}
          </div>
          <fieldset disabled={!canWrite} className="assessment-ratings">
            <legend>Mitarbeit dieser Stunde relativ zum Stand</legend>
            <div className="rating-grid">
              {RATING_SYMBOLS.map((symbol, index) => {
                const result = applyRating(before, symbol);
                return (
                  <button
                    key={symbol}
                    ref={index === 0 ? firstRating : undefined}
                    type="button"
                    aria-label={symbol}
                    aria-describedby={`rating-${symbol} rating-result-${symbol} rating-buffer-${symbol}`}
                    className={`rating-option ${RATING_GUIDE[symbol].tone}`}
                    aria-pressed={
                      selected?.status === "bewertet" &&
                      selected.symbol === symbol
                    }
                    onClick={(event) =>
                      onRecord({ status: "bewertet", symbol }, event.detail)
                    }
                  >
                    <strong>{symbol}</strong>
                    <span className="rating-meaning" id={`rating-${symbol}`}>
                      {RATING_GUIDE[symbol].meaning}
                    </span>
                    <span
                      className="rating-result"
                      id={`rating-result-${symbol}`}
                    >
                      <small>Ergebnis</small>
                      <b>{formatGradeDecimal(result.gradeQuarterSteps)}</b>
                    </span>
                    <small
                      className="rating-buffer"
                      id={`rating-buffer-${symbol}`}
                    >
                      Puffer {result.bufferPoints}/3
                    </small>
                  </button>
                );
              })}
            </div>
          </fieldset>
          <fieldset disabled={!canWrite}>
            <legend>Ohne Bewertung dokumentieren</legend>
            <div className="status-grid">
              <button
                type="button"
                aria-pressed={selected?.status === "abwesend"}
                onClick={(event) =>
                  onRecord({ status: "abwesend" }, event.detail)
                }
              >
                Abwesend
              </button>
              <button
                type="button"
                aria-pressed={selected?.status === "nicht_beobachtet"}
                onClick={(event) =>
                  onRecord({ status: "nicht_beobachtet" }, event.detail)
                }
              >
                Nicht beobachtet
              </button>
            </div>
          </fieldset>
          <div className="assessment-tools actions">
            {!wide ? (
              <button type="button" onClick={() => dialog.current?.showModal()}>
                Person wählen
              </button>
            ) : null}
            {selected ? (
              <button
                type="button"
                disabled={!canWrite}
                className="remove-observation"
                onClick={onRemove}
              >
                Eintrag entfernen
              </button>
            ) : null}
          </div>
        </section>
        {wide ? (
          <aside className="card assessment-roster">{roster}</aside>
        ) : (
          <dialog
            className="person-dialog"
            ref={dialog}
            aria-labelledby="person-dialog-title"
          >
            <div className="dialog-heading">
              <h2 id="person-dialog-title">Person wählen</h2>
              <button type="button" onClick={() => dialog.current?.close()}>
                Schließen
              </button>
            </div>
            {roster}
          </dialog>
        )}
      </div>
      {!complete ? (
        <section className="discard-area">
          <button type="button" disabled={!canWrite} onClick={onDiscard}>
            Laufende Stunde verwerfen
          </button>
          <p>
            Nur nach Bestätigung. Bereits erfasste Eingaben dieser Stunde gehen
            dabei verloren.
          </p>
        </section>
      ) : null}
    </div>
  );
}
