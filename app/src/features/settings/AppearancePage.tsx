import { ACCENT_PRESETS } from "../../application/appearance";
import { CLASS_ORDERS } from "../../application/classOrder";
import type { UiPreferences } from "../../infrastructure/local/uiPreferences";

export function AppearancePage({
  preferences,
  onChange,
}: {
  preferences: UiPreferences;
  onChange: (patch: Partial<UiPreferences>) => void;
}) {
  return (
    <article className="card appearance-page">
      <h2>Darstellung und Klassenliste</h2>
      <p>
        Wähle deinen Farbton und die Reihenfolge deiner Klassen. Die Auswahl
        wird in diesem Browser gespeichert.
      </p>
      <fieldset className="color-picker">
        <legend>App-Farbe</legend>
        <div className="color-choices accent-choices">
          {ACCENT_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.color}
              aria-pressed={preferences.accent === preset.color}
              onClick={() => onChange({ accent: preset.color })}
            >
              <span
                className="color-swatch"
                style={{ background: preset.color }}
                aria-hidden="true"
              />
              {preset.label}
            </button>
          ))}
        </div>
        <label htmlFor="app-accent">Eigener Farbton</label>
        <div className="custom-accent">
          <input
            id="app-accent"
            type="color"
            autoComplete="off"
            name="app-accent"
            value={preferences.accent}
            onChange={(event) => onChange({ accent: event.target.value })}
          />
          <output htmlFor="app-accent">
            {preferences.accent.toUpperCase()}
          </output>
        </div>
        <p className="muted">
          Die Vorschau ändert sich sofort. Helle Farbtöne werden für Schrift und
          Schaltflächen dunkler abgestimmt, damit sie lesbar bleiben. Rot und
          Grün behalten ihre Bedeutung in der Bewertung.
        </p>
      </fieldset>
      <fieldset>
        <legend>Klassen sortieren</legend>
        <label htmlFor="appearance-class-order">Reihenfolge der Klassen</label>
        <select
          id="appearance-class-order"
          name="appearance-class-order"
          autoComplete="off"
          value={preferences.classOrder}
          onChange={(event) =>
            onChange({
              classOrder: event.target.value as UiPreferences["classOrder"],
            })
          }
        >
          {CLASS_ORDERS.map((order) => (
            <option key={order.id} value={order.id}>
              {order.label}
            </option>
          ))}
        </select>
        <p className="muted">
          Nach Stufe stehen zum Beispiel 7a, 7b, 8a und 10a zusammen. Bei „Am
          längsten nicht benutzt“ stehen noch nicht geöffnete Klassen zuerst.
          Die Reihenfolge richtet sich nach dem Öffnen einer Klasse, nicht nach
          ihrem letzten Bewertungsdatum.
        </p>
      </fieldset>
      <p>
        Die Farbe einer einzelnen Klasse wählst du in „Klasse bearbeiten“ unter
        „Klassenfarbe“.
      </p>
    </article>
  );
}
