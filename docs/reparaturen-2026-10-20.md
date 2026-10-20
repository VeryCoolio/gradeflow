# Umsetzung des Drei-Skill-Berichts – 20.10.2026

Grundlage: [Audit vom 19.10.2026](drei-skill-audit-2026-10-19/bericht.md), Ausgangsstand `d0d5ea5`. Auftrag: alle acht Befunde umsetzen, einzeln prüfen und abhaken. Fachregeln, Schema und historische Nachweise bleiben erhalten.

- [x] B01 Fehlgeschlagene Eingabe bei Navigation erhalten.
- [ ] B02 Mobile Datenhierarchie und Bewertung kompakter gestalten.
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
