"""Letzte Sichtprüfung des gebauten Stands nach der Layout-Nacharbeit.

Produktionsvorschau auf Port 4186; Playwright lokal, nur fiktive Daten.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
from revision import BASE, ROOT, KEY, fixture, button, positions

OUT=Path(os.environ['GRADEFLOW_AUDIT_OUTPUT']);OUT.mkdir(parents=True,exist_ok=True)
if (OUT/'layout.json').exists():raise SystemExit('Vorhandene Nachweise bleiben erhalten.')
results=[]
with sync_playwright() as p:
    browser=p.chromium.launch()
    for width,height in [(390,844),(768,1024),(1440,1000)]:
        context=browser.new_context(viewport=dict(width=width,height=height),locale='de-DE')
        page=context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
        page.goto(BASE);page.wait_for_load_state('networkidle')
        button(page,'Klasse anlegen / importieren').first.click();button(page,'Klassenliste importieren').click()
        page.get_by_label('Klassenname',exact=True).fill('Prüfung 8b')
        page.get_by_label('Klassenliste',exact=True).set_input_files(ROOT/'app/public/demo-klasse.csv')
        button(page,'Klasse lokal anlegen').click();expect(page.get_by_role('heading',name='Prüfung 8b',exact=True)).to_be_visible()
        page.evaluate('window.scrollTo(0,0)')
        primary=button(page,'Stunde beginnen').bounding_box()
        assert primary['y']>=0 and primary['y']+primary['height']<=height
        page.screenshot(path=str(OUT/f'klasse-{width}.png'),full_page=True)
        button(page,'Stunde beginnen').click();button(page,'+').click()
        after=positions(page)
        for selector in ['.grading-panel h3','.assessment-header h2','.assessment-progress','.save-status']:assert after[selector]['visible']
        page.screenshot(path=str(OUT/f'eingabe-{width}.png'))
        button(page,'Nicht beobachtet').click()
        after_nb=positions(page)
        for selector in ['.grading-panel h3','.assessment-header h2','.assessment-progress','.save-status']:assert after_nb[selector]['visible']
        page.locator('#main-content').focus();page.keyboard.press('Tab');page.keyboard.press('Tab');assert page.evaluate("document.activeElement.getAttribute('aria-label')")=='--'
        sizes=page.locator('button').evaluate_all("els=>els.filter(e=>e.getClientRects().length&&!e.disabled).map(e=>({label:e.getAttribute('aria-label')||e.textContent.trim(),height:e.getBoundingClientRect().height}))")
        assert all(row['height']>=44 for row in sizes),[r for r in sizes if r['height']<44]
        page.evaluate("()=>{let u=new URL(location.href);u.hash='seite=klasse&ansicht=tabelle&klasse='+JSON.parse(localStorage.getItem('oral-grading-notebook-v1')).classes[0].id+'&stunde=entfernt';history.replaceState(null,'',u)}")
        page.reload();page.wait_for_load_state('networkidle');expect(page.get_by_role('status')).to_contain_text('nicht mehr verfügbar')
        assert not errors and page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        results.append(dict(width=width,firstActionVisible=True,afterPlus=after,afterNB=after_nb,tabs=2,touchMinimumHeight=44,invalidPositionExplained=True,pageErrors=errors))
        context.close()
    browser.close()
(OUT/'layout.json').write_text(json.dumps(results,ensure_ascii=False,indent=2));print('Drei Breiten: Einstieg, Kontext, Fokus, Touch und ungültige Position bestanden.')
