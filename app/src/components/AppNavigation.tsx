import { useRef, type MouseEvent } from "react";
import type { ClassRecord } from "../infrastructure/local/schema";
import type { Page } from "../infrastructure/local/workspacePosition";

export function AppNavigation({
  page,
  hrefForPage,
  classes,
  classId,
  onPage,
  onClass,
  onTutorial,
  onHelpOpen,
}: {
  page: Page;
  hrefForPage: (page: Page) => string;
  classes: readonly ClassRecord[];
  classId: string | null;
  onPage: (page: Page) => void;
  onClass: (id: string) => void;
  onTutorial: () => void;
  onHelpOpen?: () => void;
}) {
  const helpMenu = useRef<HTMLDetailsElement>(null);
  function navigate(event: MouseEvent<HTMLAnchorElement>, next: Page) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    if (helpMenu.current) helpMenu.current.open = false;
    onPage(next);
  }
  return (
    <header className="app-navigation">
      <div className="app-brand">
        <p className="eyebrow">Gradeflow</p>
        <h1>Mündliche Mitarbeit</h1>
      </div>
      <nav className="primary-nav" aria-label="Hauptseiten">
        {(
          [
            ["klasse", "Meine Klassen"],
            ["anlegen", "Klasse anlegen / importieren"],
            ["sicherung", "Datensicherung"],
          ] as const
        ).map(([key, label]) => (
          <a
            key={key}
            className="button-link"
            href={hrefForPage(key)}
            data-tour={`page-${key}`}
            aria-current={page === key ? "page" : undefined}
            onClick={(event) => navigate(event, key)}
          >
            {label}
          </a>
        ))}
      </nav>
      <details
        className="help-menu"
        ref={helpMenu}
        onToggle={(event) => {
          if (event.currentTarget.open) onHelpOpen?.();
        }}
      >
        <summary data-tour="help-menu" aria-label="Hilfe und Einstieg">
          <span className="help-full">Hilfe und Einstieg</span>
          <span className="help-short" aria-hidden="true">
            Hilfe
          </span>
        </summary>
        <nav aria-label="Hilfe">
          <a
            className="button-link"
            href={hrefForPage("ueber")}
            data-tour="page-ueber"
            onClick={(event) => navigate(event, "ueber")}
          >
            So funktioniert Gradeflow
          </a>
          <a
            className="button-link"
            href={hrefForPage("hilfe")}
            onClick={(event) => navigate(event, "hilfe")}
          >
            Bewertung und Puffer erklärt
          </a>
          <a
            className="button-link"
            href={hrefForPage("daten")}
            onClick={(event) => navigate(event, "daten")}
          >
            Wo sind meine Daten?
          </a>
          <a
            className="button-link"
            href={hrefForPage("darstellung")}
            onClick={(event) => navigate(event, "darstellung")}
          >
            Darstellung und Farben
          </a>
          <button
            type="button"
            onClick={() => {
              if (helpMenu.current) helpMenu.current.open = false;
              onTutorial();
            }}
          >
            Tutorial starten
          </button>
        </nav>
      </details>
      {classes.length > 0 ? (
        <div className="class-picker">
          <label htmlFor="current-class">Klasse auswählen</label>
          <select
            id="current-class"
            value={classId ?? ""}
            onChange={(event) => onClass(event.target.value)}
          >
            {classes.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name} · {group.periodLabel}
                {group.archived ? " · archiviert" : ""}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </header>
  );
}
