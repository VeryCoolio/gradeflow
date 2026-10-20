"""Tour vollständig über Weiter ansehen, Eingaben und Aktionen abwechseln."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
from guided_tutorial import exercise_tutorial

BASE = os.environ.get('GRADEFLOW_AUDIT_BASE', 'http://127.0.0.1:4190/')
OUT = Path(os.environ['GRADEFLOW_AUDIT_OUTPUT'])
OUT.mkdir(parents=True, exist_ok=False)
KEY = 'oral-grading-notebook-v1'
TARGETS = [
    '[data-tour="page-anlegen"]', '#class-name', '.name-row',
    '[data-tour="create-class"]', '[data-tour="start-lesson"]',
    '.rating-option[aria-label="+"]', '[data-tour="lesson-complete"]',
    '[data-tour="view-tabelle"], [data-tour="view-select"]', '[data-tour="view-verlauf"], [data-tour="view-select"]',
    '[data-tour-class="tutorial-existing"], #current-class',
    '[data-tour="page-sicherung"]', '[data-tour="download-backup"]',
    '[data-tour="help-menu"]', '[data-tour="page-ueber"]',
    '[data-tour="about-title"]',
]
results = []


def browse(page, width, folder):
    tour = page.get_by_role('complementary', name='Geführtes Tutorial')
    raw = page.evaluate('key => localStorage.getItem(key)', KEY)
    url = page.url
    downloads = []
    page.on('download', lambda d: downloads.append(d.suggested_filename))
    positions = []
    for index, selector in enumerate(TARGETS):
        expect(tour).to_contain_text(f'Schritt {index + 1} von 15')
        target = page.locator(selector).filter(visible=True).first
        expect(target).to_be_visible()
        page.wait_for_function('''selector => {
          const target=[...document.querySelectorAll(selector)].find(e=>e.getClientRects().length);
          const spotlight=document.querySelector('.tour-spotlight');
          if(!target || !spotlight) return false;
          const a=target.getBoundingClientRect(), b=spotlight.getBoundingClientRect();
          return Math.abs(a.top-b.top-4)<1 && Math.abs(a.left-b.left-4)<1;
        }''', arg=selector)
        a, b = target.bounding_box(), tour.bounding_box()
        overlap = max(0, min(a['x']+a['width'],b['x']+b['width'])-max(a['x'],b['x'])) * max(0,min(a['y']+a['height'],b['y']+b['height'])-max(a['y'],b['y']))
        assert overlap < 1, (index+1,a,b)
        assert b['y'] >= 0 and b['y'] + b['height'] <= page.viewport_size['height']+1
        positions.append({'step':index+1, 'target':a, 'explanation':b})
        if index in [1, 5, 11]: page.screenshot(path=str(folder/f'weiter-{width}-{index+1}.png'))
        if index < 14:
            next_button = page.get_by_role('button',name='Weiter',exact=True)
            expect(next_button).to_be_enabled()
            next_button.click()
    assert downloads == [], downloads
    page.get_by_role('button',name='Zurück zu meinen Klassen',exact=True).click()
    assert page.evaluate('key => localStorage.getItem(key)', KEY) == raw
    assert page.url == url
    (folder/'positionen.json').write_text(json.dumps(positions,indent=2))
    return {'steps':15,'all_next_buttons_enabled':True,'inputs_required':False,'downloads':downloads.copy(),'own_data_unchanged':True,'url_unchanged':True,'overlaps':0}


with sync_playwright() as p:
    browser=p.chromium.launch()
    try:
        for width,height in [(390,480),(768,1000),(1440,1000)]:
            folder=OUT/f'{width}';folder.mkdir()
            context=browser.new_context(viewport={'width':width,'height':height},accept_downloads=True)
            page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
            try:
                page.goto(BASE);page.wait_for_load_state('networkidle')
                result=browse(page,width,folder);assert not errors,errors
                results.append({'name':f'Alle Schritte mit Weiter {width}x{height}','status':'PASS',**result})
                # Start again: the original interactive path must still work.
                page.locator('.help-menu summary').click()
                page.get_by_role('button',name='Tutorial starten',exact=True).click()
                interactive=exercise_tutorial(page,width,folder)
                assert not errors,errors
                results.append({'name':f'Selbst ausprobieren und Weiter kombiniert {width}','status':'PASS',**interactive})
                print(width,'Weiter und interaktiver Ablauf PASS',flush=True)
            finally:context.close()
    except Exception as error:
        results.append({'name':'Browserprüfung','status':'FAIL','error':str(error)})
        raise
    finally:
        browser.close()
        (OUT/'ergebnisse.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
