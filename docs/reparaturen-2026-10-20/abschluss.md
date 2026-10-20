# Gradeflow 0.9.0 – Umsetzung und Abnahme

Stand: 20.10.2026. Grundlage ist der [Drei-Skill-Bericht vom 19.10.2026](../drei-skill-audit-2026-10-19/bericht.md), Umsetzung ab `d0d5ea5` auf `main`.

**Alle acht Befunde sind umgesetzt. Die automatischen und praktischen Browserprüfungen bestehen. Ein zusätzlich verlangter Nachweis bleibt blockiert: die Sichtprüfung im nativen Microsoft Excel benötigt eine Computerfreigabe.**

## Aufgaben und Abnahme

| Punkt | Umsetzung | Tatsächliche Prüfung | Ergebnis |
| --- | --- | --- | --- |
| B01 Speicherfehler | Auftrag behält Klasse, Stunde, Person, Symbol und Fehler; Wiederholung, Rückkehr und bestätigtes Verwerfen bleiben erreichbar. Browserwarnung vor Neuladen. | Schreibfehler simuliert, Navigation/Rückweg und Klassenwechsel bedient, zunächst eine andere Person gewählt; Wiederholung sichert ausschließlich das ursprüngliche Ziel. Keine irreführende Speicherbestätigung nach Rückkehr. | Bestanden |
| B02 Mobile Hierarchie | Kompakte Kopfzeile, native Ansichtenwahl, aufklappbare Exporte/Erklärungen, kompakte Bewertung. Layout reagiert auch auf große Schrift. | 320×568, 390×844, 768×1024 und 1440×1000. Bei 390 Pixeln erste Tabellenzeile und alle fünf Bewertungssymbole sichtbar. 200 Prozent Grundschrift bei 320/390 Pixeln ohne Seitenüberlauf; Tabelle scrollt intern. | Bestanden |
| B03 Personenbearbeitung | Editor direkt an der gewählten Zeile, Fokus ins Feld, Rückkehr zum Auslöser. | Erste/mittlere/letzte Person bei 20 und 45 Personen; Maus und Tastatur, Speichern und Abbrechen. Vorhandene Stunden bleiben identisch. | Bestanden |
| B04 Offene Änderungen | Gemeinsamer Schutz für Klassenname, Zeitraum und Personenname. | Seiten-/Ansichts-/Klassenwechsel, andere Person, Browser-Zurück und echte Neulade-Warnung abgebrochen; Eingaben erhalten. Unveränderte Formulare wechseln ohne Nachfrage. | Bestanden |
| B05 Importfehler | Fokusfähiger Hinweis direkt im Formular, Feldzuordnung und nächste Handlung. | Falsche Spalten, 46 Personen und unlesbare XLSX bei 390/1440 Pixeln; Fehler sichtbar/fokussiert, Bestand unverändert, gültiger Folgeimport erfolgreich. Fokusrahmen erhält Abstand zum Absenden. | Bestanden |
| B06 Excel | Titel über volle Blattbreite, getrennte breite Metadatenbereiche und ausreichend hohe Zeilen. | Tatsächlicher Download mit 200 Zeichen langen Namen/Klasse/Zeitraum, doppelte Blattnamen, unabhängiges Einlesen und drei gerenderte Blätter; Datum/Zahlen/Links geprüft. | Code und lokale Prüfung bestanden; native Sichtprüfung blockiert |
| B07 Ansicht und Navigation | Tabellenmodus, Größe, Stundenfenster und Blätterposition in Arbeitsposition und URL. Haupt-/Hilfeseiten sind echte Links. | Tabelle/Verlauf, Hauptseite, Zurück und Neuladen erhalten die Auswahl; ungültige URL erhält Standards. Strg/Cmd-Klick öffnet die Zielseite, zweiter Tab bleibt zur Ansicht. | Bestanden |
| B08 Sprache | Einzahl/Mehrzahl und Erklärungssatz korrigiert. | Anlage, Klassenkopf, Fortschritt und Abschluss mit einer Person praktisch geprüft. Tutorial vollständig durchlaufen. Modell- und Evaluationsgrenzen bleiben erhalten. | Bestanden |

