# Bedienrevision vom 19.10.2026

Ausgangsstand: `3bd003c`, Version 0.7.0. Auftrag: die im Chat genannten Bedienprobleme einzeln umsetzen und nach tatsächlicher Prüfung abhaken. Nur fiktive Testdaten; bestehende Notebooks, Fachkern, Legacy und historische Nachweise erhalten.

## Aufgabenliste

- [x] 1. Schnelle Klassenwahl: Seitenleiste auf dem Desktop, kompakte Auswahl auf kleinen Displays, auch während einer Stunde erreichbar.
- [x] 2. Ruhige Eingabeflächen: keine Größenänderung beim Hover oder beim Wechsel der ausgewählten Bewertung.
- [x] 3. Klassenerstellung: lokalen Entwurf wiederaufnehmen, Speicherstatus sichtbar, Datei-Auswahl nach Reload ehrlich erklären, Entwurf erst nach erfolgreicher Anlage entfernen.
- [x] 4. Klasse bearbeiten: lesbare Stammdaten, klarer Speicherabschluss, Archivieren und Löschen getrennt.
- [x] 5. Stundenabschluss: eigenständige Zusammenfassung statt letzter Person und aktiven Bewertungstasten; Korrektur bewusst öffnen.
- [x] 6. App erklären: Zweck, Ablauf und Grenzen aus den bestätigten Projektvorgaben verständlich darstellen.
- [ ] 7. Aktuelle Bachelorarbeit: angekündigte Datei prüfen und den Erklärungsteil daran begründen. Wartet auf die Datei; keine Quellen oder Wirkungsnachweise erfinden.
- [x] 8. Bewertungshilfe aus dem Eingabebereich in einen getrennten Hilfebereich verlegen.
- [x] 9. Eigene Seite zu Datenablage, Sicherung, Wiederherstellung und Grenzen ergänzen.
- [x] 10. Erstbesuch-Tutorial als schließbare, tastaturbedienbare Dialogfolge; später ausdrücklich wieder startbar.
- [x] 11. Verlauf: AW, NB und Offen grafisch markieren, getrennt von der Notenachse und mit Textlegende.
- [x] 12. Excel: genannten Endnoten-Satz entfernen, Blattnavigation erklären, Namen intern verlinken, Symbole größer und farblich/inhaltlich verständlich gestalten.
- [x] 13. Einmalige und doppelte Stunden einheitlich mit Datum und ausgeschriebener Stundennummer anzeigen; Berechnung und Zwei-Stunden-Grenze erhalten.
- [ ] 14. Regressionen, Dateiinhalt, Desktop-/Tablet-/Mobilansichten und Hover prüfen; Commit, Push und Remote-Stand bestätigen.

## Gestaltungsentscheidung

Die vorhandene Gradeflow-Gestaltung bleibt Grundlage: Papier `#f6f5f8`, Weiß `#ffffff`, Text `#242238`, Violett `#5b477e`, Grün `#315f48`, Statusblau `#245d89`. Systemschrift für Bedienung, vorhandene Personen-Typografie beibehalten. Auf dem Desktop links ein Klassenregister, rechts der Arbeitsbereich; auf kleinen Displays eine kompakte Klassenwahl. Die Stammdaten erhalten ein ruhiges Formular, riskantere Verwaltungsaktionen einen eigenen Abschnitt. Der Stundenabschluss ersetzt die Erfassung vollständig. Hilfen stehen außerhalb der Symbol- und Statusauswahl. Keine neue Schrift, Bibliothek oder externer Dienst erforderlich.

## Nachweise

Version 0.8.0. Die Personenseite, der Fachkern und das Notebook-Schema bleiben erhalten. Neue Erläuterungen behaupten keine pädagogische Wirksamkeit. Der Abgleich mit der noch nicht vorliegenden Bachelorarbeit bleibt als eigener offener Punkt sichtbar.

