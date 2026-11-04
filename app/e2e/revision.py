"""Revisionsregression mit fiktiven Daten in isolierten Chromium-Profilen.

Voraussetzung: npm run build und npm run preview -- --host 127.0.0.1 --port 4186.
Ausführen: ~/.cache/codex-fact-tools/venv/bin/python app/e2e/revision.py
GRADEFLOW_AUDIT_OUTPUT muss bei weiteren Läufen auf einen neuen Ordner zeigen.
Kein Zugriff auf normale Browserprofile, kein externer Dienst.
"""

import copy
import csv
import io
import json
import os
import time
import traceback
import sys
import zipfile
import subprocess
from datetime import date, timedelta
from xml.etree import ElementTree as ET
from pathlib import Path

from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(os.environ.get("GRADEFLOW_AUDIT_OUTPUT", ROOT / "docs/revision-2026-10-18/umsetzung/abschluss-browser"))
BASE = "http://127.0.0.1:4186/"
KEY = "oral-grading-notebook-v1"
NOW = "2026-10-18T10:00:00.000Z"
NAMES = [" ".join(row) for row in list(csv.reader(
    (ROOT / "app/public/demo-klasse.csv").open(encoding="utf-8-sig"), delimiter=";"
))[1:]]
RESULTS = []


def record(name, status="PASS", **details):
    RESULTS.append(dict(name=name, status=status, **details))
    (OUT / "browserergebnisse.json").write_text(
        json.dumps(RESULTS, ensure_ascii=False, indent=2)
    )
    print(name, status, flush=True)


def fixture(sessions=0, count=20):
    students = [dict(id=f"p{i+1}", displayName=n, startGradeQuarterSteps=8)
                for i, n in enumerate(NAMES[:count])]
    lessons = []
    for i in range(sessions):
        date = f"2026-09-{1 if i < 2 else i:02d}"
        observations = {}
        for j, student in enumerate(students):
            mode = (i+j) % 7
            if mode < 5:
                observations[student["id"]] = dict(status="bewertet", symbol=["--", "-", "0", "+", "++"][mode])
            elif mode == 5:
                observations[student["id"]] = dict(status="abwesend")
            else:
                observations[student["id"]] = dict(status="nicht_beobachtet")
        lessons.append(dict(id=f"s{i+1}", date=date, lessonSequence=2 if i == 1 else 1,
                            createdAt=f"2026-09-{min(i+1,28):02d}T10:00:00.000Z", updatedAt=NOW,
                            observations=observations))
    group = dict(id="c1", name="Prüfung 8b", periodLabel="Schuljahr 2026/27", archived=False,
                 createdAt=NOW, updatedAt=NOW, students=students, sessions=lessons)
    return dict(schemaVersion=1, currentClassId="c1", classes=[group])


def stored(page):
    return page.evaluate("key => JSON.parse(localStorage.getItem(key))", KEY)


def seed(page, data):
    page.goto(BASE)
    page.wait_for_load_state("networkidle")
    page.evaluate("([key,data]) => {localStorage.clear();localStorage.setItem(key,JSON.stringify(data));history.replaceState(null,'',location.pathname)}", [KEY, data])
    page.reload()
    page.wait_for_load_state("networkidle")


def button(page, name):
    return page.get_by_role("button", name=name, exact=True)


def back(page):
    button(page, "← Zur Klasse").click()


def snapshot(page, name):
    page.screenshot(path=str(OUT / (name+".png")), full_page=True)


def positions(page):
    return page.evaluate("""() => Object.fromEntries(
      ['.grading-panel h3','.assessment-header h2','.assessment-progress','.rating-grid','.feedback','.save-status','.status-grid','.assessment-context'].map(s=>{
        const e=document.querySelector(s);const r=e?.getBoundingClientRect();
        return [s,r?{top:r.top,bottom:r.bottom,visible:r.top>=0&&r.bottom<=innerHeight}:null]
      }))""")


