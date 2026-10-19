# Gradeflow 0.7.0 – Abschluss der freigegebenen Produktrevision

Stand: 18.10.2026. Der vollständige Umbau M1–M4 ist lokal umgesetzt und geprüft. Grundlage waren der neue [Prüfbericht](../pruefbericht.md), das [Zielkonzept](../zielkonzept.md) und Yannis’ ausdrückliche Freigabe des vollständigen Umbaus. Diese beiden Ausgangsdokumente bleiben als damalige Entscheidungsgrundlage erhalten; ihr Vorschlagsstatus beschreibt nicht den heutigen Umsetzungsstand.

**Ergebnis:** Eine Stunde bildet einen zusammenhängenden Bewertungsbereich. Name, Stunde, Fortschritt und Speicherzustand bleiben bei der Eingabe sichtbar. Unterbrochene Arbeit findet dieselbe Stunde und Ansicht wieder. Ein zweiter Tab kann den schreibenden Tab nicht mehr mit veralteten Daten überschreiben. Die bestätigten Fachregeln und das Notebook-Schema bleiben erhalten.

Der [Bildvergleich](vergleich.html) zeigt dieselben Aufgaben mit denselben 20 fiktiven Personen vor und nach dem Umbau. Es wurden weder echte Schülerdaten noch externe Bezahldienste verwendet. Es erfolgte keine Veröffentlichung und keine neue Usability-Erhebung.

## Änderungen und Abnahme

| Befund | Nutzerproblem und Umsetzung | Tatsächlicher Nachweis |
| --- | --- | --- |
| R01 | Ein veralteter zweiter Tab überschrieb neu gespeicherte Stunden. Browser-Lock mit genau einem Schreibberechtigten; weitere Tabs zeigen aktualisierte Daten und gesperrte Schreibaktionen. Jede Klassenänderung lädt frisch. Die Klassenwahl schreibt keine Fachdaten. | Repository-/Lock-Tests; realer Zweit-Tab-Test einschließlich Klassenauswahl, gesperrtem Umbenennen/Archivieren/Löschen und Übernahme nach Schließen des ersten Tabs. Vorher belegter Verlust, danach kein Verlust. |
| R02 | Verweigerter Zugriff auf das Storage-Objekt erzeugte eine leere App. Der Adapter greift erst im abgesicherten Repository-Aufruf auf das Objekt zu. | Unit-Regression und reale Browseransicht mit geworfenem `SecurityError`: verständlicher Alert, keine leere App und kein unbehandelter Seitenfehler. |
| R03 | Name, Fortschritt und Fehler verschwanden beim Scrollen. Haftender kompakter Kontext, Bewertung vor Zusatzliste, mobile Personenwahl im nativen Dialog. Fehler bleibt beim Eingabefeld; Wiederholung speichert die ursprüngliche Person. | Gleiche Eingabeaufgabe bei 390×844, 768×1024, 1440×1000; Kontext nach + und NB sichtbar. Fehlersimulation und Wiederholung bestanden. 200 Prozent CSS-Schrift mit langem Namen und unverdecktem Fokus geprüft. |
| R04 | Reload wählte eine andere offene Stunde und verließ Tabellenansichten. Arbeitsposition getrennt von Fachdaten in URL und lokalem Metadatenschlüssel. Browser-Zurück; erklärter Rückweg bei ungültigem Ziel. | Ältere offene Stunde und ausdrücklich gewählte Person nach Reload identisch; Tabelle bleibt geöffnet; Zurück zur vorherigen Ansicht. Zusätzliche Regression und letzte Browserprüfung für eine beim Start entfernte Stunde. |
| R05 | 22 Tab-Schritte bis zum ersten Symbol. Eingabe steht im DOM vor der Personenliste. | **Zwei Tab-Schritte** vom Hauptinhalt bis `--`, auf allen drei Breiten. 20 Personen mit Enter erfassen; Abschlussfokus und Rückweg bestanden. Mobile Personenwahl mit Fokus-Rückkehr bestanden. |
| R06 | Backup wurde vor Größenprüfung gelesen; kleine XLSX konnte großen Entpackumfang ankündigen. 5 MiB vor Dateilesen; XLSX zusätzlich ZIP-Umfangsprüfung und terminierbarer Worker. Importbestätigung nennt Klassen, Personen und Stunden; paralleles Absenden gesperrt. | Datei-/ZIP-Tests; 45 Personen akzeptiert, 46 abgewiesen; übergroße Dateien vor Textlesen abgefangen. Echte XLSX im Produktionsbrowser importiert. Komprimierte Datei mit mehr als 2 MiB Entpackumfang vor Parser abgewiesen. JSON-Grenze und unveränderter Bestand im Browser bestätigt. |
| R07 | Eine fremde ID wie `toString` führte ohne Beobachtung zu falschem Status. Zugriff nur auf eigene Beobachtungsschlüssel. | Unit-Regression und echte Browserprüfung: `Offen`; Domain nutzt weiterhin sichere Maps. |
| R08 | `App.tsx` bündelte 1.548 Zeilen einschließlich umfangreicher Teiloberflächen. Exporte importierten Darstellung aus `features`. Eigene Komponenten für Navigation, Bewertung, Klasse und Sicherung; gemeinsame Beschriftungen in `application`. | App jetzt 710 Zeilen mit Zusammensetzung und Anwendungsaktionen. `application`/`infrastructure` importieren keine `features` mehr. Alle Komponenten-/Exporttests und Browserabläufe bestanden. Zeilenzahl allein ist kein Qualitätsmaßstab; entscheidend sind die getrennten Zuständigkeiten. |
| R09 | Stundenbeschriftung validierte dieselbe gesamte Liste wiederholt, auch pro Person im Export. Stundenindex einmal nach der Domain-Validierung; wiederverwendeter Datumsformatierer; Bericht memoisiert. Bezug vor einer Stunde aus demselben vollständigen Bericht. Liste mit 20 Einträgen und Datumssuche. | Neue Regression für Bezug bei offenen/AW/NB-Stunden und ältere Stunde außerhalb der sichtbaren Liste. 24/400/1000 Stunden geladen und bearbeitet; CSV/XLSX gegen unabhängiges Modell geprüft. Keine Begrenzung des Berechnungszeitraums. |
| E01 | Verlaufstabelle hatte keinen ausdrücklich benannten Fokuszugang. `role=region`, personenbezogener Name und `tabIndex=0` ergänzt. | Tastaturprüfung und vorhandene Verlaufstests. Chromium fokussierte bereits die alte Scrollfläche automatisch; deshalb kein pauschaler Vorher-Befund „nicht bedienbar“. |

