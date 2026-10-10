import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseClassImport } from "../infrastructure/importExport/classImport";
import { EMPTY_NOTEBOOK } from "../infrastructure/local/schema";
import { addDemoClass, DEMO_STUDENT_NAMES } from "./demoClass";

describe("fiktiver Testdatensatz", () => {
  it("verwendet für Schaltfläche und CSV genau dieselben 20 fiktiven Namen", () => {
    let number = 0;
    const notebook = addDemoClass(
      EMPTY_NOTEBOOK,
      () => `demo-${++number}`,
      "2026-09-25T12:00:00.000Z",
    );
    const csvNames = parseClassImport(
      readFileSync(
        new URL("../../public/demo-klasse.csv", import.meta.url),
        "utf8",
      ),
      "demo-klasse.csv",
    );
    expect(csvNames).toEqual(DEMO_STUDENT_NAMES);
    expect(
      notebook.classes[0].students.map((item) => item.displayName),
    ).toEqual(csvNames);
    expect(
      notebook.classes[0].students.map((item) => item.startGradeQuarterSteps),
    ).toEqual(Array(20).fill(8));
    expect(notebook.classes[0].sessions).toEqual([]);
  });
});
