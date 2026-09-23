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

`periodLabel` ist eine frei gewählte Bezeichnung, zum Beispiel `Klasse 8b – 1. Halbjahr 2026/27`. Das Datenmodell erzwingt weder eine feste Laufzeit noch ein Enddatum. Ein Bewertungszeitraum bleibt aktiv, bis die Lehrkraft ihn bewusst archiviert. Dabei darf kein automatischer Noten-Reset stattfinden.

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
