# Gradeflow: Bericht aus drei getrennten Skill-Prüfungen

**Ergebnis: 3,4 von 5. Acht konkrete Verbesserungen sind offen: ein P1-, fünf P2- und zwei P3-Befunde.** Die ruhige Gestaltung, die große Klassenwahl am Desktop und die geführte Übung funktionieren. Auf kleinen Bildschirmen steht zu viel Bedienrahmen vor den Daten. Fehler- und Bearbeitungsabläufe benötigen die wichtigsten Korrekturen.

Datum: 19.10.2026. App 0.8.2, Branch `main`, untersuchter Commit `ead4b637f1e4e938be62fb05486e33485c1386bb`. Lokal wurde der Produktions-Build geprüft. Die öffentliche Netlify-App lieferte HTTP 200 und identische Hauptdateien; dort wurde zusätzlich Tutorial → Demo-Klasse → Tabelle bedient. Es wurde keine neue App-Version umgesetzt.

## Erledigte Prüfungsschritte

- [x] Quellen und Kosten der drei Skills geprüft; Design Audit und Playwright Interactive lokal installiert, vorhandene Web Design Guidelines geprüft und erhalten.
- [x] **Design Audit einzeln ausgeführt:** Desktop, Tablet, Mobilansichten, leere Zustände, dichte Daten, Bewertung, Abschluss, Verwaltung und Erklärung visuell beurteilt.
- [x] **Web Design Guidelines einzeln ausgeführt:** frische Vercel-Regeln, UI-Code, Formulare, Navigation, Zustände und Fokusführung geprüft.
- [x] **Playwright Interactive einzeln ausgeführt:** tatsächliche Eingaben, Tastatur, Dateien, Fehler, Wiederherstellung und getrennte visuelle Gegenprüfung.
- [x] Fachtests, Typecheck, Lint, Formatprüfung und Produktions-Build erfolgreich.
- [x] Reproduktionsskript für fünf Beobachtungen auf frischen fiktiven Daten ausgeführt.
- [x] Priorisierte Umsetzungsliste mit Dateien, Ursachen und Abnahmekriterien erstellt.

Die Einstufung ist eine begründete Expertenbewertung. Sie ist weder ein Test mit Lehramtsstudierenden noch ein Wirksamkeits- oder vollständiger Barrierefreiheitsnachweis. Ein vergleichbarer früherer Score liegt nicht vor; deshalb gibt es keine erfundene Verbesserungspunktzahl.

## Prüfmaßstab und Bewertung

Preset: `saas-dashboard`, wegen der operativen Klassen- und Bewertungsarbeit. Das bezeichnet den Prüfmaßstab; Gradeflow bleibt lokal ohne Konto und Synchronisierung.

| Bereich | Wert | Einschätzung |
| --- | ---: | --- |
| Arbeitsabläufe und Informationsdichte | 3/5 | Nutzdaten mobil zu spät sichtbar |
| Layout und visuelle Ordnung | 3/5 | Desktop stimmig, mobile Hierarchie schwächer |
| Interaktionen und Zustände | 3/5 | Wichtige Lücken bei Fehlern und Bearbeitung |
| Technische Barrierefreiheit | 4/5 | Gute Grundlagen, Fokuslücken und Prüfgrenzen |
| Frontend-Struktur und Stabilität | 4/5 | Getrennter Fachkern und bestandene Tests |
| Ausarbeitung der Randfälle | 3/5 | Lange Inhalte und Zustandserhalt nacharbeiten |
| Inhalt und fachliche Einordnung | 4/5 | Modell, BA und Datenablage nachvollziehbar erklärt |

Mittelwert: 24/7 = 3,4/5, gerundet. Die Kategorien sind nicht gewichtet. Die drei größten Arbeitsfelder sind Fehlererhalt (B01), mobile Datenhierarchie (B02) und sichtbare Bearbeitungs-/Fehlerrückmeldungen (B03/B05).

## Was bereits trägt

