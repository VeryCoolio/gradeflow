# Klassenberichte: Excel und CSV, Version 2

Entscheidung vom 10.10.2026: Lesbare Berichte zeigen keine technischen IDs, internen Viertelschritte oder englischen Feldnamen. Das frühere Format bleibt im Tag `v0.5.0` nachvollziehbar; CSV Version 2 ist durch Dateinamen `*-stunden-v2.csv` und die nachfolgende Spaltenfolge erkennbar.

## Excel

Echte `.xlsx`-Arbeitsmappe mit „Klassenübersicht“ und einem Blatt je Person. Die Übersicht zeigt Klasse, Bewertungszeitraum, Startwert, aktuellen Stand und Puffer. Personenblätter enthalten Datum, Stunde (nur bei zwei Stunden am selben Datum), Status, Symbol, Bedeutung, Stand nach Bewertung und Puffer. Zahlen und Daten sind typisiert; nicht bewertete Stunden haben keinen Leistungsstand in der jeweiligen Zeile. Der aktuelle Stand im Blattkopf bleibt aus allen bewerteten Stunden berechnet. Gleiche, zu lange oder ungültige Blattnamen erhalten sichere eindeutige Bezeichnungen; der vollständige Personenname bleibt im Blatt. Texte mit Formelzeichen bleiben Text; es werden keine Formeln erzeugt.

## CSV

UTF-8 mit BOM, Semikolon, CRLF. Jede Zelle wird in doppelte Anführungszeichen eingeschlossen; enthaltene Anführungszeichen werden verdoppelt. Texte mit führenden Formelzeichen (`=`, `+`, `-`, `@`) erhalten ein schützendes Apostroph.

Spalten: `Klasse`, `Bewertungszeitraum`, `Person`, `Eintrag`, `Datum`, `Stunde`, `Status`, `Symbol`, `Stand`, `Puffer`.

Je Person folgt eine Startzeile, alle Stunden nach Datum / Nummer / stabiler ID und eine Zeile „Aktuell“. Stundenstatus: „Bewertet“, „Abwesend“, „Nicht beobachtet“ oder „Offen“. Ein einzelner Eintrag desselben Datums hat eine leere sichtbare Stundennummer; bei zwei Einträgen steht 1 beziehungsweise 2. Stand und Puffer einer Stundenzeile sind nur bei bewerteten Stunden gefüllt. Abwesenheit, Nichtbeobachtung und offene Einträge bleiben unterscheidbar.

## Sicherung und Datenschutz

Excel und CSV sind Auswertungen. Zur vollständigen Wiederherstellung dient das JSON-Notebook in Schema Version 1. Vor Reimport wird es validiert; vorhandene Daten werden nach Warnung mit vorherigem lokalem Rückfallstand ersetzt. Lokale Sicherung und Notebook können gemeinsam durch Profilbereinigung, Quotenprobleme oder Geräteverlust verloren gehen. Heruntergeladene Dateien sind geschützt aufzubewahren und gehören nicht in Git. Alle Berichte werden lokal im Browser erzeugt, ohne Cloudübertragung.