## Oberfläche und Abläufe

- Die vier Hauptbereiche bleiben sichtbar. Eine native Klassenwahl ersetzt die lange seitliche Navigationsliste. „Meine Klassen“ öffnet die Übersicht; die Hilfe bietet den eindeutigen Rückweg zur laufenden Stunde.
- „Stunde beginnen“ steht vor den sekundären Exportaktionen. Die abschließende Sichtprüfung bestätigt die vollständig sichtbare Startaktion im ersten Sichtfenster auch direkt nach dem Anlegen einer Klasse auf 390 px.
- Symbol, Bedeutung und konkretes Ergebnis bleiben gemeinsam bedienbar. Der Puffer bleibt eine kleinere Zusatzinformation. AW, NB und Offen bleiben unterschiedliche Zustände. Die Erfolgsrückmeldung benennt die gerade gespeicherte Person und das Symbol beziehungsweise den Status; der neue Name bezeichnet die nächste Person.
- Erst erfolgreiches Speichern wechselt die Person. Ein Fehler verändert weder den gespeicherten Stand noch den Fortschritt. Die Wiederholung speichert auch dann die richtige ursprüngliche Person, wenn zwischenzeitlich eine andere ausgewählt wurde. Fehlerdetails lassen sich aufklappen, ohne die kurze Rückmeldung und Wiederholung zu verdrängen.
- Die Stundenliste zeigt 20 Einträge pro Seite und lässt sich nach einem Datum durchsuchen. Tabelle weiterhin mit 10/20/allen Stunden, Kompakt-/Detailansicht und drei Größen. Das Diagramm behält die gemeinsame Achse mit 112 Einheiten je Stunde und ausschließlich bewerteten Leistungspunkten.

## Ausgeführte Prüfungen

