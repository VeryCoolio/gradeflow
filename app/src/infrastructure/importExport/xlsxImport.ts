import { assertXlsxResources } from "./xlsxResources";

export async function importXlsx(raw: ArrayBuffer): Promise<string[]> {
  assertXlsxResources(raw);
  if (typeof Worker === "undefined") {
    const { readClassXlsx } = await import("./excelWorkbook");
    return readClassXlsx(raw);
  }
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("./classImport.worker.ts", import.meta.url),
      { type: "module" },
    );
    const stop = () => {
      clearTimeout(timer);
      worker.terminate();
    };
    const timer = setTimeout(() => {
      stop();
      reject(
        new Error(
          "Die Excel-Prüfung dauert zu lange und wurde beendet. Die Daten bleiben unverändert. Verwende die Musterklassenliste oder CSV.",
        ),
      );
    }, 10_000);
    worker.onmessage = (
      event: MessageEvent<{ names?: string[]; error?: string }>,
    ) => {
      stop();
      if (event.data.names) resolve(event.data.names);
      else
        reject(
          new Error(
            event.data.error ?? "Die Excel-Datei konnte nicht gelesen werden.",
          ),
        );
    };
    worker.onerror = (event) => {
      event.preventDefault();
      stop();
      reject(
        new Error(
          "Die Excel-Prüfung konnte nicht ausgeführt werden. Verwende CSV oder versuche es erneut.",
        ),
      );
    };
    worker.postMessage(raw, [raw]);
  });
}
