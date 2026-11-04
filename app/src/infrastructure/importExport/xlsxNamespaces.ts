import JSZip from "jszip";
import { SaxesParser } from "saxes";
import { assertXlsxResources } from "./xlsxResources";

const SPREADSHEET_NS =
  "http://schemas.openxmlformats.org/spreadsheetml/2006/main";

function normalizeSpreadsheetXml(xml: string): {
  xml: string;
  worksheetCount: number;
} {
  const parser = new SaxesParser({ xmlns: true });
  const removals: { start: number; length: number }[] = [];
  let openingNameStart = 0;
  let worksheetCount = 0;
  parser.on("doctype", () => {
    throw new RangeError("DTD-Inhalte sind in Klassenlisten nicht zulässig.");
  });
  parser.on("opentagstart", () => {
    openingNameStart = xml.lastIndexOf("<", parser.position - 1) + 1;
  });
  parser.on("opentag", (tag) => {
    if (tag.uri === SPREADSHEET_NS && tag.local === "sheet") worksheetCount++;
    if (tag.uri === SPREADSHEET_NS && tag.prefix) {
      removals.push({ start: openingNameStart, length: tag.prefix.length + 1 });
    }
  });
  parser.on("closetag", (tag) => {
    if (!tag.isSelfClosing && tag.uri === SPREADSHEET_NS && tag.prefix) {
      removals.push({
        start: xml.lastIndexOf("</", parser.position - 1) + 2,
        length: tag.prefix.length + 1,
      });
    }
  });
  parser.write(xml).close();

  // Adapt element names for ExcelJS without reserializing text or attributes.
  const parts: string[] = [];
  let previous = 0;
  for (const removal of removals) {
    parts.push(xml.slice(previous, removal.start));
    previous = removal.start + removal.length;
  }
  parts.push(xml.slice(previous));
  return { xml: parts.join(""), worksheetCount };
}

/** ExcelJS 4.4.0 matches unprefixed tags, although OOXML also permits prefixes. */
export async function normalizeXlsxNamespaces(
  raw: ArrayBuffer,
): Promise<{ normalized: ArrayBuffer | null; worksheetCount: number }> {
  assertXlsxResources(raw);
  const zip = await JSZip.loadAsync(raw);
  let changed = false;
  let worksheetCount = 0;
  for (const entry of Object.values(zip.files)) {
    if (entry.dir || !/^xl\/.*\.xml$/.test(entry.name)) continue;
    const xml = await entry.async("string");
    const result = normalizeSpreadsheetXml(xml);
    if (entry.name === "xl/workbook.xml")
      worksheetCount = result.worksheetCount;
    if (result.xml !== xml) {
      zip.file(entry.name, result.xml);
      changed = true;
    }
  }
  return {
    normalized: changed
      ? await zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE" })
      : null,
    worksheetCount,
  };
}