| Prüfung des letzten gebauten Stands | Ergebnis | Beleg |
| --- | --- | --- |
| `npm run typecheck` | bestanden | [Log](final-typecheck.txt) |
| `npm test` | **112 Tests in 18 Dateien bestanden**; Ausgangsstand 95 in 15 Dateien | [Log](final-test.txt) |
| `npm run lint` | bestanden | [Log](final-lint.txt) |
| `npm run format:check` | bestanden | [Log](final-format.txt) |
| `npm run build` | bestanden | [Log](final-build.txt) |
| Produktionsbrowser | **43 PASS, 0 DEFECT, 0 ERROR** als Ergebnisdatensätze | [Ergebnisse](abschluss-browser-v2/browserergebnisse.json) |
| Abschließende Layoutprüfung nach Verdichtung der Klassenübersicht | drei Breiten bestanden; Einstieg sichtbar, Kontext nach + und NB sichtbar, zwei Tab-Schritte, sichtbare Schaltflächen mindestens 44 px hoch, ungültiges Startziel erklärt | [Layout](layout-final/layout.json) |
| Unabhängiger Fachvergleich | 120 zulässige Übergänge vollständig geprüft; Guthabenmodell von −20 bis 3 Viertelschritten als unabhängige Referenz | [Fachprüfung](abschluss-browser-v2/fachpruefung.json) |
| Echte heruntergeladene Dateien | je Breite 81 CSV-Zeilen, 21 XLSX-Blätter, keine Formeln; Zahlen und Datumswerte typisiert, Datumsformat und tatsächliches Datum geprüft; 20 aktuelle Werte je Bericht unabhängig berechnet; technische IDs fehlen | [Dateiprüfung](abschluss-browser-v2/dateiinhalte.json) |
| Bestandsschutz | 64 geschützte Dateien unverändert, darunter Legacy/Referenzen und vorhandene historische Designunterlagen; v0.5.0 unverändert | [Erhaltung](erhaltungspruefung.json) |

Die Browserprüfung enthält **60 Neuladungen nach Einzelbeobachtungen**, CSV-Klassenimport, alle fünf Symbole sowie AW/NB, Unterbrechen/Fortsetzen, ältere Korrektur und vollständige Neuberechnung, maximal zwei Stunden am Datum, stabilen Tausch, Archivieren/Öffnen/Löschen mit Rückfall, Tabellenfenster und Verlauf. Dazu kommen Zweit-Tab-Schutz, defekter Startstand mit Rohdatensicherung, Legacy-Migration/Rückfall, echte XLSX-Worker-Einlesung und Dateigrenzen. JSON-Downloads wurden exakt mit dem gespeicherten Notebook verglichen, fehlerhafte Importe abgewiesen und der Vorimport-Stand wiederhergestellt.

Umgebung: vorhandenes Node 24.19.0, vorhandene npm-/Projektabhängigkeiten und kostenloses lokales Playwright mit Chromium **156.0.8078.4** auf diesem Mac. Keine neue Produktionsabhängigkeit. Die bekannte Buildwarnung für das große, erst bei Excel-Nutzung geladene ExcelJS-Modul bleibt. Der separate Import-Worker enthält ebenfalls die Excel-Bibliothek; Haupt-JavaScript 296,33 kB / 91,65 kB gzip, CSS 29,86 kB / 6,70 kB gzip. Das ist kein Nachweis für Startzeiten auf schwachen Geräten.

`abschluss-browser/` hält den ersten Abschlusslauf fest: Die Kernabläufe bestanden, weitere Fälle wurden durch einen Anführungszeichenfehler im Seed-Helfer und eine dort nicht vorhandene optionale Python-Bibliothek abgebrochen. Der Helfer wurde korrigiert; die XLSX-Testdatei entsteht nun mit dem bereits vorhandenen ExcelJS. Der komplette Wiederholungslauf `abschluss-browser-v2/` bestand. Abgebrochene Helferläufe werden nicht als App-Fehler oder bestandene Prüfung umgedeutet. Die letzte kleine Layoutverdichtung wurde danach mit allen fünf npm-Prüfungen und `layout-final/` geprüft.

Zwölf ausgewählte explizite Text-/Hintergrund- und Fokusfarbpaare wurden zusätzlich rechnerisch geprüft; das kleinste Verhältnis beträgt 5,84:1. [Farbpaare und Methode](kontrastpaare.json) sind dokumentiert. Das ersetzt keine vollständige Prüfung aller DOM-Zustände. Die abschließende Textkorrektur vereinheitlicht die Dateigrößenangabe für Klassenlisten und Sicherungen auf MiB; alle fünf npm-Prüfungen wurden danach erneut ausgeführt.

## Vorher–nachher und Messgrenzen

