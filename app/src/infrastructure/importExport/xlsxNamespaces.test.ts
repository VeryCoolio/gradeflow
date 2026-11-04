import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { normalizeXlsxNamespaces } from "./xlsxNamespaces";

const NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";

async function xmlArchive(xml: string) {
  const zip = new JSZip();
  zip.file("xl/workbook.xml", xml);
  zip.file("xl/_rels/workbook.xml.rels", "relationships stay unchanged");
  zip.file("unchanged.bin", new Uint8Array([1, 2, 3]));
  return zip.generateAsync({ type: "arraybuffer" });
}

describe("OOXML-Namespace-Kompatibilität", () => {
  it("ändert nur Elementpräfixe des gebundenen Spreadsheet-Namespace", async () => {
    const xml = `<?xml version="1.0"?><s:workbook xmlns:s="${NS}" xmlns:r="urn:relationships" xmlns:other="urn:other"><s:sheets><s:sheet name="Fiktiv" r:id="rId1"/></s:sheets><other:metadata other:id="s:value"><![CDATA[<s:literal>]]><!-- <s:comment/> --></other:metadata></s:workbook>`;
    const raw = await xmlArchive(xml);
    const before = new Uint8Array(raw).slice();
    const { normalized, worksheetCount } = await normalizeXlsxNamespaces(raw);
    expect(worksheetCount).toBe(1);
    expect(normalized).not.toBeNull();
    const zip = await JSZip.loadAsync(normalized!);
    const actual = await zip.file("xl/workbook.xml")!.async("string");
    expect(actual).toContain(`<workbook xmlns:s="${NS}"`);
    expect(actual).toContain('<sheet name="Fiktiv" r:id="rId1"/>');
    expect(actual).toContain(
      '<other:metadata other:id="s:value"><![CDATA[<s:literal>]]><!-- <s:comment/> --></other:metadata>',
    );
    expect(actual).toContain('xmlns:r="urn:relationships"');
    expect(await zip.file("xl/_rels/workbook.xml.rels")!.async("string")).toBe(
      "relationships stay unchanged",
    );
    expect(await zip.file("unchanged.bin")!.async("uint8array")).toEqual(
      new Uint8Array([1, 2, 3]),
    );
    expect(new Uint8Array(raw)).toEqual(before);
  });

  it("lässt fremde Namespaces und bereits unpräfixierte Inhalte unangetastet", async () => {
    for (const xml of [
      '<s:workbook xmlns:s="urn:other"><s:sheets/></s:workbook>',
      `<workbook xmlns="${NS}"><sheets/></workbook>`,
    ]) {
      expect(
        (await normalizeXlsxNamespaces(await xmlArchive(xml))).normalized,
      ).toBeNull();
    }
  });

  it("erkennt mehrere Präfixe unter einem Defaultnamespace und berücksichtigt Rebinding", async () => {
    const xml = `<workbook xmlns="${NS}" xmlns:a="${NS}" xmlns:b="${NS}"><a:sheets><b:sheet name="Fiktiv"/></a:sheets><a:metadata xmlns:a="urn:foreign"><a:note xmlns:b="urn:foreign"><b:detail/></a:note></a:metadata></workbook>`;
    const { normalized } = await normalizeXlsxNamespaces(await xmlArchive(xml));
    const zip = await JSZip.loadAsync(normalized!);
    expect(await zip.file("xl/workbook.xml")!.async("string")).toBe(
      `<workbook xmlns="${NS}" xmlns:a="${NS}" xmlns:b="${NS}"><sheets><sheet name="Fiktiv"/></sheets><a:metadata xmlns:a="urn:foreign"><a:note xmlns:b="urn:foreign"><b:detail/></a:note></a:metadata></workbook>`,
    );
  });

  it("erhält Unicode, Zeilenenden und Attributwerte beim Anpassen einzelner Elementnamen", async () => {
    const xml = `<?xml version="1.0"?>\r\n<workbook xmlns="${NS}"><s:sheet xmlns:s='${NS}' name="🦔 Fiktiv &amp; Beispiel" custom="größer > kleiner"><s:value>🦔 &lt;s:text&gt;\r\n<![CDATA[<s:literal>]]></s:value></s:sheet></workbook>`;
    const { normalized } = await normalizeXlsxNamespaces(await xmlArchive(xml));
    const zip = await JSZip.loadAsync(normalized!);
    expect(await zip.file("xl/workbook.xml")!.async("string")).toBe(
      xml
        .replace("<s:sheet", "<sheet")
        .replace("</s:sheet>", "</sheet>")
        .replace("<s:value>", "<value>")
        .replace("</s:value>", "</value>"),
    );
  });

  it("weist ungebundene Präfixe und DTDs vor ExcelJS ab", async () => {
    for (const xml of [
      `<workbook xmlns="${NS}"><missing:sheet/></workbook>`,
      `<!DOCTYPE workbook><workbook xmlns="${NS}"/>`,
    ]) {
      await expect(
        normalizeXlsxNamespaces(await xmlArchive(xml)),
      ).rejects.toThrow();
    }
  });

  it("behält die Ressourcenprüfung vor dem Entpacken bei", async () => {
    await expect(normalizeXlsxNamespaces(new ArrayBuffer(3))).rejects.toThrow(
      /nicht gelesen/,
    );
  });
});
