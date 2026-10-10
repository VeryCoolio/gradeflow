# Änderungs- und Prüfbericht 0.6.0

Stand: 10.10.2026. Grundlage: Rückmeldung zur lokalen Vorschau. Alle Test-, Demo- und Bildschirmdaten sind fiktiv.

## Entscheidungen

Die Nutzerentscheidungen O8–O11 stehen in [Dokument 07](07-offene-entscheidungen.md): manuelle Klassenerstellung, Vorname/Nachname als zwei verpflichtende Spalten, vorbelegte änderbare Schuljahresbezeichnung, feste Navigation, farbige Symbole mit Erklärung, tatsächliche Speicherbestätigung und Rückweg, größere Demo sowie lesbare Excel-Berichte mit Personenblättern. Ein Schuljahreslabel begrenzt den Zeitraum nicht. Es gibt weder ein automatisches Ende noch einen Noten-Reset. JSON bleibt die vollständige Wiederherstellungssicherung.

## Geprüfter Iststand

- Die feste Navigation führt zu Klassen, Klassenerstellung, Datensicherung und Bewertungshilfe. Klassen besitzen Ansichten für Stunden, Tabelle, Verlauf, Personen und Einstellungen (`app/src/App.tsx`, `app/src/styles.css`).
- Klassen werden manuell oder aus XLSX/CSV/TXT mit genau den Spalten `Vorname`, `Nachname` angelegt. Höchstens 45 Personen, maximal 5 MB, XLSX mit genau einem Blatt und Textzellen ohne Formeln. Auch einzelne Werte außerhalb der zwei Spalten werden abgewiesen. Die leere Musterdatei lässt sich ausgefüllt einlesen (`ClassCreation.tsx`, `classImport.ts`, `excelWorkbook.ts` und zugehörige Tests).
- Neue Demo-Klassen enthalten 20 Namen und überschreiben keine vorhandene Klasse. Neue Klassen erhalten einen änderbaren Schuljahresvorschlag. Bereits gespeicherte Bezeichnungen werden nicht verändert (`application/demoClass.ts`, `application/schoolYear.ts`).
- Die Bewertung erklärt die gesamte mündliche Mitarbeit einer Stunde, den relativen Vergleich und alle fünf Symbole. Rot-/Grünabstufungen ergänzen Text und Auswahlzustand. Ergebnishinweise verwenden den Fachkern und den Stand vor der betreffenden Stunde, auch bei älteren Stunden (`RatingGuide.tsx`, `application/ratingGuide.ts`, `App.tsx`, `App.test.tsx`).
- Die bestehende unmittelbare lokale Speicherung bleibt erhalten. Die Abschlussbestätigung erscheint erst bei vollständig gespeicherten Beobachtungen; bei Fehler wird kein Erfolg vorgetäuscht. Der Rückweg wird fokussiert (`App.tsx`, `App.test.tsx`).
- Excel enthält eine Klassenübersicht und ein Blatt je Person. Daten und Noten sind typisiert; unbewertete Stunden erhalten keinen Leistungsdatenpunkt. Bericht und CSV enthalten keine technischen IDs. JSON-Import und Rückfall bleiben erhalten (`excelWorkbook.ts`, `csvExport.ts`, `exports.test.ts`, `docs/csv-exportformat.md`).
- Alle Personen haben dieselbe Achse aus den chronologisch sortierten Unterrichtsdaten. Abwesend, nicht beobachtet und offen bleiben sichtbar. Die Ereignisse sind tabellarisch lesbar (`StudentHistory.tsx` und Test).
- Notebook-Schema und Fachkern wurden nicht verändert. `legacy-source/` bleibt unverändert. Der Tag `v0.5.0` hält den ursprünglichen Erhebungsstand fest.

## Ausgeführte Prüfungen