Die zentrale gemessene Bedienverbesserung ist **22 → 2 Tab-Schritte**. Der gleiche Personen-/Stundenkontext und Speicherhinweis, der vorher bei der mobilen Eingabe außerhalb des Sichtfensters lag, ist danach sichtbar. Der belegte Zweit-Tab-Verlust ist behoben. Diese technischen Aussagen sind keine Usability-Ergebnisse mit Lehramtsstudierenden.

Laststichprobe mit identischen Datenmengen, 20 fiktiven Personen und vollständigen Berichten:

| Stunden | JSON-Umfang der Testdaten | DCL vorher | DCL nachher | Nachher: Reload bis sichtbare Liste, einschließlich Automationszeit |
| --- | ---: | ---: | ---: | ---: |
| 24 | 26.111 Byte | 19,2 ms | 12,8 ms | 24,75 ms |
| 400 | 408.427 Byte | 100,8 ms | 12,4 ms | 38,60 ms |
| 1000 | 1.018.627 Byte | 2954,6 ms | 12,8 ms | 49,51 ms |

**DCL ist seit dem asynchronen Schreib-Lock nicht gleichbedeutend mit einer vollständig bedienbaren App.** Deshalb wurde zusätzlich die sichtbare Liste gemessen; hierfür fehlt eine entsprechende Ausgangsmessung. Aus den Zahlen wird kein Beschleunigungsfaktor und kein LCP abgeleitet. Es sind Einzelstichproben auf einem Mac mit warmem Browserprofil, keine Gerätestudie. Belegt sind der entfallene wiederholte Gesamtprüfpfad und die auf 20 Einträge begrenzte Darstellung bei weiterhin vollständiger Berechnung.

Eingabeklicks bei 1.000 Stunden dauerten im ursprünglichen Automationslauf 86,69 / 73,78 / 51,50 ms und im neuen Lauf 42,51 / 45,87 / 31,43 ms. Diese Werte enthalten Automationswartezeit, sind keine isolierte Handler-Laufzeit und erlauben keine allgemeine Prozentangabe. Exportmessungen sind ebenfalls in den Rohdaten erhalten; auf 390 px zum Beispiel CSV 35,65 / 27,84 / 33,27 ms und XLSX 116,15 / 57,27 / 48,16 ms, jeweils Klick bis Download.

## Skill-Beitrag mit Ergebnis

| Bereich | Tatsächlich angewandter Skill | Konkreter Beitrag und Beleg |
| --- | --- | --- |
| Auswahl | Skill Finder | Kurze lokale Suche vor der Ausgangsprüfung; geeignete vorhandene Fähigkeiten gewählt, keine Installation und kein Crawl. Zuordnung im ursprünglichen Prüfbericht. |
| Umsetzung | Ponytail | Bestehenden Fachkern und Repository erhalten, konkrete Verantwortlichkeiten herausgelöst, keine zusätzliche Produktionsbibliothek und kein unnötiger Frameworkwechsel. App-/Komponentenstruktur und Regressionen. |
| Gestaltung | Frontend Design | Durchgehender Stundenarbeitsbereich, kompakte Navigation, priorisierte Eingabe, sekundäre Exporte, zurückhaltende bestehende Farb-/Schriftfamilie. Entwurf und echter Bildvergleich. |
| Bedienbarkeit | Web Design Guidelines | DOM-Reihenfolge, Fokus, nativer Dialog, Beschriftungen, 44-px-Ziele, explizite Scrollregionen und vergrößerte Schrift. Fokus-/Layoutprüfungen. |
| Fehlerbehebung | Systematic Debugging | Ausgangsfehler reproduziert, Ursachen und gezielte Änderungen dokumentiert. Speicherzugriff, stale Tab, falscher Status und Wiederaufnahme als Regressionen. |
| Browser | Webapp Testing | Isolierte lokale Profile, drei identische Datensätze/Breiten, 60 Reloads, echte Downloads, Fehler und Rückfälle. Wiederholbare Skripte in `app/e2e/`. |
| Sicherheit | Security Best Practices, Secure Code Guardian, Security Threat Model | Konkrete lokale Grenzen für Storage, konkurrierende Tabs, untrusted IDs und Dateiimporte. Threat Model der Ausgangsprüfung plus R01/R02/R06/R07 und dokumentierte Restgrenzen. Keine Konto-, Firewall- oder DNS-Änderungen. |
| Tabellen | Spreadsheets | Echte CSV/XLSX-Inhalte, typed numbers/dates, Status, Formelfreiheit und unabhängige Wertprüfung. Vorhandene Datums-Rendering-Grenze nicht als Exportfehler ausgegeben. |
| Sprache | Professional Proofreader | Konsistente Rückmeldungen, eindeutiger Personen-/Symbolbezug, verständliche Speicher- und Wiederherstellungstexte. Sichtbare Produkttexte und Dialoge geprüft. |
| Quellen | Source Evaluation | Externe technische Aussagen im Audit gegen passende Primärquellen abgegrenzt; technische Befunde auf tatsächlichen aktuellen Code und Browsernachweise gestützt. Keine pädagogische Wirksamkeitsbehauptung. |
| Darstellung | i-have-adhd, Caveman | Kurze klare Statusmeldungen und Ergebnis zuerst, ohne aus Skill-Namen eine Diagnose abzuleiten. |

