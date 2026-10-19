# Geführtes Tutorial und Bachelorarbeitsabgleich – 0.8.1

## Aufgaben und Ergebnis

- [x] Vorliegenden BA-Zwischenstand lokal lesen und die Begründung der App damit abgleichen.
- [x] Allgemeine Textdialoge durch eine Tour an den echten Steuerelementen ersetzen.
- [x] Eigene Klassen, gespeicherten Entwurf und Arbeitsposition von den Übungsdaten trennen.
- [x] Erstbesuch, späteren Neustart, Maus, Tastatur, niedrige Ansichten und zweiten Tab prüfen.
- [x] Projektprüfungen, Quellenzuordnung und tatsächliche Grenzen dokumentieren.
- [ ] Geprüfte Dateien auf GitHub sichern und Remote-Stand bestätigen.

## Ausgangsproblem und Umsetzung

Das bisherige Tutorial bestand aus fünf Textdialogen. Es zeigte keine konkreten Ziele und wechselte unabhängig von tatsächlichen Aktionen weiter. Die Präzisierung des Nutzers verlangt die direkte Anleitung an den Schaltflächen und Eingabefeldern.

Die neue Tour verwendet die echten App-Komponenten und dieselben fachlichen Dienste mit einem ausschließlich im Arbeitsspeicher gehaltenen Übungsbestand. Sie führt durch Klassenanlage, Namenseingabe, Stundenbeginn, Bewertung, Abschluss, Tabelle, Verlauf, Klassenwechsel, JSON-Download und Hilfe. Es werden keine fiktiven Bewertungen in den eigenen Bestand geschrieben. Die Tour übernimmt weder den URL-Hash noch die gespeicherte Arbeitsposition des eigenen Bestands. Der Übungsdownload heißt `uebung-gradeflow-notebook-v1.json`. Die Übungsdaten werden beim Beenden verworfen.

Je Schritt werden das tatsächliche Feld oder die tatsächliche Schaltfläche mit Rahmen und freier Klickfläche hervorgehoben. Die Erklärung steht daneben bzw. darüber oder darunter. Klickschritte wechseln erst nach der passenden erfolgreichen App-Aktion. Bei Feldern wird die Eingabe geprüft; Tab wechselt zwischen den benötigten Feldern und den Tour-Schaltflächen, Enter bestätigt die Eingabe oder führt zum fehlenden Feld. Escape und „Tutorial beenden“ sind jederzeit erreichbar. Beim Erstbesuch erscheint die neue Tour einmal pro Browserprofil, später unter „Hilfe und Einstieg → Tutorial starten“. Der neue Metadatenschlüssel `gradeflow-tutorial-v2` unterscheidet sie von der alten Textfolge.

Die Platzierung reagiert auf Scrollen, Größenänderungen und den sichtbaren Browserausschnitt. Bei wenig Platz darf die Erklärung selbst scrollen; der für die normale Erfassung haftende Kontext haftet während der Übung nicht, damit er die markierte Taste nicht überlagert. Die eigene laufende Stunde und der lokal gespeicherte Klassenentwurf werden nach dem Beenden wieder angezeigt. Eine ausgewählte Importdatei muss nach dem Verlassen der Eingabeansicht weiterhin neu ausgewählt werden; das erklärt die vorhandene Entwurfsanzeige.

Die App-Erklärung wurde anhand der vorgelegten Bachelorarbeitsfassung begründet. [Kapitel-/Seitenzuordnung und Abweichungen](ba-abgleich-2026-10-19.md) halten insbesondere die Unterscheidung zwischen fachlicher Einschätzung und Verarbeitung, Qualität und Häufigkeit, Startwert und begrenztem Puffer, Korrekturfolgen sowie die geplante Evaluation fest. Es wurden keine neue fachliche Regel, Datenmigration, Abhängigkeit oder externe Laufzeit eingeführt. Das Manuskript bleibt unverändert und außerhalb von GitHub.

## Prüfungen

