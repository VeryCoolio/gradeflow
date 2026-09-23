# Bezug zur Bachelorarbeit

## 1. Rolle der technischen Entwicklung

Die Umprogrammierung bildet den technischen Hauptteil der Bachelorarbeit. Sie folgt auf die fachliche Eingrenzung der mündlichen Mitarbeit und die Analyse des bestehenden Prototyps.

Die Entwicklung soll nachvollziehbar zeigen:

- welche Probleme im bisherigen Stand festgestellt wurden,
- welche Anforderungen daraus abgeleitet wurden,
- welche Entscheidungen getroffen wurden,
- wie diese technisch umgesetzt wurden,
- wie die korrekte Funktion geprüft wurde,
- wie zukünftige Nutzerinnen und Nutzer die Bedienung beurteilen.

## 2. Erforderliche Nachweise während der Entwicklung

Für jeden Meilenstein festhalten:

- Ausgangsproblem,
- Ziel der Änderung,
- begründete Entscheidung,
- betroffene Komponenten,
- durchgeführte Tests,
- Ergebnis,
- verbleibende Grenze.

Codex pflegt diese Informationen knapp in `docs/entwicklungsprotokoll.md`. Der Text ist Arbeitsmaterial und wird nicht ungeprüft in die Bachelorarbeit übernommen.

## 3. Vorher-nachher-Vergleich

Der Vergleich soll nicht nur aus unterschiedlichen Screenshots bestehen. Sinnvolle Vergleichspunkte sind:

- Struktur des Quellcodes,
- Trennung von Fachlogik und Oberfläche,
- ausdrückliche Zustände für Abwesenheit und Nichtbeobachtung,
- automatisierte Absicherung der Berechnung,
- Nachvollziehbarkeit der Datenmigration,
- sofortige lokale Sicherung einzelner Eingaben und Fortsetzung unterbrochener Stunden,
- Bedienablauf der Stundenerfassung,
- Fehlerbehandlung und Rückmeldungen,
- Responsivität und Barrierefreiheit.

Die Dateien unter `legacy-source/` und `reference/screenshots/` bilden den unveränderten Ausgangspunkt.

## 4. Evaluation

Die technische Prüfung und der Usability-Test beantworten unterschiedliche Fragen:

- Automatisierte Tests: Rechnet und speichert die App entsprechend den festgelegten Regeln?
- Usability-Test: Können Lehramtsstudierende die vorgesehenen Aufgaben verständlich und flüssig bearbeiten?

Nicht untersucht wird, ob das Bewertungssystem im Unterricht zu besseren, gerechteren oder motivierenderen Noten führt.

## 5. Grenzen

In der Bachelorarbeit ausdrücklich diskutieren:

- selbst entwickeltes Bewertungsmodell,
- begrenzte Testgruppe,
- Test mit fiktiven Daten,
- keine Untersuchung realer Unterrichtswirkung,
- mögliche Verzerrungen durch Vorerfahrung der Teilnehmenden,
- begrenzter Entwicklungszeitraum,
- Datenschutz- und Betriebsfragen außerhalb eines vollständigen Produktivnachweises,
- keine Cloud-Synchronisierung und deshalb keine Prüfung eines Mehrgerätebetriebs.