## Bewusst beibehalten

- **Fachkern:** Start 2,00; Viertelschritte; Grenzen 1,00–6,00; Puffer höchstens drei bei 1,00 einschließlich Überschussverbesserung; AW/NB ohne Notenänderung; Offen bei fehlender Eingabe. Deterministisch, bestehende Tests plus vollständiger unabhängiger Übergangsvergleich.
- **Zeit und Reihenfolge:** höchstens zwei Stunden pro Datum, Nummer nur bei zwei Stunden sichtbar; stabile IDs und atomarer Tausch; Normalisierung nach Löschung; vollständige chronologische Neuberechnung. Regressionen, Browser und unabhängige Berichte bestanden.
- **Zeitraum:** kein automatischer Abschluss oder Reset, kein verkürzter Berechnungshorizont. Die Darstellung blättert, der Bestand bleibt vollständig.
- **Lokaler Betrieb und Wiederherstellung:** kein Konto, keine Cloud; Schema 1 und vorhandene Migrations-/Rückfallverfahren. Beschädigte Daten werden vor Ersetzen gesichert; Sicherungsdateien bleiben exportierbar.
- **Historie:** `legacy-source/`, `reference/`, historische Designunterlagen und Tag `v0.5.0` sind erhalten. Letzterer zeigt weiter auf `0556967fbbfa0e51954507f5cd141b17b2d08740`. Bestehende uncommittete Ausgangsarbeit ist außerdem im geprüften Archiv/Bündel im benachbarten Sicherungsordner wiederherstellbar. Es wurde kein neuer Commit oder Tag erzeugt. Der vollständige Abschlussstand ist zusätzlich mit Manifest im benachbarten Ordner `_gradeflow-revision-sicherungen/2026-10-18-revision-0.7.0/` archiviert; das Archiv wird gegen die gespeicherten SHA-256-Werte geprüft.

## Geänderte Zuständigkeiten und Dateien

- `App.tsx`: Notebook und Arbeitsposition anbinden, Anwendungsaktionen ausführen, Bereiche zusammensetzen; `App.test.tsx`: aussagekräftige Regressionen.
- `components/AppNavigation.tsx`; `features/assessment/AssessmentWorkspace.tsx`; `features/classes/ClassWorkspace.tsx`; `features/backup/BackupPanel.tsx`; erweiterte `ClassCreation.tsx`, `ClassTable.tsx`, `StudentHistory.tsx` und `styles.css`.
- `application/observationPresentation.ts` statt `features/presentation.ts`; `application/reporting.ts` und dessen Tests; CSV-/Excel-Exporter nutzen denselben vorbereiteten Index.
- `features/useNotebook.ts`, `features/useWorkspace.ts`; `local/browserStorage.ts`, `local/notebookCoordinator.ts`, `local/workspacePosition.ts` und Tests; gezielte Ergänzungen im `localRepository` und seinen Tests; `domain/sessions/observations.ts` als sicherer Zugriff, ohne Änderung der Berechnungsregeln.
- Importgrenzen und Worker: `jsonBackup.ts`, `classImport.ts`, `classListRows.ts`, `xlsxResources.ts` samt Tests, `xlsxImport.ts`, `classImport.worker.ts`; gemeinsame Browserdownloads in `browserDownloads.ts`.
- `app/e2e/revision.py`, `verify_domain.py`, `verify_exports.py`, `verify_layout.py` und Anleitung; Paketversion in `package.json`/`package-lock.json` auf 0.7.0, keine Abhängigkeitsänderung.
- README, Changelog, Architektur, technische Entscheidungen, Barrierefreiheitsprüfung und Entwicklungsprotokoll fortgeschrieben; Revisionsberichte/Bilder/Logs als Nachweise. Die vorhandene CSS-Arbeit wurde gemäß neuer Freigabe weiterentwickelt; ihre Ausgangsfassung bleibt gesichert. Der historische CSS-only-Prüfer `verify-redesign.mjs` bleibt unverändert und ist für diesen ausdrücklich funktionalen Umbau kein Abnahmekriterium.

