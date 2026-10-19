import { namesFromRows } from "./classListRows";
export { namesFromRows } from "./classListRows";

function splitCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === delimiter && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  if (quoted)
    throw new RangeError(
      "Nicht geschlossene Anführungszeichen in der Klassenliste.",
    );
  cells.push(current.trim());
  return cells;
}

export function parseClassImport(text: string, filename: string): string[] {
  if (!/\.(csv|txt)$/i.test(filename)) {
    throw new RangeError("Bitte eine CSV- oder TXT-Datei auswählen.");
  }
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) throw new RangeError("Die Klassenliste ist leer.");
  const delimiter = [";", "\t", ","].find((candidate) =>
    lines[0].includes(candidate),
  );
  return namesFromRows(
    lines.map((line) => splitCsvLine(line, delimiter ?? "\u0000")),
  );
}

export async function importClassFile(file: File): Promise<string[]> {
  if (file.size > 5 * 1024 * 1024)
    throw new RangeError("Die Klassenliste darf höchstens 5 MiB groß sein.");
  if (/\.xlsx$/i.test(file.name)) {
    const { importXlsx } = await import("./xlsxImport");
    return importXlsx(await file.arrayBuffer());
  }
  return parseClassImport(await file.text(), file.name);
}
