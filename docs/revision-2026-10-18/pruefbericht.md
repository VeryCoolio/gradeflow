# Gradeflow: Ausgangsprüfung und Freigabevorlage

**18.10.2026 – Prüfung abgeschlossen; Umsetzung noch nicht freigegeben.**

Die Revision braucht einen Umbau der Zustandsführung und des Bewertungsablaufs. Eine weitere reine CSS-Überarbeitung reicht nicht: Ein zweiter Tab kann gespeicherte Stunden verlieren; auf dem Smartphone verschwinden beim Bewerten Name, Fortschritt und Speicherhinweis aus dem Sichtfenster. Bei verweigertem Zugriff auf den Browser-Speicher bleibt die App leer. Der geprüfte Fachkern, die atomare Stundenreihenfolge und die grundlegenden Sicherungs-/Exportverfahren können dagegen erhalten bleiben.

Zur Beurteilung des Umbaus: [Zielkonzept und Dateibaum](zielkonzept.md), [mobile Ansichtsskizze](nachweise/entwurf-mobil.png), [Desktopskizze](nachweise/entwurf-desktop.png), [Fehlerzustand](nachweise/entwurf-fehler-mobil.png). Das sind Entwürfe, keine bereits umgesetzte Nachher-Version. Den produktiven Code hat diese Prüfung nicht verändert.

## 1. Prüfgrundlage und Sicherung

Gelesen wurden `AGENTS.md`, `START_HERE.md`, die Dokumente 01–08 in der vorgegebenen Reihenfolge, die aktuellen Module in `app/`, die vorhandenen Prüfungen und die relevanten Legacy-Berechnungs-/Speicherstellen. Bestätigte Entscheidungen in Dokument 07 hatten Vorrang. `docs/03-technischer-iststand.md` wurde ausschließlich als historische Legacy-Beschreibung behandelt.

| Merkmal                      | Tatsächlicher Ausgangsstand                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| Version                      | `app/package.json`: **0.6.1**                                                              |
| Branch / Commit              | `main` / `ada6c55929857ca08c69ce68495c80f5a68b83c3`                                        |
| Bereits geändert             | `app/src/styles.css`, `docs/barrierefreiheitspruefung.md`, `docs/entwicklungsprotokoll.md` |
| Bereits unversioniert        | `app/scripts/`, `app/src/main.ts`, `docs/visual-redesign/`, `docs/visuelles-redesign.md`   |
| Historische Testversion      | `v0.5.0`, Commit `0556967fbbfa0e51954507f5cd141b17b2d08740`                                |
| Wiederherstellbare Grundlage | Neben dem Repository: `../_gradeflow-revision-sicherungen/2026-10-18-ausgangsstand/`       |

Die Sicherung enthält ein Git-Bundle mit vollständiger vorhandener Historie und Tags, einen binären Arbeitsdiff, den anfänglichen Git-Status sowie ein Archiv der 139 nicht ignorierten Projektdateien einschließlich der unversionierten Designarbeit. Alle Archivdateien wurden per SHA-256 gegen das Ausgangsmanifest geprüft; `git bundle verify` bestätigt ein vollständiges, gültiges Bundle. Ignorierte Laufzeitpakete, Browserprofile und lokale Nutzerdaten sind keine Bestandteile dieses Quellcodearchivs. Das Archiv ersetzt keine Datensicherung der App.

Die vorhandenen Änderungen werden nicht als eigene Revisionsleistung ausgegeben. `legacy-source/`, `reference/` und `v0.5.0` wurden nicht verändert. Eine erneute Prüfung gegen das Ausgangsmanifest steht in [dateierhaltung.json](nachweise/dateierhaltung.json); die exakte Liste neu angelegter Prüfdateien steht in [dateiliste.json](nachweise/dateiliste.json).

## 2. Produktverständnis und verbindliche Regeln

Die App dokumentiert eine zusammenfassende menschliche Einschätzung der mündlichen Mitarbeit pro Person und Unterrichtsstunde. Sie bewertet keine Einzeläußerungen, Prüfungen, Referate, Sprache, Audio, Video oder Verhalten automatisch. Ein technischer Test belegt keine pädagogische Wirkung und keine rechtliche Zulässigkeit eines Einsatzes mit echten Schülerdaten.

| Verbindlich                                                                                                | Grundlage / Abnahme                                                        |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Startwert 2,00; `--`, `-`, `0`, `+`, `++` verändern um +0,50/+0,25/0/−0,25/−0,50                           | Dokument 02, O3; Fachtests und 120 unabhängige Übergangsprüfungen          |
| Grenzen 1,00–6,00, maximal drei Pufferpunkte nur bei 1,00; überschüssiger Verbesserungsschritt wird Puffer | O1; inklusive 1,25 mit `++` zu 1,00 und Puffer 1                           |
| Bewertet, abwesend und nicht beobachtet sind getrennte Status; offen bedeutet fehlende Eingabe             | O2; AW/NB ändern weder Note noch Puffer und erzeugen keinen Leistungspunkt |
| Jede Beobachtung speichert sofort; erst erfolgreiche letzte Speicherung macht die Stunde vollständig       | O2; Neuladen nach jeder Eingabe und simulierte Schreibfehler               |
| Höchstens zwei Stunden pro Klasse und Datum; stabile IDs, atomarer Tausch, Normalisierung nach Löschung    | O7/O14; chronologisch Datum, Nummer, stabile ID                            |
| Kein automatischer Zeitraumabschluss oder Noten-Reset                                                      | O4/O9; eine Bezeichnung ändert keine Berechnung                            |
| Manuell oder genau Vorname/Nachname importieren, maximal 45 Personen                                       | O8; CSV/TXT/XLSX, Klassenlisten maximal 5 MiB                              |
| Excel mit Übersicht und Personenblättern; zusätzliche CSV; Vollsicherung JSON                              | O10; lesbare Berichte ohne technische IDs                                  |
| Ergebnis vor Puffer; feste Navigation, kompakte Fenster und gleiche Diagrammachse                          | O11–O13; UI-Anordnung darf Fachwerte nicht verändern                       |
| Lokale Bachelorarbeitsversion ohne Konto, Supabase oder Cloud                                              | O5; keine neue kostenpflichtige Laufzeit                                   |

