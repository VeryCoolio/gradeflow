# Mit Gradeflow weiterarbeiten

Die Anwendung ist umgesetzt. Der aktuelle freigegebene App-Stand ist **1.0.0**; die ursprünglichen Meilensteine 1 bis 5 sind abgeschlossen. Der erste Prüfbericht und die anschließende Implementierung wurden vom Nutzer freigegeben. Die Arbeit beginnt deshalb nicht erneut bei Meilenstein 1.

## Einstieg für Änderungen

1. [AGENTS.md](AGENTS.md) und die dort genannten Dokumente 01–08 lesen. Bestätigte Entscheidungen in Dokument 07 haben Vorrang.
2. Den aktuellen Nutzerauftrag und den vorhandenen Code unter [app/](app/) prüfen. Alte Pläne und historische Prüfungen anhand ihrer Version einordnen.
3. Nur den beauftragten Bereich ändern; jede Beobachtung weiterhin sofort lokal speichern. Der Zeitraum hat kein automatisches Ende und keinen automatischen Noten-Reset.
4. Die betroffenen Abläufe, Tests, Typecheck, Lint, Formatierung und Build prüfen. Änderungen im [Entwicklungsprotokoll](docs/entwicklungsprotokoll.md) dokumentieren.
5. Aufgenommene Dateien prüfen, regulär committen und zum eingerichteten GitHub-Remote pushen; den Remote-Stand abgleichen. Dafür besteht die dauerhafte Nutzerfreigabe. Ein manuelles Hosting-Deployment braucht einen eigenen Auftrag.

## Wo liegt was?

- [Projektübersicht und lokaler Start](README.md)
- [Dokumentationswegweiser](docs/README.md)
- [Entwicklung und Prüfungen](docs/entwicklung.md)
- [Abnahme 1.0.0](docs/update-1.0.0.md)
- [Archivierter ursprünglicher Erstauftrag](archive/projektstart/erster-auftrag.md)

`legacy-source/` und `reference/` bleiben historische Grundlagen. Die Medien im [Archiv](archive/README.md) gehören nicht zum App-Build und zeigen ältere Produktstände.
