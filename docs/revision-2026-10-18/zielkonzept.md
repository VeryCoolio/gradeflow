# Zielkonzept zur Freigabe – 18.10.2026

Status: Vorschlag. Keine Umsetzung in `app/`. Die [Ansichtsskizze](ansichtsskizze.html) zeigt die vorgeschlagene Hierarchie mit denselben 20 fiktiven Namen wie die Ausgangsprüfung.

## Aufgabe und Gestaltungsentscheidung

Eine Lehrkraft muss eine Einschätzung für die richtige Person erfassen, die Speicherung erkennen und nach einer Unterbrechung dieselbe Arbeit wiederfinden. Deshalb bildet die Stunde einen zusammenhängenden Arbeitsbereich: Klasse und Datum, aktuelle Person, Bezugsstand, fünf Ergebnisse, zwei unbewertete Status und Speicherzustand stehen in unmittelbarer Nähe.

Die vorhandene zurückhaltende violette Orientierung und die Rot-/Grünabstufungen bleiben sinnvoll. Eine weitere reine Farbänderung würde die gemessenen Probleme nicht lösen. Der Umbau verändert deshalb Informationsreihenfolge, Navigation, Fokus und Zustandsführung. Die bestätigte relative Berechnung bleibt vollständig erhalten.

## Gestaltung vor der Ausarbeitung

| Eigenschaft          | Festlegung                                                                                      | Zweck                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Grundfläche          | `#f6f5f8`                                                                                       | Ruhiger Hintergrund                                               |
| Arbeitsfläche        | `#ffffff`                                                                                       | Eine zusammenhängende Eingabefläche                               |
| Text                 | `#242238`                                                                                       | Lesbare Namen und Ergebnisse                                      |
| Zusatztext           | `#615d70`                                                                                       | Puffer, Zeitraum und ergänzende Hinweise                          |
| Orientierung         | `#5b477e`                                                                                       | Aktive Klasse und aktueller Arbeitsbereich                        |
| Bewertungsrichtungen | Text `#2c644c` / `#8b3440`, helle abgestufte Flächen                                            | Bestätigte Symbolrichtungen zusätzlich zum Text                   |
| Schrift              | Vorhandene System-Sans; aktuelle Person mit vorhandener System-Serif; gleichmäßige Notenziffern | Keine Downloads; Name und Ergebnis klar voneinander unterscheiden |
| Abstände             | 4/8/12/16/24 px; Bedienelemente mindestens 44 px hoch                                           | Ruhige, auf Touch bedienbare Arbeitsfläche                        |
| Bewegung             | Keine zeitlich nötige Animation; `prefers-reduced-motion` beachten                              | Eingaben bleiben sofort bedienbar                                 |

**Entwurfsprüfung:** Eine generische Startseite mit großen Kennzahlen und gleich gewichteten Karten würde die Eingabe weiter nach unten schieben. Gewählt wird stattdessen eine kompakte Arbeitsleiste und eine dominante Personenansicht. Keine dekorativen Kennzahlen und kein neuer Kriterienkatalog. Die linke Personenliste dient auf großen Displays der direkten Auswahl; auf kleinen Displays folgt sie der Eingabe und verdrängt diese nicht.

```text
Smartphone                           Desktop / Tablet mit genügend Platz
Gradeflow                            Gradeflow | Klassen | Anlegen | Sicherung | Hilfe
Klassen | Anlegen                    Klasse / Zeitraum
Sicherung | Bewertungshilfe          Datum / Fortschritt / Speicherzustand
Klasse / Datum / Fortschritt         ┌ Personen ┐  Aktuelle Person / Bezugsstand
Aktuelle Person / Bezugsstand        │ Ada  +   │  --   -   0   +   ++
-- Bedeutung | Ergebnis / Puffer     │ Bea offen│  Bedeutung / Ergebnis / Puffer
-  Bedeutung | Ergebnis / Puffer     │ ...      │  Abwesend | Nicht beobachtet
0  Bedeutung | Ergebnis / Puffer     └─────────┘  Speicherzustand / letzter Eintrag
+  Bedeutung | Ergebnis / Puffer
++ Bedeutung | Ergebnis / Puffer
Abwesend | Nicht beobachtet
Speicherzustand / letzter Eintrag
Person wählen / Zur Klasse
```

Die Skizze zeigt eine Standardansicht. Lange Namen und vergrößerte Schrift dürfen die Fläche verlängern. Dann bleibt ein kompakter Kontext mit Person und Stunde sichtbar; er darf weder fokussierte Schaltflächen noch Fehlermeldungen überdecken. Ein fester Höhenzwang mit abgeschnittenen Texten ist ausgeschlossen.

