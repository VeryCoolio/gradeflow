"""Bedienrevision mit fiktiven Daten in frischen Chromium-Profilen.

Voraussetzung: Produktions-Build auf 127.0.0.1:4190.
GRADEFLOW_AUDIT_OUTPUT muss auf einen neuen Nachweisordner zeigen.
"""
import copy
import json
import os
from pathlib import Path
import traceback
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[2]
BASE = os.environ.get("GRADEFLOW_AUDIT_BASE", "http://127.0.0.1:4190/")
OUT = Path(os.environ.get("GRADEFLOW_AUDIT_OUTPUT", ROOT / "docs/bedienrevision-2026-10-19/nachweise"))
KEY = "oral-grading-notebook-v1"
RESULTS = []

def button(page, name):
    return page.get_by_role("button", name=name, exact=True)

def nav(page, name):
    page.get_by_role("navigation", name="Hauptseiten").get_by_role("button", name=name, exact=True).click()

def saved(page):
    return page.evaluate("key => JSON.parse(localStorage.getItem(key))", KEY)

def screenshot(page, name):
    page.screenshot(path=str(OUT / f"{name}.png"), full_page=True)

def help_page(page, name):
    page.locator(".help-menu summary").click()
    button(page, name).click()
    assert page.locator(".help-menu[open]").count() == 0

def record(name, **details):
    RESULTS.append({"name": name, "status": "PASS", **details})
    print(name, "PASS", flush=True)

