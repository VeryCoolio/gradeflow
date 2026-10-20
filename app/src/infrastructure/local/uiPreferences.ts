import { DEFAULT_ACCENT, isAccent } from "../../application/appearance";
import { CLASS_ORDERS, type ClassOrder } from "../../application/classOrder";
import type { StoragePort } from "./localRepository";

export const UI_PREFERENCES_KEY = "gradeflow-ui-preferences-v1";
export interface UiPreferences {
  readonly accent: string;
  readonly classOrder: ClassOrder;
  readonly recentClassIds: readonly string[];
}
export const DEFAULT_UI_PREFERENCES: UiPreferences = {
  accent: DEFAULT_ACCENT,
  classOrder: "grade",
  recentClassIds: [],
};
export function readUiPreferences(
  storage?: StoragePort,
  fallback = DEFAULT_UI_PREFERENCES,
): UiPreferences {
  try {
    const raw = storage?.getItem(UI_PREFERENCES_KEY);
    if (!raw || raw.length > 65536) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return fallback;
    const value = parsed as Record<string, unknown>;
    return {
      accent: isAccent(value.accent)
        ? value.accent.toLowerCase()
        : DEFAULT_ACCENT,
      classOrder: CLASS_ORDERS.some((order) => order.id === value.classOrder)
        ? (value.classOrder as ClassOrder)
        : "grade",
      recentClassIds: Array.isArray(value.recentClassIds)
        ? [
            ...new Set(
              value.recentClassIds.filter(
                (id): id is string =>
                  typeof id === "string" && id.length > 0 && id.length <= 1024,
              ),
            ),
          ].slice(0, 2000)
        : [],
    };
  } catch {
    return fallback;
  }
}
