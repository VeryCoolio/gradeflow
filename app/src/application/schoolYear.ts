/** Vorschlag für die Bezeichnung, kein Beginn/Ende des Berechnungszeitraums. */
export function schoolYearLabel(date: string): string {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));
  const start = month >= 8 ? year : year - 1;
  return `Schuljahr ${start}/${String(start + 1).slice(-2)}`;
}
