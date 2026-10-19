"""Zusätzliche Fehlerfälle im isolierten Chromium; keine App-Änderungen."""

import importlib.util
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('audit',HERE/'browserpruefung.py')
b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
results=[]
if (b.OUT/'fehlerfaelle.json').exists():
    raise SystemExit('Ausgangsnachweise bleiben erhalten. GRADEFLOW_AUDIT_OUTPUT auf einen neuen Ordner setzen.')


def record(name,**details):
    results.append(dict(name=name,**details))
    (b.OUT/'fehlerfaelle.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
    print(name,flush=True)


with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    context=browser.new_context(locale='de-DE')
    page=context.new_page();b.seed(page,b.fixture(2));before=b.stored(page)
    page.evaluate("""() => {Storage.prototype.setItem=function(k,v){throw new DOMException('Prüfquota','QuotaExceededError')}}""")
    b.button(page,'Reihenfolge tauschen').click()
    expect(page.get_by_role('alert')).to_contain_text('Lokales Speichern fehlgeschlagen')
    assert b.stored(page)==before
    assert page.get_by_role('status').count()==0
    record('Speicherfehler beim Tausch',unchanged=True,no_false_success=True)
    page.reload();page.wait_for_load_state('networkidle')
    b.button(page,'Verlauf').click()
    table=page.locator('.table-scroll')
    record('Tastaturzugang der Verlaufstabelle',tabindex=table.get_attribute('tabindex'),
           role=table.get_attribute('role'),interactive_descendants=table.locator('button,a,input,select,[tabindex]').count())
    context.close()
    context=browser.new_context(viewport=dict(width=390,height=844),locale='de-DE')
    context.add_init_script("""Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Prüfung: Speicherzugriff verweigert','SecurityError')}})""")
    page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(b.BASE);page.wait_for_load_state('networkidle')
    record('Browser verweigert Zugriff auf localStorage',body_text=page.locator('body').inner_text(),
           visible_alerts=page.get_by_role('alert').count(),page_errors=errors)
    page.screenshot(path=str(b.OUT/'speicherzugriff-verweigert.png'))
    context.close()
    context=browser.new_context(viewport=dict(width=390,height=844),locale='de-DE')
    page=context.new_page();data=b.fixture(1)
    data['classes'][0]['sessions'][0]['observations']={}
    b.seed(page,data)
    page.emulate_media(reduced_motion='reduce')
    page.add_style_tag(content='html { font-size:200% !important }')
    overflow=page.evaluate('document.documentElement.scrollWidth-innerWidth')
    record('200 Prozent Grundschrift und reduzierte Bewegung',overflow=overflow,
           animation=page.locator('.grading-panel').evaluate("e=>getComputedStyle(e,'::before').animationName"),
           limitation='Echte laufende App mit vergrößerter CSS Grundschrift; kein Browserzoom oder OS Textskalierung')
    b.snapshot(page,'bewertung-200-prozent-mobil')
    context.close()
    browser.close()
