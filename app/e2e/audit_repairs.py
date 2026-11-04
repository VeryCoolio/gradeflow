"""Abnahme B01–B08 mit isolierten fiktiven Daten. Keine Daten des Browserprofils.
GRADEFLOW_AUDIT_OUTPUT muss ein neuer lokaler Ausgabeordner sein.
"""
import json
import os
from datetime import date, timedelta
from pathlib import Path
from playwright.sync_api import sync_playwright, expect, Error

BASE = os.environ.get('GRADEFLOW_AUDIT_BASE', 'http://127.0.0.1:4190/')
OUT = Path(os.environ['GRADEFLOW_AUDIT_OUTPUT'])
OUT.mkdir(parents=True, exist_ok=False)
KEY = 'oral-grading-notebook-v1'
RESULTS = []


def record(name, **details):
    RESULTS.append({'name': name, 'status': 'PASS', **details})
    print(name, 'PASS', flush=True)


def button(p, name):
    return p.get_by_role('button', name=name, exact=True)


def nav(p, name):
    p.get_by_role('navigation', name='Hauptseiten').get_by_role('link', name=name, exact=True).click()


def view(p, key):
    mobile = p.locator('[data-tour="view-select"]')
    if mobile.is_visible():
        mobile.select_option(key)
    else:
        p.locator(f'[data-tour="view-{key}"]').click()


def choose_class(p, class_id):
    select = p.locator('#current-class')
    if select.is_visible(): select.select_option(class_id)
    else: p.locator(f'[data-tour-class="{class_id}"]').click()


def notebook(p):
    return json.loads(p.evaluate('key => localStorage.getItem(key)', KEY))


def fixture(count, sessions):
    stamp = '2026-10-01T12:00:00.000Z'
    people = [{'id': f'c{count}-p{i}', 'displayName': f'Fiktiv Person {i:02}', 'startGradeQuarterSteps': 8} for i in range(1, count + 1)]
    return {'id': f'c{count}', 'name': f'Fiktive Klasse {count}', 'periodLabel': 'Schuljahr 2026/27', 'archived': False, 'createdAt': stamp, 'updatedAt': stamp, 'students': people,
            'sessions': [{'id': f'c{count}-s{i}', 'date': str(date(2026, 6, 1) + timedelta(days=i)), 'lessonSequence': 1, 'createdAt': stamp, 'updatedAt': stamp,
                          'observations': {p['id']: {'status': 'bewertet', 'symbol': '0'} for p in people}} for i in range(sessions)]}


