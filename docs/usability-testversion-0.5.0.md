# Usability-Testversion 0.5.0

## Festgelegter technischer Stand

Für die Erhebung ist ausschließlich der Git-Tag `v0.5.0` vorgesehen. Dieser Tag bezeichnet genau einen Commit und darf während der laufenden Erhebung nicht verändert werden. Die Commit-ID lässt sich mit `git rev-parse v0.5.0` prüfen. Änderungen nach der Freigabe werden auf einem neuen Versionsstand entwickelt und nicht in die laufende Testversion übernommen.

Die Anwendung läuft ohne Konto und ohne Cloud-Synchronisierung. Alle Eingaben liegen im `localStorage` des verwendeten Browserprofils und Ursprungs. Die Lehrkraft beziehungsweise Testleitung muss für jede Testperson ein frisches Browserprofil verwenden. Testdaten dürfen nur fiktive Namen enthalten.

## Reproduzierbarer Start

Voraussetzung: Node.js 24 und npm. Aus dem Repository:

```bash
git checkout v0.5.0
cd app
npm ci
npm run typecheck
npm test
npm run lint
npm run format:check
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Anschließend `http://127.0.0.1:4173/` in einem frischen Browserprofil öffnen. Für alle Testpersonen denselben Ursprung und Port verwenden. Ein anderes Browserprofil oder ein Wechsel zwischen `localhost` und `127.0.0.1` hat einen anderen lokalen Datenbestand. Die Testleitung prüft vor Beginn, dass noch keine Klasse vorhanden ist.

## Fiktiver Ausgangsdatensatz

Die Datei `app/public/demo-klasse.csv` enthält in dieser Reihenfolge `Fiktiv Ada`, `Fiktiv Bea`, `Fiktiv Cem` und `Fiktiv Dana`. Sie kann in der App über „Fiktive Beispiel-Klassenliste herunterladen“ bezogen werden. Für den Importversuch lauten Klassenname `Demo 8b` und Bewertungszeitraum `Usability-Test`. Die Schaltfläche „Demo-Klasse mit fiktiven Namen anlegen“ erzeugt denselben Ausgangsstand, falls ein Test ohne Importaufgabe vorbereitet wird. Beide Wege erzeugen eine Klasse ohne Stunden und mit Startwert `2,00` für jede Person.

## Aufgabenfolge für die Erhebung

Die folgende Folge ist eine technische Vorlage für den Bedientest; Einweisung, Messinstrument und Auswertung sind im Methodenteil festzulegen.

1. Fiktive Beispiel-Klassenliste herunterladen und als `Demo 8b` mit Bewertungszeitraum `Usability-Test` importieren.
2. Für den 01.09.2026 eine Stunde beginnen. `Fiktiv Ada` mit `+` bewerten und `Fiktiv Bea` als abwesend erfassen.
3. Die Seite schließen und über dieselbe Adresse im selben Browserprofil erneut öffnen. Prüfen, ob die Stunde mit `Fiktiv Cem` als nächster offener Person fortgesetzt wird.
4. `Fiktiv Cem` als nicht beobachtet markieren und `Fiktiv Dana` mit `0` bewerten. Die vollständige Stunde und die Tabelle ansehen.
5. Für den 02.09.2026 eine weitere Stunde mit fiktiven Eingaben erfassen. Anschließend die erste Bewertung von `Fiktiv Ada` auf `++` korrigieren und ihren Verlauf ansehen.
6. Die Klasse als CSV exportieren und die vollständige JSON-Sicherung herunterladen.

Die Testleitung kann Aufgabenerfolg, Zeit, sichtbare Fehlversuche und Hilfestellungen erfassen. Aus diesen Beobachtungen dürfen keine Aussagen über pädagogische Wirksamkeit oder Notengerechtigkeit abgeleitet werden. Für die nächste Testperson wird ein neues, leeres Browserprofil verwendet; vorhandene Daten werden nicht stillschweigend gelöscht.

## Grenzen und Schutz

Die JSON-Datei enthält sämtliche lokalen Klassen und Beobachtungen. Auch im Test ist sie geschützt aufzubewahren und nicht in Git einzuchecken. Die lokale Rückfallsicherung schützt nicht gegen Verlust des Browserprofils oder Geräts. Die Version ist für einen Usability-Test mit fiktiven Daten bestimmt; Datenschutz- und Betriebsfragen für echte Schülerdaten sind nicht abschließend geprüft.
