import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  LocalRepository,
  type StoragePort,
} from "../../infrastructure/local/localRepository";
import { addClass } from "../../application/classService";
import { EMPTY_NOTEBOOK } from "../../infrastructure/local/schema";
import { prepareTutorialStep } from "./prepareTutorialStep";

export const TUTORIAL_KEY = "gradeflow-tutorial-v2";
export type TutorialAction =
  | `page-${"anlegen" | "sicherung" | "ueber"}`
  | `view-${"tabelle" | "verlauf"}`
  | "class-created"
  | "lesson-started"
  | "observation-saved"
  | "lesson-left"
  | "class-switched"
  | "backup-downloaded"
  | "help-opened";

interface PracticeProps {
  repository: LocalRepository;
  storage: StoragePort;
  onAction: (action: TutorialAction) => void;
}
interface Step {
  target: string;
  title: string;
  text: string;
  action?: TutorialAction;
  fields?: readonly string[];
}
const steps: readonly Step[] = [
  {
    target: '[data-tour="page-anlegen"]',
    title: "Lege eine Übungsklasse an",
    text: "Klicke auf die markierte Schaltfläche „Klasse anlegen“. Du übst an den echten Bedienelementen. Alles in dieser Tour bleibt von deinen eigenen Klassen getrennt. Mit „Weiter“ kannst du jeden Schritt auch ohne eigene Eingabe ansehen.",
    action: "page-anlegen",
  },
  {
    target: "#class-name",
    title: "Benenne deine Übungsklasse",
    text: "Klicke in das markierte Feld und gib zum Beispiel „Übung 8b“ ein. Mit „Weiter“ gelangst du zum nächsten Schritt; ein leerer Name wird für die Übung ergänzt.",
    fields: ["#class-name"],
  },
  {
    target: ".name-row",
    title: "Trage eine fiktive Person ein",
    text: "Gib in die beiden markierten Felder zum Beispiel „Ada“ und „Beispiel“ ein. Eine Person genügt für diese Übung. Im Alltag kannst du weitere Namen ergänzen oder eine Liste importieren.",
    fields: ["#first-0", "#last-0"],
  },
  {
    target: '[data-tour="create-class"]',
    title: "Übernimm die Klasse",
    text: "Klicke auf „Klasse lokal anlegen“. Bisher war die Eingabe ein Entwurf; diese Schaltfläche übernimmt sie als Klasse. In der Tour gilt das nur für die Übungsdaten.",
    action: "class-created",
  },
  {
    target: '[data-tour="start-lesson"]',
    title: "Beginne eine Unterrichtsstunde",
    text: "Das heutige Datum ist schon ausgewählt. Klicke auf „Stunde beginnen“, um die Mitarbeit der gesamten Stunde zu erfassen.",
    action: "lesson-started",
  },
  {
    target: '.rating-option[aria-label="+"]',
    title: "Probiere eine Bewertung aus",
    text: "Klicke für die Übung auf „+“. Du siehst bereits auf der Taste das Ergebnis. Die Symbole beziehen sich auf den bisherigen Stand. Abwesend und Nicht beobachtet stehen getrennt darunter.",
    action: "observation-saved",
  },
  {
    target: '[data-tour="lesson-complete"]',
    title: "Die Stunde ist abgeschlossen",
    text: "Die Zusammenfassung zeigt, dass alle Personen erfasst sind. Hier gibt es keine aktiven Bewertungstasten. Klicke auf „Zur Klassenübersicht“.",
    action: "lesson-left",
  },
  {
    target: '[data-tour="view-tabelle"]',
    title: "Öffne die Stundentabelle",
    text: "Klicke auf „Tabelle“. Dort stehen die Einträge aller Personen nebeneinander. Excel und CSV kannst du in der Klassenübersicht ebenfalls herunterladen.",
    action: "view-tabelle",
  },
  {
    target: '[data-tour="view-verlauf"]',
    title: "Sieh dir den Verlauf an",
    text: "Klicke auf „Verlauf“. Er zeigt den berechneten Stand über die Stunden. Abwesenheit, fehlende Beobachtung und offene Einträge erhalten eigene Markierungen.",
    action: "view-verlauf",
  },
  {
    target: '[data-tour-class="tutorial-existing"], #current-class',
    title: "Wechsle die Klasse",
    text: "Wähle „Übung 7a“: am Computer im linken Klassenregister, auf kleinen Displays in der Klassenwahl. Deine Eingaben bleiben beim Wechsel erhalten.",
    action: "class-switched",
  },
  {
    target: '[data-tour="page-sicherung"]',
    title: "Öffne die Datensicherung",
    text: "Klicke oben auf „Datensicherung“. Die echten App-Daten liegen in deinem Browserprofil. Eine eigene Sicherungsdatei schützt dich beim Browser- oder Gerätewechsel.",
    action: "page-sicherung",
  },
  {
    target: '[data-tour="download-backup"]',
    title: "Lade eine Übungssicherung herunter",
    text: "Klicke auf die markierte Schaltfläche. Du erhältst eine ausdrücklich als Übung benannte JSON-Datei mit den fiktiven Daten dieser Tour. Excel und CSV ersetzen diese Vollsicherung nicht.",
    action: "backup-downloaded",
  },
  {
    target: '[data-tour="help-menu"]',
    title: "Finde die Hilfe wieder",
    text: "Öffne „Hilfe und Einstieg“. Hier findest du die Erklärung der App, die Bewertungsregeln, Informationen zu deinen Daten und „Tutorial starten“ für einen späteren Neustart.",
    action: "help-opened",
  },
  {
    target: '[data-tour="page-ueber"]',
    title: "Lies die Idee hinter Gradeflow",
    text: "Klicke auf „So funktioniert Gradeflow“. Die Seite erklärt den Bezug zur Bachelorarbeit und die Grenzen der berechneten Werte.",
    action: "page-ueber",
  },
  {
    target: '[data-tour="about-title"]',
    title: "Du kennst jetzt den Ablauf",
    text: "Die Tour hat dir Klassenanlage, Stundenerfassung, Auswertungen und Datensicherung gezeigt. Beende die Tour, um zu deinem eigenen Arbeitsstand zurückzukehren. Die Übungsklassen werden verworfen.",
  },
];

