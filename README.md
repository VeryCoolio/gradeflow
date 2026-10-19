# Mündliche Notengebung – Bachelorarbeitsversion

Dieses Repository enthält den Neubau einer App zur Dokumentation der fortlaufenden mündlichen Mitarbeit pro Person und Unterrichtsstunde. Die Bewertung bleibt eine Entscheidung der Lehrkraft. Die Bachelorarbeitsversion arbeitet ausschließlich lokal.

## Projektstand

Version **0.7.0** setzt die freigegebene Produktrevision um: kompakte Navigation und Bewertung mit sichtbarem Personen-/Stundenkontext, sichere Wiederaufnahme derselben Ansicht, ein schreibender Tab mit aktualisierten Zweitansichten, verständliche Speicherfehler mit Wiederholung und begrenzte Dateiimporte. Die Stundenliste lässt sich blättern und nach Datum durchsuchen. Der Fachkern und das Notebook-Schema bleiben erhalten. [Abschluss und Nachweise](docs/revision-2026-10-18/umsetzung/abschluss.md) sowie der [Bildvergleich](docs/revision-2026-10-18/umsetzung/vergleich.html) dokumentieren den Stand.

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

## Netlify

Die `netlify.toml` im Repository-Hauptverzeichnis legt Node.js 24, `app` als Basisordner, `npm run build` als Build-Befehl und `dist` als Veröffentlichungsordner relativ zu `app` fest. Netlify veröffentlicht damit ausschließlich die fertigen Dateien aus `app/dist`. Das GitHub-Repository mit dem Produktionsbranch `main` verbinden; die Datei überschreibt entsprechende Build-Einstellungen in der Netlify-Oberfläche.

Bei „Page not found“ im Netlify-Deploy prüfen, ob der aktuelle Commit gebaut wurde und im veröffentlichten Ordner direkt eine `index.html` sowie `assets/` liegen. Ein Upload des Quellordners ist nicht lauffähig. Bei manueller Bereitstellung zuerst lokal `npm run build` in `app` ausführen und anschließend den Inhalt von `app/dist` hochladen. Die Navigation verwendet den URL-Hash und benötigt keine Pfadweiterleitung.

Die Daten bleiben auch bei einer über HTTPS bereitgestellten App im jeweiligen Browser gespeichert. Die Netlify-Adresse hat einen eigenen Datenbestand; lokale Daten bei Bedarf als JSON sichern und auf der neuen Adresse importieren.

## Klassenliste

Genau zwei Spalten, in dieser Reihenfolge: `Vorname` und `Nachname`. Zeile 1 enthält diese Überschriften, ab Zeile 2 steht je Person ein vollständiges Namenspaar. Höchstens 45 Personen, maximal 5 MiB. Excel (.xlsx) enthält ein Blatt ohne Formeln; CSV/TXT verwendet UTF-8 mit Semikolon, Komma oder Tabulator. Einspaltige Listen werden abgewiesen. Die App bietet eine leere Musterklassenliste als Excel oder CSV an. Für Tests ausschließlich fiktive Namen verwenden.

## Daten

Der Excel-Export enthält eine Klassenübersicht und je Person ein Blatt mit den chronologischen Stunden. [Excel und CSV](docs/csv-exportformat.md) sind lesbare Auswertungen ohne technische IDs, keine Wiederherstellungsformate. Die JSON-Sicherung enthält das gesamte lokale Notebook und kann bis 5 MiB pro Datei nach einer Formatprüfung wieder importiert werden. Größere Dateien werden mit einer klaren Fehlermeldung abgewiesen; der vorhandene Bestand bleibt erhalten. Beim Ersetzen vorhandener Klassen erscheint eine Warnung; der vorherige Datenstand wird im selben Browser als Rückfall gespeichert. Bewahre eine heruntergeladene JSON-Datei geschützt außerhalb des Browsers auf, da lokaler Speicher und lokaler Rückfall gemeinsam verloren gehen können.

Tests und Beispiele verwenden ausschließlich fiktive Personen. Lokale Notebook-Daten, Sicherungen, Zugangsdaten, `node_modules/` und Build-Dateien gehören nicht in Git. Ein produktiver Einsatz mit echten Schülerdaten erfordert eine gesonderte Datenschutz- und Betriebsprüfung.

Browserdaten sind an Browserprofil und Ursprung gebunden, einschließlich Port. Für denselben Datenbestand dieselbe lokale Adresse verwenden. Die App schützt parallele Tabs desselben Ursprungs mit der Browser-Lock-API; ohne diese API ist sie zur Ansicht und zum Export geöffnet. Eine Geräte-Synchronisierung und Verschlüsselung werden damit nicht bereitgestellt.

Die wiederholbare Browserprüfung für 0.7.0 liegt in `app/e2e/`. Die Anleitung im [Revisionsordner](docs/revision-2026-10-18/README.md) nennt Voraussetzungen und Befehle. Die dortigen älteren Ausgangsskripte sind als historische Vergleichsgrundlage erhalten.
