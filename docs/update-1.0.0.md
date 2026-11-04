# Gradeflow 1.0.0 – gezielte Bedienverbesserungen

Stand: 04.11.2026. Grundlage: Version 0.10.0, Commit `6074073`. Die fünf vom Nutzer beauftragten Abläufe werden in der bestehenden App verbessert. Fachkern, Ansichten, Farben, Notebook-Schema 1 und gespeicherte Daten bleiben erhalten. Kein automatisches Zeitraumende, Noten-Reset, zusätzlicher Speicherschritt oder Cloud-Abgleich.

## 1. Geprüfter Iststand und umgesetzte Änderungen

| Bereich              | Umsetzung und konkrete Stellen                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Klassenimport        | Navigation und leerer Einstieg heißen „Klasse anlegen / importieren“ ([Navigation](../app/src/components/AppNavigation.tsx), [App](../app/src/App.tsx)). Im bestehenden [Anlageformular](../app/src/features/classes/ClassCreation.tsx) stehen Formate und die erforderlichen Spalten direkt am Import-Einstieg; die Dateiauswahl steht vor der ausführlichen Vorbereitung. Fehler bleiben fokussierbar am Formular und der Datei zugeordnet.                                                                                                                                                                                                  |
| Namenslisten         | [classListRows.ts](../app/src/infrastructure/importExport/classListRows.ts) überspringt vollständig leere Zeilen und erhält die ursprünglichen Zeilennummern. Gezählt werden höchstens 45 tatsächliche Personen. Äußere Leerzeichen werden entfernt, mehrteilige Namen bleiben erhalten. Die bestehende Namensaufbereitung im Anwendungsfall vereinheitlicht weiterhin mehrfachen Zwischenraum; Wörter werden nicht abgeschnitten. [classImport.ts](../app/src/infrastructure/importExport/classImport.ts) erhält auch bei CSV/TXT die Quellzeile für Fehlermeldungen.                                                                         |
| Excel-Kompatibilität | [excelWorkbook.ts](../app/src/infrastructure/importExport/excelWorkbook.ts) zählt keine formatierten Leerzeilen als Personen, akzeptiert Rich-Text-Namen und erklärt Formeln, fehlende Felder oder Zusatzspalten konkret. [xlsxNamespaces.ts](../app/src/infrastructure/importExport/xlsxNamespaces.ts) passt gültige Spreadsheet-Elementpräfixe in einer temporären Kopie namespacekorrekt für ExcelJS an; deklarierte zusätzliche Blätter werden unabhängig vom ExcelJS-Modell erkannt. Quelle und ArrayBuffer bleiben unverändert.                                                                                                          |
| Zeitraum             | Der vorbelegte Zeitraum ist im [Anlageformular](../app/src/features/classes/ClassCreation.tsx) sichtbar. Leere Angaben erhalten Feldfehler und Fokus. „Zeitraum bearbeiten“ und „Klassenname und Zeitraum bearbeiten“ öffnen denselben vorhandenen Editor in [ClassWorkspace.tsx](../app/src/features/classes/ClassWorkspace.tsx); Stunden und Bewertungen werden beim Umbenennen nicht verändert.                                                                                                                                                                                                                                             |
| Speicherrückmeldung  | [AssessmentWorkspace.tsx](../app/src/features/assessment/AssessmentWorkspace.tsx) erklärt unmittelbar, dass kein weiteres Speichern nötig ist, und kennzeichnet den gespeicherten Status. Erfolg bestätigt [App.tsx](../app/src/App.tsx) weiterhin erst nach erfolgreichem Repository-Schreiben. Bei Fehlern werden die betroffene Person und ausstehende Bewertung genannt; der bestehende Wiederholungsweg verwendet dieselben IDs.                                                                                                                                                                                                          |
| Demo                 | „Demoklasse erstellen“ erklärt 20 fiktive Personen ohne Stunden. Die separate Aktion „Beispielstunden ergänzen“ nennt die Zielklasse und fügt dort 25 Stunden hinzu ([ClassCreation](../app/src/features/classes/ClassCreation.tsx), [ClassWorkspace](../app/src/features/classes/ClassWorkspace.tsx)). [demoClass.ts](../app/src/application/demoClass.ts) öffnet bei Wiederholung eine bereits ausdrücklich markierte aktive Demo; die [App](../app/src/App.tsx) zeigt danach tatsächlich diese Klasse. Normale oder archivierte Klassen und vorhandene Bewertungen bleiben erhalten. Die vorhandene Erzeugung verhindert mehrfaches Füllen. |
| Enter und Fokus      | [ClassCreation.tsx](../app/src/features/classes/ClassCreation.tsx): Enter führt vom Vornamen zum Nachnamen, dann zur nächsten Person oder „Weitere Person“. Der dortige nächste Enterdruck legt die nächste Eingabezeile an. Leere Felder, gehaltenes Enter und Texteingabekomposition lösen keinen versehentlichen Abschluss aus. Der endgültige Abschluss heißt „Klasse lokal anlegen“.                                                                                                                                                                                                                                                      |

