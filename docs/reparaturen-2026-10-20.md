# Umsetzung des Drei-Skill-Berichts – 20.10.2026

Grundlage: [Audit vom 19.10.2026](drei-skill-audit-2026-10-19/bericht.md), Ausgangsstand `d0d5ea5`. Auftrag: alle acht Befunde umsetzen, einzeln prüfen und abhaken. Fachregeln, Schema und historische Nachweise bleiben erhalten.

- [x] B01 Fehlgeschlagene Eingabe bei Navigation erhalten.
- [x] B02 Mobile Datenhierarchie und Bewertung kompakter gestalten.
- [ ] B03 Personen-Editor sichtbar und fokussiert öffnen.
- [ ] B04 Ungespeicherte Namensänderungen schützen.
- [ ] B05 Importfehler am Formular anzeigen.
- [ ] B06 Lange Excel-Titel lesbar ausgeben.
- [ ] B07 Tabellenpräferenzen erhalten und Seiten verlinken.
- [ ] B08 Sprache korrigieren.
- [ ] Abschließende Browser-/Designprüfung und GitHub-Remote bestätigen.

## B01

Die fehlgeschlagene Eingabe behält Klasse, Stunde und Person. Ein seitenübergreifender Hinweis bietet Wiederholung, Rückkehr zur Eingabe und ausdrücklich bestätigtes Verwerfen. Neuladen warnt über die Browserfunktion, solange ein ungesicherter Auftrag besteht. Eine andere Bewertung überschreibt ihn nicht. Bereits gespeicherte Daten werden nicht verändert. Der Auftrag liegt im Arbeitsspeicher; er wird nicht als erfolgreiche Speicherung oder Bestandteil einer JSON-Sicherung ausgegeben.

Prüfung: Zwei neue Regressionen schlugen vor der Änderung fehl. Danach 30 App-Integrationstests, Typecheck, Lint und Build erfolgreich. Die Browser-Gegenprüfung folgt gemeinsam mit der mobilen Überarbeitung.

## B02

Die bestehende Farb- und Schriftgestaltung bleibt erhalten. Mobile Kopfzeile und Klassenwahl sind kompakter; Klassenansichten liegen in einer benannten Auswahl. Exporte sind ein bewusst zu öffnendes Menü. Tabellenoptionen und ausführliche Diagrammhinweise lassen sich aufklappen. Die Tabelle zeigt bei 390 × 844 bereits Datenzeilen; die fünf Bewertungssymbole sowie AW/NB passen beim normalen Testnamen in die erste Ansicht. Lange Namen und große Schrift dürfen weiter scrollen.

Prüfung: 123 Tests, Typecheck und Build bestanden. Tatsächliche Sichtprüfung bei 320/390/768/1440 Pixeln ohne horizontales Seitenüberlaufen. Alle 15 Tour-Schritte bei 390 Pixeln durchlaufen; Tabelle und Verlauf über die neue Auswahl tatsächlich geöffnet. [Messwerte](reparaturen-2026-10-20/B02-fit.json) und Bilder bleiben getrennt vom Ausgangsaudit.
