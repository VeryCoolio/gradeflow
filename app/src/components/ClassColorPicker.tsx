import type { CSSProperties } from "react";
import {
  CLASS_COLORS,
  type ClassColor,
  classColorStyle,
} from "../domain/classes/classColor";

export function ClassColorPicker({
  value,
  disabled,
  onChange,
}: {
  value?: ClassColor;
  disabled: boolean;
  onChange: (color: ClassColor) => void;
}) {
  return (
    <fieldset className="color-picker" disabled={disabled}>
      <legend>Klassenfarbe</legend>
      <p className="muted">
        Sanfte Farben helfen dir, Klassen im Register wiederzufinden. Du kannst
        zum Beispiel allen Klassen einer Stufe dieselbe Farbe geben.
      </p>
      <div className="color-choices">
        {CLASS_COLORS.map((color) => (
          <button
            type="button"
            key={color.id}
            style={classColorStyle(color.id) as CSSProperties}
            aria-pressed={(value ?? "none") === color.id}
            onClick={() => onChange(color.id)}
          >
            <span className="color-swatch" aria-hidden="true" />
            {color.label}
          </button>
        ))}
      </div>
      <p className="muted">
        Wird sofort bei dieser Klasse gespeichert und in die JSON-Sicherung
        übernommen.
      </p>
    </fieldset>
  );
}