**Offen, ohne neue fachliche Festlegung:** Beobachtungskriterien, Freitextnotizen, Klassendurchschnitt, Referenzlinie, zusätzliche Uhrzeit, Bezeichnung schulüblicher Zwischenwerte und endgültiger Produktname. Ein optionaler PDF-Bericht und Mehrgeräte-Konfliktlösung bleiben außerhalb dieser Revision. Die bestätigte Dezimaldarstellung wird beibehalten. Ein Schutz vor zwei Tabs auf demselben Gerät ist ein aktuelles lokales Zuverlässigkeitsproblem, keine neue Cloud-Synchronisierung.

### Historische Abweichungen, nicht heutige Mängel

`legacy-source/src/App.jsx:268` übernahm beim Überschreiten der Note 1 keinen restlichen Verbesserungsschritt in den Puffer. Das widerspricht O1 und ist im aktuellen `gradingEngine.ts:51` bereits korrekt gelöst. Die Legacy-Funktion `saveSession()` (`App.jsx:1165`) übernahm bereits teilweise Runden ohne ausdrückliche AW-/NB-Status; heute speichert `localRepository.ts:221` einzelne explizite Beobachtungen. Die Legacy-Sortierung (`App.jsx:333`) verwendete Datum und Erstellungszeit statt der bestätigten Stundennummer; heute bestehen separate Sequenz- und Neuberechnungsmodule. Die Legacy-Cloudanmeldung (`legacy-source/src/cloudSync.js:1`) gehört nicht mehr zur aktuellen Anwendung. Diese historischen Unterschiede werden nicht als neu entdeckte Fehler in `app/` gezählt.

## 3. Skill-Zuordnung und tatsächlicher Beitrag

Alle hier genannten Anleitungen wurden vor der jeweiligen Anwendung gelesen. Es wurden keine zusätzlichen Skills oder Dienste installiert.

| Prüfbereich            | Skill                    | Erwarteter Beitrag                                                                  | Tatsächliches Ergebnis / Nachweis                                                                                                                                                                                                  |
| ---------------------- | ------------------------ | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ergänzende Fähigkeiten | Skill Finder             | Kurze lokale Suche nach UX, Barrierefreiheit, lokalem Speicher und Datei-Sicherheit | Lokale Ollama-/Indexsuche lief; [Treffer](nachweise/skill-finder.json). Vorhandene Skills decken den Auftrag ab; keine ungeprüften Installationen                                                                                  |
| Bedienkonzept          | Frontend Design          | Hierarchie aus Unterrichtsaufgaben ableiten und visuell prüfen                      | Tokens, Layoutentscheidung und geprüfte Skizzen in [Zielkonzept](zielkonzept.md)                                                                                                                                                   |
| Semantik / Fokus       | Web Design Guidelines    | Konkrete UI-Stellen auf Beschriftung, Fokus, Navigation und Scrollzugang prüfen     | 22 Tab-Schritte gemessen; mobile Kontextverluste; explizite Gegenprüfung der Verlaufstabelle                                                                                                                                       |
| Reale Abläufe          | Webapp Testing           | Isolierte Browserprofile, reproduzierbare Aufgaben und Größen                       | [browserpruefung.py](browserpruefung.py), 390/768/1440 px, 60 einzelne Eingaben mit jeweils anschließendem Neuladen                                                                                                                |
| Fehlerursachen         | Systematic Debugging     | Fehler nachstellen und den verursachenden Weg verfolgen                             | Zwei-Tab-Verlust, falsche Wiederaufnahme und Storage-Startfehler konkret reproduziert; noch kein produktiver Fix vor Freigabe                                                                                                      |
| React-/TS-Sicherheit   | Security Best Practices  | Untrusted Daten, DOM-Sinks, Geheimnisse und Abhängigkeiten prüfen                   | [Quellscan](nachweise/quellscan.json), Prüfung der Datenwege, npm-Audit ohne gemeldete Schwachstellen                                                                                                                              |
| Eingabegrenzen         | Secure Code Guardian     | Sicherheitskontrollen passend zur lokalen App konkretisieren                        | 45/46-Personen- und 5-MiB-Grenze geprüft; fehlende JSON-Vorabgrenze und reservierte IDs abgegrenzt                                                                                                                                 |
| Vertrauensgrenzen      | Security Threat Model    | Belegte Fehler von bedingten Bedrohungen trennen                                    | [Lokales Bedrohungsmodell](codex-startpaket-gradeflow-threat-model.md), fünf konkrete Pfade, keine erfundenen Servermaßnahmen                                                                                                      |
| Datei-Inhalte          | Spreadsheets             | Zahlen, Daten, Status, Blattnamen, Vollständigkeit und Formeln prüfen               | Je Export 81 CSV-Zeilen und 21 XLSX-Blätter; unabhängige Gegenrechnung, OOXML-Prüfung und zwei gerenderte Blattbereiche                                                                                                            |
| Deutsche Texte         | Professional Proofreader | Unklare Fehler-/Sicherungstexte präzisieren, Fachbedeutung erhalten                 | Konkrete Vorher-/Vorschlag-Tabelle im Zielkonzept; keine ungefragte externe Korrektur                                                                                                                                              |
| Quellen                | Source Evaluation        | Externe UI-Regeln als Referenz prüfen; Befunde am Code bestätigen                   | Aktuelle [Vercel Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md), Originalquelle am Prüftag abgerufen; keine Rechts- oder Wirkungsbehauptungen daraus abgeleitet |
| Wartbare Umsetzung     | Ponytail                 | Vollständige Aufgabe mit angemessenem Eingriff planen                               | Fachkern bleibt; gezieltes Herauslösen großer UI-Zuständigkeiten statt Neuschreibung; neue Produktionsabhängigkeit nicht vorgesehen                                                                                                |
| Verständlichkeit       | i-have-adhd / Caveman    | Ergebnis zuerst, klare Zustände und kurze nächste Schritte                          | Zusammenfassung, priorisierte Befunde und vier abnehmbare Meilensteine; keine medizinische Annahme                                                                                                                                 |

