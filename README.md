# Mündliche Notengebung – Bachelorarbeitsversion

Dieses Repository enthält den Neubau einer App zur Dokumentation der fortlaufenden mündlichen Mitarbeit pro Person und Unterrichtsstunde. Die Bewertung bleibt eine Entscheidung der Lehrkraft. Die Bachelorarbeitsversion arbeitet ausschließlich lokal.

## Projektstand

Meilenstein 1 (Fachkern), Meilenstein 2 (lokales Datenmodell und Migration) und Meilenstein 3 (Kernoberfläche) sind umgesetzt. Klassen können aus CSV/TXT importiert und Unterrichtsstunden unmittelbar lokal erfasst werden. Eine unvollständige Stunde öffnet sich beim erneuten Start am gespeicherten Stand. Tabelle, Verlauf, nachträgliche Bearbeitung älterer Stunden und Datei-Export folgen in späteren Meilensteinen. Der unveränderte Vorläufer liegt unter `legacy-source/`; die Anforderungen, Entscheidungen und Prüfungen unter `docs/`. Der [Versionsverlauf](CHANGELOG.md) und das [Entwicklungsprotokoll](docs/entwicklungsprotokoll.md) halten Änderungen fest.

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

Tests und Beispiele verwenden ausschließlich fiktive Personen. Lokale Notebook-Daten, Sicherungen, Zugangsdaten, `node_modules/` und Build-Dateien gehören nicht in Git. Ein produktiver Einsatz mit echten Schülerdaten erfordert eine gesonderte Datenschutz- und Betriebsprüfung.
