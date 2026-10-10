const MAX_STUDENTS = 45;

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

export function namesFromRows(rows: readonly (readonly string[])[]): string[] {
  const header = rows[0]?.map((cell) => cell.trim().toLocaleLowerCase("de"));
  if (
    header?.length !== 2 ||
    header[0] !== "vorname" ||
    header[1] !== "nachname"
  ) {
    throw new RangeError(
      "Die erste Zeile muss genau die Spalten „Vorname“ und „Nachname“ in dieser Reihenfolge enthalten.",
    );
  }
  const names = rows.slice(1).map((cells, index) => {
    if (cells.length !== 2 || cells.some((cell) => !cell.trim())) {
      throw new RangeError(
        `Zeile ${index + 2}: Bitte Vorname und Nachname in zwei ausgefüllten Spalten angeben.`,
      );
    }
    return cells.join(" ").replace(/\s+/g, " ").trim();
  });
  if (!names.length)
    throw new RangeError(
      "Die Klassenliste enthält noch keine Personen. Trage unter der Kopfzeile Vorname und Nachname ein.",
    );
  if (names.length > MAX_STUDENTS) {
    throw new RangeError("Eine Klasse darf höchstens 45 Personen enthalten.");
  }
  return names;
}

export async function importClassFile(file: File): Promise<string[]> {
  if (file.size > 5 * 1024 * 1024)
    throw new RangeError("Die Klassenliste darf höchstens 5 MB groß sein.");
  if (/\.xlsx$/i.test(file.name)) {
    const { readClassXlsx } = await import("./excelWorkbook");
    return readClassXlsx(await file.arrayBuffer());
  }
  return parseClassImport(await file.text(), file.name);
}
