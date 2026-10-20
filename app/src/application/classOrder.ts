import type { ClassRecord } from "../infrastructure/local/schema";

export const CLASS_ORDERS = [
  { id: "grade", label: "Klassenstufe (A–Z)" },
  { id: "recent", label: "Zuletzt benutzt" },
  { id: "oldest", label: "Am längsten nicht benutzt" },
] as const;
export type ClassOrder = (typeof CLASS_ORDERS)[number]["id"];
const collator = new Intl.Collator("de", {
  numeric: true,
  sensitivity: "base",
});

function grade(name: string): { number: number; section: string } {
  const match = name.match(
    /(?:^|[^\d])(\d{1,2})(?!\d)(?:\s*([a-z])(?=$|[^a-z]))?/i,
  );
  return {
    number: match ? Number(match[1]) : Infinity,
    section: match?.[2] ?? "",
  };
}
export function orderClasses(
  classes: readonly ClassRecord[],
  order: ClassOrder,
  recent: readonly string[],
): ClassRecord[] {
  const rank = new Map(recent.map((id, index) => [id, index]));
  return [...classes].sort((a, b) => {
    if (order !== "grade") {
      const ar = rank.get(a.id) ?? Infinity;
      const br = rank.get(b.id) ?? Infinity;
      if (ar !== br)
        return order === "recent" ? (ar < br ? -1 : 1) : ar > br ? -1 : 1;
    }
    const ag = grade(a.name),
      bg = grade(b.name);
    if (ag.number !== bg.number) return ag.number < bg.number ? -1 : 1;
    const section = collator.compare(ag.section, bg.section);
    if (section) return section;
    return collator.compare(a.name, b.name) || a.id.localeCompare(b.id);
  });
}