## Zusammenhängende Abläufe

1. **Klasse:** Klassenkontext und „Stunde beginnen“ beziehungsweise eine ausdrücklich bezeichnete offene Stunde erhalten Vorrang. Export und Bearbeitung bleiben direkt erreichbar, bekommen aber keine stärkere Primärgestaltung als die Unterrichtseingabe. Die vier Hauptbereiche bleiben auf jeder Bildschirmbreite sichtbar und brauchen kein Aufklappen.
2. **Bewertung:** Name, Stunde, Stand vor der Stunde und Fortschritt stehen vor den fünf Symbolen. Die Auswahl speichert wie bisher unmittelbar. Erst nach erfolgreicher Speicherung folgt die nächste offene Person. „Fiktiv Ada: + gespeichert“ benennt den gerade gespeicherten Eintrag, während „Fiktiv Bea“ die nächste Person bezeichnet. Keine zusätzliche globale Speicherschaltfläche.
3. **Unterbrechung und Rückkehr:** Stabile Klassen-, Stunden- und Personen-ID sowie Klassenansicht werden als lokale Arbeitsposition gespeichert. Ein Neuladen einer älteren offenen Stunde führt wieder dorthin. Bei gelöschten/archivierten Zielen erfolgt eine erklärende Rückkehr zur Klasse. Die Auswahl einer Klasse darf keine Beobachtungen schreiben oder ersetzen. Ansichten sollen über Browser-Zurück wieder erreichbar sein; ein kleiner lokaler Navigationsbaustein genügt.
4. **Fehler und Abschluss:** Ein Speicherfehler steht beim Bewertungsfeld, benennt die betroffene Person und erlaubt erneutes Speichern. Name und Fortschritt wechseln nicht. Nach der letzten erfolgreichen Eingabe erscheint die bestehende Abschlussbestätigung mit eindeutigem Fokus und Rückweg. Verweigerter Speicherzugriff beim Start führt zu einer verständlichen Fehleransicht.
5. **Auswertung und Sicherung:** Kompakte Stundentabelle, Fenster 10/20/alle, gemeinsamer Diagrammmaßstab und explizite AW/NB/Offen bleiben. Die Verlaufstabelle erhält einen benannten Tastaturzugang zum Scrollen. Der JSON-Import erhält eine Größenprüfung vor dem Lesen, eine verständliche Zusammenfassung und einen gesicherten Rückfall. Excel und CSV bleiben lesbare Berichte.

## Vorgeschlagene Texte

Professional Proofreader wurde für diese tatsächlich geprüften Passagen angewandt. Das sind Änderungsvorschläge, keine bereits geänderten Produkttexte.

| Heute                                                        | Vorschlag                                                                         | Grund                                                                                                                    |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| „Lokales Speichern fehlgeschlagen: oral-grading-notebook-v1“ | „Die Eingabe für Fiktiv Ada wurde nicht gespeichert. Versuche es erneut.“         | Betroffene Handlung und nächster Schritt statt Speicherschlüssel; Ursache bei bekannter Quoten-/Zugriffsstörung ergänzen |
| „Fiktiv Ada: lokal gespeichert.“                             | „Fiktiv Ada: + gespeichert.“                                                      | Person und ausgewählten Status zusammen bestätigen                                                                       |
| „Auf diesem Gerät gespeichert · ohne Cloud“                  | „Lokal in diesem Browser gespeichert“ mit Sicherungshinweis im Sicherungsbereich  | Browser-/Ursprungsbindung präzisieren, keine Verschlüsselung behaupten                                                   |
| „Keine Bewertung“ in Ergebniszellen                          | Als Ergebnis weiterhin „Keine Bewertung“; Status daneben ausdrücklich AW/NB/Offen | Die fachliche Unterscheidung bleibt erhalten                                                                             |
| „Gewählter Status“                                           | Beibehalten, kompakt neben der Person                                             | Eindeutiger Bezug auf die ausgewählte Stunde                                                                             |

## Ziel-Dateibaum

Vorhandene Module bleiben die Grundlage. Dateien werden nach tatsächlicher Zuständigkeit herausgelöst; keine zusätzliche Produktionsbibliothek und kein neues Fachmodell sind geplant.

