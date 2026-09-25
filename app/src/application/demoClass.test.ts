import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EMPTY_NOTEBOOK } from "../infrastructure/local/schema";
import { addDemoClass, DEMO_STUDENT_NAMES } from "./demoClass";

describe("fiktiver Testdatensatz", () => {
  it("verwendet für Schaltfläche und CSV genau dieselben vier fiktiven Namen", () => {
    let number = 0;
    const notebook = addDemoClass(
      EMPTY_NOTEBOOK,
      () => `demo-${++number}`,
      "2026-09-25T12:00:00.000Z",
    );
    const csvNames = readFileSync(
      new URL("../../public/demo-klasse.csv", import.meta.url),
      "utf8",
    )
      .trim()
      .split(/\r?\n/);
    expect(csvNames).toEqual(DEMO_STUDENT_NAMES);
    expect(
      notebook.classes[0].students.map((item) => item.displayName),
    ).toEqual(csvNames);
    expect(
      notebook.classes[0].students.map((item) => item.startGradeQuarterSteps),
    ).toEqual([8, 8, 8, 8]);
    expect(notebook.classes[0].sessions).toEqual([]);
  });
});