def run(browser, width):
    context = browser.new_context(viewport={"width": width, "height": 1000}, locale="de-DE", timezone_id="Europe/Berlin", accept_downloads=True)
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    try:
        page.goto(BASE); page.wait_for_load_state("networkidle")
        expect(page.get_by_role("dialog", name="Willkommen bei Gradeflow")).to_be_visible()
        original = saved(page)
        screenshot(page, f"tutorial-{width}")
        for _ in range(8):
            page.keyboard.press("Tab")
            assert page.evaluate("document.querySelector('dialog').contains(document.activeElement)")
        page.keyboard.press("Escape")
        expect(page.get_by_role("dialog")).to_have_count(0)
        page.reload(); page.wait_for_load_state("networkidle")
        expect(page.get_by_role("dialog")).to_have_count(0)
        help_page(page, "Tutorial starten")
        for _ in range(4): button(page, "Weiter").click()
        button(page, "Einführung abschließen").click()
        assert saved(page) == original
        record(f"Tutorial {width}", first_visit=True, focus_trapped=True, escape=True, repeat_on_request=True)

        nav(page, "Klasse anlegen")
        page.get_by_label("Klassenname", exact=True).fill("Fiktive 8b")
        page.get_by_label("Vorname 1", exact=True).fill("Fiktiv")
        page.get_by_label("Nachname 1", exact=True).fill("Ada")
        button(page, "Weitere Person").click()
        page.get_by_label("Vorname 2", exact=True).fill("Fiktiv")
        page.get_by_label("Nachname 2", exact=True).fill("Bea")
        expect(page.locator(".draft-status")).to_contain_text("Entwurf in diesem Browser gespeichert")
        page.reload(); page.wait_for_load_state("networkidle")
        expect(page.get_by_label("Klassenname", exact=True)).to_have_value("Fiktive 8b")
        expect(page.get_by_label("Nachname 2", exact=True)).to_have_value("Bea")
        screenshot(page, f"entwurf-{width}")
        button(page, "Klasse lokal anlegen").click()
        expect(page.get_by_role("heading", name="Fiktive 8b", exact=True)).to_be_visible()
        assert page.evaluate("localStorage.getItem('gradeflow-class-draft-v1')") is None
        page.reload(); page.wait_for_load_state("networkidle")
        assert len(saved(page)["classes"][0]["students"]) == 2
        record(f"Entwurf und Klassenanlage {width}", reloads=2)

        button(page, "Klasse bearbeiten").click()
        button(page, "Namen und Zeitraum bearbeiten").click()
        page.get_by_label("Bewertungszeitraum", exact=True).fill("Freier Testzeitraum")
        button(page, "Änderungen speichern").click()
        expect(page.locator(".settings-details")).to_contain_text("Freier Testzeitraum")
        expect(page.get_by_role("status")).to_contain_text("gespeichert")
        screenshot(page, f"bearbeiten-{width}")
        button(page, "Personen").click()
        expect(page.get_by_role("heading", name="Personennamen bearbeiten")).to_be_visible()
        button(page, "Stunden").click()
        page.locator("#lesson-date").fill("2026-10-19")
        button(page, "Stunde beginnen").click()
        expect(page.get_by_role("heading", name="19.10.2026 · 1. Stunde")).to_be_visible()
        assert page.locator(".grading-panel").get_by_role("button", name="Bewertung und Puffer erklärt").count() == 0
        if width >= 1100:
            maximum = 0
            for label in ["--", "-", "0", "+", "++"]:
                page.mouse.move(0, 0)
                before = page.locator(".rating-grid").bounding_box()
                button(page, label).hover()
                after = page.locator(".rating-grid").bounding_box()
                maximum = max(maximum, abs(before["height"] - after["height"]))
            assert maximum < 0.1, maximum
            record("Hover Desktop", maximum_height_change=maximum)
        else:
            expect(page.get_by_label("Klasse auswählen")).to_be_visible()
        screenshot(page, f"bewertung-{width}")
        button(page, "+").click()
        before = saved(page)
        page.reload(); page.wait_for_load_state("networkidle")
        assert saved(page) == before
        expect(page.get_by_role("heading", name="Fiktiv Bea", exact=True)).to_be_visible()
        button(page, "Abwesend").click()
        expect(page.get_by_role("heading", name="Alle Eingaben sind lokal gespeichert")).to_be_visible()
        assert page.locator(".rating-grid").count() == 0
        assert page.locator(".grading-panel").count() == 0
        assert page.evaluate("document.activeElement.textContent") == "Zur Klassenübersicht"
        screenshot(page, f"abschluss-{width}")
        page.reload(); page.wait_for_load_state("networkidle")
        expect(page.get_by_role("heading", name="Alle Eingaben sind lokal gespeichert")).to_be_visible()
        button(page, "Eingaben prüfen oder korrigieren").click()
        expect(page.locator(".rating-grid")).to_be_visible()
        button(page, "Zur Abschlussübersicht").click()
        button(page, "Zur Klassenübersicht").click()
        record(f"Bewertung, Wiederaufnahme und Abschluss {width}", reloads=2, no_active_ratings_after_completion=True)

        help_page(page, "So funktioniert Gradeflow")
        expect(page.get_by_role("heading", name="So funktioniert Gradeflow")).to_be_visible()
        help_page(page, "Wo sind meine Daten?")
        expect(page.get_by_role("heading", name="Wo sind meine Daten?")).to_be_visible()
        screenshot(page, f"daten-{width}")
        button(page, "Zur Datensicherung").click()
        expect(button(page, "Vollständige JSON-Sicherung herunterladen")).to_be_visible()
        nav(page, "Meine Klassen")
        record(f"Hilfe und Datenseite {width}")

        source = saved(page)["classes"][0]
        groups = []
        for i in range(1, 11):
            group = copy.deepcopy(source)
            group["id"] = f"c{i}"
            group["name"] = f"Fiktive Klasse {i:02d}"
            for j, student in enumerate(group["students"]): student["id"] = f"c{i}-p{j}"
            group["sessions"] = []
            for j, (date, sequence, status) in enumerate([("2026-10-19", 1, "abwesend"), ("2026-10-19", 2, "nicht_beobachtet"), ("2026-10-20", 1, None)]):
                lesson = dict(id=f"c{i}-s{j}", date=date, lessonSequence=sequence, createdAt=source["createdAt"], updatedAt=source["updatedAt"], observations={f"c{i}-p0": {"status": "bewertet", "symbol": ["++", "-", "+"][j]}})
                if status: lesson["observations"][f"c{i}-p1"] = {"status": status}
                group["sessions"].append(lesson)
            groups.append(group)
        data = {"schemaVersion": 1, "currentClassId": "c1", "classes": groups}
        page.evaluate("([key,data]) => {localStorage.setItem(key,JSON.stringify(data));localStorage.removeItem('gradeflow-workspace-v1');history.replaceState(null,'',location.pathname)}", [KEY, data])
        page.reload(); page.wait_for_load_state("networkidle")
        if width >= 1100:
            expect(page.get_by_label("Klasse suchen")).to_be_visible()
            page.get_by_label("Klasse suchen").fill("10")
            assert page.locator(".class-register button").count() == 1
            page.locator(".class-register button").click()
            page.get_by_label("Klasse suchen").fill("")
        else: page.get_by_label("Klasse auswählen").select_option("c10")
        expect(page.get_by_role("heading", name="Fiktive Klasse 10", exact=True)).to_be_visible()
        assert saved(page) == data
        screenshot(page, f"klassenwahl-{width}")
        record(f"Zehn Klassen und Wechsel {width}", notebook_unchanged=True)
        button(page, "Verlauf").click()
        page.get_by_label("Person", exact=True).select_option("c10-p1")
        assert page.locator("[data-status-marker]").count() == 3
        for status in ["abwesend", "nicht_beobachtet", "offen"]:
            assert page.locator(f'[data-status-marker="{status}"]').count() == 1
        assert page.locator("svg .grade-point").count() == 1
        assert page.locator('[data-status-marker="offen"] circle').evaluate('(e) => getComputedStyle(e).fill') == "rgb(255, 255, 255)"
        assert page.locator("svg text:not([aria-label])").filter(has_text="1. Stunde").count() == 2
        screenshot(page, f"verlauf-{width}")
        with page.expect_download() as pending:
            button(page, "Klasse als Excel exportieren").click()
        pending.value.save_as(OUT / f"bericht-{width}.xlsx")
        record(f"Statusverlauf und Excel-Download {width}", separate_status_markers=3)
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        assert not errors, errors
        record(f"Layout und Browserfehler {width}", horizontal_overflow=False, errors=errors)
    finally:
        context.close()

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=False)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            for width in [390, 768, 1440]:
                try: run(browser, width)
                except Exception as error:
                    RESULTS.append({"name": f"Browserlauf {width}", "status": "ERROR", "message": str(error), "trace": traceback.format_exc().replace(str(ROOT), "<Projekt>")})
                    print(f"Browserlauf {width} ERROR: {error}", flush=True)
        finally: browser.close()
    (OUT / "ergebnisse.json").write_text(json.dumps(RESULTS, ensure_ascii=False, indent=2))
    assert all(row["status"] == "PASS" for row in RESULTS), "Browserprüfung enthält Fehler; siehe ergebnisse.json"
