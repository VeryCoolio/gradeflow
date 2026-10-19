import { useEffect, useRef, useState } from "react";
import type { StoragePort } from "../../infrastructure/local/localRepository";

export const TUTORIAL_KEY = "gradeflow-tutorial-v1";
const steps = [
  [
    "Willkommen bei Gradeflow",
    "Die App dokumentiert die mündliche Mitarbeit einer ganzen Unterrichtsstunde. Diese kurze Einführung zeigt dir den Ablauf. Deine vorhandenen Eingaben bleiben erhalten.",
  ],
  [
    "Klassen anlegen und schnell wechseln",
    "Lege eine Klasse manuell oder über eine Klassenliste an. Dein Eingabeentwurf wird lokal gespeichert. Am Computer wechselst du links im Klassenregister; auf kleinen Displays über die Klassenwahl oben.",
  ],
  [
    "Eine Stunde erfassen",
    "Beginne eine Stunde mit Datum. Wähle pro Person ein Symbol relativ zum Stand vor dieser Stunde oder Abwesend bzw. Nicht beobachtet. Jede Eingabe wird sofort lokal gespeichert. Nach der letzten Person siehst du eine Abschlussübersicht.",
  ],
  [
    "Verlauf und Berichte ansehen",
    "In der Klasse findest du Tabelle, Verlauf und Personen. AW, NB und offene Eingaben sind eigene Status. Der Excel-Bericht enthält eine Übersicht und ein Blatt je Person; ein Klick auf den Namen springt zum Personenblatt.",
  ],
  [
    "Eine eigene Sicherung aufbewahren",
    "Die Daten liegen in diesem Browserprofil. Lade regelmäßig eine JSON-Vollsicherung herunter. Excel und CSV sind Berichte. Unter Hilfe und Einstieg findest du die Daten-Erklärung und kannst dieses Tutorial jederzeit erneut starten.",
  ],
] as const;

export function Tutorial({
  storage,
  request,
  onStorageError,
}: {
  storage?: StoragePort;
  request: number;
  onStorageError: () => void;
}) {
  const [open, setOpen] = useState(() => {
    if (!storage) return false;
    try {
      return storage.getItem(TUTORIAL_KEY) !== "gesehen";
    } catch {
      return false;
    }
  });
  const [step, setStep] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousRequest = useRef(request);
  useEffect(() => {
    if (request !== previousRequest.current) {
      previousRequest.current = request;
      setStep(0);
      setOpen(true);
    }
  }, [request]);
  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal?.();
    try {
      storage?.setItem(TUTORIAL_KEY, "gesehen");
    } catch {
      onStorageError();
    }
  }, [open, storage, onStorageError]);
  useEffect(() => {
    if (open) heading.current?.focus();
  }, [step, open]);
  function close() {
    dialog.current?.close?.();
    setOpen(false);
    document.getElementById("main-content")?.focus({ preventScroll: true });
  }
  if (!open) return null;
  return (
    <dialog
      className="tutorial-dialog"
      ref={dialog}
      aria-labelledby="tutorial-title"
      aria-describedby="tutorial-description"
      onCancel={close}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>(
          "button:not(:disabled)",
        );
        if (!buttons?.length) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === heading.current)
        ) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
    >
      <p className="tutorial-progress" aria-live="polite">
        Einführung · Schritt {step + 1} von {steps.length}
      </p>
      <h2 id="tutorial-title" ref={heading} tabIndex={-1}>
        {steps[step][0]}
      </h2>
      <p id="tutorial-description">{steps[step][1]}</p>
      <div className="tutorial-actions">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          Zurück
        </button>
        {step < steps.length - 1 ? (
          <button
            type="button"
            className="primary"
            onClick={() => setStep(step + 1)}
          >
            Weiter
          </button>
        ) : (
          <button type="button" className="primary" onClick={close}>
            Einführung abschließen
          </button>
        )}
      </div>
      <button
        className="text-button tutorial-close"
        type="button"
        onClick={close}
      >
        Tutorial schließen
      </button>
    </dialog>
  );
}