**Bestätigte Entscheidung:** Die fünf Bedienkorrekturen und ihre Grenzen stehen in [O18](07-offene-entscheidungen.md#o18--import-zeitraum-speicherbestätigung-demo-und-enter--entschieden), Anforderungen in [Abschnitt 7](01-produktumfang-und-anforderungen.md#7-verbindliche-bedienverbesserungen-für-10--04112026). Es wurde keine Bewertungsregel geändert.

Die bestehende Tour wurde auf die neuen Beschriftungen abgestimmt. Ihr bereits vorhandener Tastatur-Browsertest deckte zusätzlich auf, dass echte Navigationslinks beim Tourstart nicht fokussiert wurden. [Tutorial.tsx](../app/src/features/help/Tutorial.tsx) berücksichtigt sie jetzt bei Ziel- und Tab-Fokus; der vorher fehlgeschlagene Ablauf wurde anschließend vollständig bestanden.

## 2. Importfehler: nachgewiesene Ursache und historische Grenze

### Verfügbare Originaldatei

`Klassenliste_Gradeflow.xlsx` enthält gültige OOXML-Elemente `x:workbook`, `x:sheets` und `x:sheet`, deren Präfix an den Standard-Spreadsheet-Namensraum gebunden ist. Das unveränderte ExcelJS 4.4.0 wirft beim direkten Laden reproduzierbar `TypeError: Cannot read properties of undefined (reading 'sheets')`. Der vorherige Importpfad konnte diese Datei deshalb nicht lesen. Dies ist unabhängig von Hintergrundfarben oder Rahmen. Ein erneuter direkter Aufruf vor Abschluss bestätigte die Ausnahme; [sanitisierter Nachweis](update-1.0.0/exceljs-original-before.json).

Die Korrektur passt ausschließlich erkannte Spreadsheet-Elementpräfixe für die Bibliothek an. Sie erfolgt vor jedem ExcelJS-Laden: Eine ausschließliche Fehler-Wiederholung wäre unzureichend, weil teilweise präfixierte Zeilen ohne Ausnahme still fehlen konnten. Regressionen prüfen insbesondere eine einzelne präfixierte Personenzeile sowie präfixierte zusätzliche Zellen. Eine weitere Regression prüft zwei deklarierte Blätter, bei denen ein gültiger Alias für das Relationship-Attribut das zweite Blatt im ExcelJS-Modell verbergen konnte. Solche Mehrblattdateien werden bereits anhand der tatsächlichen Deklarationen abgewiesen.

Zusätzlich reproduzierte Fälle waren mehr als 46 formatierte Zeilen bei wenigen Personen und Rich-Text-Namen. Die neuen [Excel-Tests](../app/src/infrastructure/importExport/excelWorkbook.test.ts) prüfen diese Fälle sowie 45/46 tatsächliche Personen. Farben, Rahmen und leere Formatierungen sind keine Personendaten.

**Technische Entscheidung:** JSZip 3.10.2 und saxes 6.0.0 sind nun direkte Abhängigkeiten ([package.json](../app/package.json)). Beide Versionen waren bereits im Lockfile vorhanden. Der SAX-Parser verhindert einen selbst entwickelten XML-Parser; die vorhandenen Datei-/ZIP-Grenzen und der terminierbare Worker bleiben bestehen. Kein Upgrade dieser Bibliotheksversionen und keine kostenpflichtigen Dienste.

### Nicht mehr verfügbare historische Datei

Am 04.11.2026 stellte Yannis klar, dass `Musterklassenliste_2026-10-30.xlsx` nicht mehr vorhanden ist. Im damaligen Test wurde die Website-Musterliste unterschiedlich formatiert, unter anderem ohne Hintergrund. Der genaue damalige Fehlerfall und dessen Ursache lassen sich deshalb nicht vollständig nachweisen. Dies bleibt ausdrücklich ein offener historischer Nachweis, kein behauptet behobener Originaltest.

Tatsächlich geprüft wurden die verfügbare `Klassenliste_Gradeflow.xlsx`, eine weitere vorhandene `musterklassenliste.xlsx` und drei aus der aktuellen [Website-Vorlage](../app/public/musterklassenliste.xlsx) erzeugte Varianten derselben fiktiven Namensliste: ohne Hintergrund, mit Farben/Rahmen/Rich Text/140 formatierten Zeilen sowie mit gemischten gültigen XML-Präfixen. Originaldateien und Namen wurden nicht ins Repository übernommen. Die Browserprüfung protokolliert nur Dateiname, Personenzahl und Quellhash; vor und nach dem Import war der Quellhash identisch.

## 3. Tatsächlich ausgeführte Prüfungen

| Prüfung                                            | Tatsächliches Ergebnis                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ausgangsstand                                      | 138/138 Tests in 24 Dateien bestanden, isolierter unveränderter HEAD; Vergleichsgrundlage.                                                                                                                                                                                                                                                                     |
| `npm test`                                         | 180/180 Tests in 26 Dateien bestanden, einschließlich unverändertem Fachkern sowie Import, Formular, Demo, Zeitraum und Speicherfehler/Retry. Zusätzlich lief die Gesamtsuite mit `--maxWorkers=2` erfolgreich.                                                                                                                                                |
| `npm run typecheck`                                | Bestanden.                                                                                                                                                                                                                                                                                                                                                     |
| `npm run lint`                                     | Bestanden.                                                                                                                                                                                                                                                                                                                                                     |
| `npm run format:check`                             | Bestanden; Bericht und Nachweis-JSON zusätzlich formatiert und geprüft.                                                                                                                                                                                                                                                                                        |
| `npm run build`                                    | Bestanden; bekannter Hinweis auf große Excel-Chunks bleibt bestehen.                                                                                                                                                                                                                                                                                           |
| Neuer Browserablauf `release_1_0.py`               | 9/9 Ergebnisgruppen bestanden: reine Tastaturanlage; simulierte Schreibfehler mit zwei erfolglosen und einem erfolgreichen Retry ohne Duplikate; Wiederaufnahme; Zeitraumumbenennung und Wiederöffnen; Demo-Schutz; drei Formatvarianten; ungültiger Import bei exakt unverändertem Notebook; zwei Originaldateien mit je fünf Personen; keine Laufzeitfehler. |
| Bestehender Browserablauf `personalization.py`     | 8/8 Ergebnisgruppen bestanden: Beispielwochen neben einer vorhandenen Stunde, Klassenfarben, alle Sortierungen, App-Farben und Reload, Speicherfehler, vier Breiten/200 Prozent Schrift, JSON-Sicherung und erneuter Import; keine Laufzeitfehler.                                                                                                             |
| Bestehender Browserablauf `tutorial_additional.py` | 6/6 Ergebnisgruppen nach Fokuskorrektur bestanden: vollständige Tour bei 390 × 844/667/480 Pixeln, Tastatur bei bestehender Stunde, Klassenentwurf und schreibgeschützter Zweittab. Der erste Lauf wies den fehlenden Link-Fokus nach.                                                                                                                         |
| Python-Syntax und Git-Diff                         | Alle sieben betroffenen Browserdateien kompilierbar; `git diff --check` bestanden.                                                                                                                                                                                                                                                                             |

Nachweise: [neue Abläufe](update-1.0.0/browser-ergebnisse.json), [bestehende Personalisierung](update-1.0.0/personalisierung-ergebnisse.json) und [bestehende Tour](update-1.0.0/tutorial-ergebnisse.json). Die sechs bereits vorhandenen Browserdateien erhielten ausschließlich angepasste Beschriftungen. Davon wurden `personalization.py` und `tutorial_additional.py` wie oben vollständig erneut ausgeführt; die vier anderen erhielten eine Syntaxprüfung. Nicht alle historischen E2E-Skripte wurden erneut ausgeführt.

Visuell kontrollierte Beispiele: [Import und Feldfehler bei 390 Pixeln](update-1.0.0/importfehler-390.png), [Demo bei 320 Pixeln](update-1.0.0/demoklasse-320.png), [konkrete ausstehende Bewertung](update-1.0.0/speicherfehler.png), [wiederaufgenommene Stunde](update-1.0.0/wiederaufnahme.png) und [umbenannter Zeitraum](update-1.0.0/zeitraum.png). Für die betroffenen Import-/Demoansichten wurden 320, 390, 768 und 1440 Pixel ohne horizontalen Seitenüberlauf geprüft.

Der neue reproduzierbare Ablauf liegt in [release_1_0.py](../app/e2e/release_1_0.py). Er verwendet frische temporäre Browserprofile und ausschließlich fiktive Daten für Bilder. Vorhandene Originaldateien werden in getrennten Kontexten ohne Bilder und Namensausgabe eingelesen. Kein Eingriff in den Datenbestand des geöffneten Nutzerprofils.

### Wiederholung der Browserprüfung

Voraussetzung: vorhandenes Node/npm, installierte App-Abhängigkeiten, lokales Python mit Playwright und installiertes Chromium. Keine Installation oder kostenpflichtige API im Skript.

```sh
cd app
npm run build
npm run preview -- --host 127.0.0.1 --port 5182 --strictPort
```

In einem zweiten Terminal mit verfügbarem Playwright:

```sh
cd app
GRADEFLOW_AUDIT_OUTPUT=/tmp/gradeflow-1.0-neuer-ordner python e2e/release_1_0.py
```

Der Ausgabeordner muss neu sein. Optional nimmt `GRADEFLOW_IMPORT_FILES` eine JSON-Liste lokaler XLSX-Pfade an; die Originale sind für die fiktiven Formatvarianten nicht erforderlich. `GRADEFLOW_AUDIT_BASE` überschreibt die lokale Vorschauadresse.

**Freigabeschritt:** Erst nach bestandener Gesamtsuite, Typecheck, Lint, Formatprüfung, Produktionsbuild und Browserabnahme wurde die Paketversion auf `1.0.0` gesetzt. Das Produktionsartefakt wurde danach erneut gebaut. Fachkern und Notebook-Schema wurden nicht verändert.

## 4. Grenzen und verbleibende Risiken

- Der genaue historische Excel-Testfall fehlt; die verfügbare Datei und benannten Varianten sind tatsächlich geprüft, siehe Abschnitt 2.
- Die Datenablage bleibt synchron und lokal im Browser. Deshalb wurde keine künstliche „wird gespeichert“-Wartephase eingeführt: Die Bestätigung folgt unmittelbar auf den erfolgreichen Schreibaufruf. Bei einem anhaltenden Speicherfehler bleibt die ausstehende Beobachtung im Arbeitsspeicher mit Warnung und Wiederholungsmöglichkeit. Bewusstes Schließen trotz Warnung oder ein Browserabsturz können diese noch nicht gespeicherte Eingabe weiterhin verlieren. Bereits geschriebene Eingaben und die unvollständige Stunde werden wiederhergestellt.
- Der lokale Bestand bleibt an Browserprofil und Ursprung einschließlich Port gebunden. Diese Änderung ist keine neue Sicherungs-, Verschlüsselungs- oder Synchronisierungslösung. Es wurde keine Datenmigration ausgeführt.
- Einzelne weitere OOXML-Varianten, etwa ein alternativer Präfixalias für das Relationship-Attribut eines einzigen Blatts, bleiben eine ExcelJS-Kompatibilitätsgrenze. Sie werden mit Hinweis auf erneutes Speichern in Excel/LibreOffice oder Übertragen in die Vorlage abgewiesen; nicht still als erfolgreicher Import behandelt. Die Anpassung ist kein universeller OOXML-Konverter.
- Der bestehende Buildhinweis auf das große, bei Bedarf geladene Excel-Paket bleibt sichtbar. Die Ressourcenprüfung anhand der ZIP-Metadaten ist keine absolute Speicherquotierung; die bisherige Worker-Laufzeitgrenze bleibt erhalten.
- Browserprüfungen erfolgten mit lokalem Chromium und simulierten Displaybreiten. Keine Prüfung auf einem physischen Windows-/Android-Gerät, in nativer Excel-Oberfläche oder mit Screenreader; keine vollständige WCAG-Zertifizierung und kein neuer Usability- oder Wirkungsnachweis.
- Kein manueller Hosting-Deploy. Ein bereits extern eingerichteter automatischer Build nach GitHub-Push wird damit nicht gesondert geprüft.

## 5. Geänderte und neue Dateien

| Status   | Datei                                                                                                                       |
| -------- | --------------------------------------------------------------------------------------------------------------------------- |
| Geändert | [CHANGELOG.md](../CHANGELOG.md)                                                                                             |
| Geändert | [README.md](../README.md)                                                                                                   |
| Geändert | [app/e2e/audit_repairs.py](../app/e2e/audit_repairs.py)                                                                     |
| Geändert | [app/e2e/personalization.py](../app/e2e/personalization.py)                                                                 |
| Neu      | [app/e2e/release_1_0.py](../app/e2e/release_1_0.py)                                                                         |
| Geändert | [app/e2e/revision.py](../app/e2e/revision.py)                                                                               |
| Geändert | [app/e2e/tutorial_additional.py](../app/e2e/tutorial_additional.py)                                                         |
| Geändert | [app/e2e/usability_revision.py](../app/e2e/usability_revision.py)                                                           |
| Geändert | [app/e2e/verify_layout.py](../app/e2e/verify_layout.py)                                                                     |
| Geändert | [app/package-lock.json](../app/package-lock.json)                                                                           |
| Geändert | [app/package.json](../app/package.json)                                                                                     |
| Geändert | [app/src/App.test.tsx](../app/src/App.test.tsx)                                                                             |
| Geändert | [app/src/App.tsx](../app/src/App.tsx)                                                                                       |
| Geändert | [app/src/application/demoClass.test.ts](../app/src/application/demoClass.test.ts)                                           |
| Geändert | [app/src/application/demoClass.ts](../app/src/application/demoClass.ts)                                                     |
| Geändert | [app/src/components/AppNavigation.tsx](../app/src/components/AppNavigation.tsx)                                             |
| Geändert | [app/src/features/assessment/AssessmentWorkspace.tsx](../app/src/features/assessment/AssessmentWorkspace.tsx)               |
| Geändert | [app/src/features/classes/ClassCreation.test.tsx](../app/src/features/classes/ClassCreation.test.tsx)                       |
| Geändert | [app/src/features/classes/ClassCreation.tsx](../app/src/features/classes/ClassCreation.tsx)                                 |
| Neu      | [app/src/features/classes/ClassWorkspace.test.tsx](../app/src/features/classes/ClassWorkspace.test.tsx)                     |
| Geändert | [app/src/features/classes/ClassWorkspace.tsx](../app/src/features/classes/ClassWorkspace.tsx)                               |
| Geändert | [app/src/features/help/Tutorial.test.tsx](../app/src/features/help/Tutorial.test.tsx)                                       |
| Geändert | [app/src/features/help/Tutorial.tsx](../app/src/features/help/Tutorial.tsx)                                                 |
| Geändert | [app/src/infrastructure/importExport/classImport.test.ts](../app/src/infrastructure/importExport/classImport.test.ts)       |
| Geändert | [app/src/infrastructure/importExport/classImport.ts](../app/src/infrastructure/importExport/classImport.ts)                 |
| Geändert | [app/src/infrastructure/importExport/classListRows.ts](../app/src/infrastructure/importExport/classListRows.ts)             |
| Geändert | [app/src/infrastructure/importExport/excelWorkbook.test.ts](../app/src/infrastructure/importExport/excelWorkbook.test.ts)   |
| Geändert | [app/src/infrastructure/importExport/excelWorkbook.ts](../app/src/infrastructure/importExport/excelWorkbook.ts)             |
| Neu      | [app/src/infrastructure/importExport/xlsxNamespaces.test.ts](../app/src/infrastructure/importExport/xlsxNamespaces.test.ts) |
| Neu      | [app/src/infrastructure/importExport/xlsxNamespaces.ts](../app/src/infrastructure/importExport/xlsxNamespaces.ts)           |
| Geändert | [app/src/styles.css](../app/src/styles.css)                                                                                 |
| Geändert | [docs/01-produktumfang-und-anforderungen.md](01-produktumfang-und-anforderungen.md)                                         |
| Geändert | [docs/04-zielarchitektur.md](04-zielarchitektur.md)                                                                         |
| Geändert | [docs/06-testkonzept.md](06-testkonzept.md)                                                                                 |
| Geändert | [docs/07-offene-entscheidungen.md](07-offene-entscheidungen.md)                                                             |
| Geändert | [docs/entwicklungsprotokoll.md](entwicklungsprotokoll.md)                                                                   |
| Neu      | [docs/update-1.0.0.md](update-1.0.0.md)                                                                                     |
| Neu      | [docs/update-1.0.0/browser-ergebnisse.json](update-1.0.0/browser-ergebnisse.json)                                           |
| Neu      | [docs/update-1.0.0/demoklasse-320.png](update-1.0.0/demoklasse-320.png)                                                     |
| Neu      | [docs/update-1.0.0/exceljs-original-before.json](update-1.0.0/exceljs-original-before.json)                                 |
| Neu      | [docs/update-1.0.0/importfehler-390.png](update-1.0.0/importfehler-390.png)                                                 |
| Neu      | [docs/update-1.0.0/personalisierung-ergebnisse.json](update-1.0.0/personalisierung-ergebnisse.json)                         |
| Neu      | [docs/update-1.0.0/speicherfehler.png](update-1.0.0/speicherfehler.png)                                                     |
| Neu      | [docs/update-1.0.0/tutorial-ergebnisse.json](update-1.0.0/tutorial-ergebnisse.json)                                         |
| Neu      | [docs/update-1.0.0/wiederaufnahme.png](update-1.0.0/wiederaufnahme.png)                                                     |
| Neu      | [docs/update-1.0.0/zeitraum.png](update-1.0.0/zeitraum.png)                                                                 |

`legacy-source/`, `reference/`, vorhandene Nutzerdaten und historische Test-/Bildstände wurden nicht geändert. Bereits vorhandene, nicht zu diesem Auftrag gehörende Brag-Dateien bleiben unberührt und werden nicht mit aufgenommen.
