# Farben, Klassensortierung und Demowerte – 20.10.2026

Auftrag: App-Farbton frei wählen, Klassen Pastellfarben zuordnen, die Klassenliste wahlweise nach Stufe/Alphabet oder Nutzung sortieren und einer bereits angelegten Demo fünf Beispielwochen hinzufügen.

- [ ] App-Farbe mit Vorschlägen und freier Auswahl speichern.
- [x] Demo-Klasse zunächst leer anlegen; anschließend auf Wunsch fünf Wochen mit allen Statusarten ergänzen.
- [ ] Pastellfarben für Klassen vergeben und sichern.
- [ ] Klassen nach Stufe/Alphabet, zuletzt benutzt oder am längsten nicht benutzt sortieren.
- [ ] Desktop, Mobilansichten, Speichern/Neuladen und bestehende Abläufe prüfen.
- [ ] Version, Commit, Push und Remote-Abgleich abschließen.

## Entscheidungen

Die Demo ergänzt 25 fiktive Stunden (fünf vollständige Montag-bis-Freitag-Wochen) vor der aktuellen Woche oder vor der ältesten vorhandenen Stunde. Alle fünf Symbole, AW, NB und offene Einträge kommen vor. Vorhandene Daten bleiben erhalten. Erneutes versehentliches Füllen wird verhindert. Eine unveränderte ältere Demo wird anhand des exakten Demo-Namens und der bekannten vollständigen fiktiven Namensliste erkannt; normale Klassen erhalten diese Aktion nicht.

App-Farbton, Sortierung und Nutzungsreihenfolge sind Einstellungen dieses Browserprofils. Klassenfarben gehören zur Klasse und damit in die JSON-Sicherung. Optionale Metadaten ergänzen Schema 1 ohne Migration; alte Sicherungen bleiben lesbar. Keine Fachregel wird verändert.

## Demowerte

Die Schaltfläche erscheint erst in der angelegten Demo unter Stunden. Zwei neue Prüfungen sichern 25 eindeutige Termine, alle Statusarten, Erhalt vorhandener Stunden, Einmaligkeit und den tatsächlichen Bedienablauf bis zur Tabelle ab. Demo-/App-Tests, Typecheck und Lint bestanden.