## 4. Qualitätsmaßstab und Ausgangsmessung

Eine Lehrkraft muss beim Bedienen erkennen, **welche Person, welche Stunde, welcher Bezugsstand und welcher Speicherzustand** gelten. Eine Unterbrechung darf weder Datenverlust noch einen stillen Wechsel der bearbeiteten Stunde verursachen. Auswertungen müssen vollständig bleiben, auch wenn die Anzeige Ausschnitte zeigt. Fehler brauchen eine sichtbare nächste Handlung.

| Aufgabe / Maßstab                                      | Gemessener Ausgangsstand                                                                                     | Geplante Abnahme, noch kein Nachher-Ergebnis                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Mobile Eingabe bei 390×844, Auswahl `+`                | Nächster Name bei y=−61,67 bis −16,88; Fortschritt und Speicherhinweis ebenfalls außerhalb des Sichtfensters | Person, Stunde, Fortschritt und Rückmeldung beim bedienten Feld sichtbar                 |
| Tablet bei 768×1024                                    | Name sichtbar, Fortschritt und Speicherhinweis nach Auswahl außerhalb des Sichtfensters                      | Zusammenhängender Stundenkontext auch beim Scrollen                                      |
| Tastatur: Stundeninhalt bis erstem Symbol, 20 Personen | 22 Tab-Schritte; danach komplette Runde und Abschluss mit Enter möglich                                      | Höchstens drei Tab-Schritte bis zur Symbolgruppe, direkte Personenwahl weiterhin möglich |
| Wiederaufnahme bei zwei offenen Stunden                | Bearbeitet: 01.09.2026, 1. Stunde; nach Neuladen: 02.09.2026                                                 | Dieselbe stabile Stunden-ID und sinnvolle Personenposition                               |
| Zweiter Tab                                            | Vor Klassenauswahl in A: eine in B gespeicherte Stunde; danach: null Stunden                                 | Neue Eingabe bleibt erhalten oder veralteter Schreibvorgang wird sichtbar verhindert     |
| Letzte Eingabe, Quotenfehler simuliert                 | Daten unverändert; kein falscher Abschluss. Fehlermeldung bei y=−596,88 außerhalb des mobilen Sichtfensters  | Weiterhin kein falscher Erfolg; Fehler unmittelbar sichtbar und erneut ausführbar        |

Die Positionsmessung ist eine technische Sichtfensterprüfung mit automatisiertem Klick. Sie ersetzt keine Messung menschlicher Bedienzeit. [Rohwerte](nachweise/browserergebnisse.json), [mobiles Sichtfenster](nachweise/eingabe-sichtfenster-390.png), [Speicherfehler](nachweise/speicherfehler-sichtfenster-mobil.png).

### Laufzeit und Dateien

Ein Mac, lokales Chromium **156.0.8078.4**, Produktions-Build, keine CPU-/Netzdrosselung. Nachstehende Zeitangaben sind Messungen auf diesem Rechner, keine Aussage über Smartphones oder pädagogische Nutzung.

| Messung                                  | Ergebnis                                                                                                                     |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| CSV, 20 Personen / zwei Stunden, 1440 px | 30,25 / 33,52 / 31,98 ms von automatisiertem Klick bis Download                                                              |
| XLSX, dieselben Daten, 1440 px           | 187,55 ms erster Lauf; 73,40 / 65,73 ms nach Laden des Moduls                                                                |
| Zusätzliche Datei-Prüfung                | Alle drei Bildschirmgrößen: 81 CSV-Zeilen, 21 XLSX-Blätter, keine Formelzellen; 20 aktuelle Stände unabhängig gegengerechnet |
| Laden, 20 Personen / 24 Stunden          | DOMContentLoaded 19,2 ms                                                                                                     |
| Laden, 20 Personen / 400 Stunden         | DOMContentLoaded 100,8 ms                                                                                                    |
| Laden, 20 Personen / 1000 Stunden        | DOMContentLoaded 2954,6 ms; Eingabeklicks danach 86,69 / 73,78 / 51,50 ms                                                    |
| Produktionsumfang                        | Haupt-JS 284,72 kB / 87,31 kB gzip; CSS 29,66 / 6,73 kB; separat geladenes Excel-Modul 940,22 / 272,17 kB                    |

Die Exportzeiten enthalten Automationswartezeiten. Die Ladeangaben sind jeweils eine Stichprobe des Navigation-Timings, keine LCP-/INP-Messung oder Aussage „bedienbar nach …“. Quelle: [Ergänzende Ergebnisse](nachweise/ergaenzende-ergebnisse.json), [Build](nachweise/build.txt). Kein pauschaler Geschwindigkeitsgewinn wird behauptet.

## 5. Priorisierte Befunde mit Maßnahmen und Abnahme

### R01 – P1: Gespeicherte Stunden gehen durch einen veralteten zweiten Tab verloren

**Geprüfter Iststand:** `App.tsx:288–301` bildet die Klassenauswahl aus dem lokalen React-Snapshot und ruft `localRepository.save(updated)` auf. Mehrere weitere Klassenaktionen verwenden denselben Ansatz (`App.tsx:246`, `313`, `333`, `403`). `LocalRepository.save()` (`localRepository.ts:139`) prüft das Dokument, aber nicht dessen Aktualität. Ein `storage`-Listener oder originweiter Schreibschutz fehlt im geprüften App-Code.

