# Zielarchitektur

## 1. Ziel

Die neue App soll dieselbe Kernidee in einer testbaren und nachvollziehbaren Struktur abbilden. Der Neubau erfolgt neben der alten Version, damit der Vorher-nachher-Vergleich erhalten bleibt.

## 2. Empfohlener technischer Rahmen

Die folgende Auswahl ist eine technische Empfehlung und vor dem ersten Scaffold zu bestätigen:

- React und Vite,
- TypeScript mit strikter Konfiguration,
- Vitest für Fach- und Integrationstests,
- React Testing Library für Bedienabläufe auf Komponentenebene,
- Playwright nur für wenige zentrale End-to-End-Abläufe,
- lokale Speicherung über einen klar gekapselten Adapter,
- PWA erst nach stabilem Kern ergänzen,
- native Verpackungen erst nach erfolgreicher Web- und Usability-Phase.

Die Bachelorarbeitsversion arbeitet ausschließlich lokal. Eine Anmeldung, Supabase-Anbindung oder sonstige Cloud-Synchronisierung wird in dieser Neufassung nicht umgesetzt.

## 3. Vorgeschlagener Dateibaum

```text
app/
  src/
    domain/
      grading/
        gradingEngine.ts
        gradingEngine.test.ts
        gradeFormat.ts
        types.ts
      classes/
        types.ts
      sessions/
        lessonSequence.ts
        lessonSequence.test.ts
        recalculate.ts
        recalculate.test.ts
    application/
      classService.ts
      sessionService.ts
      backupService.ts
    infrastructure/
      local/
        localRepository.ts
        localRepository.test.ts
        schema.ts
        notebook-v1.schema.json
        migrations/
          legacyV4.ts
          legacyV4.test.ts
      importExport/
        csvImport.ts
        csvExport.ts
        jsonBackup.ts
    features/
      classes/
      assessment/
      table/
      history/
      settings/
    components/
    styles/
    test/
    App.tsx
    main.tsx
  e2e/
  public/
  package.json
  vite.config.ts
```

## 4. Fachliches Datenmodell

```text
Notebook
  schemaVersion
  classes[]

ClassGroup
  id
  name
  periodLabel
  archived
  students[]
  sessions[]

Student
  id
  displayName
  startGradeQuarterSteps

LessonSession
  id
  date
  lessonSequence
  createdAt
  updatedAt
  observations: Record<studentId, Observation>

Observation
  status: bewertet | abwesend | nicht_beobachtet
  symbol?: -- | - | 0 | + | ++
  note?: string
```

Berechnete aktuelle Note, Puffer und Verlauf sollen grundsätzlich aus Startwert und Sitzungen ableitbar bleiben. Falls berechnete Werte aus Leistungsgründen gespeichert werden, gelten sie nur als Cache und müssen jederzeit reproduzierbar sein.

Eine laufende Stunde darf eine unvollständige Liste von Beobachtungen enthalten. Jede neu ausgewählte oder geänderte Beobachtung wird unmittelbar über das lokale Repository gespeichert. Beim erneuten Öffnen wird dieser Stand wiederhergestellt. Der Bearbeitungsfortschritt wird aus der Zahl der vorhandenen Beobachtungen abgeleitet; sobald für jede Person ein Status vorliegt, ist die Stunde vollständig erfasst.

Pro Klasse und Datum sind höchstens zwei Sitzungen erlaubt. Bei der ersten wird intern `lessonSequence = 1`, bei der zweiten `lessonSequence = 2` vergeben. Ein dritter Eintrag wird mit verständlicher Fehlermeldung abgewiesen. Ausschließlich `1` und `2` sind gültig; Datum und Nummer bilden je Klasse einen eindeutigen Schlüssel. Die Oberfläche zeigt die Nummer nur bei zwei Sitzungen desselben Datums. Zur Korrektur werden die beiden Nummern in einem Zustandswechsel atomar getauscht. Nach dem Löschen einer von zwei Sitzungen wird die verbleibende auf `1` normalisiert und ihre Nummer verborgen; eine später angelegte zweite Sitzung erhält `2`. Tausch und Löschung lösen jeweils eine vollständige Neuberechnung nach Datum, `lessonSequence` und stabiler Sitzungs-ID aus.

`periodLabel` ist eine frei änderbare, beim Anlegen mit einem Schuljahr vorbelegte Bezeichnung, zum Beispiel `Klasse 8b – 1. Halbjahr 2026/27`. Das Datenmodell erzwingt weder eine feste Laufzeit noch ein Enddatum. Ein Bewertungszeitraum bleibt aktiv, bis die Lehrkraft ihn bewusst archiviert. Dabei darf kein automatischer Noten-Reset stattfinden.

## 5. Zuständigkeiten

### Domain

