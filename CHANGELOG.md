# Versionsverlauf

Der Git-Verlauf beginnt mit dem Projektstand nach Meilenstein 2. Frühere Arbeitsschritte sind im [Entwicklungsprotokoll](docs/entwicklungsprotokoll.md) festgehalten; dafür werden keine rückdatierten Commits erzeugt.

## 0.8.1 – 19.10.2026

- Textdialogfolge durch eine geführte Tour an den echten Formularen und Schaltflächen ersetzt. Markiertes Ziel, Fortschritt nach erfolgreichen Aktionen, Tastaturbedienung, Abbruch und bewusster Neustart.
- Getrennte flüchtige Übungsklassen und ausdrücklich benannter Übungsdownload; eigene Klassen und URL bleiben erhalten.
- App-Erklärung anhand der vorgelegten Bachelorarbeitsfassung begründet: fachliche Kriterien, Startwert, Puffer, Korrekturfolgen und Grenzen der Interpretation. Geplante Evaluation nicht als Ergebnis dargestellt.
- Keine neue Abhängigkeit, Fachregel oder Datenmigration. [Abgleich](docs/ba-abgleich-2026-10-19.md) und [Prüfung](docs/tutorial-ba-2026-10-19.md).

## 0.8.0 – 19.10.2026

- Suchbares Klassenregister am Desktop und Klassenwahl während der Erfassung auf kleinen Displays.
- Stabile Bewertungsflächen beim Hover; eigener Stundenabschluss mit Zusammenfassung und bewusstem Korrektureinstieg.
- Lokal wiederaufnehmbarer Klassenentwurf mit ausdrücklicher Speicherfehleranzeige und klarer Trennung zur angelegten Klasse.
- Überarbeitete Klassenverwaltung; Hilfe außerhalb der Bewertung, App-Erklärung, eigene Datenseite und wieder startbares Erstbesuch-Tutorial.
- Eigene AW-/NB-/Offen-Marker unterhalb der Notenskala, zusätzlich zu Text und Form unterschieden.
- Excel mit größeren farbigen Symbolen, Namen als Links zum Personenblatt, Rücklinks und Erklärung der Tabellenblätter. Der nicht gewünschte Endnoten-Satz entfällt.
- Stundennummer in Oberfläche und Excel durchgehend ausgeschrieben, auch bei einer einzelnen Stunde. Fachkern und Notebook-Schema bleiben unverändert.
- Aufgaben, Prüfungen und der noch ausstehende Abgleich mit der angekündigten Bachelorarbeitsfassung: [Bedienrevision](docs/bedienrevision-2026-10-19.md).

## 0.7.0 – 18.10.2026

- Bewertung mit haftendem Personen-/Stundenkontext, unmittelbarer Rückmeldung, gezieltem erneuten Speichern und mobiler Personenwahl; zwei Tab-Schritte bis zum ersten Symbol.
- Kompakte Hauptnavigation, native Klassenwahl und getrennt gespeicherte Arbeitsposition mit Browser-Zurück und Erhalt älterer Stunden nach Neuladen.
- Ein schreibender Tab, live aktualisierte Zweitansichten und sichtbare Eingabesperren verhindern das belegte Überschreiben durch veraltete Ansichten.
- Verständlicher Start bei verweigertem Speicherzugriff; sichere Verwendung fremder IDs; JSON-Grenze vor dem Lesen; XLSX-Ressourcenprüfung und terminierbarer Import-Worker.
- Eigene Komponenten für Bewertung, Klassenverwaltung und Sicherung; gemeinsame Berichtsbeschriftungen unabhängig von React; Stundenindex statt wiederholter Gesamtprüfung.
- Stundenliste mit 20 Einträgen pro Seite und Datumssuche; benannter Tastaturzugang zur Verlaufstabelle. Berechnung und Exporte bleiben vollständig.
- Keine neuen Produktionsabhängigkeiten, Fachregeln oder Cloud-Dienste. Historischer Teststand v0.5.0 unverändert. Prüfung und Grenzen im Revisionsabschluss.

## 0.6.1 – 10.10.2026

- Ruhigere Bewertungsfarben, größere getrennte Ergebnishinweise, sekundäre Pufferangabe und kompakter Status; doppelte Symbolerklärung entfernt.
- Symbolfolge mit `0` zwischen Minus und Plus auch in der Hilfe korrigiert.
- Wahrnehmbarer Stundentausch mit Eingabezusammenfassung, Personenauszug, geänderter Listenreihenfolge und tatsächlicher Speicherbestätigung.
- Kompakte Stundentabelle mit AW/NB/Offen, Legende, zuschaltbaren Zwischenständen, Stundenfenstern und drei Größen; Namen und aktueller Stand beim Scrollen fixiert.
- Feste horizontale Abstände pro Stunde im Verlauf; unterschiedliche Kurztexte ersetzen gleiche Quadratmarker.

## 0.6.0 – 10.10.2026

- Feste Navigation, manuelle Klassenerstellung und änderbar vorbelegtes Schuljahr ohne automatisches Ende oder Reset.
- Zweispaltiger Excel-/CSV-/TXT-Import mit Kopfzeile, leere Musterklassenliste und größere Demo mit 20 fiktiven Personen.
- Abgestufte rote/grüne Bewertungssymbole mit Bedeutung und konkretem Ergebnis vom Stand vor der Stunde aus.
- Ausführliche Erklärung des Bewertungsgegenstands, der Symbole, Grenzen und Pufferlogik.
- Abschlussbestätigung nach erfolgreicher letzter Speicherung mit Rückweg zur Klassenübersicht.
- Excel-Bericht mit Klassenübersicht und je Person einem Blatt; CSV mit deutschen Spalten ohne technische IDs. JSON bleibt vollständige Wiederherstellungssicherung.
- Gemeinsame Datumsachse, Statusmarker und chronologische Tabelle im Verlauf.

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