def run_case(name, operation):
    try:
        operation()
    except Exception as error:
        record(name, "ERROR", message=str(error), trace=traceback.format_exc())


def core(browser, width, height):
    context = browser.new_context(viewport=dict(width=width, height=height), locale="de-DE", timezone_id="Europe/Berlin", accept_downloads=True)
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(BASE)
    page.wait_for_load_state("networkidle")
    button(page, "Klasse anlegen / importieren").first.click()
    button(page, "Klassenliste importieren").click()
    page.get_by_label("Klassenname", exact=True).fill("Prüfung 8b")
    page.get_by_label("Klassenliste", exact=True).set_input_files(str(ROOT / "app/public/demo-klasse.csv"))
    button(page, "Klasse lokal anlegen").click()
    expect(page.get_by_role("heading", name="Prüfung 8b", exact=True)).to_be_visible()
    assert len(stored(page)["classes"][0]["students"]) == 20
    snapshot(page, f"klasse-{width}")
    page.locator("#lesson-date").fill("2026-10-18")
    button(page, "Stunde beginnen").click()
    before = positions(page)
    snapshot(page, f"eingabe-start-{width}")
    button(page, "+").click()
    after = positions(page)
    page.screenshot(path=str(OUT / f"eingabe-sichtfenster-{width}.png"))
    oriented = all(after[key]["visible"] for key in [".grading-panel h3", ".assessment-header h2", ".assessment-progress", ".save-status"])
    record(f"Orientierung {width}", "PASS" if oriented else "DEFECT", before=before, after=after,
           criteria="Aktuelle Person, Fortschritt und Speicherhinweis gemeinsam sichtbar")
    expected = [dict(status="bewertet", symbol="+")]
    for index in range(20):
        if index:
            label = "Abwesend" if index == 1 else "Nicht beobachtet" if index == 2 else "0"
            button(page, label).click()
            expected.append(dict(status="abwesend") if index == 1 else dict(status="nicht_beobachtet") if index == 2 else dict(status="bewertet", symbol="0"))
        current = stored(page)
        session = current["classes"][0]["sessions"][0]
        assert len(session["observations"]) == index+1
        page.reload()
        page.wait_for_load_state("networkidle")
        assert stored(page) == current
        if index < 19:
            expect(page.locator(".grading-panel h3")).to_have_text(NAMES[index+1])
    for student, observation in zip(current["classes"][0]["students"], expected):
        assert session["observations"][student["id"]] == observation
    record(f"Import und Neuladen nach jeder der 20 Eingaben {width}", observations=20)
    button(page, "Zur Klassenübersicht").click()
    button(page, "Tabelle").click()
    snapshot(page, f"tabelle-{width}")
    text = page.locator(".class-table").inner_text()
    assert all(value in text for value in ["AW", "NB", "1,75"])
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    button(page, "Verlauf").click()
    snapshot(page, f"verlauf-{width}")
    axis = page.locator("svg [data-session-id]").all_text_contents()
    button(page, "Nächste Person").click()
    assert page.locator("svg [data-session-id]").all_text_contents() == axis
    assert page.locator("svg circle").count() == 1
    button(page, "Stunden").click()
    button(page, "Stunde beginnen").click()
    for index in range(20):
        button(page, "0").click()
    expect(page.get_by_role("heading", name="Alle Eingaben sind lokal gespeichert")).to_be_visible()
    assert page.evaluate("document.activeElement.textContent") == "Zur Klassenübersicht"
    button(page, "Zur Klassenübersicht").click()
    button(page, "Stunde beginnen").click()
    expect(page.get_by_role("alert")).to_contain_text("höchstens zwei")
    assert len(stored(page)["classes"][0]["sessions"]) == 2
    button(page, "Bearbeiten").first.click()
    button(page, "--").click()
    back(page)
    button(page, "Tabelle").click()
    assert "2,50" in page.locator(".class-table tbody tr").first.inner_text()
    button(page, "Stunden").click()
    previous = stored(page)
    button(page, "Reihenfolge tauschen").click()
    swapped = stored(page)
    for old, new in zip(previous["classes"][0]["sessions"], swapped["classes"][0]["sessions"]):
        assert old["id"] == new["id"] and old["observations"] == new["observations"]
        assert new["lessonSequence"] == 3-old["lessonSequence"]
    record(f"Status Verlauf alte Stunde Grenze Tausch {width}", page_errors=errors)
    for kind, label in [("csv", "Klasse als CSV exportieren"), ("xlsx", "Klasse als Excel exportieren")]:
        samples = []
        for run in range(3):
            started = time.perf_counter()
            with page.expect_download() as download_info:
                button(page, label).click()
            download = download_info.value
            download.save_as(str(OUT / f"bericht-{width}.{kind}"))
            samples.append(round((time.perf_counter()-started)*1000, 2))
        record(f"Export {kind} {width}", milliseconds=samples, measurement="Playwright Klick bis Download inklusive Automationswartezeit; erster Lauf kalt")
    button(page, "Datensicherung").click()
    with page.expect_download() as download_info:
        button(page, "Vollständige JSON-Sicherung herunterladen").click()
    backup = OUT / f"sicherung-{width}.json"
    download_info.value.save_as(str(backup))
    assert json.loads(backup.read_text()) == stored(page)
    old = stored(page)
    page.get_by_label("JSON-Sicherung auswählen").set_input_files(dict(name="defekt.json", mimeType="application/json", buffer=b'{"schemaVersion":999}'))
    button(page, "JSON-Sicherung importieren").click()
    expect(page.get_by_role("alert")).to_contain_text("Schemaversion")
    assert stored(page) == old
    page.get_by_label("JSON-Sicherung auswählen").set_input_files(str(backup))
    page.once("dialog", lambda dialog: dialog.accept())
    button(page, "JSON-Sicherung importieren").click()
    expect(page.get_by_role("status")).to_contain_text("Sicherung importiert")
    assert stored(page) == old
    page.once("dialog", lambda dialog: dialog.accept())
    button(page, "Stand vor letztem Import wiederherstellen").click()
    expect(page.get_by_role("status")).to_contain_text("wiederhergestellt")
    assert stored(page) == old
    record(f"Backup Rundlauf defekte Datei und Rückfall {width}", exact_roundtrip=True)
    record(f"Seitenbreite {width}", overflow=page.evaluate("document.documentElement.scrollWidth-innerWidth"))
    context.close()


