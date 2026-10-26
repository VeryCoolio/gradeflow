# Benutzertest – Gradeflow 0.10.0

## Vorbereitung für die Testleitung

- Fester App-Stand: **0.10.0**, Commit `2a429eaf96894f852be9f9761ee07547102a05d4`. Während der Erhebung nicht aktualisieren. Der historische Stand [0.5.0](usability-testversion-0.5.0.md) bleibt unverändert erhalten.
- Je Testperson ein neues, leeres Browserprofil; gleiche Adresse und gleiche Gerätekonfiguration verwenden. Adresse, Commit, Browser und Gerät protokollieren. Das Erstbesuchs-Tutorial bleibt für alle verfügbar; Nutzung oder Überspringen festhalten.
- Die [Excel-Testklasse mit vier fiktiven Personen](benutzertest-0.10.0/Klasse_8b.xlsx) vor dem Auschecken außerhalb der Arbeitskopie speichern und bereitstellen. Demo-Wochen erst in Aufgabe 12 erzeugen. Keine echten Schülerdaten verwenden.
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

## Testunterlagen

- [Arbeitsauftrag: eine Seite](benutzertest-0.10.0/Arbeitsauftrag.pdf)
- [Importdatei: Klasse_8b.xlsx](benutzertest-0.10.0/Klasse_8b.xlsx)
- [Beobachtungsbogen für die Testleitung: zwei Seiten](benutzertest-0.10.0/Beobachtungsbogen.pdf)

Teilnehmende erhalten nur Arbeitsauftrag und Excel-Datei. Der Beobachtungsbogen bleibt bei der Testleitung. Die Dateien vor dem Auschecken des festen App-Stands außerhalb der Arbeitskopie sichern.

## Aufgaben für die Testperson

1. Importiere die Datei Klasse_8b.xlsx als Klasse 8b. Verwende als Bewertungszeitraum Benutzertest.
2. Erfasse für Klasse 8b am 01.09.2026 eine vollständige Stunde: Fiktiv Ada erhält +, Fiktiv Bea ist abwesend, Fiktiv Cem wurde nicht beobachtet und Fiktiv Dana erhält 0.
3. Erfasse für Klasse 8b am 03.09.2026 eine vollständige Stunde: Fiktiv Ada erhält --, Fiktiv Bea erhält +, Fiktiv Cem erhält 0 und Fiktiv Dana erhält ++.
4. Schließe die App beziehungsweise ihren Browsertab vollständig.
5. Öffne die App wieder über dieselbe Adresse im selben Browserprofil.
6. Lege manuell eine neue Klasse 7a mit drei fiktiven Personen an: Mira Beispiel, Noah Muster und Lina Probe.
7. Trage in Klasse 8b nachträglich eine vollständige Stunde für den 02.09.2026 ein. Alle vier Personen erhalten 0.
8. Ändere für Fiktiv Ada den bereits gespeicherten Eintrag vom 01.09.2026 von + auf ++.
9. Benenne Fiktiv Bea in Fiktiv Beatrix um.
10. Öffne einen aus Gradeflow exportierten Excel-Bericht für Klasse 8b in einem Tabellenprogramm.
11. Erstelle eine Demoklasse in der App.
12. Ergänze in der Demoklasse die angebotenen Demowerte für fünf Wochen.

## Abschlussgespräch

Tabelle und Verlauf der Demoklasse sowie den exportierten Excel-Bericht betrachten.

- **Tabelle:** Wie übersichtlich und verständlich findest du die Tabelle mit den vielen Einträgen?
- **Verlauf:** Wie verständlich ist der Verlauf? Welche Entwicklung erkennst du, was ist unklar?
- **Excel-Bericht:** Wie hilfreich und lesbar findest du den Excel-Bericht? Welche Angaben fehlen dir?
- **Gestaltung und Bedienung:** Wie beurteilst du Farben, Schrift, Anordnung und Navigation? Was würdest du zuerst verbessern?

## Hinweise für die Testleitung

Je Aufgabe Ergebnis (S = selbstständig, H = mit Hilfe, N = nicht gelungen, - = nicht durchgeführt), Zeit, Fehlversuche und Hilfe notieren. Lösungswege nicht vorgeben; Aussagen und eigene Interpretation trennen. Nach dem Wiederöffnen prüfen, ob beide Stunden erhalten sind. Nach Aufgabe 8 ist Adas aktueller Stand 2,00. Nach der Umbenennung müssen bisherige Einträge erhalten bleiben.

Die Importdatei enthält ausschließlich vier fiktive Personen und wurde mit der tatsächlichen Gradeflow-Importfunktion geprüft. Die PDF-Seiten wurden gerendert und visuell kontrolliert. Excel wurde laut Yannis am **20.10.2026** bereits manuell geprüft; dies ist eine Nutzerbestätigung, kein neuer Test des App-Exports. Ein fehlendes Tabellenprogramm als technische Einschränkung protokollieren.

Es gibt keine Aufgabe für JSON-Sicherung oder CSV-Export. Der Beobachtungsbogen ist ein aufgabenbezogenes Protokoll, kein standardisiertes Messinstrument. Die nächste Testperson beginnt mit einem neuen Browserprofil; vorhandene Daten nicht ungefragt löschen. Der Test untersucht die Bedienbarkeit, nicht pädagogische Wirksamkeit.
