import { expect, it } from "vitest";
import { schoolYearLabel } from "./schoolYear";

it("schlägt eine Schuljahresbezeichnung vor, ohne gespeicherte Zeiträume zu ändern", () => {
  expect(schoolYearLabel("2026-10-10")).toBe("Schuljahr 2026/27");
  expect(schoolYearLabel("2027-07-31")).toBe("Schuljahr 2026/27");
  expect(schoolYearLabel("2027-08-01")).toBe("Schuljahr 2027/28");
});