def failure_cases(browser):
    context = browser.new_context(viewport=dict(width=390, height=844), locale="de-DE")
    page = context.new_page()
    data = fixture(1, 3)
    del data["classes"][0]["sessions"][0]["observations"]["p3"]
    seed(page, data)
    original = stored(page)
    page.evaluate("""() => {window.originalSetItem=Storage.prototype.setItem;
      Storage.prototype.setItem=function(k,v){if(k==='oral-grading-notebook-v1')throw new DOMException('Prüfquota','QuotaExceededError');return window.originalSetItem.call(this,k,v)}}""")
    button(page, "0").click()
    expect(page.get_by_role("alert")).to_contain_text("Lokales Speichern fehlgeschlagen")
    assert stored(page) == original
    assert page.get_by_role("heading", name="Alle Eingaben sind lokal gespeichert").count() == 0
    geometry = positions(page)
    page.screenshot(path=str(OUT / "speicherfehler-sichtfenster-mobil.png"))
    record("Letzte Eingabe bei Speicherfehler", no_false_success=True, unchanged=True,
           feedback_visible=geometry[".feedback"]["visible"], geometry=geometry)
    page.evaluate("() => { Storage.prototype.setItem=window.originalSetItem; }")
    button(page, "Eingabe erneut speichern").click()
    expect(page.get_by_role("heading", name="Alle Eingaben sind lokal gespeichert")).to_be_visible()
    back(page)
    button(page, "Klasse und Zeitraum").click()
    page.once("dialog", lambda dialog: dialog.accept())
    button(page, "Zeitraum archivieren").click()
    assert stored(page)["classes"][0]["archived"] is True
    page.reload();page.wait_for_load_state("networkidle")
    assert page.get_by_role("button", name="Stunde beginnen", exact=True).count() == 0
    button(page, "Klasse und Zeitraum").click()
    button(page, "Zeitraum wieder öffnen").click()
    page.once("dialog", lambda dialog: dialog.accept())
    button(page, "Klasse löschen").click()
    assert stored(page)["classes"] == []
    button(page, "Datensicherung").click()
    page.once("dialog", lambda dialog: dialog.accept())
    button(page, "Stand vor letzter Klassenlöschung wiederherstellen").click()
    assert len(stored(page)["classes"]) == 1
    record("Archivieren Öffnen Löschen und Rückfall im Browser")
    context.close()