Die Tabellenpräferenzen gelten für die zuletzt gewählte Arbeitsansicht und bleiben auch beim Klassenwechsel erhalten. Eine neue Stundenzahl setzt die Blätterposition auf die neuesten Stunden zurück. Gibt es weniger Seiten, wird die angezeigte Position begrenzt. Alte gespeicherte Arbeitspositionen bleiben lesbar; das Notebook-Schema bleibt Version 1.

Ein fehlgeschlagener Speicherauftrag liegt bis zur Wiederholung oder zum ausdrücklichen Verwerfen im Arbeitsspeicher. Die Warnung vor Neuladen ist kein Schutz gegen einen Browser-/Geräteabsturz. Eine JSON-Sicherung enthält nur tatsächlich gespeicherte Daten.

## 1. Design Audit – erneute Sichtprüfung

Gleicher Maßstab wie im Ausgangsbericht: `saas-dashboard`, sieben ungewichtete Kategorien. Farbwelt, Schriftcharakter und fachlicher Ablauf bleiben erhalten. Bewertung anhand tatsächlicher Ansichten mit Daten, Editor, Importfehlern, Bewertung und Export; keine reine Quellcodebewertung.

| Bereich | Vorher | Jetzt | Begründung |
| --- | ---: | ---: | --- |
| Arbeitsabläufe und Informationsdichte | 3 | 4 | Mobile Daten erscheinen vor ausführlichen Nebeninformationen. |
| Layout und visuelle Ordnung | 3 | 4 | Kompakte Steuerung, große Schrift bricht kontrolliert um. |
| Interaktionen und Zustände | 3 | 4 | Fehlerauftrag, Änderungswarnung und Fokus bleiben nachvollziehbar. |
| Technische Barrierefreiheit | 4 | 4 | Fokusführung und Links verbessert; kein vollständiger Assistenztechniktest. |
| Frontend-Struktur und Stabilität | 4 | 4 | Fachkern/Schema erhalten, Regressionen und Build bestehen. |
| Ausarbeitung der Randfälle | 3 | 4 | Lange Excel-Texte und Ansichtspräferenzen behandelt. Native Excel-Prüfung fehlt. |
| Inhalt und fachliche Einordnung | 4 | 4 | Einzelformen und Satz korrigiert; fachliche Begrenzungen erhalten. |

Mittelwert: **3,4 → 4,0 von 5**, Differenz +0,6 gerundet. Das ist eine Experteneinschätzung der Oberfläche, kein Ergebnis einer Nutzerstudie und kein Nachweis für bessere Noten, Motivation oder Unterrichtswirkung.

[B02 mobile Tabelle](abnahme/B02-tabelle-390.png), [Desktop](abnahme/B02-tabelle-1440.png), [200 Prozent bei 320 Pixeln](abnahme/B02-schrift-200-320.png), [Personen-Editor](abnahme/B03-editor-390.png), [Importfehler](abnahme/B05-import-390.png).

## 2. Web Design Guidelines – erneute Codeprüfung

Die Vercel-Regeln wurden am 20.10.2026 frisch gelesen: `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`. Die Prüfung konzentriert sich auf die geänderten Abläufe und die acht ursprünglichen Befunde; die englischen Sprachkonventionen werden nicht auf deutsche Texte übertragen.

- `app/src/components/AppNavigation.tsx`: echte Links für Haupt-/Hilfeseiten, native Tastaturbedienung und veränderte Klicks bleiben erhalten.
- `app/src/features/classes/ClassWorkspace.tsx`: geöffneter Editor erhält Fokus; Änderungen besitzen Navigations-/Neuladeschutz.
- `app/src/features/classes/ClassCreation.tsx`: sichtbare Fehlerzusammenfassung, Feldzuordnung, nächste Handlung und gezielter Fokus.
- `app/src/infrastructure/local/workspacePosition.ts`: Tabellenzustand in URL und lokaler Arbeitsposition, kontrollierte Standardwerte.
- `app/src/styles.css`: sichtbare Fokusmarkierungen, kontrollierter Umbruch bei großer Schrift, vorhandene Reduktion von Bewegung erhalten; keine Größenänderung der Bewertungsflächen beim Hover hinzugefügt.

Die ursprünglichen acht Befunde erfordern nach dieser Umsetzung keine weitere Codekorrektur. Daraus folgt keine pauschale Zusicherung, dass jede einzelne Empfehlung oder jede WCAG-Anforderung vollständig erfüllt ist.

