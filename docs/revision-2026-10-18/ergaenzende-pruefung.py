"""Ergänzende Fach-, Datei-, Tastatur- und Wiederherstellungsprüfung.

Führt keine produktiven Änderungen aus. Nutzt ausschließlich fiktive Daten.
Lokal mit derselben Python-Umgebung wie browserpruefung.py ausführen.
"""

import copy
import csv
import importlib.util
import json
import time
import zipfile
from datetime import date, timedelta
from pathlib import Path
from xml.etree import ElementTree as ET

from playwright.sync_api import sync_playwright, expect

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("browseraudit", HERE / "browserpruefung.py")
b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)
OUT = b.OUT
RESULTS = []


def record(name, **details):
    RESULTS.append(dict(name=name, **details))
    (OUT / "ergaenzende-ergebnisse.json").write_text(json.dumps(RESULTS, ensure_ascii=False, indent=2))
    print(name, flush=True)


def domain(page):
    page.goto("http://127.0.0.1:5186/")
    result = page.evaluate("""async () => {
      const {applyRating}=await import('/src/domain/grading/gradingEngine.ts');
      const symbols=['--','-','0','+','++'];const deltas=[-2,-1,0,1,2];let checked=0;
      for(let grade=4;grade<=24;grade++)for(let buffer=0;buffer<=(grade===4?3:0);buffer++){
        for(let i=0;i<5;i++){
          const potential=Math.max(-20,Math.min(3,4-grade+buffer+deltas[i]));
          const expected={gradeQuarterSteps:potential>=0?4:4-potential,bufferPoints:Math.max(0,potential)};
          const actual=applyRating({gradeQuarterSteps:grade,bufferPoints:buffer},symbols[i]);
          if(JSON.stringify(expected)!==JSON.stringify(actual))throw Error(JSON.stringify({grade,buffer,expected,actual}));checked++;
        }
      }
      return {transitions:checked,oracle:'Unabhängiges begrenztes Guthaben von -20 bis 3 Viertelschritten'};
    }""")
    record("120 mögliche Übergänge des Fachkerns", **result)
    f = b.fixture(1)
    probes = page.evaluate("""async data => {
      const {assertNotebook}=await import('/src/infrastructure/local/schema.ts');
      const {parseClassImport,importClassFile}=await import('/src/infrastructure/importExport/classImport.ts');
      const results={};
      const check=(name,fn)=>{try{fn();results[name]='angenommen'}catch(e){results[name]=e.message}};
      const duplicate=structuredClone(data);duplicate.classes.push({...structuredClone(data.classes[0]),id:'c2'});
      check('Doppelte sichtbare Klassennamen',()=>assertNotebook(duplicate));
      const empty=structuredClone(data);empty.classes[0].students=[];empty.classes[0].sessions=[];
      check('Leere aktive Klasse',()=>assertNotebook(empty));
      const reserved=structuredClone(data);reserved.classes[0].students[0].id='toString';reserved.classes[0].sessions[0].observations={};
      check('Personen ID toString',()=>assertNotebook(reserved));
      check('45 Personen CSV',()=>parseClassImport('Vorname;Nachname\\n'+Array.from({length:45},(_,i)=>'Fiktiv;Person'+i).join('\\n'),'test.csv'));
      check('46 Personen CSV',()=>parseClassImport('Vorname;Nachname\\n'+Array.from({length:46},(_,i)=>'Fiktiv;Person'+i).join('\\n'),'test.csv'));
      check('Falsche Kopfzeile',()=>parseClassImport('Nachname;Vorname\\nTest;Fiktiv','test.csv'));
      let read=false;
      try{await importClassFile({name:'gross.csv',size:5*1024*1024+1,text:async()=>{read=true;return ''}})}catch(e){results['Dateigröße CSV']=e.message}
      results['Zu große CSV vor Lesen abgewiesen']=!read;
      return results;
    }""", f)
    record("Importgrenzen und Schema", **probes)
    f["classes"][0]["students"][0]["id"] = "toString"
    f["classes"][0]["sessions"][0]["observations"] = {}
    b.seed(page, f)
    observed = page.locator(".student-list button small").first.inner_text()
    record("Reservierte Personen ID erzeugt falschen Status", expected="Offen", actual=observed,
           defect=observed != "Offen")