def multi_tab(browser):
    context = browser.new_context(locale="de-DE")
    a = context.new_page();seed(a, fixture())
    b = context.new_page();b.goto(BASE);b.wait_for_load_state("networkidle")
    expect(button(b,"Stunde beginnen")).to_be_disabled()
    button(a,"Stunde beginnen").click();button(a,"+").click()
    expect(b.locator('.session-list li')).to_have_count(1)
    before=stored(a)
    b.get_by_label('Klasse auswählen').select_option('c1')
    assert stored(b)==before
    button(b,'Klasse und Zeitraum').click()
    for name in ['Klassenname und Zeitraum bearbeiten','Zeitraum archivieren','Klasse löschen']:
        expect(button(b,name)).to_be_disabled()
    a.close()
    button(b,'Bearbeitung hier übernehmen').click()
    expect(button(b,'Klassenname und Zeitraum bearbeiten')).to_be_enabled()
    button(b,'Stunden').click();button(b,'Fortsetzen').click();button(b,'Nicht beobachtet').click()
    assert len(stored(b)['classes'][0]['sessions'][0]['observations'])==2
    record('Zwei Tabs: Schreibschutz Aktualisierung Klassenauswahl und Übernahme', no_data_loss=True, readonly_controls=True)
    context.close()


def resume_and_navigation(browser):
    context = browser.new_context(locale="de-DE")
    page = context.new_page()
    data = fixture(3)
    data["classes"][0]["sessions"][0]["observations"] = {"p1":dict(status="bewertet",symbol="+")}
    data["classes"][0]["sessions"][2]["observations"] = {}
    seed(page, data)
    back(page)
    page.locator('[data-session-id="s1"]').get_by_role("button", name="Fortsetzen", exact=True).click()
    old = page.locator(".assessment-header h2").inner_text()
    page.reload();page.wait_for_load_state("networkidle")
    new = page.locator(".assessment-header h2").inner_text()
    record("Wiederaufnahme mehrerer offener Stunden", "DEFECT" if old != new else "PASS", before=old, after=new)
    back(page);button(page,"Tabelle").click()
    page.reload();page.wait_for_load_state("networkidle")
    record("Neuladen der Tabellenansicht", "DEFECT" if page.locator(".class-table").count() == 0 else "PASS",
           landing="Laufende Stunde" if page.locator(".assessment-header").count() else "Klasse")
    context.close()


