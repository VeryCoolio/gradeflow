// Nur lesende Stichprobe der von der App erzeugten XLSX-Datei.
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const output = process.env.GRADEFLOW_AUDIT_OUTPUT
  ? pathToFileURL(`${resolve(process.env.GRADEFLOW_AUDIT_OUTPUT)}/`)
  : new URL("./nachweise/", import.meta.url);
if (existsSync(new URL("excel-blatt-1.png", output))) {
  throw new Error(
    "Ausgangsvorschau bleibt erhalten. GRADEFLOW_AUDIT_OUTPUT auf einen neuen Ordner setzen.",
  );
}
const workbook = await SpreadsheetFile.importXlsx(
  await FileBlob.load(fileURLToPath(new URL("bericht-390.xlsx", output))),
);
const inspection = await workbook.inspect({
  kind: "sheet",
  include: "id,name",
  maxChars: 4000,
});
await fs.writeFile(new URL("excel-inspektion.txt", output), inspection.ndjson);
for (const [index, range] of [
  [0, "A1:D12"],
  [1, "A1:G8"],
]) {
  const sheet = workbook.worksheets.getItemAt(index);
  const preview = await workbook.render({
    sheetName: sheet.name,
    range,
    scale: 1.5,
    format: "png",
  });
  await fs.writeFile(
    new URL(`excel-blatt-${index + 1}.png`, output),
    new Uint8Array(await preview.arrayBuffer()),
  );
}
console.log("XLSX unverändert importiert; zwei Blattbereiche gerendert.");
