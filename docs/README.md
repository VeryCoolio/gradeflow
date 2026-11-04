# Dokumentation

**Aktuelle Anwendung: Version 1.0.0.** Der Quellcode liegt unter [app/](../app/), die Änderungen einer Version im [Versionsverlauf](../CHANGELOG.md). Datierten Prüfungen und Bildern liegt jeweils der dort genannte damalige App-Stand zugrunde.

## Schnell zum richtigen Dokument

| Gesucht                                           | Einstieg                                                                                                          |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Was kann die aktuelle App, und was wurde geprüft? | [Abnahme 1.0.0](update-1.0.0.md) mit zugehörigen [Nachweisen](update-1.0.0/).                                     |
| Wie starte, prüfe oder baue ich die App?          | [Entwicklungsanleitung](entwicklung.md).                                                                          |
| Welche fachlichen Entscheidungen gelten?          | [Entscheidungen und offene Punkte](07-offene-entscheidungen.md), danach Anforderungen und Bewertungsmodell unten. |
| Was wurde wann geändert?                          | [Entwicklungsprotokoll](entwicklungsprotokoll.md) und [CHANGELOG](../CHANGELOG.md).                               |
| Wo sind Medien und ursprünglicher Auftrag?        | [Archiv](../archive/README.md); die historischen App-Prüfungen bleiben zur Nachvollziehbarkeit hier in `docs/`.   |

## Verbindliche Projektdokumente

Die Reihenfolge aus [AGENTS.md](../AGENTS.md) bleibt erhalten. Bei fachlichen Widersprüchen haben ausdrücklich bestätigte Entscheidungen in Dokument 07 Vorrang.

| Datei                                                                         | Gegenstand                                                                                                  |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [01 – Produktumfang und Anforderungen](01-produktumfang-und-anforderungen.md) | Zweck, Abgrenzung und bestätigte Bedienanforderungen.                                                       |
| [02 – Bewertungsmodell](02-bewertungsmodell.md)                               | Symbole, Viertelschritte, Grenzen, Puffer und Status.                                                       |
| [03 – Technischer Iststand](03-technischer-iststand.md)                       | **Historische Bestandsanalyse der Legacy-App**, keine Beschreibung des heutigen React-/TypeScript-Projekts. |
| [04 – Zielarchitektur](04-zielarchitektur.md)                                 | Schichten, Datenmodell und datierte technische Entscheidungen.                                              |
| [05 – Migrationsplan](05-migrationsplan.md)                                   | Ursprüngliche Meilensteine, Abnahmen und Rückfallstrategie; die Meilensteine sind umgesetzt.                |
| [06 – Testkonzept](06-testkonzept.md)                                         | Technische Prüfung und Abgrenzung zum wissenschaftlichen Usability-Test.                                    |
| [07 – Entscheidungen und offene Punkte](07-offene-entscheidungen.md)          | Verbindliche Fachentscheidungen und spätere Präzisierungen.                                                 |
| [08 – Bezug zur Bachelorarbeit](08-bezug-zur-bachelorarbeit.md)               | Wissenschaftliche Einordnung und Grenzen.                                                                   |

## Formate und Tests

- [Excel-/CSV-Bericht und Abgrenzung zur JSON-Sicherung](csv-exportformat.md).
- [Gezielte technische Abnahme 1.0.0](update-1.0.0.md); wiederholbarer Browserablauf unter [app/e2e/release_1_0.py](../app/e2e/release_1_0.py).
- [Eingefrorene Testanleitung 0.10.0](usability-testversion.md), [zugehörige Testunterlagen](benutzertest-0.10.0/) und [fiktive Testdaten](testdaten/). Diese Erhebungsfassung wird durch spätere App-Änderungen nicht rückwirkend ersetzt.
- [Historische Testanleitung 0.5.0](usability-testversion-0.5.0.md) und [technische Teilprüfung der Barrierefreiheit](barrierefreiheitspruefung.md).

## Historische Entwicklung und Nachweise

Diese Unterlagen bleiben mit Bildern, Rohdaten und alten Dateipfaden erhalten. Sie dokumentieren frühere Entwicklungsstände und erteilen keine neue Implementierungsfreigabe.

| Stand/Thema                              | Bericht und zugehörige Materialien                                                                                                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Oberfläche 0.6 und 0.6.1                 | [Überarbeitung](oberflaechenueberarbeitung-0.6.md), [Bedienkorrekturen](bedienkorrekturen-0.6.1.md).                                                                                  |
| Visuelles Redesign                       | [Bericht](visuelles-redesign.md), [Vergleichsmaterial](visual-redesign/).                                                                                                             |
| Produktrevision 0.7.0                    | [Einstieg und Wiederholung](revision-2026-10-18/README.md), [Abschluss](revision-2026-10-18/umsetzung/abschluss.md).                                                                  |
| Bedienrevision, Erklärung und Tour 0.8.x | [Aufgabenliste](bedienrevision-2026-10-19.md), [BA-Abgleich](ba-abgleich-2026-10-19.md), [Tour-Prüfung](tutorial-ba-2026-10-19.md), [Weiter-Funktion](tutorial-weiter-2026-10-19.md). |
| Audit und Reparaturen 0.9.0              | [Auditmaterial](drei-skill-audit-2026-10-19/), [Reparaturbericht](reparaturen-2026-10-20.md).                                                                                         |
| Personalisierung 0.10.0                  | [Bericht](personalisierung-2026-10-20.md), [Nachweise](personalisierung-2026-10-20/).                                                                                                 |

Die historischen Medienfassungen zeigen ebenfalls Version 0.10.0 und sind gesondert unter [archive/media/](../archive/README.md#medienfassungen) eingeordnet.