- Desktopregister mit Suche und zehn Klassen ist bedienbar; kleine Displays besitzen eine benannte Klassenwahl.
- Die fünf Bewertungsflächen verändern ihre Geometrie beim Hover nicht. Bedeutungen, erwartetes Ergebnis und Puffer sind lesbar getrennt.
- Nach der letzten erfolgreichen Eingabe erscheint eine eigene Zusammenfassung ohne Bewertungstasten. Der Korrektureinstieg ist ausdrücklich.
- AW, NB und Offen sind in Verlauf und Tabelle voneinander und von der bewerteten 0 unterscheidbar. Die Linie erfindet keine Leistungsdatenpunkte für fehlende Bewertungen.
- Die 15 Tutorialschritte zeigen konkrete Bedienelemente. Reines Weiterklicken funktioniert bei 320, 390, 768 und 1440 Pixeln. 60 Ziel-/Kartengeometrien passten ohne Überdeckung; dabei gab es keinen automatischen Download. Ein kompletter Ablauf mit echten Aktionen und Übungsdownload erhielt eigene Klassen, Entwurf und URL.
- Klassenentwurf, sofortige Speicherung erfolgreicher Eingaben, Wiederaufnahme, Archivierung, Importvalidierung, Rückfallstände und einzelner schreibender Tab funktionieren in den geprüften Szenarien.

## Umsetzungsliste

Die offenen Kästchen bedeuten **noch zu reparieren**, nicht erneut zu prüfen oder erneut freizugeben. P1 betrifft einen wichtigen Fehlerpfad, P2 wiederkehrende Bedienprobleme, P3 Ausarbeitung.

| Aufgabe | Priorität | Bearbeitung |
| --- | --- | --- |
| B01 Ausstehende fehlgeschlagene Bewertung bei Navigation erhalten | P1 | [ ] |
| B02 Mobile Hauptdaten und Bewertungsaktionen früher zeigen | P2 | [ ] |
| B03 Personen-Editor am Auslöser sichtbar öffnen | P2 | [ ] |
| B04 Ungespeicherte Namensänderungen erhalten oder schützen | P2 | [ ] |
| B05 Datei-/Importfehler im sichtbaren Formular zeigen | P2 | [ ] |
| B06 Lange Excel-Titel lesbar machen und nativ gegenprüfen | P2 | [ ] |
| B07 Tabellenpräferenzen erhalten, Seitenziele verlinken | P3 | [ ] |
| B08 Einzelformen und Erklärungssatz korrigieren | P3 | [ ] |

Empfohlene Reihenfolge: zuerst B01 mit einer gezielten Regression absichern. Danach B03/B05 gemeinsam als Fokus- und Rückmeldungsarbeit erledigen. Anschließend B02 auf Grundlage der tatsächlichen Bildschirme überarbeiten, B04 schützen und B06 bis B08 abschließen. Fachregeln, lokale Speicherung und historische Referenzen benötigen dafür keine Neuentwicklung.

## Befunde für die anschließende Bearbeitung

### B01 · P1 · Fehlgeschlagene Bewertung verliert beim Seitenwechsel ihren Wiederholungsauftrag

**Iststand:** Keine Rückfrage. Auswahl bleibt Offen, Wiederholung und Fehler verschwinden. Bereits gespeicherte Beobachtungen bleiben erhalten.

**Nachstellen:** Stunde beginnen und Schreibfehler im Notebook-Speicher simulieren. → Ein Symbol anklicken; Fehler und Eingabe erneut speichern erscheinen. → Datensicherung, dann Meine Klassen und Fortsetzen anklicken.

**Ursache:** onPage und leaveSession verwerfen failedObservation. Nur chooseClass besitzt dafür eine Rückfrage.

**Empfohlene Änderung:** Den ausstehenden Auftrag bei Navigation erhalten oder vor dem Verwerfen gezielt bestätigen lassen. Personen- und Stunden-ID erhalten; keine Erfolgsmeldung auslösen.