**Auswirkung:** Eine bereits als gespeichert bestätigte Stunde kann verschwinden. Reproduktion: A und B öffnen denselben Stand, B legt eine Stunde an und speichert `+`, A klickt auf die bestehende Klasse. Die Zahl der Stunden fällt von eins auf null. Kein Cloudbetrieb ist dafür nötig.

**Ziel / Maßnahme:** Einheitlicher lokaler Schreibweg; Klassenauswahl schreibt keine veralteten Fachdaten. Ein klar erkennbarer Schreibberechtigter pro Ursprung verhindert konkurrierende Gesamtschreibvorgänge; weitere Tabs übernehmen Änderungen oder zeigen einen verständlichen Hinweis. Kein stilles automatisches Zusammenführen pädagogischer Eingaben.

**Abnahme:** Genau diese Zwei-Tab-Reproduktion sowie Umbenennen/Archivieren/Anlegen/Import im veralteten Tab dürfen keine neue Beobachtung löschen. Auch nahezu gleichzeitige Schreibversuche werden mit zwei echten Seiten geprüft. Alle erfolgreich bestätigten Daten sind nach Neuladen noch vorhanden.

### R02 – P1: Verweigerter Speicherzugriff erzeugt eine leere App

**Geprüfter Iststand:** `App.tsx:107–115`: `window.localStorage` wird schon beim Erzeugen des Repositorys gelesen, vor dem `try` von `loadResult`. Eine dort simulierte `SecurityError`-Ausnahme führt zu leerem Body, keinem sichtbaren Alert und einer ungefangenen Ausnahme. [Beleg](nachweise/fehlerfaelle.json), [Bild](nachweise/speicherzugriff-verweigert.png).

**Auswirkung:** Die Lehrkraft bekommt weder eine Erklärung noch einen brauchbaren nächsten Schritt. Die bereits vorhandene Fehler-/Rettungsansicht wird nicht erreicht.

**Ziel / Maßnahme:** Speicherobjekt und Repository geschützt initialisieren; verweigerten Zugriff ausdrücklich als eigenen Fehlerzustand darstellen. Daten dürfen dabei nicht als gelöscht oder erfolgreich gespeichert gelten. Sicherungsimport wird erst nutzbar, wenn Speicherung tatsächlich möglich ist.

**Abnahme:** Getrennte Fault-Injection für verweigerten Objektzugriff, fehlgeschlagenes Lesen und fehlgeschlagenes Schreiben. Jeder Fall zeigt eine verständliche Oberfläche; kein falscher Erfolg und kein Überschreiben vorhandener Rohdaten.

### R03 – P1: Bewertungsfeld und Stundenkontext fallen auf kleinen Displays auseinander

**Geprüfter Iststand:** `App.tsx:1305` ff., `styles.css:603`, `679`, `715` sowie mobile Regeln ab `1535`. Hauptnavigation, Klassenliste, Stundenkopf und Personenliste liegen vor dem Bewertungsbereich. Der erste Personenname liegt bei 390 px vor dem Scrollen bereits unterhalb der Bildschirmhöhe. Nach dem Klick auf `+` ist der nächste Name oberhalb des sichtbaren Bereichs; die eigentlichen Bewertungsschaltflächen bleiben sichtbar. Auch ein korrekt abgefangener Speicherfehler wird oben außerhalb der bedienten Fläche ausgegeben (`App.tsx:829` ff.).

**Auswirkung:** Weitere Eingaben sind möglich, während die zugehörige Person visuell fehlt. Ein Fehler kann beim Weiterarbeiten unbemerkt bleiben. Bei 768 px fehlen nach dem Klick zumindest Fortschritt und Speicherhinweis.

**Ziel / Maßnahme:** Zusammenhängende Bewertungsansicht gemäß [Zielkonzept](zielkonzept.md): kompakter Stundenkontext, Name und Bezugsstand direkt bei den Symbolen, mobile Personenwahl nachgeordnet, Fehler im sichtbaren Arbeitsbereich. Ergebnis bleibt größer als Puffer. Erfolg benennt die gerade gespeicherte Person; der nächste Name ist eindeutig.

**Abnahme:** Gleiche 20 Namen und gleiche Eingaben bei 390/768/1440 px. Nach jedem Symbol und AW/NB müssen aktuelle Person, Stunde und Fortschritt sichtbar sein. Schreibfehler bleiben bei den bedienten Schaltflächen erkennbar. Zusätzlich lange Namen, vergrößerte Schrift, Fokus und reduzierte Bewegung prüfen. Skizzen sind keine bestandene Produktabnahme.

### R04 – P2: Neuladen wechselt die bearbeitete Stunde oder Ansicht

**Geprüfter Iststand:** `firstIncompleteSession()` (`App.tsx:72`) wählt nach Erstellungszeit statt letzter Bearbeitungsposition. `activeSessionId`, `selectedStudentId`, `page` und `dashboardView` leben nur in React (`App.tsx:127–168`). Eine ausdrücklich geöffnete ältere offene Stunde wird nach Neuladen durch die neuere ersetzt. Die Tabelle wird nach Neuladen ebenfalls durch eine offene Stunde ersetzt.

**Auswirkung:** Die Lehrkraft muss Kontext neu suchen; bei älteren Korrekturen besteht ein Verwechslungsrisiko. Die Beobachtungen selbst bleiben im geprüften Einzel-Tab-Ablauf gespeichert.

**Ziel / Maßnahme:** Kleine, validierte lokale Arbeitsposition mit stabilen IDs und klarer Navigation. Keine berechneten Noten in diesem Positionszustand. Wenn ein Ziel nicht mehr existiert, verständlich zur Klasse zurückkehren. Browser-Zurück soll zwischen Ansichten führen, ohne Fachwerte zu verändern.

