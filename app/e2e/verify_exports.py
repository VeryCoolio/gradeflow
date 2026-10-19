"""Unabhängige Inhaltsprüfung tatsächlich heruntergeladener CSV-/XLSX-Berichte.

Aufruf: python app/e2e/verify_exports.py AUSGABEORDNER
Nur Python-Standardbibliothek; keine native Excel-Prüfung.
"""
import csv
import json
import sys
import zipfile
from datetime import datetime, timedelta
from pathlib import Path
from xml.etree import ElementTree as ET

OUT=Path(sys.argv[1]).resolve()
RESULTS=[]
def record(name,**details):
    RESULTS.append(dict(name=name,**details))
    print(name,flush=True)

def spreadsheets():
    ns={"s":"http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    for width in [390,768,1440]:
        backup=json.loads((OUT/f"sicherung-{width}.json").read_text())
        group=backup['classes'][0]
        with (OUT/f"bericht-{width}.csv").open(encoding='utf-8-sig',newline='') as fh:
            rows=list(csv.reader(fh,delimiter=';'))
        assert len(rows)==81 and all(len(row)==10 for row in rows)
        assert rows[0]==['Klasse','Bewertungszeitraum','Person','Eintrag','Datum','Stunde','Status','Symbol','Stand','Puffer']
        final={r[2]:r[8] for r in rows[1:] if r[3]=='Aktuell'}
        slots=sorted(group['sessions'],key=lambda x:(x['date'],x['lessonSequence'],x['id']))
        for student in group['students']:
            potential=-4
            for session in slots:
                obs=session['observations'].get(student['id'])
                if obs and obs['status']=='bewertet':potential=max(-20,min(3,potential+{'--':-2,'-':-1,'0':0,'+':1,'++':2}[obs['symbol']]))
            grade=(4 if potential>=0 else 4-potential)/4
            assert final[student['displayName']]==f'{grade:.2f}'.replace('.',',')
        with zipfile.ZipFile(OUT/f"bericht-{width}.xlsx") as z:
            book=ET.fromstring(z.read('xl/workbook.xml'))
            sheets=book.find('s:sheets',ns)
            names=[s.attrib['name'] for s in sheets]
            assert len(names)==21 and len({n.lower() for n in names})==21 and all(len(n)<=31 for n in names)
            strings=ET.fromstring(z.read('xl/sharedStrings.xml'))
            texts=[''.join(el.itertext()) for el in strings]
            xml=''.join(z.read(name).decode() for name in z.namelist() if name.endswith('.xml'))
            assert all(student['id'] not in xml for student in group['students'])
            cells=[]
            for name in z.namelist():
                if name.startswith('xl/worksheets/sheet') and name.endswith('.xml'):
                    tree=ET.fromstring(z.read(name));assert not tree.findall('.//s:f',ns)
                    cells.append(tree)
            first=cells[0]
            c=first.find('.//s:c[@r="C6"]',ns)
            assert c.attrib.get('t','n')=='n' and float(c.find('s:v',ns).text)==2.5
            for tree in cells[1:]:
                for addr in ['A6','F6']:
                    cell=tree.find(f'.//s:c[@r="{addr}"]',ns)
                    if cell is not None and cell.find('s:v',ns) is not None:assert cell.attrib.get('t','n')=='n'
            assert 'Abwesend' in texts and 'Nicht beobachtet' in texts
            styles=ET.fromstring(z.read('xl/styles.xml'))
            formats={int(el.attrib['numFmtId']):el.attrib['formatCode'] for el in styles.findall('s:numFmts/s:numFmt',ns)}
            xfs=list(styles.find('s:cellXfs',ns))
            def value(tree,address):
                cell=tree.find(f'.//s:c[@r="{address}"]',ns)
                if cell is None:return None
                raw=cell.find('s:v',ns)
                if raw is None:return None
                return texts[int(raw.text)] if cell.attrib.get('t')=='s' else float(raw.text)
            for student,tree in zip(group['students'],cells[1:]):
                potential=-4
                for number,session in enumerate(slots,6):
                    native=value(tree,f'A{number}')
                    assert isinstance(native,float)
                    assert (datetime(1899,12,30)+timedelta(days=native)).date().isoformat()==session['date']
                    datecell=tree.find(f'.//s:c[@r="A{number}"]',ns)
                    fmt=int(xfs[int(datecell.attrib['s'])].attrib['numFmtId'])
                    assert formats.get(fmt)=='dd.mm.yyyy'
                    obs=session['observations'].get(student['id'])
                    if obs and obs['status']=='bewertet':
                        potential=max(-20,min(3,potential+{'--':-2,'-':-1,'0':0,'+':1,'++':2}[obs['symbol']]))
                        assert value(tree,f'F{number}')==(4 if potential>=0 else 4-potential)/4
                        assert value(tree,f'G{number}')==max(0,potential)
                    else:
                        assert value(tree,f'F{number}') is None and value(tree,f'G{number}') is None

        record(f"CSV XLSX Inhalte {width}",csv_rows=len(rows),sheets=len(names),formula_cells=0,
               numbers_dates_typed=True,current_grades_independently_checked=20,technical_ids_absent=True)



if (OUT/'dateiinhalte.json').exists():raise SystemExit('Vorhandene Nachweise bleiben erhalten.')
spreadsheets()
(OUT/'dateiinhalte.json').write_text(json.dumps(RESULTS,ensure_ascii=False,indent=2))