- Alle fünf Projektprüfungen bestanden: Typecheck, **119 Tests in 21 Dateien**, ESLint, Prettier und Produktions-Build. Die [Ausgaben](tutorial-ba-2026-10-19/pruefungen/) enthalten die tatsächlichen Ergebnisse.
- **22 bestandene Browserprüfungen** der Bedienrevision bei 390/768/1440 × 1000 Pixel in frischen Chromium-Profilen, ohne Laufzeitfehler. Einschließlich der vollständigen geführten Tour, eigenem Entwurf, Bewertung mit Reload, Stundenabschluss, zehn Klassen, Daten-/Hilfeseiten, Verlauf und Export. [Ergebnisse](tutorial-ba-2026-10-19/nachweise-final/ergebnisse.json).
- **6 bestandene Zusatzprüfungen**: vollständige Tour zusätzlich bei 390 × 844/667/480 Pixel, begonnene eigene Stunde samt ausgewählter Person und URL nach einer Tastaturübung erhalten, gespeicherter Klassenentwurf erhalten, Tour im schreibgeschützten zweiten Tab ohne Veränderung des eigenen Notebooks. [Ergebnisse](tutorial-ba-2026-10-19/zusatz-abgeschlossen/ergebnisse.json).
- Die sechs vollständigen Tour-Durchläufe prüfen insgesamt **90 Schrittpositionen** auf sichtbare Ziele und Erklärungen ohne gegenseitige Überdeckung. Tatsächliche Klicks und Eingaben müssen jeweils den nächsten Schritt auslösen. Erstbesuch, manueller Neustart, Tab-Umlauf, Escape, Übungsdownload und unveränderter eigener Notebook-Rohwert/URL sind enthalten. Die Geometrieprotokolle enthalten alle Schritte; Screenshots halten je Ansicht die Schritte 1/3/6/10/15 fest.
- Die drei Klassen-Excel-Downloads wurden unabhängig als ZIP/XML geprüft: drei Blätter, zwei interne Personenlinks, 20-Punkt-Symbole, korrekte numerische Noten, leere unbewertete Felder und typisierte Datumswerte mit Datumsformat, keine Formeln. [Dateiprüfung](tutorial-ba-2026-10-19/nachweise-final/excel-dateipruefung.json).
- Geänderte Dateien vor dem Commit geprüft; vollständige Liste in [dateiliste.json](tutorial-ba-2026-10-19/dateiliste.json). BA-Originalhash erneut unverändert bestätigt. Legacy, Referenzen, vorherige Nachweise und historischer Tag `v0.5.0` bleiben erhalten.

## Korrekturen während der Prüfung

Die Zwischenläufe sind nicht als erfolgreiche Abschlussnachweise ausgegeben. [Zwischenlauf-Ergebnisse](tutorial-ba-2026-10-19/zwischenlaeufe.json) erhalten die Fehler: vorzeitige native Eingabeprüfung konnte kontrollierte Formularwerte zurücksetzen; ein zu niedriger Ausschnitt überlagerte Ziele; ein Rundungsrest unter einem Pixel verhinderte eine nötige Scrollkorrektur; ein haftender Kontext überlagerte die Bewertungstaste bei 480 Pixel Höhe. Beim zusätzlichen Tastaturablauf wurden zunächst Bereitschaft/Fokus nicht abgewartet; anschließend zeigte sich eine tatsächlich zu weit gefasste Tab-Zielliste. Feldschritte führen jetzt ausschließlich durch die benötigten Eingaben und fangen Enter vor einem vorzeitigen Formularabschluss ab. Die endgültigen Läufe bestehen. Vollständige ältere Bildschirmserien bleiben lokal unter `_gradeflow-revision-sicherungen/2026-10-19-tutorial-zwischenlaeufe` erhalten und werden nicht zusätzlich hochgeladen.

## Wiederholung und Grenzen

Mit vorhandenen Abhängigkeiten in `app` bauen und die Vorschau auf `127.0.0.1:4190` starten. `app/e2e/usability_revision.py` und `app/e2e/tutorial_additional.py` benötigen lokales Python mit Playwright/Chromium und jeweils einen neuen Ausgabeordner über `GRADEFLOW_AUDIT_OUTPUT`. Der gemeinsame Ablauf steht in `app/e2e/guided_tutorial.py`; `app/e2e/verify_usability_exports.py AUSGABEORDNER` prüft die Excel-Dateien.

Geprüft wurde Chromium mit simulierten Bildschirmgrößen. Echte Mobilgeräte und deren Bildschirmtastaturen, Windows, weitere Browserengines, Screenreader und vollständige WCAG-Konformität sind nicht nachgewiesen. Native Excel-Bedienung wurde nicht geprüft. Die bekannte Größenwarnung des nachgeladenen Excel-Moduls bleibt bestehen. Technische Tests ersetzen weder den geplanten Usability-Test noch eine Untersuchung pädagogischer Wirkung.