**Abnahme:** Zwei unvollständige Stunden, ältere bearbeiten, Person wählen, neu laden: dieselbe Stunde bleibt geöffnet. Tabellen-/Verlaufsansicht und ausgewählte Person überstehen Neuladen. Gelöschte oder archivierte Ziele führen nicht zu einem beschädigten Start.

### R05 – P2: Der Weg zur primären Tastatureingabe führt durch sämtliche Personen

**Geprüfter Iststand:** In der DOM-Reihenfolge stehen die 20 Personenbuttons vor den fünf Symbolen (`App.tsx:1350` ff.). Vom fokussierten Stundeninhalt bis zum ersten Symbol wurden 22 Tab-Schritte gemessen. Eine vollständige Bewertung mit Enter und der Fokus auf dem Abschlussbutton funktionieren bereits.

**Auswirkung:** Ein neuer Tastaturnutzer muss die lange Liste durchlaufen, bevor er die häufigste Handlung erreicht.

**Ziel / Maßnahme:** Eingabebereich vor die ergänzende Liste in der sinnvollen Fokusreihenfolge setzen; direkte Personenwahl erhalten. Kein neuer globaler Tastaturhandler, der native Eingaben oder Screenreader-Tasten blockiert.

**Abnahme:** Höchstens drei Tab-Schritte vom Stundeninhalt zur ersten Bewertung. Gesamte Klasse einschließlich AW/NB, Korrektur, Hilfe/Rückkehr und Abschluss ausschließlich per Tastatur durchführen. Fokus bleibt sichtbar und wird nicht von einer fixierten Leiste verdeckt.

### R06 – P2: Sicherungsdateien werden ohne Vorabgrenze gelesen; XLSX-Ressourcenrisiko bleibt offen

**Geprüfter Iststand:** `backupFile.text()` und `recoveryFile.text()` (`App.tsx:644`, `720`) laufen ohne Prüfung der Dateigröße. Anders als `classImport.ts:78` gibt es hier kein vorgelagertes Byte-Limit. `readClassXlsx()` (`excelWorkbook.ts:143`) prüft Zeilen und Zelltypen erst nach `workbook.xlsx.load(raw)`.

**Auswirkung:** Sehr große oder stark komprimierte Dateien können die lokale App schon beim Einlesen/Entpacken beanspruchen. **Das ist ein Codebefund und ein plausibles Ressourcenrisiko; ein gezielter Speichererschöpfungsangriff wurde nicht ausgeführt.** Die getesteten defekten normalen Sicherungen wurden korrekt abgewiesen und überschrieben den gültigen Stand nicht.

**Ziel / Maßnahme:** Gemeinsamer begrenzter Datei-Leseweg für normalen Import und Rettungsimport; klare Fehlermeldung vor `.text()`. Vorschlag: 5 MiB als technische Dateiobergrenze, ohne zeitliche Begrenzung oder Kürzung gespeicherter Bewertungszeiträume. Bestehende größere Sicherungen erhalten eine verlustfreie Übertragungsstrategie, keine stille Ablehnung mit Datenlöschung. XLSX-Entpackungsumfang separat begrenzen; nicht bloß ein weiteres Dateiendungsfeld prüfen.

**Abnahme:** Grenzfälle knapp unter/auf/über dem Limit; zu große Datei wird vor dem Lesen abgewiesen. Beide JSON-Einstiege erhalten dieselbe Prüfung. Gültige Sicherung, defekte Sicherung, Quotenfehler beim Rückfall und unveränderte Rohdaten bleiben abgesichert. Kein Zeitlimit oder Fehler wird durch einen scheinbaren Erfolg verborgen.

### R07 – P2: Eine zulässige Import-ID kann einen falschen NB-Status erzeugen

**Geprüfter Iststand:** `schema.ts:104` erlaubt jede nicht leere Personen-ID. Bei `toString` und einer leeren Beobachtungsliste liefern direkte Zugriffe wie `activeSession.observations[student.id]` eine geerbte Eigenschaft. `features/presentation.ts:14` gibt dafür „Nicht beobachtet“ aus. Der Fall wurde im echten Browser reproduziert.

**Auswirkung:** Eine importierte Person erscheint als ausdrücklich nicht beobachtet, obwohl keine Beobachtung gespeichert ist. Das betrifft gestaltete/importierte IDs; die normale Erstellung verwendet UUIDs. Kein Beleg für ausführbaren Importcode oder eine Änderung von `Object.prototype`.

**Ziel / Maßnahme:** Nur eigene Beobachtungsschlüssel berücksichtigen und den Import an derselben Grenze konsistent validieren. Eine normale UUID-Nutzung reicht nicht als Schutz beim Einlesen beliebiger Sicherungen.

**Abnahme:** `toString`, `constructor`, `__proto__`, unbekannte Personen und beschädigte Beobachtungen als gezielte Fixtures. Fehlende Eingabe bleibt Offen; AW/NB bleibt nur bei ausdrücklich gespeichertem Status sichtbar. Gültige bisherige Sicherungen und Migration bleiben verlustfrei.

### R08 – P2: Zentrale UI und Exportdarstellung sind unnötig gekoppelt

**Geprüfter Iststand:** Fachkern, Repository und Import/Export sind bereits getrennt. Allerdings enthält `App.tsx` 1548 Zeilen einschließlich Klassenaktionen, Storage-Rettung, Downloads, Navigation, Stundenliste und Bewertung. Beide Exportmodule importieren `observationLabel` aus `features/presentation.ts` (`csvExport.ts:4`, `excelWorkbook.ts:4`). Der geplante Application-Service-Teil ist gegenüber der UI noch unvollständig.

**Auswirkung:** Eine Änderung am Speicherzustand oder an Statusbeschriftungen muss über mehrere UI-/Infrastrukturwege konsistent gehalten werden. R01 zeigt eine konkrete Folge der verstreuten Schreibwege.

