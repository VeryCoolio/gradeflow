# Entwicklungsprotokoll

Diese Datei wird ab Beginn der neuen Implementierung fortgeführt.

## Vorlage

### YYYY-MM-DD – Kurztitel

- Ausgangsproblem:
- Ziel:
- Entscheidung:
- Umsetzung:
- Geänderte Dateien:
- Prüfungen:
- Ergebnis:
- Offene Punkte oder Grenzen:

### 2026-09-23 – Meilenstein 1: Fachkern und Stundennummer

- Ausgangsproblem: Der Legacy-Code mischt Berechnung und Oberfläche, verwendet Dezimalwerte und sortiert Stunden am selben Datum ohne fachliche Stundennummer. Der überschüssige Verbesserungsschritt bei `1,25 + ++` geht dort verloren.
- Ziel: Einen unabhängig von React und Speicherung prüfbaren Fachkern für Noten, Puffer, Beobachtungsstatus und chronologische Stundenfolge schaffen.
- Entscheidung: Die neue `lessonSequence` wird pro Klasse und Datum als kleinste freie positive Nummer vergeben. Die Kombination aus Datum und Nummer ist eindeutig; Korrekturen berechnen den gesamten Verlauf neu. React, Vite, striktes TypeScript, Vitest und npm sind bestätigt. Die Benennung von Zwischenwerten bleibt offen; der Fachkern formatiert nur numerische Dezimalwerte.
- Umsetzung: Dokumente 01, 02, 04, 06 und 07 um die Fachentscheidung ergänzt. Unter `app/` ein npm/Vite-Grundgerüst ohne Oberfläche und reine Module für Viertelschritte, Puffer, Status, Stundennummer und Neuberechnung angelegt. `legacy-source/` blieb unverändert.
- Geänderte Dateien: `docs/01-produktumfang-und-anforderungen.md`, `docs/02-bewertungsmodell.md`, `docs/04-zielarchitektur.md`, `docs/06-testkonzept.md`, `docs/07-offene-entscheidungen.md`, `docs/entwicklungsprotokoll.md`; neue Dateien unter `app/` einschließlich `package-lock.json` und drei Testdateien.
- Prüfungen: `npm run typecheck`, `npm test`, `npm run build`, `npm run lint`, `npm run format:check`.
- Ergebnis: 27 Unit-Tests bestanden; Typecheck, Produktions-Build, Lint und Formatprüfung bestanden. Für Vitest und Vite wurde die bereitgestellte Node-Laufzeit verwendet, da die Node-Laufzeit der Codex-App die Rollup-Binärdatei im OneDrive-Verzeichnis wegen einer macOS-Signaturprüfung nicht laden konnte.
- Offene Punkte oder Grenzen: Lokale Speicherung, Migration, Oberfläche, Import/Export und Cloud-Synchronisierung wurden nicht implementiert. Die Zuordnung von `lessonSequence` zu Legacy-Stunden ist Aufgabe von Meilenstein 2; die Benennung der Zwischenwerte bleibt nach Dokument 07 offen.

### 2026-09-23 – Präzisierung zu höchstens zwei Stunden je Datum

