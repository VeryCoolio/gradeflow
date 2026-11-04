// @vitest-environment jsdom
import { useState, type ComponentProps } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { buildClassReport } from "../../application/reporting";
import { DEFAULT_TABLE_OPTIONS } from "../../infrastructure/local/workspacePosition";
import { reportClass } from "../../test/reportClass";
import { ClassWorkspace } from "./ClassWorkspace";

afterEach(cleanup);

function workspaceProps(): ComponentProps<typeof ClassWorkspace> {
  const currentClass = { ...reportClass(), demo: true as const };
  return {
    tableOptions: DEFAULT_TABLE_OPTIONS,
    setTableOptions: vi.fn(),
    registerNavigationGuard: () => () => {},
    confirmNavigation: () => true,
    currentClass,
    report: buildClassReport(currentClass),
    dashboardView: "stunden",
    setDashboardView: vi.fn(),
    canWrite: true,
    lessonDate: "2026-11-04",
    setLessonDate: vi.fn(),
    today: () => "2026-11-04",
    historyStudentId: null,
    setHistoryStudentId: vi.fn(),
    lastSwap: null,
    error: "",
    exporting: false,
    actions: {
      populateDemo: vi.fn(),
      setColor: vi.fn(),
      saveDetails: vi.fn(() => true),
      saveStudentName: vi.fn(() => true),
      archiveClass: vi.fn(),
      deleteCurrentClass: vi.fn(),
      startSession: vi.fn(),
      openSession: vi.fn(),
      swapSessions: vi.fn(),
      deleteStoredSession: vi.fn(),
      exportExcel: vi.fn(),
      exportCsv: vi.fn(),
    },
  };
}

it("zeigt Zielklasse und Umfang der Beispielstunden vor der ausdrücklichen Aktion", async () => {
  const user = userEvent.setup();
  const props = workspaceProps();
  render(<ClassWorkspace {...props} />);
  const heading = screen.getByRole("heading", {
    name: "Beispielstunden für Fiktive Klasse",
  });
  const section = within(heading.closest("section")!);
  expect(section.getByText(/25 fiktiven Stunden/).textContent).toContain(
    "vor deinen vorhandenen Stunden",
  );
  expect(props.actions.populateDemo).not.toHaveBeenCalled();
  await user.click(
    section.getByRole("button", { name: "Beispielstunden ergänzen" }),
  );
  expect(props.actions.populateDemo).toHaveBeenCalledOnce();
});

it.each(["schreibgeschützt", "archiviert"])(
  "sperrt die Ergänzung, wenn die Demo %s ist",
  (reason) => {
    const props = workspaceProps();
    render(
      <ClassWorkspace
        {...props}
        canWrite={reason !== "schreibgeschützt"}
        currentClass={{
          ...props.currentClass,
          archived: reason === "archiviert",
        }}
      />,
    );
    expect(
      screen
        .getByRole("button", { name: "Beispielstunden ergänzen" })
        .hasAttribute("disabled"),
    ).toBe(true);
  },
);

it("bestätigt ergänzte Beispielstunden mit Klassenname und bietet sie nicht erneut an", () => {
  const props = workspaceProps();
  render(
    <ClassWorkspace
      {...props}
      currentClass={{ ...props.currentClass, demoDataGenerated: true }}
    />,
  );
  expect(screen.getByRole("status").textContent).toContain(
    "25 fiktiven Beispielstunden für Fiktive Klasse",
  );
  expect(
    screen.queryByRole("button", { name: "Beispielstunden ergänzen" }),
  ).toBeNull();
});

it("bietet normalen Klassen keine Beispielstunden an", () => {
  const props = workspaceProps();
  render(
    <ClassWorkspace
      {...props}
      currentClass={{ ...props.currentClass, demo: undefined }}
    />,
  );
  expect(
    screen.queryByRole("button", { name: "Beispielstunden ergänzen" }),
  ).toBeNull();
});

it("öffnet den vorhandenen Zeitraumeditor direkt am Klassenkopf und speichert dessen Bezeichnung", async () => {
  const user = userEvent.setup();
  const props = workspaceProps();
  function Workspace() {
    const [view, setView] = useState(props.dashboardView);
    return (
      <ClassWorkspace
        {...props}
        dashboardView={view}
        setDashboardView={setView}
      />
    );
  }
  render(<Workspace />);
  await user.click(screen.getByRole("button", { name: "Zeitraum bearbeiten" }));
  expect(
    screen
      .getByRole("button", { name: "Klasse und Zeitraum" })
      .getAttribute("aria-current"),
  ).toBe("page");
  const period = screen.getByLabelText("Bewertungszeitraum");
  expect((period as HTMLInputElement).value).toBe("Offen");
  await user.clear(period);
  await user.type(period, "Freier Zeitraum");
  await user.click(
    screen.getByRole("button", { name: "Änderungen speichern" }),
  );
  expect(props.actions.saveDetails).toHaveBeenCalledWith(
    "Fiktive Klasse",
    "Freier Zeitraum",
  );
});

it("erhält einen ungespeicherten Personennamen und dessen Navigationsschutz", async () => {
  const user = userEvent.setup();
  const props = workspaceProps();
  let guard = () => true;
  const confirmNavigation = vi.fn(() => false);
  render(
    <ClassWorkspace
      {...props}
      dashboardView="personen"
      confirmNavigation={confirmNavigation}
      registerNavigationGuard={(next) => {
        guard = next;
        return () => {};
      }}
    />,
  );
  await user.click(
    screen.getByRole("button", { name: "Namen von Fiktiv Ada bearbeiten" }),
  );
  const name = screen.getByLabelText("Neuer Personenname");
  await user.type(name, " geändert");
  expect(
    screen.queryByRole("button", { name: "Zeitraum bearbeiten" }),
  ).toBeNull();
  expect(guard()).toBe(false);
  expect(confirmNavigation).toHaveBeenCalledOnce();
  expect((name as HTMLInputElement).value).toBe("Fiktiv Ada geändert");
});
