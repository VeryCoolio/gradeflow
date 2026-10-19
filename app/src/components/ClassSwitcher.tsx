import { useState } from "react";
import type { ClassRecord } from "../infrastructure/local/schema";

export function ClassSwitcher({
  classes,
  classId,
  onClass,
}: {
  classes: readonly ClassRecord[];
  classId: string | null;
  onClass: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = classes.filter((group) =>
    `${group.name} ${group.periodLabel}`
      .toLocaleLowerCase("de")
      .includes(search.toLocaleLowerCase("de")),
  );
  return (
    <aside className="class-sidebar" aria-label="Klassenregister">
      <h2>
        Meine Klassen <small>({classes.length})</small>
      </h2>
      <label htmlFor="class-search">Klasse suchen</label>
      <input
        id="class-search"
        type="search"
        autoComplete="off"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Name oder Zeitraum …"
      />
      <nav className="class-register" aria-label="Klasse wechseln">
        {filtered.map((group) => (
          <button
            key={group.id}
            type="button"
            aria-pressed={group.id === classId}
            onClick={() => onClass(group.id)}
          >
            <strong>{group.name}</strong>
            <small>
              {group.periodLabel}
              {group.archived ? " · archiviert" : ""}
            </small>
          </button>
        ))}
      </nav>
      {!filtered.length ? (
        <p className="muted">
          {classes.length
            ? "Keine passende Klasse."
            : "Noch keine Klasse angelegt."}
        </p>
      ) : null}
      <p className="sidebar-note">
        Bereits gespeicherte Eingaben bleiben beim Klassenwechsel erhalten.
      </p>
    </aside>
  );
}
