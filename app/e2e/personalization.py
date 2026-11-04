"""Farben, Klassensortierung und fünf Demo-Wochen mit fiktiven Daten prüfen.
GRADEFLOW_AUDIT_OUTPUT: neuer Ausgabeordner; Vorschau standardmäßig auf Port 4190.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('GRADEFLOW_AUDIT_BASE', 'http://127.0.0.1:4190/')
OUT = Path(os.environ['GRADEFLOW_AUDIT_OUTPUT'])
OUT.mkdir(parents=True, exist_ok=False)
KEY = 'oral-grading-notebook-v1'
UI_KEY = 'gradeflow-ui-preferences-v1'
RESULTS = []


def record(name, **details):
    RESULTS.append({'name': name, 'status': 'PASS', **details})
    print(name, 'PASS', flush=True)


def button(p, name):
    return p.get_by_role('button', name=name, exact=True)


def nav(p, name):
    p.get_by_role('navigation', name='Hauptseiten').get_by_role('link', name=name, exact=True).click()


def appearance(p):
    p.locator('.help-menu summary').click()
    p.get_by_role('link', name='Darstellung und Farben', exact=True).click()


def view(p, name):
    select = p.locator('[data-tour="view-select"]')
    if select.is_visible(): select.select_option(name)
    else: p.locator(f'[data-tour="view-{name}"]').click()


def data(p):
    return json.loads(p.evaluate('k => localStorage.getItem(k)', KEY))


def choose(p, class_id):
    select = p.locator('#current-class')
    if select.is_visible(): select.select_option(class_id)
    else: p.locator(f'[data-tour-class="{class_id}"]').click()


def names(p):
    return p.locator('.class-register strong').all_text_contents()


with sync_playwright() as pw:
    browser = pw.chromium.launch()
    context = browser.new_context(viewport={'width':1440,'height':1000}, locale='de-DE', accept_downloads=True)
    context.set_default_timeout(6000)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('dialog', lambda d: d.accept())
    try:
        page.goto(BASE); page.wait_for_load_state('networkidle')
        button(page, 'Tutorial beenden').click()
        button(page, 'Demoklasse erstellen').click()
        demo_id = data(page)['classes'][0]['id']
        assert data(page)['classes'][0]['sessions'] == []
        button(page, 'Stunde beginnen').click()
        button(page, '+').click()
        button(page, '← Zur Klasse').click()
        existing = data(page)['classes'][0]['sessions'][0]
        button(page, 'Beispielstunden ergänzen').click()
        demo = data(page)['classes'][0]
        assert len(demo['sessions']) == 26 and demo['sessions'][0] == existing
        assert demo['demo'] and demo['demoDataGenerated']
        assert button(page, 'Beispielstunden ergänzen').count() == 0
        statuses = {o['status'] for s in demo['sessions'] for o in s['observations'].values()}
        assert statuses == {'bewertet', 'abwesend', 'nicht_beobachtet'}
        view(page, 'tabelle')
        assert page.get_by_title('Abwesend', exact=True).count() > 0
        assert page.get_by_title('Nicht beobachtet', exact=True).count() > 0
        assert page.get_by_title('Offen', exact=True).count() > 0
        page.screenshot(path=str(OUT/'demo-tabelle-1440.png'), animations='disabled')
        record('Demo erst leer, dann 25 zusätzliche Stunden mit allen Statusarten', existing_observation_unchanged=True, duplicate_generation_prevented=True)

        for name in ['10a','Klasse 8a · Mathematik','7b','7a','8c']:
            nav(page, 'Klasse anlegen / importieren')
            page.get_by_label('Klassenname', exact=True).fill(name)
            page.get_by_label('Vorname 1', exact=True).fill('Fiktiv')
            page.get_by_label('Nachname 1', exact=True).fill('Beispiel')
            button(page, 'Klasse lokal anlegen').click()
            expect(page.get_by_role('heading', name=name, exact=True)).to_be_visible()
            assert button(page, 'Beispielstunden ergänzen').count() == 0
        ids = {g['name']:g['id'] for g in data(page)['classes']}
        expected = ['7a','7b','Klasse 8a · Mathematik','Demo 8b','8c','10a']
        assert names(page) == expected
        before = {g['id']:g['sessions'] for g in data(page)['classes']}
        for name, color in [('7a','Salbei'),('7b','Salbei'),('Klasse 8a · Mathematik','Lavendel'),('Demo 8b','Lavendel'),('8c','Rosé'),('10a','Himmelblau')]:
            choose(page, ids[name])
            page.get_by_role('link',name='Klassenfarbe ändern',exact=True).click()
            page.get_by_role('group', name='Klassenfarbe', exact=True).get_by_role('button', name=color, exact=True).click()
        assert before == {g['id']:g['sessions'] for g in data(page)['classes']}
        assert next(g for g in data(page)['classes'] if g['id']==ids['7a'])['color'] == 'sage'
        assert next(g for g in data(page)['classes'] if g['id']==ids['7b'])['color'] == 'sage'
        page.screenshot(path=str(OUT/'klassenfarben-1440.png'), animations='disabled')
        record('Pastellfarben gezielt vergeben, gleiche Stufe gleich färben', observations_unchanged=True, grade_alphabet_order=names(page))

        for name in ['10a','7a','Demo 8b']: choose(page, ids[name])
        page.get_by_label('Klassen sortieren', exact=True).select_option('recent')
        recent = names(page)
        assert recent[:3] == ['Demo 8b','7a','10a']
        page.get_by_label('Klassen sortieren', exact=True).select_option('oldest')
        assert names(page) == list(reversed(recent))
        page.get_by_label('Klassen sortieren', exact=True).select_option('grade')
        assert names(page) == expected
        record('Alle drei Sortierungen nach tatsächlichem Öffnen', recent=recent, oldest=list(reversed(recent)))

        appearance(page)
        original = page.evaluate('k => localStorage.getItem(k)', KEY)
        for name in ['Lavendel','Blau','Salbei','Rosé','Sand','Schiefer']:
            button(page,name).click(); expect(button(page,name)).to_have_attribute('aria-pressed','true')
        page.get_by_label('Eigener Farbton', exact=True).fill('#fff5b8')
        custom_accent = page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()")
        assert custom_accent != '#fff5b8'
        page.get_by_label('Reihenfolge der Klassen', exact=True).select_option('oldest')
        assert page.evaluate('k => localStorage.getItem(k)', KEY) == original
        page.reload(); page.wait_for_load_state('networkidle')
        expect(page.locator('#app-accent')).to_have_value('#fff5b8')
        expect(page.get_by_label('Reihenfolge der Klassen', exact=True)).to_have_value('oldest')
        assert names(page) == list(reversed(recent))
        record('App-Farbvorschläge, freie helle Farbe und gespeicherte Auswahl', selected='#fff5b8', legible_accent=custom_accent, notebook_unchanged=True)

        page.evaluate('''() => {window.personalOriginalSetItem=Storage.prototype.setItem;
          Storage.prototype.setItem=function(k,v){if(k==='gradeflow-ui-preferences-v1')throw new Error('Fiktiver Speicherfehler');return window.personalOriginalSetItem.call(this,k,v);};}''')
        button(page,'Blau').click()
        page.get_by_label('Reihenfolge der Klassen',exact=True).select_option('recent')
        expect(page.get_by_role('alert')).to_contain_text('für diesen Besuch')
        expect(button(page,'Blau')).to_have_attribute('aria-pressed','true')
        page.evaluate('() => {Storage.prototype.setItem=window.personalOriginalSetItem;}')
        button(page,'Rosé').click(); expect(page.get_by_role('alert')).to_have_count(0)
        record('Speicherfehler erhält lokale Farbauswahl und erklärt die Grenze')

        for width,height in [(320,568),(390,844),(768,1024),(1440,1000)]:
            page.set_viewport_size({'width':width,'height':height});page.evaluate('window.scrollTo(0,0)')
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
            page.screenshot(path=str(OUT/f'darstellung-{width}.png'),animations='disabled')
        page.set_viewport_size({'width':320,'height':844})
        page.evaluate("() => {document.documentElement.style.fontSize='200%';window.scrollTo(0,0);}")
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
        page.screenshot(path=str(OUT/'darstellung-320-schrift200.png'),animations='disabled')
        page.evaluate("document.documentElement.style.fontSize=''")
        page.set_viewport_size({'width':390,'height':844})
        nav(page,'Meine Klassen')
        choose(page,demo_id);view(page,'tabelle');page.evaluate('window.scrollTo(0,0)')
        page.screenshot(path=str(OUT/'demo-tabelle-390.png'),animations='disabled')
        view(page,'verlauf');page.screenshot(path=str(OUT/'demo-verlauf-390.png'),animations='disabled')
        view(page,'einstellungen')
        expect(page.get_by_role('button',name='Lavendel',exact=True)).to_have_attribute('aria-pressed','true')
        page.screenshot(path=str(OUT/'klassenfarbe-390.png'),animations='disabled')
        record('Vier Breiten, 200 Prozent Schrift, mobile Klassenwahl und Farben', horizontal_page_overflow=False)

        nav(page,'Datensicherung')
        with page.expect_download() as download:
            button(page,'Vollständige JSON-Sicherung herunterladen').click()
        backup_path=OUT/'fiktiver-bestand.json';download.value.save_as(backup_path)
        saved=json.loads(backup_path.read_text())
        assert sum(g.get('color')=='sage' for g in saved['classes'])==2
        assert len(next(g for g in saved['classes'] if g['id']==demo_id)['sessions'])==26
        assert 'accent' not in saved and 'classOrder' not in saved
        other=browser.new_context(viewport={'width':1440,'height':1000},locale='de-DE')
        try:
            imported=other.new_page();imported.goto(BASE);imported.wait_for_load_state('networkidle')
            button(imported,'Tutorial beenden').click();nav(imported,'Datensicherung')
            imported.locator('#backup-file').set_input_files(backup_path)
            button(imported,'JSON-Sicherung importieren').click()
            expect(imported.locator('.class-register button')).to_have_count(6)
            assert sum(g.get('color')=='sage' for g in data(imported)['classes'])==2
            assert len(next(g for g in data(imported)['classes'] if g['id']==demo_id)['sessions'])==26
            assert imported.evaluate('k => localStorage.getItem(k)',UI_KEY) is None
        finally: other.close()
        record('JSON-Sicherung und Import erhalten Klassenfarben und Demo-Daten', separate_profile_preferences=True)
        assert not errors,errors
        record('Keine Browser-Laufzeitfehler',count=len(errors))
    except Exception as error:
        RESULTS.append({'name':'Abnahme','status':'FAIL','error':str(error)})
        page.screenshot(path=str(OUT/'fehler.png'),animations='disabled')
        raise
    finally:
        context.close();browser.close()
        (OUT/'ergebnisse.json').write_text(json.dumps(RESULTS,ensure_ascii=False,indent=2))
