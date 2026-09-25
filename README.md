# Mündliche Notengebung – Bachelorarbeitsversion

Dieses Repository enthält den Neubau einer App zur Dokumentation der fortlaufenden mündlichen Mitarbeit pro Person und Unterrichtsstunde. Die Bewertung bleibt eine Entscheidung der Lehrkraft. Die Bachelorarbeitsversion arbeitet ausschließlich lokal.

## Projektstand

Meilensteine 1 bis 5 sind umgesetzt. Die [Usability-Testversion](docs/usability-testversion.md) ist als Git-Tag `v0.5.0` mit festem fiktivem Datensatz und Aufgabenfolge beschrieben. Klassen können aus CSV/TXT importiert oder als Demo-Klasse angelegt werden. Unterrichtsstunden werden unmittelbar lokal erfasst und nach einer Unterbrechung fortgesetzt. Tabelle und Verlauf zeigen den chronologisch neu berechneten Stand; ältere Einträge und Personennamen lassen sich korrigieren. CSV-Export und eine vollständige JSON-Sicherung mit geprüftem Reimport stehen bereit. Klassen können nach Bestätigung mit lokalem Rückfallstand gelöscht werden. Eine frühere Legacy-Migrationssicherung ist über die Oberfläche herunterladbar und im selben Browser wiederherstellbar. Der unveränderte Vorläufer liegt unter `legacy-source/`; die Anforderungen, Entscheidungen und Prüfungen unter `docs/`. Der [Versionsverlauf](CHANGELOG.md) und das [Entwicklungsprotokoll](docs/entwicklungsprotokoll.md) halten Änderungen fest.

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

CSV- und TXT-Dateien enthalten ohne Kopfzeile einen Namen pro Zeile oder Vorname und Nachname in zwei durch Semikolon, Komma oder Tab getrennten Spalten. Höchstens 45 Personen werden übernommen. Verwende für Tests nur fiktive Namen.

## Daten

Der [CSV-Export](docs/csv-exportformat.md) enthält eine Klasse samt Startwert, Stunden und aktuellem Stand. Die JSON-Sicherung enthält das gesamte lokale Notebook und kann nach einer Formatprüfung wieder importiert werden. Beim Ersetzen vorhandener Klassen erscheint eine Warnung; der vorherige Datenstand wird im selben Browser als Rückfall gespeichert. Bewahre eine heruntergeladene JSON-Datei geschützt außerhalb des Browsers auf, da lokaler Speicher und lokaler Rückfall gemeinsam verloren gehen können.

Tests und Beispiele verwenden ausschließlich fiktive Personen. Lokale Notebook-Daten, Sicherungen, Zugangsdaten, `node_modules/` und Build-Dateien gehören nicht in Git. Ein produktiver Einsatz mit echten Schülerdaten erfordert eine gesonderte Datenschutz- und Betriebsprüfung.
