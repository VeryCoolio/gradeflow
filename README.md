# Gradeflow

**Mündliche Mitarbeit im Unterricht nachvollziehbar dokumentieren.**

Gradeflow unterstützt Lehrkräfte bei der Einschätzung einer ganzen Unterrichtsstunde pro Person. Die pädagogische Entscheidung bleibt bei der Lehrkraft. Die Bachelorarbeitsversion speichert ausschließlich lokal im Browser und enthält keine Anmeldung oder Cloud-Synchronisierung.

**Aktueller Stand: 1.0.0** · [Änderungen und Abnahme](docs/update-1.0.0.md) · [Versionsverlauf](CHANGELOG.md)

## Orientierung

| Bereich                          | Inhalt                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [app/](app/)                     | Aktuelle React-Anwendung mit Fachkern und Tests.                                                        |
| [docs/](docs/README.md)          | Anforderungen, Entscheidungen, Entwicklung und Prüfnachweise. Hier beginnt die fachliche Dokumentation. |
| [archive/](archive/README.md)    | Frühere Filmfassungen, Sprachproben und der abgeschlossene Erstauftrag.                                 |
| [legacy-source/](legacy-source/) | Unveränderte historische Anwendung als Vergleichsgrundlage.                                             |
| [reference/](reference/)         | Ursprüngliche technische Unterlagen; historische Referenz.                                              |

## Lokal starten

Node.js 24 und npm verwenden:

```sh
cd app
npm ci
npm run dev
```

## Qualität prüfen

```sh
cd app
npm run typecheck
npm test
npm run lint
npm run format:check
npm run build
```

GitHub Actions führt diese Prüfungen bei Pushes und Pull Requests aus. Freigegebene Versionen sind durch Git-Tags wie `v1.0.0` auffindbar.

## Weiterarbeiten

- **Entwicklung und vorhandene Netlify-Konfiguration:** [Entwicklungsanleitung](docs/entwicklung.md).
- **Anforderungen und Entscheidungen:** [Dokumentationsübersicht](docs/README.md).
- **Klassenlisten und Sicherung:** Excel/CSV/TXT benötigen die Spalten `Vorname` und `Nachname`; [Formate und Datengrenzen](docs/entwicklung.md#klassenlisten-und-sicherung).
- **Arbeit mit Codex:** [Aktueller Einstieg](START_HERE.md) und [Projektregeln](AGENTS.md).

Browserdaten sind an Browserprofil und Adresse einschließlich Port gebunden. JSON-Sicherungen geschützt außerhalb des Browsers aufbewahren. Tests und Beispiele verwenden fiktive Personen; der produktive Einsatz mit echten Schülerdaten erfordert eine gesonderte Datenschutz- und Betriebsprüfung.
