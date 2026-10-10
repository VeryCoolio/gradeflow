# Bedienkorrekturen 0.6.1

Stand: 10.10.2026. Grundlage: weitere Rückmeldung zur lokalen Bewertung, Stundentabelle und Verlauf. Historische Berichte und `v0.5.0` bleiben erhalten.

## Entscheidung und geprüfte Umsetzung

- **Bewertung:** Der zuletzt präzisierte Wunsch lässt den Puffer als kleine Zusatzinformation bestehen. Notenergebnis ist getrennt und deutlich hervorgehoben; Flächen sind dezent rot/grün, Status kleiner, doppelte Symbolaufzählung entfernt. `0` steht in Bewertung und Hilfe an dritter Stelle. Ursache in der Hilfe war `Object.entries` mit numerischem Schlüssel `0`; die ausdrückliche Symbolfolge behebt das (`App.tsx`, `RatingGuide.tsx`, `styles.css`).
- **Stundentausch:** Das Repository tauschte bereits atomar, die gleich beschrifteten Zeilen machten den Vorgang kaum wahrnehmbar. Die Liste zeigt jetzt die erste vor der zweiten Stunde, Symbolzahlen und einen Personenauszug. Nach Erfolg erscheinen lokale Speicherbestätigung und Hinweis direkt am Datum. Bei Speicherfehler bleibt die Reihenfolge bestehen. Stabile IDs behalten ihre Beobachtungen (`App.tsx`, `presentation.ts`, `App.test.tsx`).
- **Stundentabelle:** Standard ist die kompakte Ansicht der zehn neuesten Stunden; weitere Fenster, 20 oder alle Stunden, Detailansicht und drei Größen sind wählbar. AW = abwesend, NB = nicht beobachtet, Offen = noch nicht erfasst. Eine bewertete Null bleibt ein eigener Eintrag. Namen, Kopfzeilen und Gesamtstand sind fixiert. Der aktuelle Stand stammt immer aus dem vollständigen Bericht, auch wenn Stunden verborgen sind (`ClassTable.tsx` und Test).
- **Verlauf:** Jede Unterrichtsstunde besitzt konstant 112 horizontale SVG-Einheiten. Unbewertete Stunden sind mit AW/NB/Offen beschriftet und erzeugen keine Leistungsdatenpunkte. Unterschiedliche Zeiträume und Personen verwenden dieselbe Abstandseinheit. Die Linie kann unbewertete Stunden überspannen; ihre geometrische Länge hängt auch von Notenänderung und überspannten Stunden ab (`StudentHistory.tsx` und Test).
- **Unveränderter Rahmen:** Sofortige lokale Speicherung, Pufferlogik, Statusmodell, chronologische Neuberechnung, Notebook-Schema und frei laufender Zeitraum bleiben erhalten. Keine neue Abhängigkeit, Migration oder Cloud-Synchronisierung.

## Prüfungen

| Prüfung                          | Ergebnis                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Typecheck                        | bestanden                                                                                                                      |
| Unit-/Integrationstests          | 95 Tests in 15 Dateien bestanden                                                                                               |
| Lint / Formatprüfung             | bestanden                                                                                                                      |
| Produktions-Build                | bestanden; bekannte Warnung zur Größe des getrennt geladenen Excel-Moduls                                                      |
| `git diff --check`               | ohne Befund                                                                                                                    |
| Fiktiver Produktions-Browsertest | 20 Personen, 24 vollständige Stunden, alle Statusarten und eine Doppelstunde auf getrenntem lokalem Ursprung                   |
| Tausch                           | geänderter Personenauszug, erste/zweite Stunde und tatsächliche Speicherbestätigung sichtbar; Fehlerfall automatisiert geprüft |
| Tabelle                          | ältere Fenster, alle Stunden in großer Schrift, interne Scrollbewegung bei sichtbarem Namen und Gesamtstand geprüft            |
| Verlauf                          | alle 24 Datumspunkte im Browser mit exakt 112 Einheiten Abstand; Tests mit einer und 20 Stunden sowie unbewerteter Person      |
| Layout                           | 390 und 768 CSS-Pixel ohne horizontales Seitenüberlaufen; Desktop 1280 visuell geprüft; mobile Bewertung ohne Textüberlappung  |
| Kontraststichprobe               | Textkontraste der fünf Bewertungsflächen 6,17:1 bis 7,67:1                                                                     |

