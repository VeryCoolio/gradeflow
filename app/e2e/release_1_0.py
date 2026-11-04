"""Gezielte Abnahme der fünf Verbesserungen für 1.0 in frischen Browserprofilen.

Voraussetzung: Produktionsvorschau auf GRADEFLOW_AUDIT_BASE (Standard 5182).
GRADEFLOW_AUDIT_OUTPUT muss ein neuer Ausgabeordner sein.
Optionale Originaldateien: GRADEFLOW_IMPORT_FILES als JSON-Liste lokaler Pfade.
Originalnamen werden weder protokolliert noch fotografiert.
"""
import copy
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from playwright.sync_api import sync_playwright, expect

APP = Path(__file__).resolve().parents[1]
BASE = os.environ.get("GRADEFLOW_AUDIT_BASE", "http://127.0.0.1:5182/")
OUT = Path(os.environ["GRADEFLOW_AUDIT_OUTPUT"])
OUT.mkdir(parents=True, exist_ok=False)
KEY = "oral-grading-notebook-v1"
ENTRY = "Klasse anlegen / importieren"
EXPECTED = ["Fiktiv Anna Maria van Beispiel", "Fiktiv Jean-Luc de Muster", "Fiktiv Bea"]
RESULTS = []


def button(page, name):
    return page.get_by_role("button", name=name, exact=True)


def nav(page, name):
    page.get_by_role("navigation", name="Hauptseiten").get_by_role("link", name=name, exact=True).click()


def notebook(page):
    return page.evaluate("key => JSON.parse(localStorage.getItem(key)) || {classes:[]}", KEY)


def record(name, **details):
    RESULTS.append({"name": name, "result": "PASS", **details})
    print(name, "PASS", flush=True)


def boot(context, errors):
    page = context.new_page()
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(BASE)
    page.wait_for_load_state("networkidle")
    exit_tour = button(page, "Tutorial beenden")
    if exit_tour.is_visible():
        exit_tour.click()
    return page


def keyboard_focus(page, locator):
    for _ in range(40):
        if locator.evaluate("element => document.activeElement === element"):
            return
        page.keyboard.press("Tab")
    raise AssertionError("Tastaturziel nicht innerhalb von 40 Tabstopps erreicht")


def view(page, key):
    picker = page.locator('[data-tour="view-select"]')
    if picker.is_visible():
        picker.select_option(key)
    else:
        page.locator(f'[data-tour="view-{key}"]').click()


def choose(page, class_id):
    picker = page.locator("#current-class")
    if picker.is_visible():
        picker.select_option(class_id)
    else:
        page.locator(f'[data-tour-class="{class_id}"]').click()


def generate_variants(folder):
    # Existing ExcelJS/JSZip dependencies; no package installation.
    code = r"""
import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import {writeFile} from 'node:fs/promises';
import {join} from 'node:path';
const folder=process.argv[1];
const rows=[['  Fiktiv Anna  Maria  ',' van Beispiel '],[' Fiktiv Jean-Luc ',' de Muster '],[' Fiktiv ',' Bea ']];
for(const variant of ['ohne-hintergrund','farben-rahmen-leerzeilen','gemischte-praefixe']){
 const workbook=new ExcelJS.Workbook();
 await workbook.xlsx.readFile('public/musterklassenliste.xlsx');
 const sheet=workbook.worksheets[0];
 sheet.eachRow({includeEmpty:true},row=>row.eachCell({includeEmpty:true},cell=>{
  if(variant==='ohne-hintergrund') cell.fill={type:'pattern',pattern:'none'};
 }));
 rows.forEach((values,i)=>{const at=variant==='farben-rahmen-leerzeilen'?i*3+3:i+2;sheet.getCell(at,1).value=values[0];sheet.getCell(at,2).value=values[1];});
 if(variant==='farben-rahmen-leerzeilen'){
  for(let at=1;at<=140;at++)for(let col=1;col<=5;col++){
   const cell=sheet.getCell(at,col);
   cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:at%2?'FFE8E3F0':'FFEDF4F0'}};
   cell.border={bottom:{style:'thin',color:{argb:'FF999999'}}};
  }
  sheet.getCell('A3').value={richText:[{text:'  Fiktiv Anna '},{text:' Maria  ',font:{bold:true}}]};
 }
 let raw=await workbook.xlsx.writeBuffer();
 if(variant==='gemischte-praefixe'){
  const zip=await JSZip.loadAsync(raw);
  const key='xl/worksheets/sheet1.xml';
  let xml=await zip.file(key).async('string');
  xml=xml.replace('<worksheet ','<worksheet xmlns:s="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ');
  xml=xml.replace(/<row\b[^>]*r="4"[^>]*>[\s\S]*?<\/row>/,row=>row.replace(/<(\/?)(row|c|v)(?=[\s>])/g,'<$1s:$2'));
  zip.file(key,xml);raw=await zip.generateAsync({type:'nodebuffer'});
 }
 await writeFile(join(folder,variant+'.xlsx'),raw);
}
"""
    subprocess.run(["node", "--input-type=module", "-e", code, str(folder)],
                   cwd=APP, check=True, capture_output=True, text=True)
    return sorted(folder.glob("*.xlsx"))


