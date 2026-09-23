# Technischer Iststand

## 1. Prüfgrundlage

Geprüft wurden die im Work-Verlauf bereitgestellten Dateien unter `legacy-source/`. Der vollständige ursprüngliche Entwicklungsordner lag nicht vor. Aussagen über nicht enthaltene Electron-, Android- oder iOS-Dateien sind deshalb nicht möglich.

## 2. Nachweisbarer Stack

Aus `legacy-source/package.json`:

- React `19.1.1`,
- React DOM `19.1.1`,
- Vite `7.1.4`,
- Recharts `3.1.0`,
- Lucide React,
- Supabase JavaScript SDK,
- Vite PWA Plugin,
- Capacitor für Android und iOS,
- Electron und Electron Builder für Windows.

## 3. Nachweisbar vorhandene Funktionen

- CSV- und TXT-Import von Namen,
- maximal 45 Personen pro Klasse,
- mehrere Klassen,
- Sortieren, Umbenennen, Abschließen und Löschen von Klassen,
- Bewertung über `--`, `-`, `0`, `+`, `++`,
- Startwert 2,0,
- Viertel- und Halbschritte,
- Puffer mit maximal drei Punkten bei Note 1,
- chronologische Neuberechnung gespeicherter Sitzungen,
- Bearbeitung von Namen und Einträgen,
- Tabelle und Verlaufsdiagramm,
- CSV-Export,
- lokale Speicherung im Browser,
- lokale Wiederherstellung einer offenen Bewertungsrunde,
- Supabase-Anmeldung und Passwortzurücksetzung,
- Cloudspeicherung des gesamten App-Zustands,
- PWA-Konfiguration und rechtliche Informationsseiten.

## 4. Aktuelle Daten- und Rechenlogik

- `App.jsx` enthält Konstanten, Rechenlogik, Datenmigration, Speicherung, Synchronisierung, Oberfläche und einen großen CSS-Block.
- Die Datei umfasst im bereitgestellten Stand rund 107 KB.
- Der gesamte App-Zustand wird lokal unter `oral-grading-app-v4` gespeichert.
- Offene Entwürfe liegen getrennt unter `oral-grading-session-drafts-v1`.
- Cloud-Daten werden als gesamtes Dokument in der Tabelle `user_notebooks` pro Nutzer-ID gespeichert.
- Die Konfliktentscheidung vergleicht Zeitstempel und übernimmt den als neuer erkannten Gesamtzustand.
- `saveSession()` erlaubt derzeit das Speichern, sobald mindestens eine Person bewertet wurde. Nicht bearbeitete Personen erhalten keinen Eintrag.
- `recalculateClassState()` ignoriert Einträge, deren Symbol nicht in der fünfteiligen Bewertungsskala enthalten ist.

## 5. Festgestellte technische Schwächen

- Fachlogik und UI sind nicht getrennt.
- Die Fachfunktionen sind nicht exportiert und dadurch unnötig schwer isoliert testbar.
- In `package.json` existiert kein Testskript und keine nachgewiesene Testsuite.
- Abwesenheit und Nichtbeobachtung existieren nicht als Status.
- Ein fehlender Eintrag ist mehrdeutig: nicht bearbeitet, nicht beobachtet oder abwesend können nicht unterschieden werden.
- Entwürfe werden lokal, aber nicht nachweisbar in der Cloud gespeichert.
- Die Cloudspeicherung eines Gesamtdokuments begünstigt Überschreibungen bei parallelen Änderungen auf mehreren Geräten.
- Der Durchschnitt wird aus aktuellen Zwischenständen aller Personen gebildet; die fachliche Bedeutung dieser Klassenkennzahl ist nicht dokumentiert.
- Die Diagramm-Referenzlinie ist fest auf Note 2 gesetzt und nicht fachlich erklärt.
- Datum allein ist als sichtbare Spaltenüberschrift bei mehreren Stunden am selben Tag nicht eindeutig.
- Die Formatierung und Fachsprache der Exportdatei ist nicht versioniert.
- Der Code enthält `crypto.randomUUID()` direkt in Datenaufbereitung und Migration. Das erschwert vollständig reproduzierbare Tests, wenn IDs fehlen.

## 6. Nicht verifizierbar

Mit den vorliegenden Dateien konnten folgende Punkte nicht vollständig geprüft werden:

- Electron-Hauptprozess und tatsächliche Windows-Sicherungslogik,
- native Capacitor-Projekte,
- Supabase-Datenbankschema, Row-Level-Security und Serverkonfiguration,
- produktive Umgebungsvariablen,
- tatsächliche Store-Builds,
- vollständige Git-Historie,
- Datenschutzkonformität eines produktiven Schuleinsatzes.

Der bereitgestellte Windows-ZIP-Upload war im Arbeitsstand nicht vollständig als ZIP lesbar und wurde deshalb nicht in das Startpaket übernommen.

## 7. Konsequenz für den Neubau

Der Legacy-Code ist eine Referenz für vorhandenes Verhalten, aber nicht das Fundament, das schrittweise weiter vergrößert werden soll. Fachlich bestätigte Funktionen werden mit Tests neu umgesetzt. Nicht bestätigte oder problematische Details werden nicht automatisch kopiert.

