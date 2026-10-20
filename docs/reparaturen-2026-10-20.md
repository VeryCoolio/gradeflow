# Umsetzung des Drei-Skill-Berichts – 20.10.2026

Grundlage: [Audit vom 19.10.2026](drei-skill-audit-2026-10-19/bericht.md), Ausgangsstand `d0d5ea5`. Auftrag: alle acht Befunde umsetzen, einzeln prüfen und abhaken. Fachregeln, Schema und historische Nachweise bleiben erhalten.

- [x] B01 Fehlgeschlagene Eingabe bei Navigation erhalten.
- [x] B02 Mobile Datenhierarchie und Bewertung kompakter gestalten.
- [x] B03 Personen-Editor sichtbar und fokussiert öffnen.
- [x] B04 Ungespeicherte Namensänderungen schützen.
- [x] B05 Importfehler am Formular anzeigen.
- [x] B06 Lange Excel-Titel lesbar ausgeben.
- [x] B07 Tabellenpräferenzen erhalten und Seiten verlinken.
- [x] B08 Sprache korrigieren.
- [x] Abschließende Browser-/Designprüfung; GitHub-Abgleich nach dem Abschlusscommit.

## B01

Die fehlgeschlagene Eingabe behält Klasse, Stunde und Person. Ein seitenübergreifender Hinweis bietet Wiederholung, Rückkehr zur Eingabe und ausdrücklich bestätigtes Verwerfen. Neuladen warnt über die Browserfunktion, solange ein ungesicherter Auftrag besteht. Eine andere Bewertung überschreibt ihn nicht. Bereits gespeicherte Daten werden nicht verändert. Der Auftrag liegt im Arbeitsspeicher; er wird nicht als erfolgreiche Speicherung oder Bestandteil einer JSON-Sicherung ausgegeben.

Prüfung: Zwei neue Regressionen schlugen vor der Änderung fehl. Danach 30 App-Integrationstests, Typecheck, Lint und Build erfolgreich. Die Browser-Gegenprüfung ist im Abschluss bestanden.

## B02

Die bestehende Farb- und Schriftgestaltung bleibt erhalten. Mobile Kopfzeile und Klassenwahl sind kompakter; Klassenansichten liegen in einer benannten Auswahl. Exporte sind ein bewusst zu öffnendes Menü. Tabellenoptionen und ausführliche Diagrammhinweise lassen sich aufklappen. Die Tabelle zeigt bei 390 × 844 bereits Datenzeilen; die fünf Bewertungssymbole sowie AW/NB passen beim normalen Testnamen in die erste Ansicht. Lange Namen und große Schrift dürfen weiter scrollen.

Prüfung: 123 Tests, Typecheck und Build bestanden. Tatsächliche Sichtprüfung bei 320/390/768/1440 Pixeln ohne horizontales Seitenüberlaufen. Alle 15 Tour-Schritte bei 390 Pixeln durchlaufen; Tabelle und Verlauf über die neue Auswahl tatsächlich geöffnet. [Messwerte](reparaturen-2026-10-20/B02-fit.json) und Bilder bleiben getrennt vom Ausgangsaudit.

## B03

Der Personen-Editor steht direkt in der gewählten Personenzeile. Das Namensfeld erhält Fokus und wird bei Bedarf sichtbar gescrollt. Nach Speichern oder Abbrechen kehrt der Fokus zum zugehörigen Auslöser zurück. Der bestehende Demo-/Umbenennungstest prüft nun ausdrücklich die Fokusübergabe; diese Prüfung schlug vor der Änderung fehl und besteht danach. Typecheck bestanden. Erste/mittlere/letzte Person bei 20 und 45 Personen anschließend im Browser mit Maus und Tastatur geprüft.

## B04

Offene Namen-/Zeitraumänderungen werden als ungespeichert angezeigt. Ein gemeinsamer Navigationsschutz fragt vor dem Verwerfen; Abbrechen erhält die Eingabe. Das gilt für Seiten, Klassen, Ansichten, andere Personen, Tourstart und Browser-Zurück. Neuladen nutzt die native Browserwarnung. Unveränderte Formulare verlangen keine Bestätigung.

Prüfung: Zwei neue Regressionen zuerst fehlgeschlagen, danach bestanden; Typecheck erfolgreich. Browser-Zurück, Klassenwechsel und die native Warnung vor Neuladen wurden im Abschluss tatsächlich bedient.

