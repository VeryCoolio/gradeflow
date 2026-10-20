import { CLASS_ORDERS, type ClassOrder } from "../application/classOrder";
import { classColorStyle, CLASS_COLORS } from "../domain/classes/classColor";
import { useState, type CSSProperties } from "react";
import type { ClassRecord } from "../infrastructure/local/schema";

export function ClassSwitcher({
  classOrder,
  onOrder,
  classes,
  classId,
  onClass,
  onColorSettings,
  colorSettingsHref,
}: {
  classOrder: ClassOrder;
  onOrder: (order: ClassOrder) => void;
  classes: readonly ClassRecord[];
  classId: string | null;
  onClass: (id: string) => void;
  onColorSettings: () => void;
  colorSettingsHref: string;
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
      <label htmlFor="class-order">Klassen sortieren</label>
      <select
        id="class-order"
        name="class-order"
        autoComplete="off"
        value={classOrder}
        onChange={(event) => onOrder(event.target.value as ClassOrder)}
      >
        {CLASS_ORDERS.map((order) => (
          <option key={order.id} value={order.id}>
            {order.label}
          </option>
        ))}
      </select>
      <nav className="class-register" aria-label="Klasse wechseln">
        {filtered.map((group) => (
          <button
            key={group.id}
            type="button"
            data-tour-class={group.id}
            data-class-color={group.color ?? "none"}
            style={classColorStyle(group.color) as CSSProperties}
            title={
              group.color && group.color !== "none"
                ? `Klassenfarbe: ${CLASS_COLORS.find((color) => color.id === group.color)?.label}`
                : undefined
            }
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
      {classId ? (
        <a
          href={colorSettingsHref}
          className="button-link text-button sidebar-color-action"
          onClick={(event) => {
            if (
              event.button !== 0 ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            )
              return;
            event.preventDefault();
            onColorSettings();
          }}
        >
          Klassenfarbe ändern
        </a>
      ) : null}
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