function createPractice() {
  const values = new Map<string, string>();
  const storage: StoragePort = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
  };
  const repository = new LocalRepository(storage);
  let id = 0;
  repository.save(
    addClass(
      EMPTY_NOTEBOOK,
      {
        name: "Übung 7a",
        periodLabel: "Nur für das Tutorial",
        students: ["Fiktiv Kim"],
      },
      () => (id++ === 0 ? "tutorial-existing" : `tutorial-person-${id}`),
      new Date().toISOString(),
    ),
  );
  return { repository, storage };
}

export function Tutorial({
  storage,
  request,
  onStorageError,
  autoStart = true,
  children,
  renderPractice,
}: {
  storage?: StoragePort;
  request: number;
  onStorageError: () => void;
  autoStart?: boolean;
  children: ReactNode;
  renderPractice: (props: PracticeProps) => ReactNode;
}) {
  const [open, setOpen] = useState(() => {
    if (!autoStart || !storage) return false;
    try {
      return storage.getItem(TUTORIAL_KEY) !== "gesehen";
    } catch {
      return false;
    }
  });
  const previousRequest = useRef(request);
  useEffect(() => {
    if (request !== previousRequest.current) {
      previousRequest.current = request;
      setOpen(true);
    }
  }, [request]);
  useEffect(() => {
    if (!open) return;
    try {
      storage?.setItem(TUTORIAL_KEY, "gesehen");
    } catch {
      onStorageError();
    }
  }, [open, storage, onStorageError]);
  function close() {
    setOpen(false);
    requestAnimationFrame(() =>
      document.getElementById("main-content")?.focus({ preventScroll: true }),
    );
  }
  if (!open) return children;
  return <PracticeTour renderPractice={renderPractice} onClose={close} />;
}