def keyboard_and_recovery(browser):
    context = browser.new_context(viewport=dict(width=1440,height=1000),locale="de-DE")
    page=context.new_page();b.seed(page,b.fixture())
    b.button(page,"Stunde beginnen").click()
    steps=0
    while steps<80:
        page.keyboard.press("Tab");steps+=1
        if page.evaluate("document.activeElement.getAttribute('aria-label')") == "--":break
    assert steps<80
    outline=page.evaluate("getComputedStyle(document.activeElement).outline")
    for _ in range(20):page.keyboard.press("Enter")
    expect(page.get_by_role("heading",name="Alle Eingaben sind lokal gespeichert")).to_be_visible()
    assert page.evaluate("document.activeElement.textContent") == "Zur Klassenübersicht"
    page.keyboard.press("Enter")
    record("Tastaturabschluss 20 Personen", tabs_to_first_rating=steps,focus_outline=outline,completion_focus=True)
    data=b.fixture(1,3)
    page.evaluate("([key])=>localStorage.setItem(key,'{defekt')",[b.KEY]);page.reload();page.wait_for_load_state("networkidle")
    expect(page.get_by_role("alert")).to_contain_text("kein gültiges JSON")
    raw_before=page.evaluate("key=>localStorage.getItem(key)",b.KEY)
    page.get_by_label("JSON-Sicherung zur Wiederherstellung").set_input_files(dict(name="defekt.json",mimeType="application/json",buffer=b'{}'))
    b.button(page,"Aus Sicherung wiederherstellen").click()
    assert page.evaluate("key=>localStorage.getItem(key)",b.KEY)==raw_before
    page.get_by_label("JSON-Sicherung zur Wiederherstellung").set_input_files(dict(name="gueltig.json",mimeType="application/json",buffer=json.dumps(data).encode()))
    page.once("dialog",lambda d:d.accept());b.button(page,"Aus Sicherung wiederherstellen").click()
    expect(page.get_by_role("status")).to_contain_text("wiederhergestellt")
    assert b.stored(page)==data
    assert page.evaluate("localStorage.getItem('oral-grading-damaged-notebook-backup-v1')")==raw_before
    record("Beschädigten Startstand über Oberfläche wiederherstellen",raw_backup_preserved=True)
    legacy={"classes":[{"id":"lc","name":"Fiktive Legacyklasse","students":[{"id":"lp","name":"Fiktiv Ada","startGrade":2}],"sessions":[]}],"currentClassId":"lc"}
    page.evaluate("raw=>{localStorage.clear();localStorage.setItem('oral-grading-app-v4',raw)}",json.dumps(legacy));page.reload();page.wait_for_load_state("networkidle")
    assert len(b.stored(page)["classes"])==1
    b.button(page,"Datensicherung").click()
    page.once("dialog",lambda d:d.accept());b.button(page,"Legacy-Schlüssel wiederherstellen").click()
    assert json.loads(page.evaluate("localStorage.getItem('oral-grading-app-v4')"))==legacy
    record("Legacy Migration und Rückfall im Browser",legacy_keys_preserved=True,new_notebook_preserved=True)
    context.close()


def load_benchmarks(browser):
    context=browser.new_context(viewport=dict(width=1440,height=1000),locale="de-DE")
    page=context.new_page()
    for sessions in [24,400,1000]:
        f=b.fixture(0)
        # Eigenständige Termine, ohne eine fachliche Laufzeitgrenze einzuführen.
        base=date(2023,1,1)
        model=b.fixture(1)["classes"][0]["sessions"][0]
        f["classes"][0]["sessions"]=[dict(copy.deepcopy(model),id=f"s{i}",date=(base+timedelta(days=i)).isoformat()) for i in range(sessions)]
        b.seed(page,f)
        page.reload();page.wait_for_load_state("networkidle")
        navigation=page.evaluate("performance.getEntriesByType('navigation')[0].toJSON()")
        page.locator(".session-list li").first.get_by_role("button",name="Bearbeiten",exact=True).click()
        samples=[]
        for _ in range(3):
            t=time.perf_counter();b.button(page,"+").click();samples.append(round((time.perf_counter()-t)*1000,2))
        record(f"Lastmessung 20 Personen {sessions} Stunden", bytes=len(json.dumps(f).encode()),
               dom_content_loaded_ms=navigation['domContentLoadedEventEnd'],load_event_ms=navigation['loadEventEnd'],
               input_automation_ms=samples,metric_limit="Ein Mac, Chromium, kein simuliertes langsames Gerät; Automationszeit enthält Wartezeiten")
    context.close()


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
        record(f"CSV XLSX Inhalte {width}",csv_rows=len(rows),sheets=len(names),formula_cells=0,
               numbers_dates_typed=True,current_grades_independently_checked=20,technical_ids_absent=True)


if __name__=='__main__':
    if (OUT/'ergaenzende-ergebnisse.json').exists():
        raise SystemExit('Ausgangsnachweise bleiben erhalten. GRADEFLOW_AUDIT_OUTPUT auf einen neuen Ordner setzen.')
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        page=browser.new_page(locale='de-DE');domain(page);page.close()
        keyboard_and_recovery(browser)
        load_benchmarks(browser)
        browser.close()
    spreadsheets()
