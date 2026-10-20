# Umsetzung des Drei-Skill-Berichts – 20.10.2026

Grundlage: [Audit vom 19.10.2026](drei-skill-audit-2026-10-19/bericht.md), Ausgangsstand `d0d5ea5`. Auftrag: alle acht Befunde umsetzen, einzeln prüfen und abhaken. Fachregeln, Schema und historische Nachweise bleiben erhalten.

- [x] B01 Fehlgeschlagene Eingabe bei Navigation erhalten.
- [x] B02 Mobile Datenhierarchie und Bewertung kompakter gestalten.
- [x] B03 Personen-Editor sichtbar und fokussiert öffnen.
- [x] B04 Ungespeicherte Namensänderungen schützen.
- [x] B05 Importfehler am Formular anzeigen.
- [x] B06 Lange Excel-Titel lesbar ausgeben.
- [x] B07 Tabellenpräferenzen erhalten und Seiten verlinken.
- [ ] B08 Sprache korrigieren.
- [ ] Abschließende Browser-/Designprüfung und GitHub-Remote bestätigen.

## B01

Die fehlgeschlagene Eingabe behält Klasse, Stunde und Person. Ein seitenübergreifender Hinweis bietet Wiederholung, Rückkehr zur Eingabe und ausdrücklich bestätigtes Verwerfen. Neuladen warnt über die Browserfunktion, solange ein ungesicherter Auftrag besteht. Eine andere Bewertung überschreibt ihn nicht. Bereits gespeicherte Daten werden nicht verändert. Der Auftrag liegt im Arbeitsspeicher; er wird nicht als erfolgreiche Speicherung oder Bestandteil einer JSON-Sicherung ausgegeben.

Prüfung: Zwei neue Regressionen schlugen vor der Änderung fehl. Danach 30 App-Integrationstests, Typecheck, Lint und Build erfolgreich. Die Browser-Gegenprüfung folgt gemeinsam mit der mobilen Überarbeitung.

## B02

Die bestehende Farb- und Schriftgestaltung bleibt erhalten. Mobile Kopfzeile und Klassenwahl sind kompakter; Klassenansichten liegen in einer benannten Auswahl. Exporte sind ein bewusst zu öffnendes Menü. Tabellenoptionen und ausführliche Diagrammhinweise lassen sich aufklappen. Die Tabelle zeigt bei 390 × 844 bereits Datenzeilen; die fünf Bewertungssymbole sowie AW/NB passen beim normalen Testnamen in die erste Ansicht. Lange Namen und große Schrift dürfen weiter scrollen.

Prüfung: 123 Tests, Typecheck und Build bestanden. Tatsächliche Sichtprüfung bei 320/390/768/1440 Pixeln ohne horizontales Seitenüberlaufen. Alle 15 Tour-Schritte bei 390 Pixeln durchlaufen; Tabelle und Verlauf über die neue Auswahl tatsächlich geöffnet. [Messwerte](reparaturen-2026-10-20/B02-fit.json) und Bilder bleiben getrennt vom Ausgangsaudit.

## B03

Der Personen-Editor steht direkt in der gewählten Personenzeile. Das Namensfeld erhält Fokus und wird bei Bedarf sichtbar gescrollt. Nach Speichern oder Abbrechen kehrt der Fokus zum zugehörigen Auslöser zurück. Der bestehende Demo-/Umbenennungstest prüft nun ausdrücklich die Fokusübergabe; diese Prüfung schlug vor der Änderung fehl und besteht danach. Typecheck bestanden. Die visuelle Gegenprüfung mit 20/45 Personen erfolgt im Abschlusslauf.

## B04

Offene Namen-/Zeitraumänderungen werden als ungespeichert angezeigt. Ein gemeinsamer Navigationsschutz fragt vor dem Verwerfen; Abbrechen erhält die Eingabe. Das gilt für Seiten, Klassen, Ansichten, andere Personen, Tourstart und Browser-Zurück. Neuladen nutzt die native Browserwarnung. Unveränderte Formulare verlangen keine Bestätigung.

Prüfung: Zwei neue Regressionen zuerst fehlgeschlagen, danach bestanden; Typecheck erfolgreich. Browser-Zurück und Klassenwechsel werden im Abschluss zusätzlich tatsächlich bedient.

## B05

Fehler beim Anlegen/Importieren erscheinen direkt vor dem Absenden im Formular. Der Hinweis erhält Fokus, ist mit dem betroffenen Dateifeld verknüpft und erklärt den nächsten Schritt. Eingaben bleiben erhalten; ein neu gewähltes Dokument entfernt den veralteten Dateifehler. Drei Formular- und 32 App-Tests, Typecheck und Lint bestanden. Die tatsächliche mobile Fehlerbedienung folgt im Abschlusslauf.

## B06

Excel-Titel nutzen verbundene Zellen über die gesamte Blattbreite. Klassenname und Bewertungszeitraum erhalten ausreichend breite getrennte Bereiche; Zeilenhöhen berücksichtigen Textlänge und Zeilenumbrüche. Lange Namen in der Übersicht erhalten ebenfalls mehr Höhe. Fachwerte, Datumstypen und interne Links bleiben erhalten. Fünf Excel-Regressionen und Typecheck bestanden; Sichtprüfung des tatsächlichen Exports folgt im Abschlusslauf.

## B07

Tabellenmodus, Schriftgröße, Stundenfenster und Blätterposition gehören zur gespeicherten Arbeitsposition und zur kopierbaren URL. Fehlerhafte Werte erhalten sichere Standardwerte. Alte Positionen funktionieren weiter. Hauptseiten und Hilfeseiten sind echte Links mit unverändertem Schutz beim normalen Wechsel; neue Tabs bleiben möglich. 33 App-Tests, Tabellen-/Positionsprüfungen, Typecheck und Lint bestanden. Die aktive Browser-Tour wurde auf Links und mobile Ansichtenwahl angepasst.
