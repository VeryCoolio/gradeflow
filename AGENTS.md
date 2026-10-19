# Arbeitsregeln für Codex

## Projektziel

In diesem Repository wird eine neue, wartbare Version der App „Mündliche Notengebung“ entwickelt. Die App dokumentiert ausschließlich die fortlaufende mündliche Mitarbeit während einer gesamten Unterrichtsstunde. Sie erfasst keine mündlichen Prüfungen, Referate oder Präsentationen.

Die Anwendung unterstützt die Lehrkraft bei Dokumentation und Berechnung. Die pädagogische Bewertung bleibt eine menschliche Entscheidung. Entwickle keine automatische Bewertung von Sprache, Verhalten, Audio, Video oder einzelnen Äußerungen.

## Verbindlicher Kontext

Lies vor einer Planung oder Änderung in dieser Reihenfolge:

1. `docs/01-produktumfang-und-anforderungen.md`
2. `docs/02-bewertungsmodell.md`
3. `docs/03-technischer-iststand.md`
4. `docs/04-zielarchitektur.md`
5. `docs/05-migrationsplan.md`
6. `docs/06-testkonzept.md`
7. `docs/07-offene-entscheidungen.md`
8. `docs/08-bezug-zur-bachelorarbeit.md`

Bei Widersprüchen gilt diese Reihenfolge:

1. ausdrücklich bestätigte Entscheidungen in `docs/07-offene-entscheidungen.md`
2. nummerierte Dokumente in `docs/`
3. vorhandener Code unter `legacy-source/`
4. alte technische Ausarbeitung unter `reference/`

## Arbeitsweise

- Behandle `legacy-source/` als unveränderte Referenz. Bearbeite oder lösche dort keine Datei.
- Lege die neue Anwendung in `app/` an.
- Beginne nicht mit der Implementierung, bevor der in `START_HERE.md` verlangte Prüfbericht erstellt und vom Nutzer freigegeben wurde.
- Unterscheide in Berichten klar zwischen geprüftem Iststand, Entscheidung, Empfehlung und offenem Punkt.
- Erfinde keine fachlichen Regeln. Wenn eine Regel nicht dokumentiert ist, markiere sie als offen.
- Halte Änderungen klein und nachvollziehbar. Erstelle nach jedem Meilenstein einen lauffähigen Stand.
- Halte GitHub nach abgeschlossenen und geprüften Änderungen aktuell: Änderungen prüfen, nachvollziehbar committen und zum eingerichteten Remote pushen. Yannis hat dies am 19.10.2026 dauerhaft autorisiert; keine erneute Freigabe für regulären Commit und Push erforderlich. Prüfe den tatsächlichen Remote-Stand vor dem Abschluss. Bei einem Blocker Ursache und verbleibende Arbeit klar benennen. Geheimnisse, persönliche Daten, Abhängigkeiten und temporäre Dateien ausschließen; fremde Änderungen und historische Stände erhalten. Kein Force-Push oder eigenmächtiges Deployment.
- Führe keine Migration oder Löschung vorhandener Nutzerdaten ohne vorher getestete Rückfallmöglichkeit aus.
- Nutze ausschließlich fiktive Schülerdaten in Tests, Screenshots und Beispieldateien.
- Übernimm keine echten Zugangsdaten. Geheimnisse gehören in lokale Umgebungsvariablen und niemals in das Repository.
- Neue Produktionsabhängigkeiten müssen fachlich begründet werden. Vermeide unnötige Bibliotheken.
- Die Bachelorarbeitsversion arbeitet ausschließlich lokal. Implementiere keine Anmeldung, Supabase-Anbindung oder Cloud-Synchronisierung.
- Speichere jede ausgewählte oder geänderte Beobachtung unmittelbar lokal. Eine unterbrochene Stunde muss beim nächsten Öffnen am zuletzt gespeicherten Stand fortgesetzt werden können.
- Begrenze einen Bewertungszeitraum nicht automatisch auf Halbjahr oder Schuljahr. Die Lehrkraft beendet oder archiviert ihn selbst; ein automatischer Noten-Reset ist nicht vorgesehen.

## Technische Qualitätsregeln

- Trenne Fachlogik, lokale Speicherung, Import/Export und React-Oberfläche.
- Die Notenberechnung muss als reines, frameworkunabhängiges Modul umgesetzt werden.
- Statuswerte wie `bewertet`, `abwesend` und `nicht_beobachtet` müssen im Datenmodell ausdrücklich unterschieden werden. Fehlende Daten dürfen nicht stillschweigend als `0` oder „unverändert“ behandelt werden.
- Jede Änderung einer älteren Stunde muss eine deterministische chronologische Neuberechnung auslösen.
- Geldwerte spielen keine Rolle; Notenwerte dürfen intern als Viertelschritte oder eindeutig kontrollierte Dezimalwerte gespeichert werden. Vermeide unkontrollierte Gleitkommaarithmetik.
- Datenmigrationen brauchen Versionierung, Tests und eine dokumentierte Rückfallstrategie.
- Barrierefreiheit: semantische Elemente, Tastaturbedienung, sichtbarer Fokus, verständliche Beschriftungen und ausreichender Kontrast.
- Mobile, Tablet- und Desktopansicht sind zu prüfen.

## Prüfungen

Nach Änderungen sind mindestens die für den betroffenen Bereich vorgesehenen Prüfungen auszuführen:

- Formatierung und Linting
- Typecheck, falls TypeScript verwendet wird
- Unit-Tests der Fachlogik
- Komponenten- oder Integrationstests der geänderten Bedienabläufe
- Produktions-Build

Melde am Ende exakt:

- geänderte Dateien,
- ausgeführte Prüfungen,
- Ergebnisse,
- verbleibende Risiken oder nicht geprüfte Bereiche.

Ein grüner Build ersetzt keine Fachtests. Ein automatisierter Test ersetzt keinen späteren Usability-Test mit Lehramtsstudierenden.

## Schutz der Bachelorarbeit

- Implementierungsentscheidungen müssen für das spätere technische Kapitel nachvollziehbar dokumentiert werden.
- Pflege nach jedem Meilenstein `docs/entwicklungsprotokoll.md` mit Datum, Problem, Entscheidung, Änderung und Prüfung.
- Der Vorher-nachher-Vergleich muss möglich bleiben. Bestehende Referenzdateien und Screenshots dürfen daher nicht überschrieben werden.
- Behaupte keine pädagogische Wirksamkeit aufgrund technischer oder Usability-Tests.