function PracticeTour({
  renderPractice,
  onClose,
}: {
  renderPractice: (props: PracticeProps) => ReactNode;
  onClose: () => void;
}) {
  const [practice] = useState(createPractice);
  const [index, setIndex] = useState(0);
  const [revision, setRevision] = useState(0);
  const [geometry, setGeometry] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    cardLeft: number;
    cardTop: number;
    cardMaxHeight: number;
    below: boolean;
  } | null>(null);
  const surface = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLElement>(null);
  const step = steps[index];

  function nextStep() {
    prepareTutorialStep(practice, index + 1);
    setGeometry(null);
    setRevision((value) => value + 1);
    setIndex(index + 1);
  }

  useEffect(() => {
    const root = surface.current;
    if (!root) return;
    if (index === 13) {
      const menu = root.querySelector<HTMLDetailsElement>(".help-menu");
      if (menu) menu.open = true;
    }
    let frame = 0;
    let lastTarget: HTMLElement | undefined;
    let previousDescription: string | null = null;
    const restoreDescription = () => {
      if (!lastTarget) return;
      if (previousDescription === null)
        lastTarget.removeAttribute("aria-describedby");
      else lastTarget.setAttribute("aria-describedby", previousDescription);
    };
    const visibleTarget = () =>
      Array.from(root.querySelectorAll<HTMLElement>(step.target)).find(
        (element) => element.getClientRects().length > 0,
      );
    const update = () => {
      const target = visibleTarget();
      if (!target) {
        setGeometry(null);
        return;
      }
      if (lastTarget !== target) {
        restoreDescription();
        previousDescription = target.getAttribute("aria-describedby");
        target.setAttribute(
          "aria-describedby",
          [previousDescription, "tour-description"].filter(Boolean).join(" "),
        );
        lastTarget = target;
        target.scrollIntoView?.({ block: "center", behavior: "instant" });
        // Keep keyboard entry on the actual field rather than the explanation.
        (target.matches("input, select, button, summary")
          ? target
          : target.querySelector<HTMLElement>("input")
        )?.focus({ preventScroll: true });
      }
      let rect = target.getBoundingClientRect();
      const width = Math.min(352, window.innerWidth - 24);
      const viewportTop = window.visualViewport?.offsetTop ?? 0;
      const viewportHeight =
        window.visualViewport?.height ?? window.innerHeight;
      const viewportBottom = viewportTop + viewportHeight;
      const cardMaxHeight = Math.max(100, viewportHeight - rect.height - 40);
      const height = Math.min(card.current?.offsetHeight ?? 250, cardMaxHeight);
      if (
        rect.bottom + height + 24 > viewportBottom &&
        rect.top - height - 24 < viewportTop
      ) {
        window.scrollBy({
          top: Math.ceil(rect.bottom + height + 24 - viewportBottom),
          behavior: "instant",
        });
        rect = target.getBoundingClientRect();
      }
      const below = rect.bottom + height + 24 <= viewportBottom;
      const cardTop = below
        ? rect.bottom + 12
        : Math.max(viewportTop + 12, rect.top - height - 12);
      setGeometry({
        left: rect.left - 4,
        top: rect.top - 4,
        width: rect.width + 8,
        height: rect.height + 8,
        cardLeft: Math.max(
          12,
          Math.min(rect.left, window.innerWidth - width - 12),
        ),
        cardTop,
        cardMaxHeight,
        below,
      });
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["open", "class", "style"],
    });
    const resize = new ResizeObserver(schedule);
    resize.observe(root);
    if (card.current) resize.observe(card.current);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      restoreDescription();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
    };
  }, [step, index, revision]);

  useEffect(() => {
    function keyboard(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (
        event.key === "Enter" &&
        step.fields &&
        event.target instanceof HTMLInputElement
      ) {
        event.preventDefault();
        nextStep();
        return;
      }
      if (event.key !== "Tab") return;
      const target = Array.from(
        surface.current?.querySelectorAll<HTMLElement>(step.target) ?? [],
      ).find((element) => element.getClientRects().length > 0);
      const controls: HTMLElement[] = step.fields
        ? step.fields.flatMap((selector) => {
            const field = surface.current?.querySelector<HTMLElement>(selector);
            return field ? [field] : [];
          })
        : target?.matches("input, select, button, summary")
          ? [target]
          : Array.from(
              target?.querySelectorAll<HTMLElement>("input, button, select") ??
                [],
            );
      controls.push(
        ...Array.from(
          card.current?.querySelectorAll<HTMLButtonElement>(
            "button:not(:disabled)",
          ) ?? [],
        ),
      );
      if (!controls.length) return;
      event.preventDefault();
      const current = controls.indexOf(document.activeElement as HTMLElement);
      controls[
        (current + (event.shiftKey ? -1 : 1) + controls.length) %
          controls.length
      ].focus();
    }
    document.addEventListener("keydown", keyboard);
    return () => document.removeEventListener("keydown", keyboard);
  }, [onClose, step, index, practice]);

  return (
    <div className="tutorial-practice">
      <p className="tutorial-banner">
        Geführte Übung · Deine eigenen Klassen bleiben erhalten
      </p>
      <div key={revision} ref={surface} className="tutorial-surface">
        {renderPractice({
          ...practice,
          onAction: (action) => {
            if (action === step.action) setIndex((current) => current + 1);
          },
        })}
      </div>
      {geometry ? (
        <>
          <div
            className="tour-shade"
            style={{ inset: `0 0 auto 0`, height: Math.max(0, geometry.top) }}
          />
          <div
            className="tour-shade"
            style={{
              top: geometry.top,
              left: 0,
              width: Math.max(0, geometry.left),
              height: geometry.height,
            }}
          />
          <div
            className="tour-shade"
            style={{
              top: geometry.top,
              left: geometry.left + geometry.width,
              right: 0,
              height: geometry.height,
            }}
          />
          <div
            className="tour-shade"
            style={{
              top: geometry.top + geometry.height,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          />
          <div
            className="tour-spotlight"
            aria-hidden="true"
            style={{
              left: geometry.left,
              top: geometry.top,
              width: geometry.width,
              height: geometry.height,
            }}
          />
        </>
      ) : null}
      <aside
        ref={card}
        className="tour-card"
        aria-label="Geführtes Tutorial"
        data-placement={geometry?.below ? "below" : "above"}
        style={
          geometry
            ? {
                left: geometry.cardLeft,
                top: geometry.cardTop,
                maxHeight: geometry.cardMaxHeight,
              }
            : { left: 12, top: 12 }
        }
      >
        <p className="tutorial-progress" role="status">
          Übung · Schritt {index + 1} von {steps.length}
        </p>
        <h2>{step.title}</h2>
        <p id="tour-description">{step.text}</p>
        {!geometry ? (
          <p role="status">Das passende Bedienelement wird gesucht …</p>
        ) : null}
        <div className="tutorial-actions">
          {index < steps.length - 1 ? (
            <button className="primary" type="button" onClick={nextStep}>
              Weiter
            </button>
          ) : null}
          {index === steps.length - 1 ? (
            <button className="primary" type="button" onClick={onClose}>
              Zurück zu meinen Klassen
            </button>
          ) : null}
          <button className="text-button" type="button" onClick={onClose}>
            Tutorial beenden
          </button>
        </div>
      </aside>
    </div>
  );
}