def table_cases(browser):
    for width,height in [(390,844),(768,1024),(1440,1000)]:
        context=browser.new_context(viewport=dict(width=width,height=height),locale="de-DE")
        page=context.new_page();seed(page,fixture(24));button(page,"Tabelle").click()
        before=page.locator(".class-table .current-column").all_text_contents()
        expect(page.get_by_role("status").last).to_have_text("Stunden 15–24 von 24")
        button(page,"Ältere Stunden").click()
        expect(page.get_by_role("status").last).to_have_text("Stunden 5–14 von 24")
        page.get_by_label("Stunden pro Ansicht").select_option("0")
        button(page,"Mit Notenverlauf").click()
        page.get_by_label("Tabellengröße").select_option("large")
        after=page.locator(".class-table .current-column").all_text_contents()
        assert before==after
        region=page.get_by_role("region",name="Stundentabelle",exact=True)
        region.focus();page.keyboard.press("ArrowRight")
        page.wait_for_timeout(150)
        scroll=region.evaluate("e=>({scrollLeft:e.scrollLeft,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth})")
        snapshot(page,f"tabelle-24-{width}")
        button(page,"Verlauf").click()
        circles=page.locator("svg circle").count()
        coords=page.locator("svg [data-session-id]").evaluate_all("els=>els.map(e=>Number(e.getAttribute('x')))")
        assert all(b-a==112 for a,b in zip(coords,coords[1:]))
        button(page,"Nächste Person").click()
        assert coords==page.locator("svg [data-session-id]").evaluate_all("els=>els.map(e=>Number(e.getAttribute('x')))")
        record(f"24 Stunden Tabelle Tastatur Verlauf {width}", scroll=scroll,points=circles, spacing=112)
        context.close()


def accessibility_and_imports(browser):
    results=[]
    for width,height in [(390,844),(768,1024),(1440,1000)]:
        context=browser.new_context(viewport=dict(width=width,height=height),locale='de-DE')
        page=context.new_page();data=fixture(1);data['classes'][0]['sessions'][0]['observations']={};seed(page,data)
        page.locator('#main-content').focus();steps=0
        while steps<5:
            page.keyboard.press('Tab');steps+=1
            if page.evaluate("document.activeElement.getAttribute('aria-label')")=='--':break
        assert steps<=3
        for _ in range(20): page.keyboard.press('Enter')
        expect(page.get_by_role('heading',name='Alle Eingaben sind lokal gespeichert')).to_be_visible()
        assert page.evaluate('document.activeElement.textContent')=='Zur Klassenübersicht'
        page.keyboard.press('Enter')
        button(page,'Bearbeiten').click()
        if width<900:
            button(page,'Person wählen').click();expect(page.get_by_role('dialog')).to_be_visible()
            page.get_by_role('dialog').get_by_role('button').nth(2).focus();page.keyboard.press('Enter')
            expect(page.get_by_role('dialog')).not_to_be_visible()
            assert page.evaluate("document.activeElement.getAttribute('aria-label')")=='--'
        data['classes'][0]['students'][0]['displayName']='Fiktiv Beatrix Alexandra Beispielname mit sehr langem Doppelnamen'
        data['classes'][0]['sessions'][0]['observations']={};seed(page,data)
        page.emulate_media(reduced_motion='reduce');page.add_style_tag(content='html{font-size:200% !important}')
        button(page,'Nicht beobachtet').focus()
        bounds=button(page,'Nicht beobachtet').bounding_box();context_bounds=page.locator('.assessment-context').bounding_box()
        assert bounds['y']>=context_bounds['y']+context_bounds['height']-1
        assert bounds['y']+bounds['height']<=height
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        assert page.locator('.grading-panel h3').inner_text()==data['classes'][0]['students'][0]['displayName']
        snapshot(page,f'grossschrift-langer-name-{width}')
        page.keyboard.press('Enter')
        assert stored(page)['classes'][0]['sessions'][0]['observations']['p1']['status']=='nicht_beobachtet'
        record(f'Tastatur Personenwahl Abschluss Großschrift {width}', tabs_to_first_rating=steps, focus_uncovered=True, no_text_truncation=True, limitation='CSS-Grundschrift 200 Prozent; kein echter OS-Zoom')
        context.close()
    context=browser.new_context(locale='de-DE');page=context.new_page();seed(page,fixture(2));old=stored(page)
    page.evaluate("""()=>{Storage.prototype.setItem=function(){throw new DOMException('Prüfung','QuotaExceededError')}}""")
    button(page,'Reihenfolge tauschen').click();expect(page.get_by_role('alert')).to_contain_text('Lokales Speichern fehlgeschlagen');assert stored(page)==old
    record('Speicherfehler beim atomaren Stundentausch', unchanged=True)
    context.close()
    context=browser.new_context(locale='de-DE')
    context.add_init_script("""Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Prüfung','SecurityError')}})""")
    page=context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)));page.goto(BASE);page.wait_for_load_state('networkidle');expect(page.get_by_role('alert')).to_contain_text('Lesen fehlgeschlagen');assert not errors
    snapshot(page,'speicherzugriff-verweigert');record('Verweigerter Storage-Zugriff', blank_screen=False, page_errors=errors);context.close()


