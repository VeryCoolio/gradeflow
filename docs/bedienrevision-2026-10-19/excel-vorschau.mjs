// Nur lesender Import der von Gradeflow erzeugten Arbeitsmappe.
import fs from "node:fs/promises";
import { resolve, join } from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const output = resolve(process.argv[2]);
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(join(output, "bericht-390.xlsx")));
const inspection = await workbook.inspect({ kind: "sheet", include: "id,name", maxChars: 2500 });
await fs.writeFile(join(output, "excel-inspektion.txt"), inspection.ndjson, { flag: "wx" });
for (let i = 0; i < 3; i++) {
  const sheet = workbook.worksheets.getItemAt(i);
  const preview = await workbook.render({ sheetName: sheet.name, range: i === 0 ? "A1:D8" : "A1:G8", scale: 1.5, format: "png" });
  await fs.writeFile(join(output, `excel-blatt-${i + 1}.png`), new Uint8Array(await preview.arrayBuffer()), { flag: "wx" });
}
console.log("Drei unveränderte Excel-Blätter importiert und gerendert.");
