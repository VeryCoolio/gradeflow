# CSV-Exportformat, Version 1

Der CSV-Export enthält genau eine Klasse. Er ist eine lesbare Auswertung; für eine vollständige Wiederherstellung dient die JSON-Sicherung. Beide Dateien werden ausschließlich im Browser erzeugt und heruntergeladen.

## Kodierung und Reihenfolge

- UTF-8 mit BOM, Semikolon als Trennzeichen und CRLF als Zeilenende.
- Jede Zelle ist in doppelte Anführungszeichen eingeschlossen; Anführungszeichen im Inhalt werden verdoppelt.
- Zeilen stehen in der Reihenfolge der Personen aus der Klasse. Je Person folgen `start`, alle Stunden in chronologischer Reihenfolge und `current`.
- Die Stunden werden nach Datum, `lessonSequence` und zuletzt stabiler Sitzungs-ID geordnet. `lessonSequence` ist intern immer `1` oder `2`; eine einzelne Stunde wird in der Oberfläche ohne Nummer dargestellt.
- Tabellenprogramme können führende Formelzeichen aus Text als Formeln ausführen. Zellen, deren Inhalt nach optionalem Leerraum mit `=`, `+`, `-` oder `@` beginnt, erhalten deshalb ein führendes Apostroph. Das betrifft auch Bewertungssymbole wie `++`.

## Spalten

| Spalte | Bedeutung |
| --- | --- |
| `formatVersion` | Immer `1`. |
| `classId`, `className`, `periodLabel` | Klasse und frei benannter Bewertungszeitraum. |
| `studentId`, `studentName` | Person. |
| `rowType` | `start`, `session` oder `current`. |
| `sessionId`, `date`, `lessonSequence` | Nur für `session` gefüllt. Datum im Format `YYYY-MM-DD`. |
| `status` | Bei Stunden `bewertet`, `abwesend`, `nicht_beobachtet` oder `offen` für noch fehlende Eingabe. |
| `symbol` | Nur bei `bewertet`: `--`, `-`, `0`, `+` oder `++`. |
| `gradeQuarterSteps` | Ganzzahlige Viertelschritte des berechneten Standes. |
| `gradeDecimal` | Derselbe Stand mit deutschem Dezimalkomma, zum Beispiel `1,75`. |
| `bufferPoints` | Pufferpunkte von `0` bis `3`. |

`start` und `current` enthalten Stand und Puffer, aber keine Stunde oder Beobachtung. Bei `session` sind Stand und Puffer nur für `bewertet` gefüllt. `abwesend`, `nicht_beobachtet` und `offen` bleiben ausdrücklich unterscheidbar und verändern die Note nicht. Der aktuelle Stand wird für jede Person aus allen gespeicherten Stunden neu berechnet. Ein automatisches Ende oder ein Noten-Reset des Bewertungszeitraums findet nicht statt.

## Datenschutz und Wiederherstellung

Die CSV- und JSON-Dateien können personenbezogene Daten enthalten. Sie sollen geschützt aufbewahrt und nicht in Git eingecheckt werden. Eine JSON-Sicherung enthält alle Klassen, Stunden und Beobachtungen als Notebook-Schema Version 1. Beim Import wird sie vor dem Schreiben validiert; vorhandene Klassen werden nur nach Warnung ersetzt. Der vorherige Notebook-Stand wird lokal im selben Browser gespeichert und kann dort wiederhergestellt werden. Eine externe JSON-Datei ist nötig, um sich auch gegen Verlust oder Bereinigung des Browser-Speichers abzusichern.
