import { expect, it } from "vitest";
import {
  ACCENT_PRESETS,
  contrastRatio,
  DEFAULT_ACCENT,
  isAccent,
  themeVariables,
} from "./appearance";
import { CLASS_COLORS } from "../domain/classes/classColor";

it("hält frei gewählte helle/dunkle Farben und Pastellbeschriftungen lesbar", () => {
  expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21);
  for (const color of [
    ...ACCENT_PRESETS.map((p) => p.color),
    "#ffffff",
    "#000000",
    "#ffff00",
    "#00ffff",
    "#00ff00",
    "#ff0000",
    "#ffe8f0",
  ]) {
    const theme = themeVariables(color);
    expect(
      contrastRatio(theme["--accent"] ?? DEFAULT_ACCENT, "#ffffff"),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(
        theme["--accent-ink"] ?? "#483264",
        theme["--accent-soft"] ?? "#eee9f6",
      ),
    ).toBeGreaterThanOrEqual(4.5);
  }
  for (const color of CLASS_COLORS)
    expect(contrastRatio("#242238", color.fill)).toBeGreaterThanOrEqual(7);
  expect(isAccent("#AAbbCC")).toBe(true);
  expect(isAccent("url(fremd)")).toBe(false);
  expect(themeVariables("ungueltig")).toEqual({});
});
