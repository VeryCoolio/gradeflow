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

it("verwendet denselben festen Stundenabstand bei einer und bei zwanzig Stunden", () => {
  const source = reportClass();
  const { container, rerender } = render(
    <StudentHistory
      report={buildClassReport({ ...source, sessions: [source.sessions[1]] })}
      studentId="p1"
      onStudentChange={() => {}}
    />,
  );
  const firstX = Number(
    container.querySelector("text[data-session-id]")?.getAttribute("x"),
  );
  rerender(
    <StudentHistory
      report={buildClassReport({
        ...source,
        sessions: Array.from({ length: 20 }, (_, index) => ({
          ...source.sessions[1],
          id: `session-${index}`,
          date: `2026-09-${String(index + 1).padStart(2, "0")}`,
          lessonSequence: 1,
        })),
      })}
      studentId="p1"
      onStudentChange={() => {}}
    />,
  );
  const coordinates = Array.from(
    container.querySelectorAll("text[data-session-id]"),
    (element) => Number(element.getAttribute("x")),
  );
  expect(coordinates[0]).toBe(firstX);
  expect(
    new Set(
      coordinates.slice(1).map((value, index) => value - coordinates[index]),
    ),
  ).toEqual(new Set([112]));
});

it("kennzeichnet unbewertete Stunden mit AW, NB und Offen ohne zusätzliche Leistungsdatenpunkte", () => {
  const { container } = render(
    <StudentHistory
      report={buildClassReport(reportClass())}
      studentId="p2"
      onStudentChange={() => {}}
    />,
  );
  expect(
    container.querySelector('svg text[aria-label="Abwesend"]')?.textContent,
  ).toMatch(/AW$/);
  expect(
    container.querySelector('svg text[aria-label="Nicht beobachtet"]')
      ?.textContent,
  ).toMatch(/NB$/);
  expect(
    container.querySelector('svg text[aria-label="Offen"]')?.textContent,
  ).toMatch(/Offen$/);
  expect(container.querySelectorAll("[data-status-marker]")).toHaveLength(3);
  expect(
    container.querySelector('[data-status-marker="abwesend"]'),
  ).toBeTruthy();
  expect(
    container.querySelector('[data-status-marker="nicht_beobachtet"]'),
  ).toBeTruthy();
  expect(container.querySelector('[data-status-marker="offen"]')).toBeTruthy();
  expect(container.querySelectorAll("svg .grade-point")).toHaveLength(1);
});
