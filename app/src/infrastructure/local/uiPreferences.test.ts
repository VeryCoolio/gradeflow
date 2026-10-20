import { expect, it } from "vitest";
import { DEFAULT_UI_PREFERENCES, readUiPreferences } from "./uiPreferences";
const storage = (raw: string) => ({
  getItem: () => raw,
  setItem() {},
  removeItem() {},
});
it("liest gesicherte Einstellungen und verwirft beschädigte oder ungeprüfte Werte", () => {
  const prefs = {
    accent: "#315F7A",
    classOrder: "oldest",
    recentClassIds: ["c1", "c2", "c1", {}, null, ""],
  };
  expect(readUiPreferences(storage(JSON.stringify(prefs)))).toEqual({
    accent: "#315f7a",
    classOrder: "oldest",
    recentClassIds: ["c1", "c2"],
  });
  expect(readUiPreferences(storage("{kaputt"))).toEqual(DEFAULT_UI_PREFERENCES);
  expect(
    readUiPreferences(
      storage(JSON.stringify({ accent: "url(x)", classOrder: "falsch" })),
    ),
  ).toEqual(DEFAULT_UI_PREFERENCES);
  expect(
    readUiPreferences({
      ...storage(""),
      getItem: () => {
        throw new Error("gesperrt");
      },
    }),
  ).toEqual(DEFAULT_UI_PREFERENCES);
});
