// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { buildClassReport } from "../../application/reporting";
import { reportClass } from "../../test/reportClass";
import { ClassTable } from "./ClassTable";

afterEach(cleanup);

it("zeigt zehn neueste Stunden und blättert ohne Änderung des Gesamtstands durch 24 Stunden", async () => {
  const user = userEvent.setup();
  const source = reportClass();
  const report = buildClassReport({
    ...source,
    sessions: Array.from({ length: 24 }, (_, index) => ({
      ...source.sessions[1],
      id: `session-${index}`,
      date: `2026-09-${String(index + 1).padStart(2, "0")}`,
      lessonSequence: 1,
    })),
  });
  render(<ClassTable report={report} />);
  expect(screen.getByRole("status").textContent).toBe("Stunden 15–24 von 24");
  expect(document.querySelectorAll("time")).toHaveLength(10);
  expect(screen.queryByRole("columnheader", { name: "01.09.2026" })).toBeNull();
  const current = () =>
    document.querySelector("tbody .current-column")?.textContent;
  expect(current()).toBe("1,00");
  await user.click(screen.getByRole("button", { name: "Ältere Stunden" }));
  expect(screen.getByRole("status").textContent).toBe("Stunden 5–14 von 24");
  expect(current()).toBe("1,00");
  await user.click(screen.getByRole("button", { name: "Ältere Stunden" }));
  expect(screen.getByRole("status").textContent).toBe("Stunden 1–4 von 24");
  expect(
    screen
      .getByRole("button", { name: "Ältere Stunden" })
      .hasAttribute("disabled"),
  ).toBe(true);
  await user.click(screen.getByRole("button", { name: "Neuere Stunden" }));
  expect(screen.getByRole("status").textContent).toBe("Stunden 5–14 von 24");
  await user.selectOptions(screen.getByLabelText("Stunden pro Ansicht"), "20");
  expect(screen.getByRole("status").textContent).toBe("Stunden 5–24 von 24");
  await user.selectOptions(screen.getByLabelText("Stunden pro Ansicht"), "0");
  expect(document.querySelectorAll("time")).toHaveLength(24);
  expect(current()).toBe("1,00");
});

it("unterscheidet AW, NB, Offen und bewertete Null und erlaubt Details sowie kleinere und größere Schrift", async () => {
  const user = userEvent.setup();
  const source = reportClass();
  const report = buildClassReport({
    ...source,
    sessions: source.sessions.map((session) =>
      session.id === "s3"
        ? {
            ...session,
            observations: { p1: { status: "bewertet", symbol: "0" } },
          }
        : session,
    ),
  });
  render(<ClassTable report={report} />);
  const region = screen.getByRole("region", { name: "Stundentabelle" });
  expect(within(region).getByTitle("Abwesend").textContent).toBe("AW");
  expect(within(region).getByTitle("Nicht beobachtet").textContent).toBe("NB");
  expect(within(region).getByTitle("Offen").textContent).toBe("Offen");
  expect(within(region).getByTitle("Bewertet: 0").textContent).toBe("0");
  expect(within(region).queryByText(/Stand:/)).toBeNull();
  await user.click(screen.getByRole("button", { name: "Mit Notenverlauf" }));
  expect(within(region).getAllByText(/Stand:/)).toHaveLength(3);
  expect(within(region).getByTitle("Abwesend").textContent).toBe("Abwesend");
  await user.selectOptions(screen.getByLabelText("Tabellengröße"), "large");
  expect(region.classList.contains("table-size-large")).toBe(true);
  await user.selectOptions(screen.getByLabelText("Tabellengröße"), "small");
  expect(region.classList.contains("table-size-small")).toBe(true);
  await user.click(screen.getByRole("button", { name: "Kompakt" }));
  expect(within(region).queryByText(/Stand:/)).toBeNull();
});

it("zeigt eine leere Tabelle ohne aktivierte Navigation und ohne erfundene Stunden", () => {
  render(
    <ClassTable
      report={buildClassReport({ ...reportClass(), sessions: [] })}
    />,
  );
  expect(screen.getByRole("status").textContent).toBe("Noch keine Stunden");
  expect(document.querySelectorAll("time")).toHaveLength(0);
  expect(
    screen
      .getByRole("button", { name: "Ältere Stunden" })
      .hasAttribute("disabled"),
  ).toBe(true);
  expect(
    screen
      .getByRole("button", { name: "Neuere Stunden" })
      .hasAttribute("disabled"),
  ).toBe(true);
});