**Ziel / Maßnahme:** Den bestehenden Kern behalten. Bewertungsarbeitsbereich, Sicherung und Klassenansicht nach Zuständigkeit herauslösen; einheitliche Notebook-Aktionen und gemeinsame Beschriftungen unter `application/`. Keine neue State-/Router-/Validierungsbibliothek nur für diese Aufteilung. Die 1910 CSS-Zeilen sind allein kein Fehlerbeleg; nur tatsächlich betroffene Layoutregeln werden bereinigt.

**Abnahme:** Aktuelle Tests und Browserabläufe bestehen weiter. Domain bleibt React-/Storage-unabhängig. Exportmodule importieren keine `features/`-Datei mehr. Sämtliche fachlichen Schreibvorgänge nutzen den abgesicherten Weg aus M1. Die Aufteilung erhält Fehlerbehandlung und Validierung.

### R09 – P2: Lange Stundenlisten erzeugen wiederholte vollständige Sequenzprüfungen

**Geprüfter Iststand:** `App.tsx:1199–1287` rendert alle Stunden; `sessionLabel()` (`presentation.ts:43`) ruft pro Verwendung `hasVisibleLessonSequence()` auf. Diese Funktion prüft und durchläuft jeweils sämtliche Stunden (`lessonSequence.ts:111`). Ähnliche wiederholte Aufrufe liegen im CSV-/XLSX-Bericht und in der Tabelle. Das erzeugt unnötige quadratische Arbeit. Die Einzelstichprobe bei 1000 Stunden ergab rund 2,95 s bis DOMContentLoaded; eine detaillierte CPU-Profilierung wurde nicht durchgeführt.

**Auswirkung:** Bewertungszeiträume sind absichtlich nicht begrenzt. Umfangreiche Klassen können beim Öffnen unruhig oder langsam werden, obwohl die nächste Eingabe nur eine Beobachtung betrifft.

**Ziel / Maßnahme:** Validierung an der zuständigen Daten-/Domain-Grenze erhalten, Datums-/Nummernindex einmal pro Bericht bilden und wiederverwenden. Stundenliste in überschaubaren Abschnitten mit direkter Datumswahl anbieten. Alle Stunden bleiben gespeichert und werden berechnet/exportiert; das ist keine zeitliche Begrenzung. Kein vorsorglicher Wechsel der Speichertechnik.

**Abnahme:** Gleiche 24/400/1000-Stunden-Fixtures vor/nach Umbau mehrfach messen. Keine vollständige Slotvalidierung pro sichtbarem Zellenlabel. Gesamtwerte und Export vollständig unverändert. Eine wiederholbare Verkürzung muss tatsächlich gemessen werden; keine aus dem Code abgeleitete Prozentangabe.

### E01 – P3: Explizite Benennung des Verlauf-Scrollbereichs ergänzen

`StudentHistory.tsx:196` verwendet eine unbenannte `.table-scroll`-Fläche ohne explizites `tabIndex`. **Eine zunächst vermutete Tastatursperre wurde widerlegt:** Im getesteten Chromium erhält der Bereich automatisch Fokus und scrollt per Pfeil um 40 px. [Gegenprüfung](nachweise/tastatur-verlauf-gegenpruefung.json). Empfehlung ist eine explizite, benannte Region wie in `ClassTable`, plus Prüfung in weiteren Browserengines. Kein behaupteter Ausfall in Chromium und kein abgeschlossener Screenreader-Audit.

## 6. Bewusst beibehaltene Bereiche

| Bereich                               | Qualitätsmaßstab                                                                                    | Beleg für Beibehaltung                                                                                                                                                    |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fachkern in `domain/`                 | Rein, deterministisch, bestätigte Viertelschritt-/Pufferregeln                                      | Vorhandene Fachtests und unabhängige Gegenrechnung aller 120 gültigen Zustands-/Symbolübergänge bestanden                                                                 |
| Atomarer Tausch / Löschnormalisierung | Stabile IDs und Eingaben bleiben zugeordnet; nur Reihenfolge ändert sich; Fehler bleibt atomar      | Unit-/Integrationstests bestanden; reale Browser auf drei Größen; zusätzlich Schreibfehler beim Tausch unverändert                                                        |
| Unmittelbare Einzelspeicherung        | Jede erfolgreiche Eingabe überlebt Neuladen; kein globaler Speicherschritt                          | 20 Eingaben mit Neuladen auf jeder der drei Breiten; 60 Prüfungen, drei explizite Status                                                                                  |
| Tabellenfenster und Diagramm          | Ausschnitt ändert keine Gesamtberechnung; AW/NB/Offen bleiben unterscheidbar; fester Stundenabstand | 24 Stunden auf allen Größen, 10/alle und Detail/Größe bedient; aktueller Stand unverändert; Achsenabstand 112 Einheiten und gleiche Achse beim Personenwechsel            |
| Sicherung / Migration                 | Validieren vor Überschreiben; Rückfall schreiben vor Ersetzen; Rohdaten erhalten                    | Unit-/Integrationstests plus Browser-Rundlauf, beschädigter Startstand, Legacy-Rückfall, Klassenlöschrückfall                                                             |
| Lesbare CSV-/XLSX-Berichte            | Typisierte Zahlen/Daten, vollständige Ereignisse, keine technischen IDs oder Formeln                | Dateien aus echten Downloads geprüft; 81 CSV-Zeilen/21 Blätter; aktueller Stand unabhängig geprüft. Vorhandene Randfalltests zu Blattnamen und Formeleinstiegen bestanden |
| Bestehende Gestaltungsmittel          | Systemschriften, sichtbarer Fokus, zurückhaltende Bewertungsfarben, reduzierte Bewegung             | Gerenderte Ausgangsstände; 3-px-Fokus sichtbar; 200 % CSS-Grundschrift ohne Seitenüberlauf; Animation bei reduzierter Bewegung `none`                                     |

