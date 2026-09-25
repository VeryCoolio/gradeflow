# Versionsverlauf

Der Git-Verlauf beginnt mit dem Projektstand nach Meilenstein 2. Frühere Arbeitsschritte sind im [Entwicklungsprotokoll](docs/entwicklungsprotokoll.md) festgehalten; dafür werden keine rückdatierten Commits erzeugt.

## 0.5.0 – 25.09.2026

- Reproduzierbare Usability-Testversion mit fiktiver Demo-Klasse, herunterladbarer Beispiel-Klassenliste und festgelegter Aufgabenfolge.
- Nachträgliche Korrektur von Personennamen bei unveränderten Bewertungen.
- Bewusst bestätigte Klassenlöschung mit vorheriger lokaler Sicherung und Wiederherstellung.
- Wiederherstellung eines unlesbaren lokalen Notebooks aus einer validierten JSON-Sicherung; alte Rohdaten werden vor dem Ersetzen gesichert.
- Download und Wiederherstellung der originalen Legacy-Migrationsdaten im selben Browser.
- Tastatursprung zum Hauptinhalt, angekündigte Änderungen bei Person und Fortschritt sowie größere Bedienelemente.

Die Version ist für einen Usability-Test mit fiktiven Daten bestimmt. Ein Einsatz mit echten Schülerdaten benötigt eine gesonderte Datenschutz- und Betriebsprüfung.

## 0.4.0 – 23.09.2026

- Stundentabelle mit Startwert, jeder Stunde, aktuellem Stand, Puffer und ausdrücklich sichtbaren Beobachtungsstatus.
- Personenbezogener Verlauf aus derselben chronologischen Berechnung; fehlende Bewertungen bleiben in der Ereignisliste sichtbar.
- Ältere Einträge bearbeiten oder entfernen, zwei Stunden eines Datums tauschen und Stunden mit anschließender Nummernnormalisierung löschen.
- Dokumentierter CSV-Export pro Klasse sowie versionierte JSON-Vollsicherung mit geprüftem Import, Ersetzungswarnung und lokalem Rückfallstand.
- Unit- und Integrationstests für Neuberechnung, Ansichten, Exporte und Wiederherstellung.

Die Bachelorarbeitsversion enthält weiterhin keine Cloud-Synchronisierung. Ein Usability-Test mit Lehramtsstudierenden und eine Datenschutzprüfung für echte Schülerdaten stehen aus.

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
