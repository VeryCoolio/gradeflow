const MAX_INFLATED_BYTES = 8 * 1024 * 1024;
const MAX_ENTRY_BYTES = 2 * 1024 * 1024;
const MAX_ENTRIES = 256;

/** ZIP-Metadaten vor dem Entpacken prüfen; der Browser-Import läuft zusätzlich im Worker. */
export function assertXlsxResources(raw: ArrayBuffer): void {
  const view = new DataView(raw);
  let end = -1;
  for (
    let at = raw.byteLength - 22;
    at >= Math.max(0, raw.byteLength - 65557);
    at--
  ) {
    if (
      view.getUint32(at, true) === 0x06054b50 &&
      at + 22 + view.getUint16(at + 20, true) === raw.byteLength
    ) {
      end = at;
      break;
    }
  }
  if (end < 0)
    throw new RangeError(
      "Diese Excel-Datei kann nicht gelesen werden. Verwende eine gültige .xlsx-Musterklassenliste.",
    );
  const entries = view.getUint16(end + 10, true);
  const directorySize = view.getUint32(end + 12, true);
  let offset = view.getUint32(end + 16, true);
  if (
    entries > MAX_ENTRIES ||
    entries === 0 ||
    offset + directorySize !== end ||
    view.getUint32(end + 4, true) !== 0
  ) {
    throw new RangeError(
      "Die Excel-Datei enthält zu viele oder nicht unterstützte Bestandteile. Verwende die Musterklassenliste.",
    );
  }
  let total = 0;
  for (let i = 0; i < entries; i++) {
    if (offset + 46 > end || view.getUint32(offset, true) !== 0x02014b50)
      throw new RangeError(
        "Die Excel-Datei hat eine beschädigte ZIP-Struktur.",
      );
    const inflated = view.getUint32(offset + 24, true);
    total += inflated;
    if (
      inflated > MAX_ENTRY_BYTES ||
      total > MAX_INFLATED_BYTES ||
      view.getUint16(offset + 8, true) & 1
    ) {
      throw new RangeError(
        "Die entpackte Excel-Datei ist zu groß oder verschlüsselt. Verwende die Musterklassenliste ohne zusätzliche Inhalte.",
      );
    }
    offset +=
      46 +
      view.getUint16(offset + 28, true) +
      view.getUint16(offset + 30, true) +
      view.getUint16(offset + 32, true);
  }
  if (offset !== end)
    throw new RangeError(
      "Die Excel-Datei hat ein ungültiges Inhaltsverzeichnis.",
    );
}