- Ausgangsproblem: Die erste Fassung ließ beliebig viele nummerierte Stunden je Klasse und Datum zu.
- Ziel: Höchstens zwei Stunden mit intern konsistenter Nummerierung und sichtbarer Unterscheidung nur bei einer Doppelstunde.
- Entscheidung: Gültig sind nur `1` und `2`. Die erste Stunde trägt intern `1` ohne sichtbare Nummer; die zweite trägt `2`. Ein dritter Eintrag wird abgewiesen. Tausch erfolgt atomar, Löschung normalisiert die verbleibende Stunde auf `1`.
- Umsetzung: Anforderungen, Bewertungsmodell, Zielarchitektur, Migrationsplan, Testkonzept und Entscheidungsprotokoll angepasst. Fachfunktionen für Anzeigeentscheidung, Tausch und Löschung ergänzt; beide Operationen sind mit vollständiger Neuberechnung verknüpft.
- Geänderte Dateien: `docs/01-produktumfang-und-anforderungen.md`, `docs/02-bewertungsmodell.md`, `docs/04-zielarchitektur.md`, `docs/05-migrationsplan.md`, `docs/06-testkonzept.md`, `docs/07-offene-entscheidungen.md`, `docs/entwicklungsprotokoll.md`, `app/src/domain/sessions/lessonSequence.ts`, `app/src/domain/sessions/lessonSequence.test.ts`, `app/src/domain/sessions/recalculate.ts`, `app/src/domain/sessions/recalculate.test.ts`.
- Prüfungen: Typecheck, Unit-Tests, Lint, Formatprüfung und Produktions-Build.
- Ergebnis: Alle Prüfungen bestanden; 30 Unit-Tests grün. Der Fachkern enthält keine Oberfläche oder lokale Speicherung.
- Offene Punkte oder Grenzen: Die Anzeige der Nummer und die Bedienung des Tauschs folgen erst mit der Oberfläche. Legacy-Daten mit mehr als zwei Stunden am selben Datum brauchen in Meilenstein 2 eine verlustfreie Konfliktbehandlung.

### 2026-09-23 – Meilenstein 2: Lokales Datenmodell und Legacy-Migration

- Ausgangsproblem: Die Legacy-App speichert Klassen und offene Entwürfe unter getrennten Schlüsseln; Speicherfehler werden teilweise verschluckt. Das neue Fachmodell benötigt ausdrückliche Beobachtungsstatus und die Zwei-Stunden-Grenze.
- Ziel: Versioniertes und validiertes lokales Datenmodell, sofortiges Speichern einzelner Beobachtungen, Wiederherstellung unvollständiger Stunden und eine Migration mit getesteter Rückfallmöglichkeit.
- Entscheidung: JSON-Schema Version 1 und Laufzeitvalidierung; lokale Schreibvorgänge ohne Verzögerung über `LocalRepository`. Vor automatischer Migration werden beide unveränderten Legacy-Rohwerte gemeinsam gesichert. Legacy-Stunden werden je Datum nach Erstellungszeit und ID auf `1` und `2` abgebildet; ein offener Entwurf wird als unvollständige Stunde übernommen. Mehr als zwei Legacy-Stunden am selben Datum und nicht übertragbare Werte stoppen die Migration ohne Kürzung. Die Legacy-Schlüssel bleiben bestehen.
- Umsetzung: `schema.ts`, `notebook-v1.schema.json`, `localRepository.ts` und reine Migration `legacyV4.ts` mit Tests ergänzt. Schreiben einer Beobachtung, Anlegen, atomarer Tausch und Löschen einer Stunde sichern jeweils einen vollständig validierten Notebook-Zustand. Die Wiederherstellung der alten Schlüssel aus der Migrationssicherung ist als Methode und Test vorhanden. `docs/04-zielarchitektur.md` und `docs/05-migrationsplan.md` aktualisiert.
- Geänderte Dateien: `app/src/domain/sessions/types.ts`, dessen vorhandene Testdateien, `app/src/infrastructure/local/schema.ts`, `app/src/infrastructure/local/notebook-v1.schema.json`, `app/src/infrastructure/local/localRepository.ts`, `app/src/infrastructure/local/localRepository.test.ts`, `app/src/infrastructure/local/migrations/legacyV4.ts`, `app/src/infrastructure/local/migrations/legacyV4.test.ts`, `docs/04-zielarchitektur.md`, `docs/05-migrationsplan.md`, `docs/entwicklungsprotokoll.md`.
- Prüfungen: Typecheck, Unit-Tests, Lint, Formatprüfung und Produktions-Build.
- Ergebnis: Alle Prüfungen bestanden; 47 Unit-Tests grün. Tests decken Migration, Konflikte, Sicherung vor Migration, Rückfall, sofortige lokale Speicherung, Neuladen einer unvollständigen Stunde, Klassenunabhängigkeit und Speicherfehler ab. `legacy-source/` blieb unverändert.
- Offene Punkte oder Grenzen: Es gibt noch keine Oberfläche und keinen Dateiimport oder JSON-Dateiexport. Die Rückfallmethode ist deshalb nur programmatisch verfügbar. `localStorage` ist an den Browser-Ursprung gebunden und kann durch Profilbereinigung, Quotenprobleme oder Geräteverlust ausfallen; Sicherung und Notebook liegen derzeit im selben Browser-Speicher. Für echte Schülerdaten fehlt weiterhin eine Datenschutz- und Betriebsprüfung. Ein Herkunftswechsel der App benötigt eine gesonderte Übertragung der Legacy-Rohwerte.

