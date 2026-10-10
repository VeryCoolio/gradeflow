# Mündliche Notengebung – Bachelorarbeitsversion

Dieses Repository enthält den Neubau einer App zur Dokumentation der fortlaufenden mündlichen Mitarbeit pro Person und Unterrichtsstunde. Die Bewertung bleibt eine Entscheidung der Lehrkraft. Die Bachelorarbeitsversion arbeitet ausschließlich lokal.

## Projektstand

Meilensteine 1 bis 5 sind umgesetzt; Version 0.6.0 überarbeitet die Bedienung nach Nutzerfeedback. Feste Seiten für Klassen, Klassenerstellung, Sicherung und Bewertungshilfe ersetzen die Aufklappbereiche. Klassen lassen sich manuell oder aus zweispaltigen Excel-/CSV-/TXT-Listen anlegen. Neue Klassen erhalten eine änderbare Schuljahresbezeichnung ohne Enddatum oder automatischen Reset. Die Demo enthält 20 fiktive Personen. Farbige Symbole zeigen Bedeutung und konkretes Ergebnis; jede Beobachtung wird sofort lokal gespeichert. Vollständige Stunden erhalten eine Speicherbestätigung mit Rückweg zur Übersicht. Tabelle, Verlauf mit Datumsachse, Excel mit Personenblättern, vereinfachte CSV und wiederherstellbare JSON-Vollsicherung stehen bereit. Vorhandene Daten und `legacy-source/` bleiben erhalten. [Entwicklungsprotokoll](docs/entwicklungsprotokoll.md) und [Versionsverlauf](CHANGELOG.md) beschreiben die Änderungen.

Version 0.6.1 verfeinert die Bewertungshierarchie und Symbolfolge, macht den Stundentausch sichtbar und ergänzt eine kompakte, größenveränderbare Tabelle mit Stundenfenstern. Der Verlauf verwendet feste Stundenabstände und klare Statuskürzel. [Bedienkorrekturen 0.6.1](docs/bedienkorrekturen-0.6.1.md) dokumentiert Änderungen und Prüfungen.

Der Tag `v0.5.0` bleibt der unveränderte historische [Usability-Teststand](docs/usability-testversion.md). Die Überarbeitung wird separat geprüft und vor einer neuen Erhebung erneut festgelegt.

## Entwicklung

Node.js 24 und npm verwenden:

```bash
cd app
npm ci
npm run dev
```

Für die Qualitätssicherung:

```bash
cd app
npm run typecheck
npm test
npm run lint
npm run format:check
npm run build
```

GitHub Actions führt diese Prüfungen bei Pushes und Pull Requests aus. Änderungen an Fachregeln gehören mit Tests und einem Eintrag im Entwicklungsprotokoll in einen eigenen Commit. Freigegebene Projektstände erhalten einen Git-Tag.

## Klassenliste

Genau zwei Spalten, in dieser Reihenfolge: `Vorname` und `Nachname`. Zeile 1 enthält diese Überschriften, ab Zeile 2 steht je Person ein vollständiges Namenspaar. Höchstens 45 Personen, maximal 5 MB. Excel (.xlsx) enthält ein Blatt ohne Formeln; CSV/TXT verwendet UTF-8 mit Semikolon, Komma oder Tabulator. Einspaltige Listen werden abgewiesen. Die App bietet eine leere Musterklassenliste als Excel oder CSV an. Für Tests ausschließlich fiktive Namen verwenden.

## Daten

Der Excel-Export enthält eine Klassenübersicht und je Person ein Blatt mit den chronologischen Stunden. [Excel und CSV](docs/csv-exportformat.md) sind lesbare Auswertungen ohne technische IDs, keine Wiederherstellungsformate. Die JSON-Sicherung enthält das gesamte lokale Notebook und kann nach einer Formatprüfung wieder importiert werden. Beim Ersetzen vorhandener Klassen erscheint eine Warnung; der vorherige Datenstand wird im selben Browser als Rückfall gespeichert. Bewahre eine heruntergeladene JSON-Datei geschützt außerhalb des Browsers auf, da lokaler Speicher und lokaler Rückfall gemeinsam verloren gehen können.

Tests und Beispiele verwenden ausschließlich fiktive Personen. Lokale Notebook-Daten, Sicherungen, Zugangsdaten, `node_modules/` und Build-Dateien gehören nicht in Git. Ein produktiver Einsatz mit echten Schülerdaten erfordert eine gesonderte Datenschutz- und Betriebsprüfung.
