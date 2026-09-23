import { parseNotebook, type NotebookV1 } from "../local/schema";

export function exportNotebookJson(notebook: NotebookV1): string {
  return `${JSON.stringify(notebook, null, 2)}\n`;
}

export function importNotebookJson(raw: string): NotebookV1 {
  return parseNotebook(raw);
}
