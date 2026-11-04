"""Zusätzliche Tour-Prüfungen: niedrige Ansichten, Tastatur, Erhalt eigener Arbeitsstände."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
from guided_tutorial import exercise_tutorial

OUT = Path(os.environ['GRADEFLOW_AUDIT_OUTPUT'])
OUT.mkdir(parents=True, exist_ok=False)
BASE = os.environ.get('GRADEFLOW_AUDIT_BASE', 'http://127.0.0.1:4190/')
RESULTS = []
KEY = 'oral-grading-notebook-v1'


def record(name, **details):
    RESULTS.append({'name': name, 'status': 'PASS', **details})
    print(name, 'PASS', flush=True)


with sync_playwright() as p:
    browser = p.chromium.launch()
    try:
        for height in [844, 667, 480]:
            out = OUT / str(height); out.mkdir()
            context = browser.new_context(viewport={'width': 390, 'height': height}, accept_downloads=True)
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            try:
                page.goto(BASE); page.wait_for_load_state('networkidle')
                result = exercise_tutorial(page, 390, out)
                assert not errors, errors
                record(f'Niedrige Ansicht {height}', **result)
            finally:
                context.close()
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()
        page.goto(BASE); page.wait_for_load_state('networkidle');page.keyboard.press('Escape')
        nav = page.get_by_role('navigation', name='Hauptseiten')
        nav.get_by_role('link', name='Klasse anlegen / importieren', exact=True).click()
        page.get_by_label('Klassenname', exact=True).fill('Fiktive eigene Klasse')
        for index, name in [(1, 'Ada'), (2, 'Bea')]:
            if index == 2: page.get_by_role('button', name='Weitere Person', exact=True).click()
            page.get_by_label(f'Vorname {index}', exact=True).fill('Fiktiv')
            page.get_by_label(f'Nachname {index}', exact=True).fill(name)
        page.get_by_role('button', name='Klasse lokal anlegen', exact=True).click()
        page.get_by_role('button', name='Stunde beginnen', exact=True).click()
        page.get_by_role('button', name='+', exact=True).click()
        expect(page.locator('.grading-panel h3')).to_have_text('Fiktiv Bea')
        original = page.evaluate('key => localStorage.getItem(key)', KEY)
        url = page.url
        def start():
            page.locator('.help-menu summary').click()
            page.get_by_role('button', name='Tutorial starten', exact=True).click()
        start()
        expect(page.locator('[data-tour=page-anlegen]')).to_be_focused()
        page.keyboard.press('Enter')
        expect(page.locator('.tour-card')).to_contain_text('Schritt 2 von 15')
        expect(page.locator('#class-name')).to_be_focused()
        page.keyboard.type('Übung per Tastatur')
        page.keyboard.press('Tab'); page.keyboard.press('Enter')
        expect(page.locator('.tour-card')).to_contain_text('Schritt 3 von 15')
        expect(page.locator('#first-0')).to_be_focused()
        page.keyboard.type('Fiktiv');page.keyboard.press('Tab');page.keyboard.type('Tastatur')
        page.keyboard.press('Tab');page.keyboard.press('Enter')
        expect(page.locator('.tour-card')).to_contain_text('Schritt 4 von 15')
        page.keyboard.press('Escape')
        expect(page.locator('.grading-panel h3')).to_have_text('Fiktiv Bea')
        assert page.url == url
        assert page.evaluate('key => localStorage.getItem(key)', KEY) == original
        record('Begonnene Stunde und Tastatureingabe erhalten', selected_person='Fiktiv Bea', notebook_unchanged=True, url_unchanged=True)
        nav.get_by_role('link', name='Klasse anlegen / importieren', exact=True).click()
        page.get_by_label('Klassenname', exact=True).fill('Fiktiver Entwurf')
        page.get_by_label('Vorname 1', exact=True).fill('Fiktiv')
        draft = page.evaluate("localStorage.getItem('gradeflow-class-draft-v1')")
        url = page.url
        start();page.keyboard.press('Escape')
        expect(page.get_by_label('Klassenname', exact=True)).to_have_value('Fiktiver Entwurf')
        expect(page.get_by_label('Vorname 1', exact=True)).to_have_value('Fiktiv')
        assert page.evaluate("localStorage.getItem('gradeflow-class-draft-v1')") == draft
        assert page.url == url
        assert page.evaluate('key => localStorage.getItem(key)', KEY) == original
        record('Klassenentwurf erhalten', draft_unchanged=True, notebook_unchanged=True)
        page.screenshot(path=str(OUT / 'eigener-entwurf.png'))
        reader = context.new_page()
        reader.goto(BASE); reader.wait_for_load_state('networkidle')
        expect(reader.get_by_role('complementary', name='Nur zur Ansicht')).to_be_visible()
        reader.locator('.help-menu summary').click()
        reader.get_by_role('button', name='Tutorial starten', exact=True).click()
        reader.locator('[data-tour="page-anlegen"]').click()
        reader.get_by_label('Klassenname', exact=True).fill('Fiktive Übung im Ansichts-Tab')
        reader.keyboard.press('Escape')
        expect(reader.get_by_role('complementary', name='Nur zur Ansicht')).to_be_visible()
        assert reader.evaluate('key => localStorage.getItem(key)', KEY) == original
        record('Tour im schreibgeschützten zweiten Tab', notebook_unchanged=True)
        reader.close()
        context.close()
    except Exception as error:
        RESULTS.append({'name': 'Zusatzprüfung', 'status': 'FAIL', 'error': str(error)})
        raise
    finally:
        (OUT / 'ergebnisse.json').write_text(json.dumps(RESULTS, ensure_ascii=False, indent=2))
        browser.close()
