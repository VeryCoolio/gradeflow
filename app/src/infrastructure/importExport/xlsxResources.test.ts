import { expect, it } from "vitest";
import ExcelJS from "exceljs";
import { assertXlsxResources } from "./xlsxResources";

it("lässt die Musterstruktur zu und weist einen manipulierten Entpackungsumfang ab", async () => {
  const workbook = new ExcelJS.Workbook();
  workbook.addWorksheet("Klasse").addRow(["Vorname", "Nachname"]);
  const bytes = new Uint8Array(await workbook.xlsx.writeBuffer());
  const raw = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  );
  expect(() => assertXlsxResources(raw)).not.toThrow();
  const view = new DataView(raw);
  let central = 0;
  while (
    central < raw.byteLength - 4 &&
    view.getUint32(central, true) !== 0x02014b50
  )
    central++;
  view.setUint32(central + 24, 2 * 1024 * 1024 + 1, true);
  expect(() => assertXlsxResources(raw)).toThrow(
    /entpackte Excel-Datei ist zu groß/,
  );
});

it("weist beschädigte ZIP-Daten vor dem Excel-Parser ab", () => {
  expect(() => assertXlsxResources(new ArrayBuffer(10))).toThrow(
    /nicht gelesen/,
  );
});
