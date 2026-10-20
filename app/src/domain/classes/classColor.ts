export const CLASS_COLORS = [
  {
    id: "none",
    label: "Ohne Farbe",
    fill: "#ffffff",
    border: "#dcd9e3",
    marker: "#8f889c",
  },
  {
    id: "lavender",
    label: "Lavendel",
    fill: "#eee8f5",
    border: "#baaccb",
    marker: "#85719d",
  },
  {
    id: "blue",
    label: "Himmelblau",
    fill: "#e7eff7",
    border: "#a4bdce",
    marker: "#6a8ca2",
  },
  {
    id: "sage",
    label: "Salbei",
    fill: "#e9f0e7",
    border: "#a9bda4",
    marker: "#78916f",
  },
  {
    id: "rose",
    label: "Rosé",
    fill: "#f6e9ed",
    border: "#d2adb8",
    marker: "#a97a89",
  },
  {
    id: "sand",
    label: "Sand",
    fill: "#f5eedf",
    border: "#cdbb94",
    marker: "#a58e62",
  },
  {
    id: "mint",
    label: "Minze",
    fill: "#e4f1ed",
    border: "#9ebfb3",
    marker: "#6e9887",
  },
] as const;
export type ClassColor = (typeof CLASS_COLORS)[number]["id"];
export function isClassColor(value: unknown): value is ClassColor {
  return CLASS_COLORS.some((color) => color.id === value);
}
export function classColorStyle(value?: ClassColor): Record<string, string> {
  const color =
    CLASS_COLORS.find((color) => color.id === value) ?? CLASS_COLORS[0];
  return {
    "--class-fill": color.fill,
    "--class-border": color.border,
    "--class-marker": color.marker,
  };
}
