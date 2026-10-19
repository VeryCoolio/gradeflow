import { expect, it } from "vitest";
import { CLASS_DRAFT_KEY, emptyClassDraft, readClassDraft } from "./classDraft";

it("liest einen getrennten Klassenentwurf und weist beschädigte oder übergroße Daten ab", () => {
  const draft = {
    ...emptyClassDraft("2026-10-19"),
    name: "Fiktive 8b",
    people: [{ firstName: "Fiktiv", lastName: "Ada" }],
  };
  const storage = {
    getItem: () => JSON.stringify(draft),
    setItem() {},
    removeItem() {},
  };
  expect(readClassDraft(storage)).toEqual(draft);
  expect(CLASS_DRAFT_KEY).not.toBe("oral-grading-notebook-v1");
  for (const value of [
    "broken",
    "x".repeat(100_001),
    JSON.stringify({ ...draft, version: 2 }),
    JSON.stringify({ ...draft, people: Array(46).fill(draft.people[0]) }),
    JSON.stringify({ ...draft, people: [null] }),
  ]) {
    expect(() =>
      readClassDraft({ ...storage, getItem: () => value }),
    ).toThrow();
  }
});