```text
app/src/
  App.tsx                            Zusammensetzen der Bereiche
  application/
    classService.ts                  Vorhandene Klassenoperationen
    notebookActions.ts               Einheitliche fachliche Schreibvorgänge
    reporting.ts                     Vollständiger Fachbericht; Datumsindex
    observationPresentation.ts       Gemeinsame Status-/Stundenbeschriftungen
  domain/                            Geprüfter Fachkern bleibt erhalten
  infrastructure/
    local/
      localRepository.ts             Validierung, Speicherung, Rückfall
      notebookCoordinator.ts         Lokaler Schreibschutz / Zweit-Tab-Koordination
      workspacePosition.ts           Getrennte Arbeitsposition, keine Notenwerte
      schema.ts                      Validierung einschließlich sicherer ID-Nutzung
      migrations/                    Vorhandene Migration mit Rückfalltests
    importExport/
      classImport.ts                 CSV/TXT/XLSX-Eingangsgrenze
      jsonBackup.ts                  Begrenztes Lesen und Vorschau
      csvExport.ts / excelWorkbook.ts Vorhandene Berichte
  features/
    assessment/AssessmentWorkspace.tsx
    classes/ClassWorkspace.tsx
    backup/BackupPanel.tsx
    history/StudentHistory.tsx
    table/ClassTable.tsx
  components/
    AppNavigation.tsx / StorageFeedback.tsx
  styles.css                         Vorhandene Tokens; aufgabenbezogene Regeln
app/e2e/
  revision.spec.*                    Reproduzierbare Browserregressionen
```

**Schreibschutz:** Die Umsetzung muss das belegte Überschreiben durch einen zweiten Tab verhindern. Bevorzugt wird ein eindeutiger Schreibberechtigter pro Ursprung und ein sichtbarer, aktualisierter Zweit-Tab. Ein bestehender Stand darf nie aus einem veralteten React-Snapshot ersetzt werden. Unterstützung und Rückfall für die tatsächlich verfügbaren Browser werden geprüft; `storage`-Ereignisse allein gelten nicht als atomarer Schreibschutz. Ein Wechsel auf IndexedDB oder eine neue Bibliothek ist ohne zusätzlichen nachgewiesenen Bedarf nicht vorgesehen.

**Importumfang:** Als technische Ausgangsentscheidung werden maximal 5 MiB je Importdatei vorgeschlagen, passend zur vorhandenen Klassenlistenbegrenzung. Die tatsächlich verfügbare Browser-Speicherkapazität ist zusätzlich zu behandeln. Diese Grenze gilt für eine Datei, nicht für die Dauer eines Bewertungszeitraums. Historische Klassen werden weder automatisch beendet noch gekürzt. Größere bereits gültige Datenbestände werden nicht gelöscht; für sie muss eine klare Fehlermeldung beziehungsweise verlustfreie Übertragung vorgesehen werden. XLSX-Entpackung braucht zusätzlich eine begründete Ressourcenbegrenzung; ein Limit nur der komprimierten Datei reicht dafür als Nachweis nicht aus.

## Abnahme des Zielbilds

Mit denselben fiktiven Daten bei 390×844, 768×1024 und 1440×1000:

- Bei Auswahl eines Symbols bleiben Person, Stunde und Fortschritt sichtbar. Nach automatischem Personenwechsel ist der neue Name sichtbar. Ein Speicherfehler bleibt bei den bedienten Schaltflächen sichtbar. Lange Namen, 200 % Schrift und Tastaturfokus werden zusätzlich geprüft.
- Vom Fokus auf dem Stundeninhalt sind höchstens drei Tab-Schritte bis zum ersten Bewertungssymbol nötig. Alle Personen sind per Tastatur auswählbar; die Abschlussaktion erhält weiterhin den Fokus. Die Zahl ist ein Abnahmeziel, noch kein Messergebnis.
- Zwei Tabs dürfen keine schon gespeicherte Stunde durch Klassenauswahl, Umbenennung oder Archivierung verlieren. Die letzte tatsächlich bearbeitete Stunde bleibt nach Neuladen dieselbe, auch bei mehreren offenen Stunden.
- Alle bisherigen Berechnungs-, Status-, Tausch-, Fenster-, Datei- und Rückfallprüfungen bestehen. Pro Meilenstein erfolgen die fünf geforderten npm-Prüfungen und betroffene Browserabläufe.
- Der Vergleich wird mit den vorhandenen Prüfskripten und Ausgangsbildern wiederholt. Eine technische Verbesserung ersetzt keinen Usability-Test mit Lehramtsstudierenden.
