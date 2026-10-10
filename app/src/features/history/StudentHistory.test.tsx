// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { buildClassReport } from "../../application/reporting";
import { reportClass } from "../../test/reportClass";
import { StudentHistory } from "./StudentHistory";

afterEach(cleanup);
it("belässt alle Datumspunkte auf derselben Achse beim Wechsel zu einer unbewerteten Person", () => {
  const report = buildClassReport(reportClass());
  const { container, rerender } = render(
    <StudentHistory
      report={report}
      studentId="p1"
      onStudentChange={() => {}}
    />,
  );
  const coordinates = () =>
    Array.from(container.querySelectorAll("text[data-session-id]"), (label) => [
      label.getAttribute("x"),
      label.textContent,
    ]);
  const first = coordinates();
  rerender(
    <StudentHistory
      report={report}
      studentId="p2"
      onStudentChange={() => {}}
    />,
  );
  expect(coordinates()).toEqual(first);
  expect(first.map((point) => point[1])).toEqual([
    "23.09.2026",
    "23.09.2026",
    "24.09.2026",
  ]);
  expect(screen.getByText(/Noch keine bewertete Stunde/)).toBeTruthy();
  expect(screen.getByRole("cell", { name: "Nicht beobachtet" })).toBeTruthy();
});
