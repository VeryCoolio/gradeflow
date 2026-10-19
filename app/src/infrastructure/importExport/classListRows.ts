const MAX_STUDENTS = 45;

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
