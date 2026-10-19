"""Unabhängige XLSX-Prüfung der fiktiven Zweipersonen-Fixture aus usability_revision.py."""
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
from xml.etree import ElementTree as E
from zipfile import ZipFile

OUT = Path(sys.argv[1]).resolve()
NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
results = []
target = OUT / "excel-dateipruefung.json"
if target.exists():
    raise SystemExit("Vorhandene Nachweise bleiben erhalten.")
for width in [390, 768, 1440]:
    with ZipFile(OUT / f"bericht-{width}.xlsx") as z:
        strings = ["".join(item.itertext()) for item in E.fromstring(z.read("xl/sharedStrings.xml"))]

        def value(tree, address):
            cell = tree.find(f'.//s:c[@r="{address}"]', NS)
            if cell is None:
                return None
            raw = cell.find("s:v", NS)
            if raw is None:
                return None
            return strings[int(raw.text)] if cell.get("t") == "s" else float(raw.text)

        names = [item.get("name") for item in E.fromstring(z.read("xl/workbook.xml")).find("s:sheets", NS)]
        assert names == ["Klassenübersicht", "Fiktiv Ada", "Fiktiv Bea"]
        sheets = [E.fromstring(z.read(f"xl/worksheets/sheet{i}.xml")) for i in [1, 2, 3]]
        assert "Tabellenblätter" in value(sheets[0], "A3") and "Endnote" not in "".join(strings)
        targets = [item.get("Target") for item in E.fromstring(z.read("xl/worksheets/_rels/sheet1.xml.rels"))]
        assert targets == ["#'Fiktiv Ada'!A1", "#'Fiktiv Bea'!A1"]
        assert value(sheets[1], "D6") == "++"
        assert [value(sheets[1], f"B{n}") for n in [6, 7, 8]] == ["1. Stunde", "2. Stunde", "1. Stunde"]
        assert [value(sheets[1], f"F{n}") for n in [6, 7, 8]] == [1.5, 1.75, 1.5]
        assert [value(sheets[2], f"C{n}") for n in [6, 7, 8]] == ["Abwesend", "Nicht beobachtet", "Offen"]
        assert all(value(sheets[2], f"F{n}") is None for n in [6, 7, 8])
        assert all(not sheet.findall(".//s:f", NS) for sheet in sheets)
        styles = E.fromstring(z.read("xl/styles.xml"))
        xfs = list(styles.find("s:cellXfs", NS))
        fonts = list(styles.find("s:fonts", NS))
        formats = {int(item.get("numFmtId")): item.get("formatCode") for item in styles.find("s:numFmts", NS)}
        symbol = sheets[1].find('.//s:c[@r="D6"]', NS)
        font = fonts[int(xfs[int(symbol.get("s"))].get("fontId"))]
        assert float(font.find("s:sz", NS).get("val")) >= 20
        for row, expected in zip([6, 7, 8], ["2026-10-19", "2026-10-19", "2026-10-20"]):
            date = sheets[1].find(f'.//s:c[@r="A{row}"]', NS)
            assert date.get("t", "n") == "n"
            assert (datetime(1899, 12, 30) + timedelta(days=value(sheets[1], f"A{row}"))).date().isoformat() == expected
            assert formats[int(xfs[int(date.get("s"))].get("numFmtId"))] == "dd.mm.yyyy"
        results.append({"width": width, "sheets": 3, "internal_person_links": 2, "symbols_pt": 20, "grades_checked": 3, "typed_dates_and_formats": True, "ungraded_cells_empty": True, "formulas": 0})
target.write_text(json.dumps(results, ensure_ascii=False, indent=2))
print(json.dumps(results, ensure_ascii=False))