Beide für die Prüfung gestarteten lokalen Vite-Server sind beendet; die Testbrowser wurden geschlossen.

Die [Dateiliste](dateiliste.txt) nennt den tatsächlichen Arbeitsstand. Bereits beim Start vorhandene Änderungen sind im [Ausgangsbericht](../pruefbericht.md) und Sicherungsmanifest abgegrenzt.

## Offene beziehungsweise nicht geprüfte Punkte

- Keine neue Erhebung mit Lehramtsstudierenden, keine pädagogische Wirksamkeitsmessung und keine Freigabe für echte Schülerdaten. Historische Testbefunde dürfen nicht stillschweigend auf 0.7.0 übertragen werden.
- Kein Screenreader, keine vollständige WCAG-Zertifizierung, keine weiteren Browserengines, kein echter Browser-/OS-Zoom, kein Android-/Windows-Gerät und keine schwachen Geräte geprüft. CSS-Schriftvergrößerung und Desktop-Viewportgrößen sind ausdrücklich nur die dokumentierten Teilprüfungen.
- Kein natives Microsoft Excel geprüft. Die echten heruntergeladenen Dateien wurden anhand ihrer OOXML-Zellen und unabhängiger Zahlen-/Datumsberechnung geprüft. Die frühere Vorschau zeigte Datumsserienwerte; das war kein Beleg für fehlerhafte Dateidaten.
- Browser ohne Lock-API arbeiten zur Ansicht und zum Export. Die Synchronisation betrifft Tabs desselben Ursprungs, nicht mehrere Geräte. Ein älterer, gleichzeitig laufender App-Stand, der den neuen Lock nicht verwendet, kann dadurch nicht geschützt werden; beim Upgrade alte Tabs schließen.
- Lokale Daten sind browserprofil- und ursprungsgebunden, nicht durch diese Revision verschlüsselt. Browserdaten und lokale Rückfälle können gemeinsam verloren gehen. Regelmäßige externe JSON-Sicherungen bleiben nötig; Browserquoten unterscheiden sich. Größere JSON-Dateien als 5 MiB werden klar abgewiesen, nicht automatisch aufgeteilt oder gekürzt.
- XLSX-Metadatenprüfung und Worker-Laufzeitgrenze reduzieren das konkrete Ressourcenrisiko. Das ist keine absolute Speicherquotierung für beliebig bösartige Archive; ohne Worker ist der direkte Parser nach denselben Umfangsprüfungen aktiv. Kein Belastungsnachweis für alle Browserparser.
- Die bekannte große Excel-Bibliothek bleibt. Kein neuer Service Worker, keine PWA-/Native-Verpackung und keine Deployment-Freigabe aus diesem Auftrag abgeleitet.


## Ergänzung vom 19.10.2026 – GitHub als Abschluss

Yannis hat festgelegt, dass abgeschlossene und geprüfte Änderungen künftig immer mit Commit und Push zum eingerichteten GitHub-Remote abgeschlossen werden. Dies ist in `AGENTS.md` verbindlich festgehalten und zusätzlich in den persönlichen Arbeitsregeln auf diesem Mac gespeichert. Der bisher ausschließlich lokale Stand 0.7.0 wird mit diesem Commit auf `main` übernommen; der Remote-Stand wird nach dem Push geprüft. Das ändert keine Bewertungsregel und erteilt keine Deployment-Freigabe. Die oben dokumentierte Aussage über den fehlenden Commit bezieht sich auf den Abschluss vom 18.10.2026.

Vor der Übertragung wurden die ausgewählten neuen/geänderten Textdateien auf typische Geheimnismuster und die Upload-Dateiliste auf private Dateitypen sowie Laufzeitverknüpfungen geprüft. Abhängigkeiten und Python-Caches werden nun auch in Unterordnern ignoriert. Die fiktiven Prüfbelege bleiben Bestandteil der Revision; die ursprünglichen lokalen Sicherungsarchive und der Tag v0.5.0 bleiben erhalten.