**Excel-Vorschaugrenze:** [Übersicht](nachweise/excel-blatt-1.png) und [Personenblatt](nachweise/excel-blatt-2.png) wurden gerendert betrachtet. Der Renderer zeigt im Personenblatt die Datumsseriennummer an. Die exportierte Datei enthält das korrekte Zahlenformat `dd.mm.yyyy`; ein unabhängiges erneutes Lesen ergibt `2026-10-18 12:00:00`. Das ist eine Vorschaugrenze und kein als App-Fehler übernommener Befund. [Gegenprüfung](nachweise/excel-datum-gegenpruefung.json). Native Excel-/LibreOffice-Bedienung ist nicht geprüft.

## 7. Zusammenhängender Umsetzungsplan zur Freigabe

Freigabegegenstand ist die folgende **gesamte Revision M1–M4**, mit den Abnahmen aus Abschnitt 5 und dem Zielkonzept. Nach Freigabe können die beschriebenen Routinearbeiten ohne erneute Grundsatzfrage durchgeführt werden. Eine Änderung bestätigter fachlicher Regeln oder des lokalen Betriebsumfangs wäre eine neue Entscheidung. Jeder Meilenstein endet mit lauffähigem Stand, Protokolleintrag und den fünf npm-Prüfungen plus betroffenen Browserregressionen.

| Meilenstein                                    | Konkreter Umbau                                                                                                                                                                                                                       | Problem / Ergebnis                                                                           | Abnahme                                                                                                                                                                                    |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **M1: Speicherung zuverlässig machen**         | Storage-Zugriff geschützt initialisieren; einheitliche lokale Notebook-Aktionen; originweiter Schreibschutz und verständlicher Zweit-Tab-Zustand; JSON-Vorabgrenze und sichere Beobachtungsschlüssel                                  | R01, R02, R06, R07; bestätigte Daten werden nicht still ersetzt und Fehler bleiben bedienbar | Zwei-Tab-Verlust verhindert; denied/read/quota getrennt; alle Import-/Rückfallregressionen einschließlich reservierter IDs bestehen                                                        |
| **M2: Arbeitsposition und Navigation**         | Stabile lokale Arbeitsposition; Klassenwahl von fachlichen Gesamtschreibvorgängen lösen; Rückkehr zu derselben Stunde/Person/Ansicht; zentraler kleiner Navigationsbaustein                                                           | R04 und Teil R08; verlässliche Unterbrechung und Rückkehr                                    | Ältere offene Stunde und Ansicht überstehen Reload; Browser-Zurück; gelöschte/archivierte Ziele erklärt; keine Änderung von Beobachtungen durch Navigation                                 |
| **M3: Bewertungs- und Klassenansicht umbauen** | Zusammenhängende Bewertungsfläche aus der Skizze, kompakter Kontext, Eingabe vor ergänzender Personenliste, lokale Fehler/Rückmeldungen, primär Beginnen/Fortsetzen; passende Komponenten herauslösen und deutsche Texte überarbeiten | R03, R05, R08; mobile Zuordnung und schnelle Eingabe                                         | Gleiche Aufgaben/Daten auf 390/768/1440 px; Kontext und Fehler sichtbar; höchstens drei Tabs; lange Namen/200 %/Fokus; voller Abschluss und Rückweg                                        |
| **M4: Auswertung, Last und Abschluss**         | Gemeinsame Darstellung aus `application/`, Datumsindex statt wiederholter Slotprüfung, begrenzte Stundenliste mit Datumswahl, benannter Verlauf-Scrollbereich; vollständige Vergleichsprüfung und eigener Versionsstand               | R08, R09, E01; wartbare Berichte und umfangreiche Zeiträume                                  | 24/400/1000 Stunden ohne Ergebnisverlust; gemessener Vorher-/Nachhervergleich; alle Datei-/Backup-Kernabläufe und fünf npm-Prüfungen bestanden; genaue Dateiliste und Grenzen dokumentiert |

Der technische Stack bleibt React, TypeScript, Vite, Vitest und vorhandenes ExcelJS. Eine neue Produktionsabhängigkeit ist nicht eingeplant. Das Notebook-Schema soll ohne fachliche Änderung erhalten bleiben; neue Arbeitspositionsdaten werden getrennt gespeichert. Falls eine echte Datenmigration erforderlich wird, muss zuerst ein Rückfall mit fiktiven Daten getestet werden. Die historische Erhebung `v0.5.0` wird weder ersetzt noch verändert. Keine Veröffentlichung oder Bereitstellung für echte Schülerdaten ist enthalten.

## 8. Tatsächlich ausgeführte Prüfungen

