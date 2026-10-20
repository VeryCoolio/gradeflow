import { useCallback, useEffect, useRef, useState } from "react";
import type { StoragePort } from "../infrastructure/local/localRepository";
import {
  readUiPreferences,
  UI_PREFERENCES_KEY,
  type UiPreferences,
} from "../infrastructure/local/uiPreferences";

export function useUiPreferences(storage?: StoragePort) {
  const [preferences, setPreferences] = useState(() =>
    readUiPreferences(storage),
  );
  const current = useRef(preferences);
  const unsaved = useRef(false);
  const [warning, setWarning] = useState("");
  const update = useCallback(
    (change: (value: UiPreferences) => UiPreferences) => {
      const base = unsaved.current
        ? current.current
        : readUiPreferences(storage, current.current);
      const next = change(base);
      if (next === base) return;
      current.current = next;
      setPreferences(next);
      try {
        storage?.setItem(UI_PREFERENCES_KEY, JSON.stringify(next));
        unsaved.current = false;
        setWarning("");
      } catch {
        unsaved.current = true;
        setWarning(
          "Die Darstellung konnte nicht gespeichert werden. Deine Auswahl gilt für diesen Besuch; versuche es später erneut. Deine Klassen und Bewertungen bleiben erhalten.",
        );
      }
    },
    [storage],
  );
  const change = useCallback(
    (patch: Partial<UiPreferences>) =>
      update((value) => ({ ...value, ...patch })),
    [update],
  );
  const recordClass = useCallback(
    (id: string) =>
      update((value) =>
        value.recentClassIds[0] === id
          ? value
          : {
              ...value,
              recentClassIds: [
                id,
                ...value.recentClassIds.filter((item) => item !== id),
              ].slice(0, 2000),
            },
      ),
    [update],
  );
  useEffect(() => {
    const refresh = (event: StorageEvent) => {
      if (unsaved.current) return;
      if (event.key !== UI_PREFERENCES_KEY && event.key !== null) return;
      const next = readUiPreferences(storage);
      current.current = next;
      setPreferences(next);
    };
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [storage]);
  return { preferences, warning, change, recordClass };
}
