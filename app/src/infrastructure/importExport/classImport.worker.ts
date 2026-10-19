import { readClassXlsx } from "./excelWorkbook";

self.onmessage = async (event: MessageEvent<ArrayBuffer>) => {
  try {
    self.postMessage({ names: await readClassXlsx(event.data) });
  } catch (error) {
    self.postMessage({
      error:
        error instanceof Error
          ? error.message
          : "Die Excel-Datei konnte nicht gelesen werden.",
    });
  }
};
