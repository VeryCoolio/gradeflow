import { useRef } from "react";
import type { ClassRecord } from "../infrastructure/local/schema";
import type { Page } from "../infrastructure/local/workspacePosition";

export function AppNavigation({
  page,
  classes,
  classId,
  onPage,
  onClass,
  onTutorial,
}: {
  page: Page;
  classes: readonly ClassRecord[];
  classId: string | null;
  onPage: (page: Page) => void;
  onClass: (id: string) => void;
  onTutorial: () => void;
}) {
  const helpMenu = useRef<HTMLDetailsElement>(null);
  function openHelp(next: Page) {
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
            ["anlegen", "Klasse anlegen"],
            ["sicherung", "Datensicherung"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-current={page === key ? "page" : undefined}
            onClick={() => onPage(key)}
          >
            {label}
          </button>
        ))}
      </nav>
      <details className="help-menu" ref={helpMenu}>
        <summary>Hilfe und Einstieg</summary>
        <nav aria-label="Hilfe">
          <button type="button" onClick={() => openHelp("ueber")}>
            So funktioniert Gradeflow
          </button>
          <button type="button" onClick={() => openHelp("hilfe")}>
            Bewertung und Puffer erklärt
          </button>
          <button type="button" onClick={() => openHelp("daten")}>
            Wo sind meine Daten?
          </button>
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