def import_file(page, path, name):
    nav(page, ENTRY)
    button(page, "Klassenliste importieren").click()
    expect(page.locator("#class-import-hint")).to_contain_text("Vorname, Nachname")
    page.get_by_label("Klassenname", exact=True).fill(name)
    page.get_by_label("Klassenliste", exact=True).set_input_files(path)
    button(page, "Klasse lokal anlegen").click()
    expect(page.get_by_role("heading", name=name, exact=True)).to_be_visible()


with tempfile.TemporaryDirectory(prefix="gradeflow-formatvarianten-") as temporary:
    variants = generate_variants(Path(temporary))
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        errors = []
        context = browser.new_context(viewport={"width":1440,"height":1000}, locale="de-DE", timezone_id="Europe/Berlin")
        context.set_default_timeout(10000)
        page = boot(context, errors)
        try:
            # Entire three-person creation uses Tab/Enter, including the final action.
            entry = page.get_by_role("navigation", name="Hauptseiten").get_by_role("link", name=ENTRY, exact=True)
            keyboard_focus(page, entry)
            page.keyboard.press("Enter")
            keyboard_focus(page, page.get_by_label("Klassenname", exact=True))
            page.keyboard.type("Fiktive Tastaturklasse")
            keyboard_focus(page, page.get_by_label("Vorname 1", exact=True))
            page.keyboard.press("Enter")
            expect(page.get_by_label("Vorname 1", exact=True)).to_be_focused()
            assert notebook(page)["classes"] == []
            for index, last in enumerate(["Ada","Bea","Cem"], 1):
                page.keyboard.type("Fiktiv")
                page.keyboard.press("Enter")
                expect(page.get_by_label(f"Nachname {index}", exact=True)).to_be_focused()
                page.keyboard.type(last)
                page.keyboard.press("Enter")
                expect(button(page, "Weitere Person")).to_be_focused()
                assert notebook(page)["classes"] == []
                if index < 3:
                    page.keyboard.press("Enter")
                    expect(page.get_by_label(f"Vorname {index+1}", exact=True)).to_be_focused()
                    page.keyboard.press("Enter")
                    expect(page.get_by_label(f"Vorname {index+1}", exact=True)).to_be_focused()
            keyboard_focus(page, page.get_by_label("Bewertungszeitraum", exact=True))
            page.keyboard.press("Meta+A" if sys.platform == "darwin" else "Control+A")
            page.keyboard.press("Backspace")
            keyboard_focus(page, button(page, "Klasse lokal anlegen"))
            page.keyboard.press("Enter")
            expect(page.get_by_label("Bewertungszeitraum", exact=True)).to_be_focused()
            expect(page.get_by_label("Bewertungszeitraum", exact=True)).to_have_attribute("aria-invalid","true")
            assert notebook(page)["classes"] == []
            expect(page.get_by_label("Nachname 3", exact=True)).to_have_value("Cem")
            page.keyboard.type("Freier Projektzeitraum")
            keyboard_focus(page, button(page, "Klasse lokal anlegen"))
            page.keyboard.press("Enter")
            expect(page.get_by_role("heading",name="Fiktive Tastaturklasse",exact=True)).to_be_visible()
            group=notebook(page)["classes"][0]
            assert [person["displayName"] for person in group["students"]]==["Fiktiv Ada","Fiktiv Bea","Fiktiv Cem"]
            assert group["periodLabel"]=="Freier Projektzeitraum"
            record("Drei Personen ausschließlich per Tastatur; leeres Feld und expliziter Abschluss", persons=3)

            page.locator("#lesson-date").fill("2026-11-04")
            button(page,"Stunde beginnen").click()
            button(page,"++").click()
            expect(page.locator(".save-status")).to_contain_text("Fiktiv Ada: ++ lokal gespeichert.")
            expect(page.locator(".save-status")).to_contain_text("nicht zusätzlich speichern")
            page.locator(".student-list button").first.click()
            saved=page.evaluate("k=>localStorage.getItem(k)",KEY)
            page.evaluate("""() => {
                window.gradeflowTestWrite=Storage.prototype.setItem;
                Storage.prototype.setItem=function(k,v){
                    if(k==='oral-grading-notebook-v1')throw new Error('Fiktiver Speicherfehler');
                    return window.gradeflowTestWrite.call(this,k,v);
                };
            }""")
            button(page,"--").click()
            expect(page.get_by_role("alert")).to_contain_text("Fiktiv Ada: Bewertet: --")
            expect(page.locator(".save-status")).to_have_count(0)
            for _ in range(2):
                button(page,"Eingabe erneut speichern").click()
                assert page.evaluate("k=>localStorage.getItem(k)",KEY)==saved
            page.screenshot(path=str(OUT/"speicherfehler.png"),full_page=True)
            page.evaluate("() => { Storage.prototype.setItem=window.gradeflowTestWrite; }")
            button(page,"Eingabe erneut speichern").click()
            current=notebook(page)["classes"][0]
            assert len(current["sessions"])==1
            assert len(current["sessions"][0]["observations"])==1
            assert current["sessions"][0]["observations"][current["students"][0]["id"]]=={"status":"bewertet","symbol":"--"}
            expect(page.get_by_role("alert")).to_have_count(0)
            record("Speicherfehler, zwei Wiederholungen und erfolgreiche Korrektur ohne Duplikate")

            partial=notebook(page)
            page.close()
            page=boot(context,errors)
            assert notebook(page)==partial
            expect(page.get_by_role("heading",name="Fiktiv Bea",exact=True)).to_be_visible()
            expect(page.locator(".save-status")).to_contain_text("lokal gespeichert")
            page.screenshot(path=str(OUT/"wiederaufnahme.png"),full_page=True)
            button(page,"← Zur Klasse").click()
            before=copy.deepcopy(notebook(page)["classes"][0])
            button(page,"Zeitraum bearbeiten").click()
            page.get_by_label("Bewertungszeitraum",exact=True).fill("Freie Projektphase bis zur Archivierung")
            button(page,"Änderungen speichern").click()
            renamed=notebook(page)["classes"][0]
            assert renamed["sessions"]==before["sessions"]
            assert renamed["students"]==before["students"]
            page.close()
            page=boot(context,errors)
            assert notebook(page)["classes"][0]==renamed
            assert renamed["periodLabel"]=="Freie Projektphase bis zur Archivierung" and not renamed["archived"]
            page.screenshot(path=str(OUT/"zeitraum.png"),full_page=True)
            record("Stunde schließen/öffnen und Zeitraum umbenennen/erneut öffnen; Bewertungen erhalten")

            nav(page,ENTRY)
            button(page,"Demoklasse erstellen").click()
            demo=next(g for g in notebook(page)["classes"] if g.get("demo"))
            assert demo["sessions"]==[]
            expect(page.get_by_role("heading",name=f"Beispielstunden für {demo['name']}",exact=True)).to_be_visible()
            for width,height in [(320,800),(390,844),(768,1024),(1440,1000)]:
                page.set_viewport_size({"width":width,"height":height})
                expect(button(page,"Beispielstunden ergänzen")).to_be_visible()
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+1")
                page.screenshot(path=str(OUT/f"demoklasse-{width}.png"),full_page=True)
            button(page,"Beispielstunden ergänzen").click()
            generated=next(g for g in notebook(page)["classes"] if g["id"]==demo["id"])
            assert len(generated["sessions"])==25 and generated["demoDataGenerated"]
            expect(button(page,"Beispielstunden ergänzen")).to_have_count(0)
            choose(page,group["id"])
            expect(button(page,"Beispielstunden ergänzen")).to_have_count(0)
            nav(page,ENTRY)
            button(page,"Demoklasse erstellen").click()
            assert len(notebook(page)["classes"])==2
            expect(page.get_by_role("heading",name=demo["name"],exact=True)).to_be_visible()
            assert next(g for g in notebook(page)["classes"] if g["id"]==demo["id"])==generated
            assert next(g for g in notebook(page)["classes"] if g["id"]==group["id"])==renamed
            record("Demoklasse, 25 zusätzliche Stunden, Wiederöffnung und Schutz der normalen Klasse")

            for index,path in enumerate(variants,1):
                import_file(page,path,f"Fiktive Formatprüfung {index}")
                imported=notebook(page)["classes"][-1]
                assert [p["displayName"] for p in imported["students"]]==EXPECTED
                assert next(g for g in notebook(page)["classes"] if g["id"]==group["id"])==renamed
            record("Website-Vorlage ohne Hintergrund, mit Farben/Rahmen/Leerzeilen und gemischten Präfixen", variants=len(variants), persons_each=3)

            before_failure=page.evaluate("k=>localStorage.getItem(k)",KEY)
            nav(page,ENTRY)
            button(page,"Klassenliste importieren").click()
            page.get_by_label("Klassenname",exact=True).fill("Fiktiver fehlerhafter Import")
            page.get_by_label("Klassenliste",exact=True).set_input_files({"name":"fehler.csv","mimeType":"text/csv","buffer":b"Vorname;Nachname\nFiktiv;\n"})
            button(page,"Klasse lokal anlegen").click()
            expect(page.get_by_role("alert")).to_contain_text("Nachname")
            expect(page.get_by_role("alert")).to_contain_text("ergänzen")
            assert page.evaluate("k=>localStorage.getItem(k)",KEY)==before_failure
            for width in [320,390,768,1440]:
                page.set_viewport_size({"width":width,"height":1000})
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+1")
                page.screenshot(path=str(OUT/f"importfehler-{width}.png"),full_page=True)
            record("Importfehler verständlich; bestehender Notebook-Rohstand exakt erhalten")

            # Original imports are tested in separate disposable contexts, without screenshots or names.
            for index,filename in enumerate(json.loads(os.environ.get("GRADEFLOW_IMPORT_FILES","[]")),1):
                path=Path(filename)
                before_hash=hashlib.sha256(path.read_bytes()).hexdigest()
                isolated=browser.new_context(viewport={"width":1440,"height":1000},locale="de-DE")
                isolated.set_default_timeout(10000)
                try:
                    original_page=boot(isolated,errors)
                    import_file(original_page,path,f"Originalprüfung {index}")
                    original_group=notebook(original_page)["classes"][0]
                    assert len(original_group["students"])>0
                    assert hashlib.sha256(path.read_bytes()).hexdigest()==before_hash
                    record("Vorhandene Originaldatei importiert",filename=path.name,persons=len(original_group["students"]),source_sha256=before_hash)
                finally:
                    isolated.close()
            assert not errors,errors
            record("Keine Browser-Laufzeitfehler",count=len(errors))
        except Exception as error:
            RESULTS.append({"name":"Abnahme","result":"FAIL","error":str(error)})
            # Only the primary context contains exclusively generated fictitious names.
            if not page.is_closed():
                page.screenshot(path=str(OUT/"fehler.png"),full_page=True)
            raise
        finally:
            context.close()
            browser.close()
            (OUT/"ergebnisse.json").write_text(json.dumps(RESULTS,ensure_ascii=False,indent=2)+"\n")
