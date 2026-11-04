# Entwicklung und Betrieb

Die aktuelle Anwendung liegt ausschließlich unter `app/`. Der historische Code unter `legacy-source/` und die Filmkompositionen im Archiv sind eigenständige Referenzen und gehören nicht zum App-Build. Node.js 24 und npm verwenden.

## Lokal entwickeln

Vom Repository-Hauptverzeichnis aus:

```sh
cd app
npm ci
npm run dev
```

Die von Vite angezeigte Adresse verwenden. Browserdaten sind an Browserprofil und Ursprung einschließlich Port gebunden. Für denselben Datenbestand dieselbe Adresse verwenden; ein anderer Port besitzt einen getrennten Bestand.

## Prüfen und bauen

In `app/`:

```sh
npm run typecheck
npm test
npm run lint
npm run format:check
npm run build
```

Der Produktionsbuild liegt in `app/dist/`. `npm run preview` zeigt ihn lokal an. [GitHub Actions](../.github/workflows/ci.yml) führt dieselben Prüfungen bei Pushes und Pull Requests aus. Bei Excel bleibt der bekannte Hinweis auf ein großes, bei Bedarf geladenes Paket bestehen.

Die gezielte Browserprüfung für Version 1.0 ist in [release_1_0.py](../app/e2e/release_1_0.py) umgesetzt. [Abnahme und Wiederholung](update-1.0.0.md#3-tatsächlich-ausgeführte-prüfungen) beschreiben Voraussetzungen und Grenzen. Weitere Browserprüfungen stehen unter `app/e2e/`; historische Skripte sind nicht pauschal als Prüfung des aktuellen App-Stands zu verstehen.

## Klassenlisten und Sicherung

Klassenlisten enthalten genau zwei Datenspalten: `Vorname` und `Nachname`, in dieser Reihenfolge. Die erste ausgefüllte Zeile enthält die Überschriften; danach steht je Person ein vollständiges Namenspaar. Höchstens 45 Personen und 5 MiB. Excel (.xlsx) enthält ein Blatt ohne Formeln; CSV/TXT verwendet UTF-8 mit Semikolon, Komma oder Tabulator. Einspaltige Listen werden abgewiesen.

Farben und Rahmen beeinflussen den Import nicht. Vollständig leere und nur formatierte Zeilen werden übersprungen. Äußere Leerzeichen werden entfernt, mehrteilige Namen bleiben erhalten. Die App bietet eine leere Excel-/CSV-Vorlage an. Tests verwenden ausschließlich fiktive Namen.

[Excel und CSV](csv-exportformat.md) sind lesbare Auswertungen, keine Wiederherstellungsformate. Die vollständige JSON-Sicherung enthält das versionierte Notebook. Beim Import prüft die App Format und Grenze von 5 MiB; beschädigte oder übergroße Dateien ersetzen den vorhandenen Bestand nicht. Vor dem Ersetzen wird ein lokaler Rückfall gesichert und eine Warnung angezeigt. Eine heruntergeladene JSON-Datei schützt zusätzlich gegen Verlust des Browserprofils; sie ist geschützt außerhalb des Browsers aufzubewahren.

Der Schreibschutz zwischen Tabs arbeitet über die Browser-Lock-API. Ohne diese API bleibt die App zur Ansicht und zum Export geöffnet. Dies liefert keine Geräte-Synchronisierung oder Verschlüsselung. Produktiver Einsatz mit echten Schülerdaten erfordert eine gesonderte Datenschutz- und Betriebsprüfung.

## Vorhandene Netlify-Konfiguration

[netlify.toml](../netlify.toml) im Hauptverzeichnis legt Node.js 24, `app` als Basisordner, `npm run build` als Build-Befehl und `dist` als Veröffentlichungsordner relativ zu `app` fest. Veröffentlicht werden ausschließlich die fertigen Dateien aus `app/dist`. Ein bereits verbundenes GitHub-Repository kann den Branch `main` automatisch bauen; eine manuelle Veröffentlichung ist eine eigene Aktion.

Bei „Page not found“ prüfen, ob der richtige Commit gebaut wurde und im veröffentlichten Ordner direkt `index.html` und `assets/` liegen. Ein Upload des Quellordners ist nicht lauffähig. Für eine ausdrücklich beauftragte manuelle Bereitstellung zuerst in `app/` bauen und den Inhalt von `app/dist` verwenden. Die App nutzt Hash-Navigation und benötigt keine Pfadweiterleitung.

Auch über HTTPS bleiben die Daten im jeweiligen Browser. Eine Netlify-Adresse besitzt einen eigenen Bestand; lokale Daten bei Bedarf als JSON sichern und dort importieren. Die Konfiguration enthält weder Cloud-Synchronisierung noch eine Übertragung von Beobachtungen zu Netlify.

## Änderungen ins Repository übernehmen

Nur beauftragte Dateien aufnehmen. Lokale Notebook-Daten, Sicherungen, Zugangsdaten, Abhängigkeiten, Buildausgaben und temporäre Medienlaufzeiten gehören nicht ins Repository. Historische Referenzen und fremde Änderungen erhalten.

Nach bestandenen Prüfungen folgt ein nachvollziehbarer Commit mit regulärem Push und Remote-Abgleich. Versionen werden mit Tags markiert; vorhandene Tags und Commit-Historie bleiben erhalten. Fachliche Entscheidungen gehören mit Tests in die nummerierten Dokumente und ins [Entwicklungsprotokoll](entwicklungsprotokoll.md). Die Projektregeln stehen in [AGENTS.md](../AGENTS.md).
