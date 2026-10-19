import type { ClassRecord } from "../infrastructure/local/schema";
import type { Page } from "../infrastructure/local/workspacePosition";

export function AppNavigation({
  page,
  classes,
  classId,
  assessing,
  onPage,
  onClass,
}: {
  page: Page;
  classes: readonly ClassRecord[];
  classId: string | null;
  assessing: boolean;
  onPage: (page: Page) => void;
  onClass: (id: string) => void;
}) {
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
            ["hilfe", "Bewertung verstehen"],
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
      {classes.length > 0 && !assessing ? (
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
