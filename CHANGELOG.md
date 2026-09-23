# Versionsverlauf

Der Git-Verlauf beginnt mit dem Projektstand nach Meilenstein 2. Frühere Arbeitsschritte sind im [Entwicklungsprotokoll](docs/entwicklungsprotokoll.md) festgehalten; dafür werden keine rückdatierten Commits erzeugt.

## 0.3.0 – 23.09.2026

- Kernoberfläche für Klassenimport, Klassenauswahl, frei benannten Bewertungszeitraum und Stundenerfassung.
- Jede Beobachtung wird unmittelbar lokal gespeichert; unvollständige Stunden werden nach erneutem Öffnen fortgesetzt. Ein bewusstes Verwerfen erfordert Bestätigung.
- Sichtbare Unterscheidung von `bewertet`, `abwesend` und `nicht_beobachtet`, Fortschritt, aktuellen Stand und Puffer.
- Klassen- und Zeitraumänderung, Archivierung sowie maximal zwei Stunden pro Datum mit passender Nummernanzeige.
- Integrationstests für Bedienabläufe und Tastaturbedienung; Vitest auf Version 5 aktualisiert.

Tabelle, Verlauf, nachträgliche Bearbeitung älterer Stunden, Datei-Export und Cloud-Synchronisierung sind nicht enthalten.

## 0.2.0 – 23.09.2026

- Fachkern mit festen Viertelschritten, Pufferlogik und chronologischer Neuberechnung.
- Höchstens zwei Unterrichtsstunden je Klasse und Datum; atomarer Tausch und Normalisierung nach Löschung.
- Versioniertes lokales Notebook, sofortige Speicherung einzelner Beobachtungen und getestete Legacy-Migration mit Rückfallstand.
- Dokumentation des Produktumfangs, des Testkonzepts und der offenen Entscheidungen.

Die Version enthält noch keine neue Benutzeroberfläche, keinen Dateiimport oder -export und keine Cloud-Synchronisierung.
