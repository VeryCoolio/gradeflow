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
  const names = lines.map((line, index) => {
    const delimiter = [";", "\t", ","].find((candidate) =>
      line.includes(candidate),
    );
    const cells = splitCsvLine(line, delimiter ?? "\u0000");
    if (cells.length > 2 || cells.some((cell) => !cell)) {
      throw new RangeError(`Zeile ${index + 1} enthält keinen gültigen Namen.`);
    }
    return cells.join(" ").replace(/\s+/g, " ").trim();
  });
  if (names.length > MAX_STUDENTS) {
    throw new RangeError("Eine Klasse darf höchstens 45 Personen enthalten.");
  }
  return names;
}
