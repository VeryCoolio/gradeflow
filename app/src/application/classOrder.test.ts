import { expect, it } from "vitest";
import { orderClasses } from "./classOrder";
import { reportClass } from "../test/reportClass";

const names = [
  "10a",
  "8c",
  "Klasse 8a · Mathematik",
  "7b",
  "8B",
  "7a",
  "Projektgruppe",
  "Schuljahr 2026",
];
const classes = names.map((name, i) => ({
  ...reportClass(),
  id: `c${i}`,
  name,
}));
const orderedNames = (
  mode: "grade" | "recent" | "oldest",
  recent: string[] = [],
) => orderClasses(classes, mode, recent).map((g) => g.name);
it("ordnet Jahrgangszahlen numerisch und Parallelklassen unabhängig vom Namenspräfix alphabetisch", () => {
  expect(orderedNames("grade")).toEqual([
    "7a",
    "7b",
    "Klasse 8a · Mathematik",
    "8B",
    "8c",
    "10a",
    "Projektgruppe",
    "Schuljahr 2026",
  ]);
  expect(classes.map((g) => g.name)).toEqual(names);
});
it("ordnet nach tatsächlichem Öffnen, mit nie geöffneten Klassen zuerst bei längster Nichtnutzung", () => {
  const recent = ["c1", "c0", "c5", "c3", "c4", "c2", "c6", "c7"];
  expect(orderedNames("recent", recent)).toEqual(
    recent.map((id) => classes.find((g) => g.id === id)!.name),
  );
  expect(orderedNames("oldest", recent)).toEqual(
    [...recent].reverse().map((id) => classes.find((g) => g.id === id)!.name),
  );
  expect(orderedNames("oldest", ["c0"])[0]).toBe("7a");
  expect(orderedNames("oldest", ["c0"]).at(-1)).toBe("10a");
});