Die Ansichtseinstellungen speichern keine neuen fachlichen Daten. Exportiert und berechnet werden weiterhin sämtliche Stunden. Ein professioneller Usability-Test oder eine vollständige Barrierefreiheitsprüfung wurde nicht ersetzt.

## Vollständige Dateiliste

Alle Pfade relativ zum Repository-Stamm; insgesamt 21 Dateien: 19 geänderte bestehende und zwei neue Dateien.

| Datei                                              | Änderung                                                                 |
| -------------------------------------------------- | ------------------------------------------------------------------------ |
| `CHANGELOG.md`                                     | Versionsverlauf                                                          |
| `README.md`                                        | Beschreibung und Berichtlink                                             |
| `app/package.json`                                 | Version 0.6.1                                                            |
| `app/package-lock.json`                            | Version 0.6.1, keine neuen Abhängigkeiten                                |
| `app/src/App.tsx`                                  | Bewertungshierarchie, Personenauszug und Tauschrückmeldung               |
| `app/src/App.test.tsx`                             | Symbolfolge, sichtbarer Tausch, Speicherfehler und Tabellen-Regressionen |
| `app/src/features/assessment/RatingGuide.tsx`      | ausdrückliche Symbolreihenfolge                                          |
| `app/src/features/history/StudentHistory.tsx`      | feste Abstände und eindeutige Statusmarker                               |
| `app/src/features/history/StudentHistory.test.tsx` | Abstände und unbewertete Einträge                                        |
| `app/src/features/presentation.ts`                 | Kurztexte und Eingabezahlen                                              |
| `app/src/features/table/ClassTable.tsx`            | Kompakt-/Detailansicht, Stundenfenster und Größenwahl                    |
| `app/src/features/table/ClassTable.test.tsx`       | neu; 24 Stunden, vollständiger Gesamtstand, Status und Größen            |
| `app/src/styles.css`                               | dezente Farben, Hierarchie, mobile Zeilen und fixierte Tabelle           |
| `docs/01-produktumfang-und-anforderungen.md`       | präzisierte Bedienanforderungen                                          |
| `docs/02-bewertungsmodell.md`                      | unveränderte Berechnung bei neuer Darstellung                            |
| `docs/04-zielarchitektur.md`                       | Ansichtszustände und feste Diagrammeinheit                               |
| `docs/06-testkonzept.md`                           | ergänzende Abnahmefälle                                                  |
| `docs/07-offene-entscheidungen.md`                 | O12–O14                                                                  |
| `docs/barrierefreiheitspruefung.md`                | ergänzende Teilprüfung                                                   |
| `docs/entwicklungsprotokoll.md`                    | Problem, Entscheidung, Umsetzung und Nachweise                           |
| `docs/bedienkorrekturen-0.6.1.md`                  | neu; dieser Bericht                                                      |

Die bereits zuvor unversionierte `app/src/main.ts` und `legacy-source/` sind unverändert. Temporäre Prüfdateien enthalten ausschließlich fiktive Daten und werden nicht ins Repository aufgenommen.

## Grenzen und offene Punkte

- Screenreader, vollständiger WCAG-Audit und neuer Usability-Test stehen weiterhin aus. Die Kontrastmessung ist eine Stichprobe.
- Die Tabelle kann innerhalb ihres Bereichs weiterhin horizontal scrollen. Ein festes Stundenfenster und fixierte Bezugsspalten begrenzen den Darstellungsumfang; sie löschen oder begrenzen keine fachlichen Daten.
- Die bekannte Excel-Größenwarnung bleibt bestehen; diese Überarbeitung fügt keine neue Bibliothek hinzu.
- Datenschutz- und Betriebsprüfung für echte Daten sowie die bestehenden Risiken des lokalen Browser-Speichers bleiben offen. Ein konkreter fachspezifischer Kriterienkatalog ist weiterhin nicht festgelegt.