- Alle fünf Projektprüfungen bestanden: Typecheck, **117 Tests in 21 Dateien**, ESLint, Prettier und Produktions-Build. Ausgaben in `bedienrevision-2026-10-19/abschluss-pruefungen/`.
- **22 bestandene Browserprüfungen**, keine Browserfehler im vollständigen Abschlusslauf: Chromium, frische Profile, 390/768/1440 Pixel. Erstbesuch, Tutorial-Neustart und Escape/Fokusumlauf, Entwurf samt Wiederaufnahme, erfolgreiche Anlage/Entfernung des Entwurfs, Klassenverwaltung, unveränderte Personenseite, Bewertung mit Reload, geschützter Abschluss/Korrektureinstieg, Hilfeseiten, zehn Klassen und Statusgrafik geprüft. Der Klassenwechsel verändert den Notebook-Rohwert nicht. Ausschließlich fiktive Namen.
- Hover: vor der Korrektur 12,03125 Pixel Höhenänderung; danach 0 Pixel im Browser. Ursache war eine spezifischere ältere Hover-Regel mit anderen Innenabständen. Ein zunächst noch gefüllter Offen-Marker wurde nach der Sichtprüfung gegen eine globale Kreisformatierung geschützt.
- Excel-Dateien aus allen drei Browserbreiten unabhängig als ZIP/XML gelesen: drei Blätter, zwei interne Personenlinks, korrekte numerische Noten, leere unbewertete Notenfelder, Datumszahlen mit `dd.mm.yyyy`, ausgeschriebene Stunden, 20-Punkt-Symbole und keine Formeln. Drei Blätter des ersten Exports wurden ohne Änderung zusätzlich importiert, gerendert und visuell betrachtet.
- Die XLSX-Vorschau des gebündelten Renderers zeigt Datumsserienzahlen statt der vorhandenen Excel-Datumsformatierung. Zelltyp, Datum und Zahlenformat sind unabhängig geprüft; eine native Excel-Prüfung wurde nicht durchgeführt. Der Renderer verändert die ausgelieferte Arbeitsmappe nicht.
- Frühere Läufe bleiben abgegrenzt erhalten: `nachweise` zeigt den zunächst fehlenden vollständigen Tastaturumlauf des neuen Tutorials. `nachweise-r2` bestand die Bedienabläufe, scheiterte aber an einer zu breiten Prüfauswahl, die unsichtbare SVG-Titel als Datumsbeschriftungen mitzählt. `nachweise-r3` ist vollständig erfolgreich. `nachweise-abschluss` prüft zusätzlich die endgültige mobile Navigation und den hohlen Offen-Marker; maßgeblicher Abschlussstand. Lokale Pfade in Textprotokollen sind anonymisiert.

## Wiederholung

Mit vorhandenen Projektabhängigkeiten `npm run build` in `app` ausführen und die Vorschau an `127.0.0.1:4190` starten. `app/e2e/usability_revision.py` benötigt lokales Python mit Playwright/Chromium und einen **neuen** Ausgabeordner über `GRADEFLOW_AUDIT_OUTPUT`. Anschließend prüft `app/e2e/verify_usability_exports.py AUSGABEORDNER` die tatsächlich heruntergeladenen Arbeitsmappen unabhängig. Die zwei Ausgangs- und Vergleichsläufe werden nicht überschrieben. Die zusätzliche reine XLSX-Vorschau liegt in `bedienrevision-2026-10-19/excel-vorschau.mjs` und verwendet die gebündelte kostenlose Artifact-Laufzeit; die temporäre Paketverknüpfung wird nicht versioniert.

## Dateien und Grenzen

Die vollständige Upload-Dateiliste steht in [dateiliste.json](bedienrevision-2026-10-19/dateiliste.json). Sie umfasst App-Komponenten, getrennte Entwurfs-/Navigationsmetadaten, Tests, Version, Entscheidungs-/Testdokumentation sowie die neuen fiktiven Nachweise. Keine neue Abhängigkeit, Datenmigration oder Cloud-Synchronisierung. `legacy-source/`, `reference/` und Tag `v0.5.0` bleiben unverändert.

Nicht geprüft: native Excel-Bedienung, Windows-/Mobilgeräte, weitere Browserengines, Screenreader und vollständige WCAG-Konformität. Die bekannte Größenwarnung des nachgeladenen Excel-Moduls bleibt bestehen. Die aktuelle Bachelorarbeitsfassung fehlt noch; ihr Abgleich ist Aufgabe 7 und kein bereits erledigter Nachweis.