## 3. Playwright Interactive und funktionale Browserprüfung

Lokales freies Chromium, frische isolierte Browserkontexte, ausschließlich fiktive Namen. Reproduzierbarer Ablauf: [audit_repairs.py](../../app/e2e/audit_repairs.py). Separate tatsächliche Sichtprüfung in der persistenten interaktiven Browsersitzung, zusätzlich zu DOM-/Geometrieprüfungen.

- [x] Große Klassen mit 20/45 Personen und 25/100 vorhandenen Stunden.
- [x] Maus-/Tastaturbearbeitung und Fokusübergabe.
- [x] Ungesicherte Formulare, Browser-Zurück und abgebrochener nativer Reload.
- [x] Speicherfehler und zielgenaue Wiederholung nach Navigation/Klassenwechsel.
- [x] Drei fehlerhafte Importe und erfolgreicher Folgeimport.
- [x] Vier Ansichtsbreiten sowie große Grundschrift bei 320/390 Pixeln.
- [x] URL-Präferenzen und neuer schreibgeschützter Tab.
- [x] Alle 15 Tour-Schritte bei 390/768/1440 Pixeln mit „Weiter“ und mit echten Aktionen. Eigene Daten/URL unverändert, kein automatischer Download beim Weiterklicken, manueller Neustart und Escape funktionieren.
- [x] Keine Browser-Laufzeitfehler in der Abnahme.

[Maschinelles Browserprotokoll](abnahme/ergebnisse.json), [Tour-Protokoll](abnahme/tutorial-ergebnisse.json), [zusätzliche Abschlussregression](abnahme/abschluss-pruefung.json).

## Excel: Ergebnis und offene Prüfgrenze

Die unveränderte [Testdatei](abnahme/B06-export-lang.xlsx) enthält ausschließlich fiktive Inhalte. [Übersicht](abnahme/B06-blatt-1.png) und [Personenblatt](abnahme/B06-blatt-2.png) zeigen vollständig lesbare lange Titel und Metadaten. Der Renderer stellt die Datumswerte als Excel-Seriennummern dar. Ein unabhängiger Leser erkennt dieselben Originalzellen korrekt als Datum mit `dd.mm.yyyy`; dies ist eine Renderergrenze und kein aus dem Bild abgeleiteter Appfehler. Numerische Fachwerte bleiben Zahlen; Vor-/Rücklinkziele und eindeutige Blattnamen sind geprüft. [Prüfwerte und SHA-256](abnahme/B06-export-pruefung.json).

- [x] Unveränderten Export unabhängig einlesen und rendern.
- [x] Lange/doppelte Namen, Datumstyp, Zahlen und Linkziele prüfen.
- [ ] Originaldatei im nativen Microsoft Excel visuell prüfen und beide Links anklicken.

Der Aufruf zum Zugriff auf Microsoft Excel wurde mit **„Computer Use permissions are not granted“** blockiert. Dieser Nachweis wird deshalb nicht als erledigt dargestellt. Es wurde keine Systemeinstellung oder Berechtigung verändert. Reale Mobilgeräte, Windows-Excel und Screenreader waren nicht Teil dieser Abnahme.

## Technischer Abschluss

129 Tests in 21 Dateien bestanden. Typecheck, Lint, vollständige Formatprüfung und Produktionsbuild bestanden. Der Build meldet weiterhin die Größe des bei Bedarf geladenen Excel-Pakets; keine neue Abhängigkeit wurde ergänzt. Die native Excel-Prüfung ist die verbleibende externe Abnahmegrenze.

Versionen in Paketdateien, README und Änderungsverlauf sind 0.9.0. Entwicklungsprotokoll und ursprüngliche Nachweise bleiben erhalten. Die Umsetzungsschritte B01–B08 wurden einzeln nachvollziehbar committed und auf `main` gepusht. Der Remote-Stand des Abschlusscommits wird nach dem Push zusätzlich geprüft und im Chat bestätigt. Ein manueller Hosting-Deploy wurde nicht ausgelöst; ein bestehender GitHub-Hosting-Automatismus bleibt die vorhandene Konfiguration. Zusätzliche Dienste/Tools: 0 Euro.
