"""Prüft die geführte Tour an echten Steuerelementen; ausschließlich fiktive Daten."""
import json
from pathlib import Path
from playwright.sync_api import expect

KEY = "oral-grading-notebook-v1"


def exercise_tutorial(page, width, out):
    out = Path(out)
    tour = page.get_by_role("complementary", name="Geführtes Tutorial")
    original = page.evaluate("key => localStorage.getItem(key)", KEY)
    original_url = page.url
    geometries = []

    def step(number, selector):
        expect(tour).to_contain_text(f"Schritt {number} von 15")
        target = page.locator(selector).filter(visible=True).first
        expect(target).to_be_visible()
        expect(page.locator(".tour-spotlight")).to_be_visible()
        # Wait until the spotlight has moved to the current target.
        page.wait_for_function("""selector => {
            const t = [...document.querySelectorAll(selector)].find(e => e.getClientRects().length);
            const s = document.querySelector('.tour-spotlight');
            if (!t || !s) return false;
            const a=t.getBoundingClientRect(), b=s.getBoundingClientRect();
            return Math.abs(a.left-b.left-4)<1 && Math.abs(a.top-b.top-4)<1;
        }""", arg=selector)
        a, b = target.bounding_box(), tour.bounding_box()
        overlap = max(0, min(a['x']+a['width'], b['x']+b['width'])-max(a['x'], b['x'])) * max(0, min(a['y']+a['height'], b['y']+b['height'])-max(a['y'], b['y']))
        assert overlap < 1, (number, a, b)
        assert b['x'] >= 0 and b['x']+b['width'] <= page.viewport_size['width'] + 1
        assert b['y'] >= 0 and b['y']+b['height'] <= page.viewport_size['height'] + 1
        geometries.append({"step": number, "target": a, "explanation": b})
        if number in [1, 3, 6, 10, 15]:
            page.screenshot(path=str(out / f"tour-{width}-{number:02d}.png"))
        return target

    step(1, '[data-tour="page-anlegen"]').click()
    step(2, '#class-name').fill("Übung 8b")
    page.get_by_role("button", name="Weiter", exact=True).click()
    step(3, '.name-row')
    page.get_by_label("Vorname 1", exact=True).fill("Ada")
    expect(page.get_by_role("button", name="Weiter", exact=True)).to_be_enabled()
    page.get_by_label("Nachname 1", exact=True).fill("Beispiel")
    page.get_by_role("button", name="Weiter", exact=True).click()
    step(4, '[data-tour="create-class"]').click()
    step(5, '[data-tour="start-lesson"]').click()
    step(6, '.rating-option[aria-label="+"]').click()
    expect(page.get_by_role("region", name="Stundenabschluss")).to_be_visible()
    step(7, '[data-tour="lesson-complete"]').click()
    for number, view in [(8, "tabelle"), (9, "verlauf")]:
        target = step(number, f'[data-tour="view-{view}"], [data-tour="view-select"]')
        if target.evaluate("e => e.tagName") == "SELECT":
            target.select_option(view)
        else:
            target.click()
    switch = step(10, '[data-tour-class="tutorial-existing"], #current-class')
    if width >= 1100:
        switch.click()
    else:
        switch.select_option("tutorial-existing")
    step(11, '[data-tour="page-sicherung"]').click()
    with page.expect_download() as downloaded:
        step(12, '[data-tour="download-backup"]').click()
    download = downloaded.value
    assert download.suggested_filename == "uebung-gradeflow-notebook-v1.json"
    path = out / f"uebung-{width}.json"
    download.save_as(path)
    notebook = json.loads(path.read_text())
    assert len(notebook['classes']) == 2
    assert sum(len(c['sessions']) for c in notebook['classes']) == 1
    step(13, '[data-tour="help-menu"]').click()
    step(14, '[data-tour="page-ueber"]').click()
    step(15, '[data-tour="about-title"]')
    page.get_by_role("button", name="Zurück zu meinen Klassen", exact=True).click()
    expect(tour).to_have_count(0)
    assert page.evaluate("key => localStorage.getItem(key)", KEY) == original
    assert page.url == original_url
    (out / f"tour-geometrie-{width}.json").write_text(json.dumps(geometries, indent=2))
    page.reload(); page.wait_for_load_state("networkidle")
    expect(tour).to_have_count(0)
    page.locator('.help-menu summary').click()
    page.get_by_role('button', name='Tutorial starten', exact=True).click()
    step(1, '[data-tour="page-anlegen"]')
    for _ in range(6):
        page.keyboard.press('Tab')
        assert page.evaluate("document.activeElement.matches('[data-tour=page-anlegen], .tour-card button')")
    page.keyboard.press('Escape')
    expect(tour).to_have_count(0)
    assert page.evaluate("key => localStorage.getItem(key)", KEY) == original
    return {"steps": 15, "clickable_targets": True, "overlaps": 0,
            "download": download.suggested_filename, "own_data_unchanged": True,
            "url_unchanged": True, "first_visit_once": True, "manual_restart": True,
            "keyboard_cycle": True, "escape": True}
