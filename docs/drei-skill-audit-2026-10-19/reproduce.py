"""Vier UI-Befunde und mobile Datenposition mit isolierten fiktiven Daten nachstellen.

Aufruf: python reproduce.py --out /tmp/gradeflow-repro
Voraussetzung: freies Playwright + Chromium und App-Vorschau auf Port 4190.
Dies protokolliert Beobachtungen. BEOBACHTET bedeutet einen offenen Mangel,
keinen bestandenen Produkttest. Nach einer Reparatur soll er verschwinden.
"""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect


def button(p, name):
    return p.get_by_role("button", name=name, exact=True)


def nav(p, name):
    p.get_by_role("navigation", name="Hauptseiten").get_by_role("button", name=name, exact=True).click()


def bounds(locator):
    return locator.evaluate("e => ({top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom,viewport:innerHeight})")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", default="http://127.0.0.1:4190/")
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    roster = args.out / "fiktive-liste.csv"
    roster.write_text("Vorname;Nachname\n" + "\n".join(f"Fiktiv;Person {i}" for i in range(1, 21)))
    invalid = args.out / "ungueltige-liste.csv"
    invalid.write_text("NurEineSpalte\nFiktiv Person\n")
    results = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 1000}, locale="de-DE")
        context.set_default_timeout(6000)
        try:
            page = context.new_page()
            page.goto(args.base)
            button(page, "Tutorial beenden").click()
            nav(page, "Klasse anlegen")
            page.locator("#class-name").fill("Fiktive Nachprüfung")
            button(page, "Klasse importieren").click()
            page.locator("#class-file").set_input_files(roster)
            button(page, "Klasse lokal anlegen").click()
            expect(page.get_by_role("heading", name="Fiktive Nachprüfung", exact=True)).to_be_visible()

            button(page, "Personen").click()
            button(page, "Namen von Fiktiv Person 1 bearbeiten").click()
            rect = bounds(page.locator("#student-name"))
            results.append({"id": "B03", "observed": rect["top"] >= rect["viewport"], "bounds": rect})
            page.screenshot(path=str(args.out / "B03-editor.png"), animations="disabled")

            button(page, "Tabelle").click()
            button(page, "Mit Notenverlauf").click()
            page.get_by_label("Tabellengröße").select_option("large")
            page.get_by_label("Stunden pro Ansicht").select_option("0")
            button(page, "Verlauf").click()
            button(page, "Tabelle").click()
            reset = page.get_by_label("Tabellengröße").input_value() == "normal" and page.get_by_label("Stunden pro Ansicht").input_value() == "10"
            results.append({"id": "B07", "observed": reset})
            page.set_viewport_size({"width": 390, "height": 844})
            rect = bounds(page.locator(".class-report-scroll"))
            results.append({"id": "B02", "observed": rect["top"] > rect["viewport"], "bounds": rect, "data": "20 Personen, keine Stunden"})
            page.screenshot(path=str(args.out / "B02-mobil.png"), animations="disabled")
            page.set_viewport_size({"width": 1440, "height": 1000})

            nav(page, "Klasse anlegen")
            page.locator("#class-name").fill("Fiktiver Fehlerfall")
            button(page, "Klasse importieren").click()
            page.locator("#class-file").set_input_files(invalid)
            button(page, "Klasse lokal anlegen").click()
            alert = page.get_by_role("alert")
            expect(alert).to_contain_text("Vorname")
            rect = bounds(alert)
            results.append({"id": "B05", "observed": rect["bottom"] < 0, "bounds": rect})
            page.screenshot(path=str(args.out / "B05-import.png"), animations="disabled")

            nav(page, "Meine Klassen")
            button(page, "Stunden").click()
            page.locator("#lesson-date").fill("2026-10-19")
            button(page, "Stunde beginnen").click()
            before = page.evaluate("localStorage.getItem('oral-grading-notebook-v1')")
            page.evaluate("""() => {
              const original = Storage.prototype.setItem;
              Storage.prototype.setItem = function(k,v) {
                if(k === 'oral-grading-notebook-v1') throw new DOMException('Audit Speicherfehler','QuotaExceededError');
                return original.call(this,k,v);
              };
            }""")
            button(page, "+").click()
            expect(button(page, "Eingabe erneut speichern")).to_be_visible()
            assert before == page.evaluate("localStorage.getItem('oral-grading-notebook-v1')"), "Fehlschlag darf kein Notebook ändern"
            page.screenshot(path=str(args.out / "B01-vor-navigation.png"), animations="disabled")
            dialogs = []
            def dismiss(dialog):
                dialogs.append(dialog.message)
                dialog.dismiss()
            page.on("dialog", dismiss)
            nav(page, "Datensicherung")
            nav(page, "Meine Klassen")
            button(page, "Fortsetzen").click()
            expect(page.locator(".observation-status")).to_contain_text("Offen")
            retry_lost = button(page, "Eingabe erneut speichern").count() == 0 and not dialogs
            results.append({"id": "B01", "observed": retry_lost, "dialogs": dialogs, "retryLost": retry_lost})
            page.screenshot(path=str(args.out / "B01-nach-navigation.png"), animations="disabled")
        finally:
            context.close()
            browser.close()
    (args.out / "beobachtungen.json").write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n")
    for result in results:
        print(result["id"], "BEOBACHTET" if result["observed"] else "NICHT_REPRODUZIERT")


if __name__ == "__main__":
    main()