## B05

Fehler beim Anlegen/Importieren erscheinen direkt vor dem Absenden im Formular. Der Hinweis erhält Fokus, ist mit dem betroffenen Dateifeld verknüpft und erklärt den nächsten Schritt. Eingaben bleiben erhalten; ein neu gewähltes Dokument entfernt den veralteten Dateifehler. Drei Formular- und 32 App-Tests, Typecheck und Lint bestanden. Drei Fehlerklassen bei 390 und 1440 Pixeln sowie ein gültiger Folgeimport anschließend im Browser bestanden.

## B06

Excel-Titel nutzen verbundene Zellen über die gesamte Blattbreite. Klassenname und Bewertungszeitraum erhalten ausreichend breite getrennte Bereiche; Zeilenhöhen berücksichtigen Textlänge und Zeilenumbrüche. Lange Namen in der Übersicht erhalten ebenfalls mehr Höhe. Fachwerte, Datumstypen und interne Links bleiben erhalten. Fünf Excel-Regressionen und Typecheck bestanden; Der tatsächliche Export wurde anschließend unabhängig gelesen und gerendert. Die zusätzliche native Excel-Sichtprüfung ist wegen fehlender Computerfreigabe blockiert; sie gilt ausdrücklich nicht als bestanden.

## B07

Tabellenmodus, Schriftgröße, Stundenfenster und Blätterposition gehören zur gespeicherten Arbeitsposition und zur kopierbaren URL. Fehlerhafte Werte erhalten sichere Standardwerte. Alte Positionen funktionieren weiter. Hauptseiten und Hilfeseiten sind echte Links mit unverändertem Schutz beim normalen Wechsel; neue Tabs bleiben möglich. 33 App-Tests, Tabellen-/Positionsprüfungen, Typecheck und Lint bestanden. Die aktive Browser-Tour wurde auf Links und mobile Ansichtenwahl angepasst.

## B08

Einzahl und Mehrzahl stimmen jetzt bei Klassenanlage, Personenanzahl, Erfassungsfortschritt, Stundenabschluss und Sicherungszusammenfassung. Der Erklärungstext lautet „Mündliche Beiträge sind flüchtig.“ Die fachliche Aussage bleibt erhalten. 129 Tests bestanden; Produktionsbuild, Lint und Formatprüfung erfolgreich. Eine unzulässige Testoption wurde im neuen B07-Prüftest entfernt; Typecheck über den Build erneut erfolgreich.

## Abschluss 0.9.0

Alle acht Befunde sind umgesetzt. 129 Tests in 21 Dateien sowie Typecheck, Lint, Formatprüfung und Produktionsbuild bestehen. Tatsächliche Browserbedienung bestätigt Klassen mit 20/45 Personen und bis zu 100 Stunden, fehlerhafte Importe, zielgenaue Wiederholung, Navigationsschutz einschließlich Neuladen, Tabellenpräferenzen und schreibgeschützte neue Tabs. Die Tour besteht mit echten Aktionen und ausschließlich „Weiter“ bei 390/768/1440 Pixeln. Große Schrift wurde zusätzlich bei 320 und 390 Pixeln geprüft und eine dabei gefundene Überlappung korrigiert.

Ein zusätzlicher B01-Randfall zeigte nach Rückkehr zur fehlgeschlagenen Eingabe eine unpassende Speicherbestätigung beim erneuten Verlassen. Die ergänzte Regression schlug zuerst fehl, besteht nach der Korrektur und wurde am aktuellen Produktionsbuild bestätigt. Fehlgeschlagene Eingaben bleiben als ungesicherter Auftrag erkennbar.

Die frühere Auditdatei bleibt ein historischer Befund. Der [vollständige Abschlussbericht](reparaturen-2026-10-20/abschluss.md) enthält Abnahmematrix, Designvergleich, Nachweise und Prüfgrenzen. Offen bleibt die native Excel-Sichtprüfung: Der Computerzugriff meldete „Computer Use permissions are not granted“. Zelltypen, Datumsformat, Inhalte, Zeilenhöhen und Linkziele des unveränderten Exports wurden unabhängig geprüft. Es wurde kein manueller Hosting-Deploy ausgelöst.
