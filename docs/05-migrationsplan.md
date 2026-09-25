# Migrations- und Umsetzungsplan

## Grundsatz

Die alte Version bleibt unverändert erhalten. Die neue Anwendung entsteht unter `app/`. Jeder Meilenstein muss einen prüfbaren Zwischenstand liefern. Erst nach fachlicher Freigabe wird der nächste Meilenstein begonnen.

## Phase 0 – Prüfung und Entscheidungen

Ergebnis:

- Codex-Prüfbericht aus `START_HERE.md`,
- berücksichtigte Entscheidungen aus `07-offene-entscheidungen.md`,
- festgelegter Zielstack,
- dokumentierte Abnahmekriterien.

Noch keine neue Benutzeroberfläche.

## Phase 1 – Fachlicher Kern

Umfang:

- Typen für Note, Symbol, Puffer und Beobachtungsstatus,
- reine Berechnungsfunktion,
- Formatierung der Notenanzeige,
- chronologische Neuberechnung,
- vollständige Unit-Tests einschließlich Randfällen.

Abnahme:

- alle bestätigten Beispiele aus `02-bewertungsmodell.md` bestehen,
- Abwesenheit und Nichtbeobachtung verändern den Stand nicht,
- identische Eingabedaten liefern immer identische Ergebnisse,
- keine React- oder Speicherabhängigkeit im Fachkern.

## Phase 2 – Lokales Datenmodell und Migration

Umfang:

- versioniertes JSON-Schema,
- lokale Repository-Schnittstelle,
- Import alter Zustände aus `oral-grading-app-v4`,
- unmittelbare lokale Speicherung jeder einzelnen Beobachtung,
- Wiederherstellung einer unterbrochenen Stunde am zuletzt gespeicherten Stand,
- Validierung und verständliche Fehlermeldungen,
- Backup vor jeder automatischen Migration.

Abnahme:

- repräsentative Legacy-Daten werden ohne Verlust bestätigter Informationen übernommen,
- Legacy-Daten mit mehr als zwei Stunden am selben Datum werden nicht stillschweigend gekürzt oder umnummeriert; ihr Migrationskonflikt bleibt mit gesichertem Ausgangsstand sichtbar,
- Migration ist wiederholbar,
- eine gespeicherte Eingabe bleibt nach Neuladen der Anwendung erhalten,
- eine unvollständige Stunde kann ohne Verlust der bisherigen Einträge fortgesetzt werden,
- beschädigte Dateien überschreiben keinen funktionierenden Stand,
- Rückfall auf Backup ist dokumentiert und getestet.

Technischer Rückfallstand für Meilenstein 2: Vor einem automatischen Schreiben in `oral-grading-notebook-v1` werden die unveränderten Rohwerte aus `oral-grading-app-v4` und `oral-grading-session-drafts-v1` gemeinsam unter `oral-grading-migration-backup-v1` gesichert. Die Legacy-Schlüssel werden bei der Migration nicht gelöscht. Ein fehlerhafter oder mit der Sicherung nicht mehr übereinstimmender Quellstand stoppt die Migration, ohne den neuen Stand zu überschreiben. `LocalRepository.restoreLegacyBackup()` kann die ursprünglichen Legacy-Schlüssel aus der Sicherung wiederherstellen; dieser Rückfall ist mit fiktiven Daten getestet. Das neue Schema wird dabei nicht automatisch entfernt. Seit Meilenstein 5 sind Download der Migrationssicherung und Wiederherstellung der alten Schlüssel über die Oberfläche erreichbar. Browser-Speicher ist an den jeweiligen Ursprung gebunden; ein Wechsel des Ursprungs erfordert eine gesonderte Übertragung der Rohdaten oder Sicherung.

## Phase 3 – Kernoberfläche

Umfang:

- Klassenimport und -auswahl,
- frei benannter und zeitlich nicht automatisch begrenzter Bewertungszeitraum,
- Bewertung einer Stunde,
- Status `abwesend` und `nicht beobachtet`,
- Fortschrittsanzeige,
- sofortige lokale Sicherung jeder Eingabe,
- Fortsetzen einer unterbrochenen Stunde und bewusstes Zurücksetzen,
- verständlicher Hinweis auf den fachlichen Umfang.

Abnahme:

- vollständige Musterklasse kann ausschließlich per Tastatur bearbeitet werden,
- Status und aktuelle Person sind eindeutig,
- versehentliches Doppelklicken erzeugt keine doppelten Einträge,
- unvollständige Stunden bleiben lokal erhalten und können später fortgesetzt werden,
- ein Bewertungszeitraum bleibt ohne automatischen Halbjahres- oder Schuljahreswechsel nutzbar,
- eine vollständig erfasste Stunde benötigt keinen zusätzlichen globalen Speicherschritt.

## Phase 4 – Tabelle, Verlauf und Bearbeitung

Umfang:

- nachvollziehbare Stundentabelle,
- sichtbare Unterscheidung aller drei Beobachtungsstatus,
- Verlaufsdarstellung,
- nachträgliche Bearbeitung und Neuberechnung,
- CSV-Export sowie JSON-Vollsicherung mit validiertem Reimport und lokalem Rückfallstand.

Abnahme:

- Tabellen-, Verlaufs- und Exportwerte stimmen mit dem Fachkern überein,
- Änderung einer frühen Stunde aktualisiert alle späteren Werte,
- mehrere Stunden am selben Tag bleiben unterscheidbar,
- höchstens zwei Stunden je Klasse und Datum; Tausch und Löschung halten ihre Nummern konsistent.

Umsetzungsstand vom 23.09.2026: Die Phase ist in Meilenstein 4 umgesetzt. Das [CSV-Format](csv-exportformat.md) ist versioniert dokumentiert. Vor dem JSON-Reimport wird der bisherige Notebook-Stand im selben Browser gesichert; ein externer Schutz gegen Verlust des Browser-Speichers entsteht erst durch die heruntergeladene JSON-Datei.

## Phase 5 – Usability-fähiger Release

Umfang:

- responsives Design,
- Barrierefreiheitsprüfung,
- Demo-Klasse mit fiktiven Namen,
- reproduzierbarer Produktions-Build,
- definierte Testversion für Lehramtsstudierende,
- rein lokaler Betrieb ohne Konto oder Cloud-Abhängigkeit,
- eingefrorene Version für die Bachelorarbeit.

Abnahme:

- alle automatisierten Kernprüfungen grün,
- Testaufgaben aus `06-testkonzept.md` vollständig durchführbar,
- Versionsnummer und Commit eindeutig dokumentiert,
- keine Änderungen an der Testversion während laufender Erhebung.

Umsetzungsstand vom 25.09.2026: Der Tag `v0.5.0` definiert die Testversion. Reproduzierbarer Start, fiktiver Datensatz und Aufgabenfolge stehen in [usability-testversion.md](usability-testversion.md); die technische Teilprüfung der Barrierefreiheit in [barrierefreiheitspruefung.md](barrierefreiheitspruefung.md). Ein Test mit Lehramtsstudierenden und eine umfassende Prüfung mit assistiver Technik folgen als eigene Erhebung.