with sync_playwright() as pw:
    browser = pw.chromium.launch()
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, locale='de-DE', accept_downloads=True)
    context.set_default_timeout(7000)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    dialogs = {'accept': True, 'seen': []}

    def respond(dialog):
        dialogs['seen'].append({'type': dialog.type, 'message': dialog.message})
        if dialogs['accept']: dialog.accept()
        else: dialog.dismiss()

    page.on('dialog', respond)
    try:
        groups = [fixture(20, 25), fixture(45, 100)]
        long = ('Fiktive außergewöhnlich lange Bezeichnung mit breiten Wörtern ' * 4)[:200]
        long_group = fixture(2, 3)
        long_group.update(id='lang', name=long, periodLabel=long)
        for p in long_group['students']: p['displayName'] = long
        groups.append(long_group)
        backup = OUT / 'fiktiver-testbestand.json'
        backup.write_text(json.dumps({'schemaVersion': 1, 'currentClassId': 'c20', 'classes': groups}))
        page.goto(BASE)
        button(page, 'Tutorial beenden').click()
        nav(page, 'Datensicherung')
        page.locator('#backup-file').set_input_files(backup)
        button(page, 'JSON-Sicherung importieren').click()
        expect(page.locator('.class-sidebar')).to_contain_text('Fiktive Klasse 20')
        nav(page, 'Meine Klassen')

        # B03: first/middle/last, mouse and keyboard, preserve all previous sessions.
        before_sessions = [g['sessions'] for g in notebook(page)['classes']]
        for count in [20, 45]:
            choose_class(page, f'c{count}')
            view(page, 'personen')
            for index in [1, (count + 1) // 2, count]:
                trigger = page.get_by_role('button', name=f'Namen von Fiktiv Person {index:02} bearbeiten', exact=True)
                if index == count:
                    trigger.focus(); page.keyboard.press('Enter')
                else: trigger.click()
                field = page.locator('#student-name')
                expect(field).to_be_focused()
                bounds = field.bounding_box()
                assert 0 <= bounds['y'] and bounds['y'] + bounds['height'] <= 1001
                assert field.locator('..').locator('..').locator('span').first.is_visible()
                if index == count:
                    field.fill(f'Fiktiv Korrigiert {count}')
                    button(page, 'Namen speichern').click()
                    expect(trigger).to_have_count(0)
                    expect(page.get_by_role('button', name=f'Namen von Fiktiv Korrigiert {count} bearbeiten')).to_be_focused()
                else:
                    button(page, 'Abbrechen').click(); expect(trigger).to_be_focused()
            page.screenshot(path=str(OUT / f'B03-personen-{count}.png'), animations='disabled')
        assert before_sessions == [g['sessions'] for g in notebook(page)['classes']]
        record('B03 erste, mittlere, letzte Person bei 20/45', mouse=True, keyboard=True, focus_return=True, previous_sessions_unchanged=True)

        # B04: cancel page/class/view/back and reload; then deliberately discard.
        choose_class(page, 'c20')
        view(page, 'einstellungen')
        button(page, 'Klassenname und Zeitraum bearbeiten').click()
        page.locator('#detail-name').fill('Fiktiv ungespeichert')
        page.locator('#detail-period').fill('Fiktiver offener Entwurf')
        dialogs['accept'] = False
        nav(page, 'Datensicherung'); expect(page.locator('#detail-name')).to_have_value('Fiktiv ungespeichert')
        choose_class(page, 'c45'); expect(page.locator('#current-class')).to_have_value('c20')
        view(page, 'tabelle'); expect(page.locator('#detail-period')).to_have_value('Fiktiver offener Entwurf')
        page.go_back(); expect(page.locator('#detail-name')).to_have_value('Fiktiv ungespeichert')
        seen = len(dialogs['seen'])
        try: page.reload(timeout=2000)
        except Error: pass
        assert any(d['type'] == 'beforeunload' for d in dialogs['seen'][seen:])
        expect(page.locator('#detail-name')).to_have_value('Fiktiv ungespeichert')
        dialogs['accept'] = True
        view(page, 'personen')
        button(page, 'Namen von Fiktiv Person 01 bearbeiten').click()
        page.locator('#student-name').fill('Fiktiver ungesicherter Name')
        dialogs['accept'] = False
        button(page, 'Namen von Fiktiv Person 02 bearbeiten').click()
        expect(page.locator('#student-name')).to_have_value('Fiktiver ungesicherter Name')
        button(page, 'Abbrechen').click()
        seen = len(dialogs['seen'])
        button(page, 'Namen von Fiktiv Person 02 bearbeiten').click()
        view(page, 'tabelle')
        assert len(dialogs['seen']) == seen
        dialogs['accept'] = True
        record('B04 Navigations- und Neuladeschutz', cancel_preserves_values=True, unchanged_editor_has_no_prompt=True, native_reload_warning=True)

        # B07: preserve all options including pagination across view/main/reload/back.
        page.locator('.table-options summary').click()
        button(page, 'Mit Notenverlauf').click()
        page.get_by_label('Tabellengröße').select_option('large')
        page.get_by_label('Stunden pro Ansicht').select_option('20')
        button(page, 'Ältere Stunden').click()
        expect(page.locator('.table-pagination')).to_contain_text('Stunden 1–5 von 25')
        view(page, 'verlauf'); view(page, 'tabelle')
        page.locator('.table-options summary').click()
        expect(page.get_by_label('Tabellengröße')).to_have_value('large')
        expect(button(page, 'Mit Notenverlauf')).to_have_attribute('aria-pressed', 'true')
        expect(page.locator('.table-pagination')).to_contain_text('Stunden 1–5 von 25')
        nav(page, 'Datensicherung'); page.go_back()
        expect(page.locator('.table-pagination')).to_contain_text('Stunden 1–5 von 25')
        page.reload(); page.wait_for_load_state('networkidle')
        expect(page.locator('.class-report-scroll')).to_have_class(__import__('re').compile('table-size-large'))
        expect(page.locator('.table-pagination')).to_contain_text('Stunden 1–5 von 25')
        target = page.get_by_role('link', name='Datensicherung', exact=True)
        href = target.get_attribute('href')
        with context.expect_page() as popup:
            target.click(modifiers=['ControlOrMeta'])
        reader = popup.value
        reader.wait_for_load_state('networkidle')
        expect(reader.get_by_role('heading', name='Datensicherung', exact=True)).to_be_visible()
        expect(reader.get_by_role('complementary', name='Nur zur Ansicht')).to_be_visible()
        assert 'seite=sicherung' in reader.url
        reader.close()
        bad_url = page.url.split('#')[0] + '#seite=klasse&ansicht=tabelle&klasse=c20&tabellenmodus=kaputt&tabellengroesse=riesig&stundenfenster=-1&tabellenseite=NaN'
        page.goto(bad_url); page.reload()
        page.locator('.table-options summary').click()
        expect(page.get_by_label('Tabellengröße')).to_have_value('normal')
        expect(page.get_by_label('Stunden pro Ansicht')).to_have_value('10')
        record('B07 Präferenzen, Browser-Zurück, Neuladen, echte Links und zweiter Tab', second_tab_read_only=True, invalid_url_defaults=True, copied_href=href)

        # B05: three import failures on desktop and mobile, valid follow-up.
        for width in [390, 1440]:
            page.set_viewport_size({'width': width, 'height': 844 if width == 390 else 1000})
            nav(page, 'Klasse anlegen / importieren')
            page.locator('#class-name').fill('Fiktiver Importtest')
            button(page, 'Klassenliste importieren').click()
            invalids = [('spalten.csv', 'NurEineSpalte\nFiktiv Ada'.encode()),
                        ('zu-viele.csv', ('Vorname;Nachname\n' + '\n'.join(f'Fiktiv;Person {i}' for i in range(46))).encode()),
                        ('unlesbar.xlsx', b'kein Excel')]
            previous = notebook(page)
            for name, payload in invalids:
                page.locator('#class-file').set_input_files({'name': name, 'mimeType': 'application/octet-stream', 'buffer': payload})
                button(page, 'Klasse lokal anlegen').click()
                alert = page.locator('#class-creation-error')
                expect(alert).to_be_visible(); expect(alert).to_be_focused()
                expect(alert).to_contain_text('Prüfe die Angaben')
                expect(page.locator('#class-file')).to_have_attribute('aria-describedby', 'class-creation-error')
                bounds = alert.bounding_box()
                assert bounds['y'] >= 0 and bounds['y'] + bounds['height'] <= page.viewport_size['height'] + 1
                assert notebook(page) == previous
            page.screenshot(path=str(OUT / f'B05-import-{width}.png'), animations='disabled')
        page.locator('#class-file').set_input_files({'name': 'gueltig.csv', 'mimeType': 'text/csv', 'buffer': b'Vorname;Nachname\nFiktiv;Einzelperson'})
        button(page, 'Klasse lokal anlegen').click()
        expect(page.get_by_role('heading', name='Fiktiver Importtest', exact=True)).to_be_visible()
        expect(page.locator('.count-pill')).to_have_text('1 Person')
        expect(page.get_by_text('Klasse mit 1 Person angelegt und lokal gespeichert.', exact=True)).to_be_visible()
        button(page, 'Stunde beginnen').click()
        expect(page.locator('.assessment-progress')).to_contain_text('0 von 1 Person erfasst')
        button(page, '+').click()
        expect(page.get_by_role('region', name='Stundenabschluss')).to_contain_text('Die Person ist erfasst.')
        button(page, 'Zur Klassenübersicht').click()
        record('B05 Fehler sichtbar und gültiger Folgeimport; B08 Einzahl', viewport_widths=[390, 1440], failed_imports_preserve_notebook=True)

        # B01: failed observation, cancel class change, leave/return, select another person and retry original.
        choose_class(page, 'c20'); view(page, 'stunden')
        page.locator('#lesson-date').fill('2026-10-20'); button(page, 'Stunde beginnen').click()
        session_url = page.url
        before = notebook(page)
        page.evaluate('''() => { window.repairOriginalSetItem = Storage.prototype.setItem;
          Storage.prototype.setItem = function(k,v) {if(k==='oral-grading-notebook-v1') throw new DOMException('Fiktiver Speicherfehler','QuotaExceededError'); return window.repairOriginalSetItem.call(this,k,v);}; }''')
        button(page, '+').click()
        expect(button(page, 'Eingabe erneut speichern')).to_be_visible()
        assert notebook(page) == before
        dialogs['accept'] = False
        choose_class(page, 'c45')
        expect(page.locator('#current-class')).to_have_value('c20')
        button(page, '← Zur Klasse').click()
        expect(button(page, 'Zur nicht gespeicherten Eingabe')).to_be_visible()
        nav(page, 'Datensicherung')
        expect(button(page, 'Eingabe erneut speichern')).to_be_visible()
        button(page, 'Zur nicht gespeicherten Eingabe').click()
        button(page, '← Zur Klasse').click()
        expect(page.get_by_text('Der aktuelle Stand ist lokal gespeichert.', exact=True)).to_have_count(0)
        button(page, 'Zur nicht gespeicherten Eingabe').click()
        page.locator('.student-list button').nth(1).click()
        page.evaluate('() => { Storage.prototype.setItem = window.repairOriginalSetItem; }')
        button(page, 'Eingabe erneut speichern').click()
        current = next(g for g in notebook(page)['classes'] if g['id'] == 'c20')
        latest = next(s for s in current['sessions'] if s['date'] == '2026-10-20')
        assert latest['observations'] == {'c20-p1': {'status': 'bewertet', 'symbol': '+'}}
        # A second failure can also be retried from a different class.
        page.evaluate('''() => { Storage.prototype.setItem = function(k,v) {if(k==='oral-grading-notebook-v1') throw new Error('Fiktiv'); return window.repairOriginalSetItem.call(this,k,v);}; }''')
        button(page, '-').click(); nav(page, 'Datensicherung')
        dialogs['accept'] = True
        choose_class(page, 'c45')
        page.evaluate('() => { Storage.prototype.setItem = window.repairOriginalSetItem; }')
        button(page, 'Eingabe erneut speichern').click()
        current = next(g for g in notebook(page)['classes'] if g['id'] == 'c20')
        latest = next(s for s in current['sessions'] if s['date'] == '2026-10-20')
        assert latest['observations']['c20-p2'] == {'status': 'bewertet', 'symbol': '-'}
        page.screenshot(path=str(OUT / 'B01-wiederholung.png'), animations='disabled')
        record('B01 Auftrag über Navigation und Klassen erhalten, Wiederholung zielgenau', original_person_only=True, failed_write_preserved_notebook=True)

        # B02: default table and compact assessment fit; large text remains scrollable without page overflow.
        choose_class(page, 'c20'); nav(page, 'Meine Klassen'); view(page, 'tabelle')
        for width, height in [(320,568), (390,844), (768,1024), (1440,1000)]:
            page.set_viewport_size({'width': width, 'height': height}); page.evaluate('window.scrollTo(0,0)')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
            if width == 390:
                bounds = page.locator('.class-report-scroll tbody tr').first.bounding_box()
                assert bounds['y'] + bounds['height'] <= height
            page.screenshot(path=str(OUT / f'B02-tabelle-{width}.png'), animations='disabled')
        for width in [320, 390]:
            page.set_viewport_size({'width':width,'height':844})
            page.evaluate("() => { document.documentElement.style.fontSize='200%'; window.scrollTo(0,0); }")
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
            assert page.locator('.primary-nav a').evaluate_all('links => links.every(a => a.scrollWidth <= a.clientWidth + 1)')
            page.screenshot(path=str(OUT / f'B02-schrift-200-{width}.png'), animations='disabled')
            page.locator('.class-report-scroll').focus(); expect(page.locator('.class-report-scroll')).to_be_focused()
            page.evaluate("document.documentElement.style.fontSize=''")
        page.set_viewport_size({'width':390,'height':844})
        view(page, 'stunden'); button(page, 'Fortsetzen').click()
        page.evaluate('window.scrollTo(0,0)')
        last = button(page, '++').bounding_box()
        assert last['y'] + last['height'] <= 844
        page.screenshot(path=str(OUT / 'B02-bewertung-390.png'), animations='disabled')
        button(page, '← Zur Klasse').click()
        record('B02 vier Breiten und 200 Prozent Grundschrift', widths=[320,390,768,1440], horizontal_page_overflow=False, first_mobile_data_row=True)

        # B06 actual app download, unmodified for native Excel check.
        choose_class(page, 'lang')
        page.locator('.report-menu summary').click()
        with page.expect_download() as download:
            button(page, 'Klasse als Excel exportieren').click()
        download.value.save_as(OUT / 'B06-export-lang.xlsx')
        record('B06 Export aus echter Oberfläche heruntergeladen', file='B06-export-lang.xlsx')
        assert not errors, errors
        record('Keine Browser-Laufzeitfehler', count=len(errors))
    except Exception as error:
        RESULTS.append({'name': 'Abnahme', 'status': 'FAIL', 'error': str(error)})
        page.screenshot(path=str(OUT / 'fehler.png'), animations='disabled')
        raise
    finally:
        context.close(); browser.close()
        (OUT / 'ergebnisse.json').write_text(json.dumps(RESULTS, ensure_ascii=False, indent=2))
