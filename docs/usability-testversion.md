# Benutzertest – Gradeflow 0.10.0

## Vorbereitung für die Testleitung

- Fester App-Stand: **0.10.0**, Commit `2a429eaf96894f852be9f9761ee07547102a05d4`. Während der Erhebung nicht aktualisieren. Der historische Stand [0.5.0](usability-testversion-0.5.0.md) bleibt unverändert erhalten.
- Je Testperson ein neues, leeres Browserprofil; gleiche Adresse und gleiche Gerätekonfiguration verwenden. Adresse, Commit, Browser und Gerät protokollieren. Das Erstbesuchs-Tutorial bleibt für alle verfügbar; Nutzung oder Überspringen festhalten.
- Die [Testklasse mit vier fiktiven Personen](testdaten/klasse-8b.csv) vor dem Auschecken außerhalb der Arbeitskopie speichern und bereitstellen. Keine Demo-Wochen erzeugen und keine echten Schülerdaten verwenden.
- Vor der Erhebung einmal alle Aufgaben selbst über die tatsächliche Testadresse durchlaufen. Die Online-Version ist hiermit nicht als geprüft bestätigt.

Lokaler Start in einer separaten Arbeitskopie mit Node.js 24 und npm:

```bash
git switch --detach 2a429eaf96894f852be9f9761ee07547102a05d4
cd app
npm ci
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Adresse: `http://127.0.0.1:4173/`. Beim Wiederöffnen denselben Browser und dieselbe Adresse verwenden.

## Aufgaben für die Testperson

1. Importiere die bereitgestellte Klassenliste als **Klasse 8b**, Zeitraum **Benutzertest**.
2. Beginne am **01.09.2026** eine Stunde. Bewerte **Fiktiv Ada** mit `+` und markiere **Fiktiv Bea** als abwesend.
3. Schließe die App und öffne sie erneut. Setze die Stunde fort: **Fiktiv Cem** wurde nicht beobachtet, **Fiktiv Dana** erhält `0`. Öffne die Tabelle.
4. Erfasse am **02.09.2026** eine zweite Stunde mit `0` für alle vier Personen. Korrigiere anschließend Adas Eintrag vom 01.09. auf `++` und öffne ihren Verlauf.
5. Lade einen **Excel-Bericht**, eine **CSV-Auswertung** und die vollständige **JSON-Sicherung** herunter.

## Kurzprotokoll und Abschluss

Je Aufgabe: Erfolg, Zeit, Fehlversuche und benötigte Hilfe notieren. Abschließend fragen: „Was war unklar oder umständlich?“ Fragebogen und Auswertungsmethode richten sich nach dem Methodenteil der Bachelorarbeit; diese Anleitung legt kein Messinstrument fest.

Excel wurde laut Yannis am **20.10.2026** bereits manuell geprüft; dies ist eine Nutzerbestätigung, kein neuer automatisierter Nachweis. Sicherungen geschützt aufbewahren. Die nächste Testperson beginnt mit einem neuen Browserprofil; vorhandene Daten nicht ungefragt löschen. Der Test untersucht die Bedienbarkeit, nicht pädagogische Wirksamkeit.