### 2026-09-23 – Meilenstein 3: Kernoberfläche

- Ausgangsproblem: Fachkern und lokale Speicherung waren nur programmatisch nutzbar. Lehrkräfte konnten weder Klassen importieren noch eine laufende Stunde in der neuen App bedienen.
- Ziel: Eine lokal nutzbare Kernoberfläche für Klassen, frei benannte Bewertungszeiträume und sofort gespeicherte Einzelbeobachtungen bereitstellen.
- Entscheidung: CSV/TXT ohne Kopfzeile mit einem Namen je Zeile oder zwei Namensspalten; maximal 45 Personen. Die Oberfläche verwendet bestehendes Notebook und Repository, rechnet Noten ausschließlich im Fachkern und zeigt eine Stundennummer nur bei zwei Stunden desselben Datums. Eine laufende Stunde darf nur nach Bestätigung verworfen werden. Für Komponenten- und Bedienablauftests werden React Testing Library, User Event und jsdom als Entwicklungsabhängigkeiten verwendet. Vitest wurde wegen einer gemeldeten Schwachstelle in seiner Entwicklungskette auf Version 5 aktualisiert.
- Umsetzung: React-Einstieg, responsive Klassen- und Stundenerfassung, Importparser und Anwendungsdienst für Klassen ergänzt. Klassen können ausgewählt, benannt und archiviert werden. Jede Auswahl von Bewertung, Abwesenheit oder Nichtbeobachtung schreibt sofort über `LocalRepository`; nach Neuladen wird die jüngste unvollständige Stunde mit der ersten noch offenen Person fortgesetzt. Doppelklickschutz verhindert doppelte Stunden und die versehentliche Bewertung der nächsten Person. Fehler beim Speichern bleiben sichtbar, ohne den angezeigten Stand vorzutäuschen.
- Geänderte Dateien: `app/src/App.tsx`, `app/src/App.test.tsx`, `app/src/styles.css`, `app/src/main.tsx` (ersetzt `main.ts`), `app/src/application/classService.ts` samt Test, `app/src/infrastructure/importExport/classImport.ts` samt Test, `app/index.html`, `app/tsconfig.json`, `app/vite.config.ts`, `app/eslint.config.js`, `app/package.json`, `app/package-lock.json`, `README.md`, `CHANGELOG.md`, `docs/entwicklungsprotokoll.md`. `legacy-source/` blieb unverändert.
- Prüfungen: Typecheck, 58 Unit- und Integrationstests, Lint, Formatprüfung und Produktions-Build bestanden. Manuell im Browser geprüft: Klassenimport mit fiktiven Namen, Stundenerfassung, Speichern und Wiederaufnahme nach Neuladen; Desktop-Ansicht sowie Layoutbreiten auf Smartphone und Tablet ohne horizontales Überlaufen. `npm audit` meldete nach der Vitest-Aktualisierung keine bekannten Schwachstellen.
- Ergebnis: Meilenstein 3 ist als lokale Kernoberfläche lauffähig. Die Stundenerfassung benötigt keinen globalen Speicherschritt; der Bewertungszeitraum hat weder ein automatisches Enddatum noch einen Reset.
- Offene Punkte oder Grenzen: Tabelle, Verlauf, Bearbeitung älterer Stunden, Export und grafische Darstellung folgen in Meilenstein 4. Der Rückfall aus einer Legacy-Migrationssicherung ist noch nicht als Bedienablauf verfügbar. Lokale Daten und Sicherung liegen weiterhin im selben Browser-Speicher; für echte Schülerdaten fehlt eine Datenschutz- und Betriebsprüfung. Ein Usability-Test mit Lehramtsstudierenden steht aus.
