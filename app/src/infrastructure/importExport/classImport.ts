import { namesFromRows } from "./classListRows";
export { namesFromRows } from "./classListRows";

function splitCsvLine(line: string, delimiter: string, row: number): string[] {
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
      `Zeile ${row}: Nicht geschlossene Anführungszeichen. Schließe das Anführungszeichen und importiere die Datei erneut.`,
    );
  cells.push(current.trim());
  return cells;
}

export function parseClassImport(text: string, filename: string): string[] {
  if (!/\.(csv|txt)$/i.test(filename)) {
    throw new RangeError("Bitte eine CSV- oder TXT-Datei auswählen.");
  }
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const header = lines.find((line) => line.trim());
  if (!header) throw new RangeError("Die Klassenliste ist leer.");
  const delimiter = [";", "\t", ","].find((candidate) =>
    header.includes(candidate),
  );
  return namesFromRows(
    lines.map((line, index) =>
      splitCsvLine(line, delimiter ?? "\u0000", index + 1),
    ),
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