| Prüfung                             | Ergebnis / genaue Grenze                                                                                                                                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`                 | Bestanden, 2,619 s                                                                                                                                                                                                                    |
| `npm test`                          | **95/95 Tests in 15 Dateien bestanden**, Befehlslauf 6,776 s                                                                                                                                                                          |
| `npm run lint`                      | Bestanden, 1,821 s                                                                                                                                                                                                                    |
| `npm run format:check`              | Bestanden, 1,225 s                                                                                                                                                                                                                    |
| `npm run build`                     | Bestanden, 5,254 s; bekannte Warnung zum großen separat geladenen Excel-Modul                                                                                                                                                         |
| `npm audit --json --ignore-scripts` | Ausgeführt, keine gemeldeten Schwachstellen; keine Abhängigkeit verändert                                                                                                                                                             |
| Produktionsbrowser 390/768/1440     | Import derselben 20 Namen, je 20 Einzelbeobachtungen mit Reload, zweite Stunde/dritte abgewiesen, frühere Stunde korrigiert, atomar getauscht, Tabelle/Verlauf, echte Downloads, JSON-Rundlauf und Rückfall                           |
| Ergänzende Browser-/Fachprüfung     | Manuelle Anlage, Umbenennung ohne ID-/Beobachtungsverlust, Zeitraumänderung ohne Reset, Archivieren/Öffnen/Löschen/Rückfall, beschädigter Startstand und Legacy-Rückfall; 120 Fachübergänge; 45/46 Personen; Datei vor Lesen begrenzt |
| Fehler- und Lastfälle               | Letzte Eingabe und Tausch mit Quotenfehler, verweigerter Storage-Zugriff, zwei Tabs, mehrere offene Stunden, reservierte ID, 24/400/1000 Stunden                                                                                      |
| Darstellung                         | Ausgangsbilder auf drei Breiten; Tabelle/Diagramm intern gescrollt; Tastaturabschluss und Fokus; 200 % CSS-Grundschrift / reduzierte Bewegung; Ansichtsskizzen visuell geprüft                                                        |

Vollständige Ausgaben: [Baseline](nachweise/baseline.json), [Tests](nachweise/test.txt), [Browser](nachweise/browserergebnisse.json), [Ergänzungen](nachweise/ergaenzende-ergebnisse.json), [Fehlerfälle](nachweise/fehlerfaelle.json), [manueller Ablauf](nachweise/manueller-ablauf.json). Die Browserdatei enthält 25 bestandene Prüfgruppen und fünf reproduzierte Abweichungen; eine Prüfgruppe ist kein zusätzlicher Unit-Test. Die fünf Abweichungen umfassen zwei Breiten derselben Orientierungsursache sowie Tabverlust, Wiederaufnahme und Ansichtsverlust.

Die [Anleitung zur Wiederholung](README.md) beschreibt die geprüften lokalen Laufzeiten und Ports. Ein neuer Ausgabeordner schützt die Ausgangsbilder und Messergebnisse vor Überschreiben. Die entsprechenden Schutzabfragen der drei Python-Prüfhelfer wurden ausgeführt und bestanden; [Nachweis](nachweise/pruefhelfer-schutz.json).

### Laufzeit- und Prüfprobleme ehrlich abgegrenzt

Die anfängliche Shell hatte weder Node noch npm im PATH. Das npm aus der Codex-App war auffindbar, dessen Node konnte die vorhandene native Rollup-Datei aufgrund unterschiedlicher macOS-Team-Signaturen jedoch nicht laden. Mit dem gebündelten Node **24.19.0** und demselben npm liefen alle Prüfungen. Keine Paket-Neuinstallation, keine Lockdateiänderung und keine globale Sicherheitslockerung waren nötig. [Fehlgeschlagener Erstlauf](nachweise/laufzeit-erster-versuch-test.txt), [erfolgreicher Lauf](nachweise/test.txt).

Ein erster Browserprüflauf brach nach der erfolgreichen Quotenfehlerprüfung beim Zurücksetzen einer Testfunktion ab: Playwright interpretierte den zurückgegebenen Funktionswert als Aufruf. Der Testhelfer wurde mit einer umschließenden Funktion korrigiert; nur der betroffene Fehler-/Rückfallablauf wurde wiederholt und bestand. [Erster Lauf](nachweise/browserergebnisse-erster-lauf.json). Das war kein zusätzlicher App-Fehler. Die Orientierungsbewertung wurde anschließend aus den bereits gemessenen Rechtecken auf das vollständige Kriterium Name/Progress/Rückmeldung bezogen; dadurch ist auch die Tablet-Abweichung ausdrücklich ausgewiesen.

Die erste XLSX-Vorschau verwendete einen URL-kodierten Dateipfad. Nach Korrektur des Prüfhelfers mit `fileURLToPath()` gelang das Rendern. Die verbleibende Datumsanzeigegrenze wurde unabhängig gegengeprüft, siehe Abschnitt 6.

## 9. Grenzen und noch ausstehende Nachweise

**Teilweise erledigter Gesamtauftrag:** Ausgangsprüfung, Sicherung, Zielkonzept, Skizzen und Umsetzungsplan liegen vor. Die Fehler sind noch im Produkt vorhanden. Die neuen Prüfskripte liegen in der Dokumentation; produktive Regressionstests und die App-Änderungen folgen nach Freigabe. Ein wirklicher Nachhervergleich ist noch nicht möglich und wird nicht durch die Skizzen ersetzt.

Nicht durchgeführt: Usability-Erhebung mit Lehramtsstudierenden, pädagogischer Wirksamkeitstest, vollständiger WCAG-/Screenreader-Audit, reale Smartphones/Tablets, weitere Browserengines, OS-/Browser-Zoom, Windows, native Excel-/LibreOffice-Prüfung, native Verpackung und produktiver Datenschutz-/Betriebsnachweis. XLSX-Import und besondere Blattnamen-/Formeleinstiegsfälle sind durch die vorhandenen Unit-/Komponententests abgedeckt; der wiederholte reale Klassenlistenimport dieser Runde nutzte CSV. Gezielte ZIP-/Speichererschöpfungsangriffe wurden nicht ausgeführt.

Lokal bedeutet browser- und ursprungsgebunden. Der aktuelle Code und JSON-Export belegen keine Verschlüsselung. Die lokalen Rückfallstände helfen beim logischen Ersetzen, schützen aber nicht vor dem Löschen des gesamten Browser-Speichers oder Geräteverlust. Ein externer JSON-Download bleibt erforderlich. Technische Prüfungen beweisen keine rechtssichere oder objektive Endnote.

**Freigabe erforderlich:** `AGENTS.md` verlangt: „Beginne nicht mit der Implementierung, bevor der in START_HERE.md verlangte Prüfbericht erstellt und vom Nutzer freigegeben wurde.“ `START_HERE.md` und `docs/05-migrationsplan.md` verlangen ebenfalls die Freigabe vor Umsetzung. Der neue Auftrag bestätigt diese Grenze ausdrücklich. Alte Meilenstein-/Designfreigaben wurden deshalb nicht als Freigabe dieses neuen Umbaus behandelt.