| Prüfung                    | Ergebnis                                                                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run typecheck`        | bestanden                                                                                                                                                          |
| `npm test`                 | 89 Tests in 14 Dateien bestanden                                                                                                                                   |
| `npm run lint`             | bestanden                                                                                                                                                          |
| `npm run format:check`     | bestanden                                                                                                                                                          |
| `npm run build`            | bestanden; Größenwarnung zum separat geladenen Excel-Baustein                                                                                                      |
| `npm audit`                | 0 bekannte Schwachstellen                                                                                                                                          |
| `git diff --check`         | ohne Befund                                                                                                                                                        |
| Excel-Dateien              | XLSX erneut eingelesen, ausgefüllte Vorlage importiert, Zahlen-/Datumsformate mit unabhängigem Leser geprüft und drei Blattansichten gerendert und visuell geprüft |
| Browser mit fiktiven Daten | Demo mit 20 Personen, alle Statusarten, vollständige Speicherung und Rückweg, Excel-Berichtserzeugung mit gestartetem Download, Zeitraumänderung, Personenverlauf  |
| Responsive Darstellung     | bei 390, 768 und 1255 CSS-Pixeln kein horizontales Überlaufen der Seite; mobile Bewertungsbuttons mindestens 44 CSS-Pixel hoch                                     |

Die Formatprüfung umfasst die Anwendung; ergänzend wurden die geänderten Dokumente formatiert. Der Produktions-Build erzeugt den normalen Einstieg mit rund 281 kB JavaScript (86 kB gzip) und einen erst bei Excel-Aktionen geladenen Baustein mit rund 940 kB (272 kB gzip).

## Geänderte und neue Dateien

Alle Pfade beziehen sich auf den Repository-Stamm. „Neu“ bezeichnet in dieser Überarbeitung angelegte Dateien.

| Datei                                                       | Status / Zweck                                                      |
| ----------------------------------------------------------- | ------------------------------------------------------------------- |
| `CHANGELOG.md`                                              | geändert; Version 0.6.0                                             |
| `README.md`                                                 | geändert; Bedienung, Import und Berichtformate                      |
| `app/package.json`                                          | geändert; Version, Preview-Skript und begründete Excel-Abhängigkeit |
| `app/package-lock.json`                                     | geändert; reproduzierbare Abhängigkeiten und Audit-Korrekturen      |
| `app/public/demo-klasse.csv`                                | geändert; zweispaltige Demo mit 20 Namen                            |
| `app/public/musterklassenliste.csv`                         | neu; leere Vorlage                                                  |
| `app/public/musterklassenliste.xlsx`                        | neu; leere formatierte Excel-Vorlage                                |
| `app/src/App.tsx`                                           | geändert; Navigation, Bewertung, Abschluss und Excel-Ablauf         |
| `app/src/App.test.tsx`                                      | geändert; neue Bedienabläufe und Regressionen                       |
| `app/src/application/demoClass.ts`                          | geändert; größere Demo, eindeutiger Name                            |
| `app/src/application/demoClass.test.ts`                     | geändert; Demo-/CSV-Konsistenz                                      |
| `app/src/application/ratingGuide.ts`                        | neu; Symboltexte und Farbzuteilung                                  |
| `app/src/application/schoolYear.ts`                         | neu; änderbarer Bezeichnungsvorschlag                               |
| `app/src/application/schoolYear.test.ts`                    | neu; Jahreswechsel und Augustgrenze                                 |
| `app/src/features/assessment/RatingGuide.tsx`               | neu; sichtbare Modellhilfe                                          |
| `app/src/features/classes/ClassCreation.tsx`                | neu; manuelle Anlage und Dateiimport                                |
| `app/src/features/history/StudentHistory.tsx`               | geändert; Datumsachse, Personennavigation und Tabelle               |
| `app/src/features/history/StudentHistory.test.tsx`          | neu; gleiche Achse und ausdrückliche Status                         |
| `app/src/features/presentation.ts`                          | geändert; Farbzuteilung für Tabellenzellen                          |
| `app/src/features/table/ClassTable.tsx`                     | geändert; farbige Bewertungskennzeichnung                           |
| `app/src/infrastructure/importExport/classImport.ts`        | geändert; strikte Spalten und Dateiimport                           |
| `app/src/infrastructure/importExport/classImport.test.ts`   | geändert; ungültige Listen und Grenzen                              |
| `app/src/infrastructure/importExport/csvExport.ts`          | geändert; lesbares deutsches Format Version 2                       |
| `app/src/infrastructure/importExport/exports.test.ts`       | geändert; CSV und bestehende Vollsicherung                          |
| `app/src/infrastructure/importExport/excelWorkbook.ts`      | neu; lokaler XLSX-Import und mehrblättriger Bericht                 |
| `app/src/infrastructure/importExport/excelWorkbook.test.ts` | neu; Typen, Namen, Grenzen, Status und Vorlage                      |
| `app/src/styles.css`                                        | geändert; Navigation, Farben und responsive Formulare               |
| `docs/01-produktumfang-und-anforderungen.md`                | geändert; bestätigte Anforderungen                                  |
| `docs/02-bewertungsmodell.md`                               | geändert; Darstellung und Vergleichsgrundlage                       |
| `docs/04-zielarchitektur.md`                                | geändert; Module, Excel-Abhängigkeit und unverändertes Schema       |
| `docs/06-testkonzept.md`                                    | geändert; ergänzende Abnahmekriterien                               |
| `docs/07-offene-entscheidungen.md`                          | geändert; O8–O11 und offene Punkte                                  |
| `docs/csv-exportformat.md`                                  | geändert; Excel und CSV Version 2                                   |
| `docs/barrierefreiheitspruefung.md`                         | ergänzt; technische Teilprüfung 0.6.0                               |
| `docs/entwicklungsprotokoll.md`                             | ergänzt; Problem, Entscheidung, Umsetzung und Prüfung               |
| `docs/oberflaechenueberarbeitung-0.6.md`                    | neu; dieser Bericht                                                 |

Die zuvor vorhandene unversionierte `app/src/main.ts` gehört nicht zu dieser Änderung. Temporäre Bildschirm- und Excel-Prüfdateien werden nicht als Anwendungsdaten ins Repository aufgenommen.

## Offene Punkte und Grenzen

- **Offen:** Ein konkreter fachspezifischer Beobachtungskatalog ist nicht bestätigt. Die Hilfe erklärt das bestehende Modell, ohne neue pädagogische Kriterien zu behaupten. PDF bleibt eine mögliche Ergänzung.
- **Geprüfte technische Grenze:** Der Excel-Baustein ist groß und kann das erste Öffnen einer Excel-Aktion verzögern; er wird getrennt geladen. Ein nativer Bedienungstest in Microsoft Excel wurde nicht durchgeführt.
- **Weiter offen:** Screenreader, Vergrößerung, vollständiger WCAG-Audit und neuer Usability-Test mit Lehramtsstudierenden. Die technischen Tests belegen keine pädagogische Wirksamkeit.
- **Bestehendes Risiko:** Lokaler Speicher und lokale Rückfallstände können gemeinsam verloren gehen. Heruntergeladene Sicherungen und Berichte enthalten bei echtem Betrieb personenbezogene Daten; Datenschutz- und Betriebsprüfung fehlen weiterhin. Die Überarbeitung fügt keine Cloud-Synchronisierung hinzu.
- **Empfehlung:** Vor einer neuen Erhebung einen eigenen freigegebenen Versionsstand festlegen und dessen Aufgabenliste an die neue Navigation anpassen. Den historischen Stand `v0.5.0` für den Vergleich erhalten.