**Dateistellen:** [App.tsx:579](../../app/src/App.tsx#L579), [App.tsx:405](../../app/src/App.tsx#L405), [App.tsx:241](../../app/src/App.tsx#L241).

**Bildbelege:** [playwright-speicherfehler-mobil.png](bilder/playwright-speicherfehler-mobil.png), [playwright-speicherfehler-nach-navigation.png](bilder/playwright-speicherfehler-nach-navigation.png).

**Abnahme:**

- [ ] Fehlschlag, Hauptnavigation, Rückweg und Wiederholung speichern genau die ursprünglich betroffene Person.
- [ ] Abgebrochene Navigation erhält Fehler und Wiederholungsauftrag.
- [ ] Direkter Rückweg, Hilfe und Klassenwechsel verwenden denselben Schutz; erfolgreiche Eingaben bleiben wie bisher sofort gespeichert.

**Nachweis/Vertrauen:** B01-Verlust-ausstehender-Eingabe; reproduce.py B01. Vertrauen: hoch.

### B02 · P2 · Mobile Hauptdaten liegen hinter Navigation, Exporten und langen Bedienhinweisen

**Iststand:** Tabelle beginnt bei y=1060 CSS-Pixeln, Diagramm bei y=1165. Nach jedem Ansichtswechsel wird zum Seitenanfang gescrollt. Bei 320 Pixeln bricht Datensicherung mitten im Wort um.

**Nachstellen:** Fiktiven Bestand mit zehn Klassen, 20 Personen und 24 Stunden öffnen. → Bei 390 × 844 Tabelle oder Verlauf wählen.

**Ursache:** Mehrere gleich gewichtete Kopfbereiche und Exportaktionen stehen vor den Nutzdaten; Einstellungen und ausführliche Legenden beanspruchen die erste Ansicht.

**Empfohlene Änderung:** Mobil Klasse und Ansicht kompakt auswählen, Exporte in eine beschriftete Aktionen-Gruppe verschieben und Tabellenoptionen bei Bedarf aufklappen. Fehler und Speicherstatus weiter deutlich anzeigen.

**Dateistellen:** [AppNavigation.tsx:28](../../app/src/components/AppNavigation.tsx#L28), [ClassWorkspace.tsx:342](../../app/src/features/classes/ClassWorkspace.tsx#L342), [ClassTable.tsx:25](../../app/src/features/table/ClassTable.tsx#L25), [App.tsx:147](../../app/src/App.tsx#L147), [styles.css:2298](../../app/src/styles.css#L2298).

**Bildbelege:** [design-390-tabelle-ruhig.png](bilder/design-390-tabelle-ruhig.png), [design-390-bewertung.png](bilder/design-390-bewertung.png), [playwright-fit-320-tabelle.png](bilder/playwright-fit-320-tabelle.png), [playwright-fit-768-tabelle.png](bilder/playwright-fit-768-tabelle.png).

**Abnahme:**

- [ ] Bei 390 × 844 erscheint mindestens die Tabellenkopfzeile und eine Datenzeile ohne vorbereitendes Scrollen.
- [ ] Bewertung zeigt nach dem Einstieg Name, Fortschritt und die fünf Symbole in einem kompakten Arbeitsbereich; AW/NB bleiben leicht erreichbar.
- [ ] 320 Pixel und 200 Prozent Grundschrift behalten lesbare Beschriftungen, sichtbaren Fokus und internes Tabellenscrollen.
- [ ] Desktop-Klassenregister und Fachberechnung bleiben erhalten.

**Nachweis/Vertrauen:** F33; visual-fit.json; reproduce.py B02. Vertrauen: hoch.

### B03 · P2 · Namen bearbeiten öffnet das Eingabefeld unbemerkt unter der gesamten Personenliste

**Iststand:** Der Editor liegt bei y=1871 im 1000 Pixel hohen Desktopfenster. Fokus bleibt auf dem Auslöser, sichtbare Ansicht ändert sich kaum.

**Nachstellen:** Klasse mit 20 Personen öffnen und Personen wählen. → Bei der ersten Person Namen bearbeiten anklicken.

**Ursache:** Ein gemeinsames Formular wird nach der Liste eingefügt; es gibt weder Fokusübergabe noch Scrollen zum Editor.

**Empfohlene Änderung:** Editor direkt bei der gewählten Person öffnen oder einen benannten Dialog verwenden. Feld fokussieren; nach Speichern/Abbrechen zum passenden Auslöser zurückkehren.

**Dateistellen:** [ClassWorkspace.tsx:269](../../app/src/features/classes/ClassWorkspace.tsx#L269), [ClassWorkspace.tsx:285](../../app/src/features/classes/ClassWorkspace.tsx#L285).

**Bildbelege:** [guidelines-personen-editor-unsichtbar.png](bilder/guidelines-personen-editor-unsichtbar.png).

**Abnahme:**

- [ ] Erste, mittlere und letzte Person bei 20 und 45 Personen mit Maus und Tastatur bearbeiten.
- [ ] Editor und gewählter Name sind nach dem Öffnen sichtbar.
- [ ] Speichern bestätigt genau die bearbeitete Person; bisherige Stunden bleiben erhalten.

**Nachweis/Vertrauen:** reproduce.py B03. Vertrauen: hoch.

### B04 · P2 · Ungespeicherte Namensänderungen werden beim Verlassen des Formulars still verworfen

**Iststand:** Der vorherige Name erscheint wieder, ohne Hinweis auf die verworfene Eingabe. Der lokale Entwurfsschutz der Klassenerstellung gilt für dieses Formular nicht.

**Nachstellen:** Klasse bearbeiten und Namen und Zeitraum bearbeiten öffnen. → Klassenname ändern, ohne Änderungen speichern zu drücken. → Datensicherung öffnen und zurück zum Bearbeitungsformular wechseln.

**Ursache:** Nur Komponentenstatus für offene Bearbeitung; Wechsel der Hauptseite entfernt die Komponente.

**Empfohlene Änderung:** Ungespeicherte Änderungen sichtbar kennzeichnen und bis Speichern/Abbrechen erhalten oder beim Verlassen bestätigen lassen. Bestehende bewusst auszulösende Speicherung beibehalten.

**Dateistellen:** [ClassWorkspace.tsx:68](../../app/src/features/classes/ClassWorkspace.tsx#L68), [ClassWorkspace.tsx:172](../../app/src/features/classes/ClassWorkspace.tsx#L172), [App.tsx:579](../../app/src/App.tsx#L579).

**Abnahme:**

- [ ] Änderungen an Name und Zeitraum über Ansichts-/Klassenwechsel und Neuladen gezielt prüfen.
- [ ] Abbrechen stellt bewusst den gespeicherten Stand her; eine unveränderte Maske erzeugt keine unnötige Rückfrage.
- [ ] Personen-Editor in denselben Schutz einbeziehen.

**Nachweis/Vertrauen:** B04-Ungespeicherter-Name-geht-verloren. Vertrauen: hoch.

### B05 · P2 · Importfehler erscheinen außerhalb des sichtbaren Formularbereichs

**Iststand:** Die Datei wird korrekt abgewiesen. Die verständliche Fehlernachricht liegt aber bei y=-328 bis -277 oberhalb des sichtbaren Bereichs. Formular und Schaltfläche zeigen keine direkte Fehlerzuordnung.

**Nachstellen:** Klasse anlegen, Klasse importieren wählen und Namen eingeben. → Einspaltige CSV auswählen, unten Klasse lokal anlegen anklicken.

**Ursache:** Globaler Alert am Anfang des Hauptinhalts; weder Inlinefehler noch Fokus-/Scrollübergabe beim asynchronen Importfehler.

**Empfohlene Änderung:** Dateifehler direkt bei Dateiauswahl und Übernahme anzeigen und zuordnen. Bei mehreren Fehlern eine fokussierte kurze Zusammenfassung verwenden. Eingaben erhalten.

**Dateistellen:** [App.tsx:626](../../app/src/App.tsx#L626), [ClassCreation.tsx:104](../../app/src/features/classes/ClassCreation.tsx#L104), [ClassCreation.tsx:309](../../app/src/features/classes/ClassCreation.tsx#L309).

**Bildbelege:** [guidelines-importfehler-desktop.png](bilder/guidelines-importfehler-desktop.png).

**Abnahme:**

- [ ] Ungültige Spalten, zu viele Personen und nicht lesbare Datei: Grund und nächste Handlung sind bei 390 und 1440 Pixeln sofort sichtbar.
- [ ] Fehler ist programmatisch mit dem passenden Feld verbunden.
- [ ] Bestand und Entwurf bleiben erhalten; gültiger Folgeimport funktioniert.

**Nachweis/Vertrauen:** reproduce.py B05; F45. Vertrauen: hoch.

### B06 · P2 · Lange Personennamen passen nicht in den Excel-Blattkopf

**Iststand:** Im unveränderten Artifact-Tool-Render ist A1 stark abgeschnitten. Vollständiger Name ist in der XLSX gespeichert. A1 hat nur 17 Spalteneinheiten Breite, Zeile 1 feste 28 Punkte Höhe und Textumbruch.

**Nachstellen:** Personenname auf Fiktiv Maximilian Alexander Konstantin Beispielname-Langnamenprüfung ändern. → Excel exportieren und erstes Personenblatt ansehen.

**Ursache:** Festes schmales Titelfeld mit fester Zeilenhöhe berücksichtigt lange Namen nicht.

**Empfohlene Änderung:** Für den Blattkopf einen ausreichend breiten Titelbereich und passende Höhe verwenden; lange Klasse und Zeitraum mitprüfen. Gültige eindeutige Blattnamen und Hyperlinks erhalten.

**Dateistellen:** [excelWorkbook.ts:102](../../app/src/infrastructure/importExport/excelWorkbook.ts#L102), [excelWorkbook.ts:146](../../app/src/infrastructure/importExport/excelWorkbook.ts#L146), [excelWorkbook.ts:180](../../app/src/infrastructure/importExport/excelWorkbook.ts#L180).

**Bildbelege:** [excel-person-lang.png](bilder/excel-person-lang.png), [excel-klasse-lang.png](bilder/excel-klasse-lang.png).

**Abnahme:**

- [ ] Kurze, doppelte und lange fiktive Namen vollständig lesbar in Übersicht und Personenblatt.
- [ ] Unveränderte Exportdatei zusätzlich in nativem Excel öffnen; Link, Rücklink und Datumsanzeige prüfen.
- [ ] Zahlen bleiben Zahlen, Daten bleiben Daten, keine fachlichen Rechenänderungen.

**Nachweis/Vertrauen:** [Unveränderte fiktive XLSX](nachweise/fiktiver-export-lang.xlsx). F39; export-check.json; excel-ooxml.json; native Excel-Bedienung noch offen. Vertrauen: mittel.

### B07 · P3 · Tabellenansicht vergisst Größe und Detailmodus beim Wechsel zum Verlauf

**Iststand:** Kompakt, Normal und 10 Stunden sind wieder eingestellt. Die URL speichert diese Einstellungen nicht. Navigationsziele werden als Buttons ausgegeben.

**Nachstellen:** Tabelle auf Mit Notenverlauf, Groß und Alle Stunden stellen. → Zum Verlauf und zurück zur Tabelle wechseln.

**Ursache:** Ansichtszustand lebt nur im beim Wechsel entfernten ClassTable. Hauptnavigation enthält Aktionen statt verlinkter Seitenziele.

**Empfohlene Änderung:** Tabellenpräferenzen im Arbeitsbereich oder einer validierten URL erhalten. Echte Seitenziele mit Links darstellen, damit Öffnen in neuem Tab und Kopieren des Ziels funktionieren.

**Dateistellen:** [ClassTable.tsx:11](../../app/src/features/table/ClassTable.tsx#L11), [ClassWorkspace.tsx:505](../../app/src/features/classes/ClassWorkspace.tsx#L505), [AppNavigation.tsx:41](../../app/src/components/AppNavigation.tsx#L41).

**Abnahme:**

- [ ] Tabelle/Verlauf/Zurück erhält die gewählte Ansicht je dokumentierter Regel.
- [ ] Ungültige URL-Werte fallen kontrolliert auf Standard zurück.
- [ ] Neue Tabs respektieren weiterhin den einzelnen Schreib-Lock.

**Nachweis/Vertrauen:** B07-Tabellenansicht-setzt-sich-zurueck; reproduce.py B07. Vertrauen: hoch.

### B08 · P3 · Einzelformen und ein Erklärungssatz sind sprachlich ungenau

**Iststand:** Mehrere Stellen sagen 1 Personen bzw. Klasse mit 1 Personen. Erklärung: Mündliche Beiträge bleiben nicht wie eine schriftliche Arbeit vorliegen.

**Nachstellen:** Klasse mit genau einer Person anlegen oder die Tutorialklasse öffnen. → So funktioniert Gradeflow, ersten Begründungsabsatz lesen.

**Ursache:** Anzahl wird ohne Singularform eingesetzt; unbeholfene Satzkonstruktion.

**Empfohlene Änderung:** Anzahlabhängige Einzelformen konsistent ausgeben. Den Satz etwa zu Mündliche Beiträge sind flüchtig. Eine zeitnahe Dokumentation hält deine Einschätzungen fest. vereinfachen.

**Dateistellen:** [App.tsx:213](../../app/src/App.tsx#L213), [ClassWorkspace.tsx:122](../../app/src/features/classes/ClassWorkspace.tsx#L122), [AssessmentWorkspace.tsx:128](../../app/src/features/assessment/AssessmentWorkspace.tsx#L128), [InfoPages.tsx:13](../../app/src/features/help/InfoPages.tsx#L13).

**Bildbelege:** [playwright-eine-person.png](bilder/playwright-eine-person.png), [design-1440-idee.png](bilder/design-1440-idee.png).

**Abnahme:**

- [ ] Eine Person und mehrere Personen in Anlage, Klassenkopf, Abschluss und Tutorial korrekt.
- [ ] Fachliche Grenzen, Modellentscheidungen und BA-Evaluationsgrenzen bleiben vollständig erhalten.

**Nachweis/Vertrauen:** F02; visuelle Sichtung und Quelltext. Vertrauen: hoch.

## Inhaltlicher Abgleich

Die Seiten „So funktioniert Gradeflow“, „Bewertung und Puffer erklärt“ und „Wo sind meine Daten?“ wurden gegen die bestätigten Produktregeln, den Fachcode und die vorhandene [BA-Zuordnung](../ba-abgleich-2026-10-19.md) gelesen. Ergebnis:

- **Gegenstand klar:** Gesamtmitarbeit einer Unterrichtsstunde; keine Einzelwortmeldungen, Prüfungen, Referate oder Präsentationen.
- **Modell korrekt eingeordnet:** Startwert 2,00 ist eine Entscheidung, keine bereits beobachtete Leistung. Symbole sind relative Änderungen. Puffer ist begrenzt; das Gegenbeispiel 1,00/Puffer 1 plus -- ergibt 1,25/Puffer 0 entspricht den Regeln.
- **Korrekturen transparent:** Nachberechnung ändert spätere Rechenstände; ihre ursprünglich gewählten Symbole bleiben bestehen. Der Hinweis, spätere Einschätzungen ebenfalls zu prüfen, ist vorhanden.
- **Datenseite zutreffend:** Profil und Ursprung, lokale Speicherung, keine Kontosynchronisierung, Entwurf versus Klasse, JSON versus lesbare Berichte sowie begrenzter lokaler Rückfall sind erklärt. Die App behauptet keine eigene Verschlüsselung.
- **BA-Grenzen sauber:** Der geplante Usability-Test wird als Planung beschrieben. Technische Tests werden nicht als Nachweis für gerechtere Noten, Motivation oder Unterrichtswirkung ausgegeben.
- **Lesbarkeit verbessern:** B08 korrigiert konkrete Formulierungen. Als spätere kleine Ergänzung können kurze Sprunglinks durch die langen Hilfeseiten führen. Das ist eine Gestaltungsempfehlung, kein nachgewiesener Funktionsfehler.

Die PDF wurde in diesem Audit nicht verändert oder erneut an einen Dienst übertragen. Es gab keine unabhängige Literatur- oder Rechtsprüfung. Die jüngere Entscheidung O16 zu durchgehenden Stundennummern bleibt maßgeblich.

## Prüfergebnis und belastbare Grenzen

- **121 Tests in 21 Dateien bestanden.** Typecheck, Lint, Format und Build bestanden. Die bekannte Buildwarnung betrifft das bei Excel-Aktionen nachgeladene ExcelJS-Paket von rund 941 kB vor Kompression.
- **56 abgeschlossene Funktionsprüfungen** im interaktiven Protokoll nach Bereinigung zweier ersetzter Prüfwerkzeug-Fehlversuche. Drei zusätzliche Einträge dokumentieren bestätigte Mängel B01, B04 und B07; deren PASS bedeutet nur erfolgreiche Reproduktion. F39 bestätigt zunächst den Export; die anschließende Bildprüfung ergibt B06.
- **Fünf Breiten, 15 Datenansichten:** 320/390/768/1024/1440 CSS-Pixel, jeweils Tabelle, Verlauf und Verwaltung. Kein horizontales Überlaufen der gesamten Seite. Interne Scrollflächen sind absichtlich breiter. Diese Messung belegt keine gute Informationshierarchie; B02 bleibt offen.
- **Axe-core 4.14.0:** zehn Zustände ohne automatisch bestätigten Regelverstoß. Manuelle Restprüfungen bleiben insbesondere bei vielen Tabellen-/SVG-Knoten für Kontrast und ARIA-Attribute offen. Daher keine Aussage „WCAG vollständig bestanden“.
- **Großschrift:** 200 Prozent CSS-Grundschrift und sichtbarer Tastaturfokus für alle fünf Symbole sowie AW/NB geprüft. Reduzierte Bewegung im Browser emuliert. Kein echter Betriebssystem- oder Browserzoom.
- **Export:** Bericht mit acht Blättern, 14 Verweiszielen, korrekten gespeicherten Datumsformaten und ohne ausführbare Formeln geprüft. Der unerwünschte Endnoten-Satz fehlt. Größere farbige Symbole und Blattnavigation sind vorhanden. Die native Bedienung der Links und das endgültige Layout in Excel wurden nicht geprüft.
- **Renderergrenze:** Die PNG-Vorschau zeigt Excel-Daten als Serienzahlen. Die unveränderte XLSX weist den betreffenden Zellen korrekt `dd.mm.yyyy` zu. Daraus wird ausdrücklich kein App-Datumsfehler abgeleitet. B06 betrifft den Titelumbruch, nicht diese Datumsdarstellung.
- **Laufzeit:** Chromium 156.0.8078.4 auf diesem Mac, frische isolierte Profile, ausschließlich fiktive Personen. Keine erfassten Seitenfehler in den überwachten Zuständen. Der Live-Kurzablauf hatte keine fehlgeschlagenen Anfragen.
- **Noch offen:** Safari/WebKit, Firefox, echter Windows-PC, echte Mobilgeräte mit Bildschirmtastatur, Screenreader, nativer Excel-Klickablauf und die geplante Untersuchung mit Lehramtsstudierenden. Auch ein umfassender Sicherheits- oder Produktivfreigabenachweis war nicht Gegenstand dieser drei Prüfungen.

## Nachweise und Wiederholung

- [Prüfung 1: Design Audit](01-design-audit.md)
- [Prüfung 2: Web Design Guidelines](02-web-design-guidelines.md)
- [Prüfung 3: Playwright Interactive](03-playwright-interactive.md)
- [Prüfinventar vor den Browserprüfungen](pruefplan.md)
- [Strukturierte Befunde für die Bearbeitung](befunde.json)
- [Skill-Herkunft und lokale Anpassungen](skills.json)
- [Bereinigtes Ergebnisprotokoll](nachweise/ergebnisse.json), [unveränderte Zwischenversuche](nachweise/zwischenversuche.json)
- [Fiktiver Excel-Bericht](nachweise/fiktiver-export.xlsx), [Langnamenprobe](nachweise/fiktiver-export-lang.xlsx), [CSV](nachweise/fiktiver-export.csv)
- [Live-Dateivergleich](nachweise/live-assets.json), [Exportprüfung](nachweise/export-check.json)

`reproduce.py` stellt B01/B02/B03/B05/B07 mit normalen Klicks und Dateiauswahl nach. Nur der Speicherfehler wird gezielt injiziert. Es verwendet neue Profile und erstellt eine fiktive Klasse. Es liest keine vorhandenen Browserprofile. BEOBACHTET heißt, dass der Mangel vorliegt.

```sh
python reproduce.py --base http://127.0.0.1:4190/ --out /tmp/gradeflow-nachpruefung
```

Dafür muss der Produktions-Build lokal auf Port 4190 laufen und das gewählte Python Playwright mit Chromium bereitstellen. Auf dem geprüften Mac funktionierte die kostenlose Umgebung `~/.cache/codex-fact-tools/venv/bin/python`. Nach Reparaturen die jeweiligen Abnahmekriterien erneut prüfen und echte Regressionstests in der bestehenden App-Suite ergänzen.

## Änderungsumfang dieses Auftrags

Installationen liegen lokal unter `~/.codex/skills`. Im Projekt entstehen dieser Berichtsordner und ein Eintrag im Entwicklungsprotokoll. App-Code, Produktversion, Abhängigkeiten, Fachkern, Schema, BA-PDF, `legacy-source/`, `reference/` und der eingefrorene Tag v0.5.0 bleiben erhalten. GitHub-Abschluss und genaue Dateiliste stehen in den Nachweisen. Die eigenen Prüfbrowser und der Prüfserver wurden geschlossen.
