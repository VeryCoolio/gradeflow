export const DEFAULT_ACCENT = "#5b477e";
export const ACCENT_PRESETS = [
  { label: "Lavendel", color: DEFAULT_ACCENT },
  { label: "Blau", color: "#315f7a" },
  { label: "Salbei", color: "#386550" },
  { label: "Rosé", color: "#8c4e63" },
  { label: "Sand", color: "#786044" },
  { label: "Schiefer", color: "#52616b" },
] as const;
export function isAccent(value: unknown): value is string {
  return typeof value === "string" && /^#[\da-f]{6}$/i.test(value);
}
function rgb(hex: string): number[] {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}
function hex(channels: number[]): string {
  return (
    "#" +
    channels
      .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
      .join("")
  );
}
function luminance(color: string): number {
  return rgb(color)
    .map((channel) => {
      const n = channel / 255;
      return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
    })
    .reduce(
      (sum, channel, i) => sum + channel * [0.2126, 0.7152, 0.0722][i],
      0,
    );
}
export function contrastRatio(a: string, b: string): number {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
function legible(color: string, contrast: number): string {
  for (let step = 0; step <= 20; step++) {
    const candidate = hex(
      rgb(color).map((channel) => channel * (1 - step / 20)),
    );
    if (contrastRatio(candidate, "#ffffff") >= contrast) return candidate;
  }
  return "#000000";
}
export const THEME_KEYS = [
  "--accent",
  "--accent-ink",
  "--accent-soft",
  "--canvas",
  "--paper",
  "--line",
  "--line-strong",
  "--theme-selected",
  "--theme-panel",
  "--theme-table-head",
  "--theme-person",
  "--theme-current",
] as const;
export function themeVariables(input: string): Record<string, string> {
  if (!isAccent(input) || input.toLowerCase() === DEFAULT_ACCENT) return {};
  const accent = legible(input, 4.6);
  const tint = (white: number) =>
    hex(rgb(input).map((channel) => channel * (1 - white) + 255 * white));
  return {
    "--accent": accent,
    "--accent-ink": legible(input, 7),
    "--accent-soft": tint(0.91),
    "--canvas": tint(0.97),
    "--paper": tint(0.97),
    "--line": tint(0.8),
    "--line-strong": legible(tint(0.4), 3),
    "--theme-selected": tint(0.86),
    "--theme-panel": tint(0.96),
    "--theme-table-head": tint(0.9),
    "--theme-person": tint(0.95),
    "--theme-current": tint(0.86),
  };
}
