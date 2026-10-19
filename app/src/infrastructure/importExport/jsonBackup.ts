import { parseNotebook, type NotebookV1 } from "../local/schema";

export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

export function readNotebookBackup(file: File): Promise<string> {
  if (file.size > MAX_BACKUP_BYTES) {
    throw new RangeError(
      "Die JSON-Sicherung darf höchstens 5 MiB groß sein. Die vorhandenen Daten bleiben erhalten. Diese größere Datei kann hier nicht eingelesen werden; bewahre das Original für eine gesonderte Übertragung auf.",
    );
  }
  return file.text();
}

export function exportNotebookJson(notebook: NotebookV1): string {
  return `${JSON.stringify(notebook, null, 2)}\n`;
}

export function importNotebookJson(raw: string): NotebookV1 {
  return parseNotebook(raw);
}