def recovery_and_xlsx(browser):
    context=browser.new_context(locale='de-DE');page=context.new_page();seed(page,fixture())
    page.evaluate("key=>{localStorage.setItem(key,'{defekt')}",KEY);page.reload();page.wait_for_load_state('networkidle')
    expect(page.get_by_role('alert')).to_contain_text('gültiges JSON')
    data=fixture(1,3)
    page.get_by_label('JSON-Sicherung zur Wiederherstellung').set_input_files(dict(name='gut.json',mimeType='application/json',buffer=json.dumps(data).encode()))
    page.once('dialog',lambda d:d.accept());button(page,'Aus Sicherung wiederherstellen').click()
    expect(page.get_by_role('heading',name='Prüfung 8b',exact=True)).to_be_visible()
    assert stored(page)==data and page.evaluate("localStorage.getItem('oral-grading-damaged-notebook-backup-v1')")=='{defekt'
    record('Beschädigten Startstand wiederherstellen', raw_backup_preserved=True)
    legacy={'classes':[{'id':'lc','name':'Fiktive Legacyklasse','students':[{'id':'lp','name':'Fiktiv Ada','startGrade':2}],'sessions':[]}],'currentClassId':'lc'}
    page.evaluate("data=>{localStorage.clear();localStorage.setItem('oral-grading-app-v4',JSON.stringify(data));history.replaceState(null,'',location.pathname)}",legacy);page.reload();page.wait_for_load_state('networkidle')
    assert stored(page)['classes'][0]['name']=='Fiktive Legacyklasse'
    button(page,'Datensicherung').click();page.once('dialog',lambda d:d.accept());button(page,'Legacy-Schlüssel wiederherstellen').click()
    assert json.loads(page.evaluate("localStorage.getItem('oral-grading-app-v4')"))==legacy
    record('Legacy Migration und Rückfall', unchanged_legacy=True)
    button(page,'Klasse anlegen / importieren').click();button(page,'Klassenliste importieren').click();page.get_by_label('Klassenname',exact=True).fill('Fiktive Excelklasse')
    file=OUT/'klassenliste.xlsx'
    subprocess.run(['node','--input-type=module','-e', "import ExcelJS from 'exceljs';const w=new ExcelJS.Workbook();const s=w.addWorksheet('Klasse');[['Vorname','Nachname'],['Fiktiv','Ada'],['Fiktiv','Bea']].forEach(r=>s.addRow(r));await w.xlsx.writeFile(process.argv[1]);", str(file)],cwd=ROOT/'app',check=True)
    page.get_by_label('Klassenliste',exact=True).set_input_files(file);button(page,'Klasse lokal anlegen').click();expect(page.get_by_role('heading',name='Fiktive Excelklasse',exact=True)).to_be_visible()
    assert len(stored(page)['classes'][-1]['students'])==2
    record('XLSX Import im echten Browser Worker', students=2)
    button(page,'Klasse anlegen / importieren').click();button(page,'Klassenliste importieren').click();page.get_by_label('Klassenname',exact=True).fill('Fiktive kaputte Excelklasse')
    bomb=OUT/'zu-gross-entpackt.xlsx'
    with zipfile.ZipFile(bomb,'w',compression=zipfile.ZIP_DEFLATED) as z:z.writestr('xl/worksheets/sheet1.xml',b'0'*(2*1024*1024+1))
    old=stored(page);page.get_by_label('Klassenliste',exact=True).set_input_files(bomb);button(page,'Klasse lokal anlegen').click();expect(page.get_by_role('alert')).to_contain_text('entpackte Excel-Datei');assert stored(page)==old
    record('Komprimierte große XLSX vor Parser abweisen', file_bytes=bomb.stat().st_size, inflated_bytes=2*1024*1024+1, unchanged=True)
    button(page,'Datensicherung').click();old=stored(page)
    page.get_by_label('JSON-Sicherung auswählen').set_input_files(dict(name='zu-gross.json',mimeType='application/json',buffer=b' '*(5*1024*1024+1)))
    button(page,'JSON-Sicherung importieren').click();expect(page.get_by_role('alert')).to_contain_text('5 MiB');assert stored(page)==old
    record('JSON Dateigrenze im Browser', unchanged=True)
    context.close()