- kennt keine React-Komponenten,
- kennt weder Browser-Storage noch Supabase,
- berechnet Note, Puffer und Verlauf deterministisch,
- validiert fachliche Zustände.

### Application

- steuert Anwendungsfälle,
- erzeugt und bearbeitet Klassen und Stunden,
- ruft Domain und Repository-Schnittstellen auf.

### Infrastructure

- importiert und exportiert Dateien,
- speichert lokal,
- migriert alte Datenversionen.

### UI

- zeigt Zustände an und sammelt Eingaben,
- enthält keine eigene Notenberechnung,
- behandelt Laden, Fehler, Offlinebetrieb und Konflikte sichtbar.

## 6. Datenschutz und Betrieb

Die technische Neufassung allein macht die App nicht automatisch bereit für echte Schülerdaten. Vor einem produktiven Schuleinsatz sind unter anderem Rechtsgrundlage, Verantwortlichkeit, Löschkonzept, Zugriffsregeln und Schutz der lokalen Daten gesondert zu prüfen. Dafür liegt in diesem Paket keine abschließende rechtliche Bewertung vor.

## 7. Oberflächenüberarbeitung 0.6.0

- `features/classes/ClassCreation.tsx`: manuelle Klassenerstellung und zweispaltiger Dateiimport in einem klaren Ablauf.
- `features/assessment/RatingGuide.tsx`: sichtbar erklärte Bedeutung und Grenzen des Modells. Reine Anzeigemetadaten liegen in `application/ratingGuide.ts`.
- `application/schoolYear.ts`: Vorschlag einer Bezeichnung; kein zeitlicher Eingriff in gespeicherte Klassen. Der technische Vorschlag wechselt am 1. August, die Bezeichnung bleibt manuell änderbar. Das ist keine Aussage über landesspezifische Unterrichtstermine.
- `infrastructure/importExport/excelWorkbook.ts`: echte XLSX-Dateien mit ExcelJS 4.4.0 ([offizielle Dokumentation](https://github.com/exceljs/exceljs#readme)). **Technische Entscheidung:** Eine zusätzliche Produktionsabhängigkeit ist für das verlangte mehrblättrige Excel-Format und dessen lokalen Import begründet. Sie wird erst bei Excel-Import oder -Export geladen. CSV und JSON bleiben eigenständige Formate.
- npm-Override auf `uuid` 11.1.1 und Aktualisierung von `source-map-js` beheben konkret gemeldete Audit-Befunde; XLSX-Erzeugung und -Einlesen sind mit diesen Versionen getestet.
- Das Notebook-Schema bleibt Version 1. Bestehende Klassen, Zeitraumnamen, IDs und Beobachtungen werden nicht automatisch verändert. Neue Demo-Klassen enthalten 20 fiktive Namen; vorhandene Demo-Klassen bleiben erhalten.
- Die Datumsachse entsteht aus allen sortierten Klassensitzungen. Leistungsdatenpunkte entstehen ausschließlich bei `bewertet`; unbewertete Stunden bleiben in der Tabelle und durch Achsenmarker zugänglich.

## 8. Bedienkorrekturen 0.6.1

- `RatingGuide.tsx` nutzt die ausdrücklich geordnete Symbolfolge statt der Objektschlüsselreihenfolge. Diese hatte die numerische Zeichenkette `0` vor die übrigen Schlüssel gesetzt.
- `features/presentation.ts` liefert eindeutige Kurztexte und Eingabezahlen für die Darstellung; gespeichert werden weiterhin die bisherigen Statuswerte.
- `ClassTable.tsx` hält Kompakt-/Detailansicht, Tabellengröße und Stundenfenster als reine Ansichtszustände. Standard: zehn neueste Stunden; umschaltbar auf 20 oder alle, mit Navigation zu älteren/neueren Fenstern. Die Berechnung erhält immer den vollständigen Klassenbericht. Fixierte Namen, Spaltenköpfe und Gesamtstände erleichtern das Scrollen.
- `StudentHistory.tsx` verwendet 112 SVG-Einheiten pro Unterrichtsstunde. Zusätzliche Stunden vergrößern die scrollbare Zeichnung, ohne vorhandene Abstände zu verändern. `AW`, `NB` und `Offen` ersetzen die gleichen unbewerteten Quadratmarker.
- `App.tsx` sortiert die Stundenliste nach Datum absteigend, innerhalb eines Datums nach Nummer aufsteigend. Der fachliche Verlauf bleibt insgesamt aufsteigend. Tausch erfolgt weiterhin atomar über das Repository; sichtbare Zusammenfassungen, Personenauszug und Erfolgshinweis zeigen die Veränderung. Fehler setzen keinen Erfolgshinweis.
- Keine neue Abhängigkeit, Schemaänderung oder Migration.
