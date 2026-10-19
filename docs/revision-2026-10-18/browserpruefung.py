"""Lokale Ausgangsprüfung. Verändert nur isolierte Browserprofile mit fiktiven Daten.

Voraussetzung: Produktionsvorschau unter 127.0.0.1:4186.
Ausführen mit ~/.cache/codex-fact-tools/venv/bin/python browserpruefung.py.
DEFECT bezeichnet eine reproduzierte Abweichung, ERROR einen Prüfabbruch.
"""

import copy
import csv
import io
import json
import os
import time
import traceback
from pathlib import Path

from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(os.environ.get("GRADEFLOW_AUDIT_OUTPUT", Path(__file__).resolve().parent / "nachweise"))
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
    page.evaluate("([key,data]) => {localStorage.clear();localStorage.setItem(key,JSON.stringify(data))}", [KEY, data])
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
      ['.grading-panel h3','.progress-row','.rating-grid','.feedback','.status-grid'].map(s=>{
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
    button(page, "Klasse anlegen").first.click()
    button(page, "Klasse importieren").click()
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
    oriented = all(after[key]["visible"] for key in [".grading-panel h3", ".progress-row", ".feedback"])
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
    button(page, "0").click()
    expect(page.get_by_role("heading", name="Alle Eingaben sind lokal gespeichert")).to_be_visible()
    back(page)
    button(page, "Klasse bearbeiten").click()
    page.once("dialog", lambda dialog: dialog.accept())
    button(page, "Zeitraum archivieren").click()
    assert stored(page)["classes"][0]["archived"] is True
    page.reload();page.wait_for_load_state("networkidle")
    assert page.get_by_role("button", name="Stunde beginnen", exact=True).count() == 0
    button(page, "Klasse bearbeiten").click()
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
    a = context.new_page()
    seed(a, fixture())
    b = context.new_page();b.goto(BASE);b.wait_for_load_state("networkidle")
    button(b, "Stunde beginnen").click();button(b, "+").click()
    before = stored(b)
    a.locator(".class-list button").first.click()
    after = stored(a)
    record("Verlust durch zweiten Tab", "DEFECT" if after != before else "PASS",
           sessions_before=len(before["classes"][0]["sessions"]), sessions_after=len(after["classes"][0]["sessions"]),
           reproduction="A und B öffnen. B beginnt Stunde und speichert +. A klickt bestehende Klasse.")
    snapshot(b, "zweiter-tab-veraltete-erfolgsmeldung")
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


if __name__ == "__main__":
    if (OUT / "browserergebnisse.json").exists():
        raise SystemExit("Ausgangsnachweise bleiben erhalten. GRADEFLOW_AUDIT_OUTPUT auf einen neuen Ordner setzen.")
    OUT.mkdir(exist_ok=True)
    (OUT/"fixture-20-24.json").write_text(json.dumps(fixture(24),ensure_ascii=False,indent=2))
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        record("Browserumgebung", browser_version=browser.version, production_url=BASE)
        for width,height in [(390,844),(768,1024),(1440,1000)]:
            run_case(f"Kernablauf {width}",lambda w=width,h=height:core(browser,w,h))
        for name,op in [("Fehler und Rückfall",failure_cases),("Zwei Tabs",multi_tab),("Wiederaufnahme",resume_and_navigation),("Große Tabelle",table_cases)]:
            run_case(name,lambda operation=op:operation(browser))
        browser.close()
    print(json.dumps({s:sum(r["status"]==s for r in RESULTS) for s in ["PASS","DEFECT","ERROR"]}),flush=True)