def benchmarks(browser):
    context=browser.new_context(viewport=dict(width=1440,height=1000),locale='de-DE');page=context.new_page()
    model=fixture(1)['classes'][0]['sessions'][0]
    for count in [24,400,1000]:
        data=fixture();data['classes'][0]['sessions']=[dict(copy.deepcopy(model),id=f's{i}',date=(date(2023,1,1)+timedelta(days=i)).isoformat()) for i in range(count)]
        seed(page,data);start=time.perf_counter();page.reload(wait_until='commit');expect(page.locator('.session-list li').first).to_be_visible();ready_ms=round((time.perf_counter()-start)*1000,2);page.wait_for_load_state('networkidle');navigation=page.evaluate("performance.getEntriesByType('navigation')[0].toJSON()")
        assert page.locator('.session-list li').count()==20
        page.locator('.session-list li').first.get_by_role('button',name='Bearbeiten',exact=True).click();samples=[]
        for _ in range(3):
            start=time.perf_counter();button(page,'+').click();samples.append(round((time.perf_counter()-start)*1000,2))
        record(f'Lastmessung 20 Personen {count} Stunden', bytes=len(json.dumps(data).encode()),dom_content_loaded_ms=navigation['domContentLoadedEventEnd'],load_event_ms=navigation['loadEventEnd'],input_automation_ms=samples,visible_sessions=20,reload_to_visible_list_automation_ms=ready_ms,metric_limit='Ein Mac, Chromium, warmes Profil; kein LCP oder schwaches Gerät; Automationszeit enthält Wartezeit')
    context.close()


if __name__ == '__main__':
    if (OUT/'browserergebnisse.json').exists():raise SystemExit('Vorhandene Nachweise bleiben erhalten. Neuen Ausgabeordner wählen.')
    OUT.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        record('Browserumgebung',browser_version=browser.version,production_url=BASE)
        for width,height in [(390,844),(768,1024),(1440,1000)]:run_case(f'Kernablauf {width}',lambda w=width,h=height:core(browser,w,h))
        for name,operation in [('Fehler und Rückfall',failure_cases),('Zwei Tabs',multi_tab),('Wiederaufnahme',resume_and_navigation),('Große Tabelle',table_cases),('Fokus und Grenzen',accessibility_and_imports),('Rettung und Dateiimporte',recovery_and_xlsx),('Lastmessung',benchmarks)]:run_case(name,lambda op=operation:op(browser))
        browser.close()
    print(json.dumps({s:sum(r['status']==s for r in RESULTS) for s in ['PASS','DEFECT','ERROR']}),flush=True)
    sys.exit(any(r['status']!='PASS' for r in RESULTS))
