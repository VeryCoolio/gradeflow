const MAX_STUDENTS = 45;

export function namesFromRows(rows: readonly (readonly string[])[]): string[] {
  const headerIndex = rows.findIndex((cells) =>
    cells?.some((cell) => cell.trim()),
  );
  const header = rows[headerIndex]?.map((cell) =>
    cell.trim().toLocaleLowerCase("de"),
  );
  if (
    header?.length !== 2 ||
    header[0] !== "vorname" ||
    header[1] !== "nachname"
  ) {
    throw new RangeError(
      "Die erste ausgefüllte Zeile muss genau die Spalten „Vorname“ und „Nachname“ in dieser Reihenfolge enthalten. Verwende die Musterklassenliste und übertrage die Namen in diese beiden Spalten.",
    );
  }
  const names: string[] = [];
  rows.forEach((cells, index) => {
    if (index <= headerIndex || cells.every((cell) => !cell.trim())) return;
    if (cells.length !== 2) {
      throw new RangeError(
        `Zeile ${index + 1}: Die Zeile enthält ${cells.length} Spalten. Verwende genau zwei Spalten: Vorname und Nachname.`,
      );
    }
    const trimmed = cells.map((cell) => cell.trim());
    const missing = trimmed.findIndex((cell) => !cell);
    if (missing !== -1) {
      throw new RangeError(
        `Zeile ${index + 1}: Der ${missing === 0 ? "Vorname" : "Nachname"} in ${missing === 0 ? "A" : "B"}${index + 1} fehlt. Bitte ergänzen und die Datei erneut importieren.`,
      );
    }
    names.push(trimmed.join(" "));
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
