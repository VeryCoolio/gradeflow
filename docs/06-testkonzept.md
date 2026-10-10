# Testkonzept

## 1. Zwei getrennte Testebenen

### Technische Qualitätssicherung

Automatisierte und manuelle Prüfungen kontrollieren, ob die entwickelte App die festgelegten Regeln korrekt umsetzt.

### Usability-Test der Bachelorarbeit

Lehramtsstudierende prüfen als zukünftige Nutzergruppe, ob die App verständlich und angenehm bedienbar ist. Dieser Test trifft keine Aussage über pädagogische Wirksamkeit, Notengerechtigkeit oder tatsächliche Unterrichtsergebnisse.

## 2. Automatisierte Fachtests

Mindestens zu prüfen:

- Startwert 2,0,
- alle fünf Bewertungssymbole,
- Untergrenze 1,0 und Obergrenze 6,0,
- Aufbau des Puffers mit `+` und `++`,
- Übergang von `1,25` mit `++` zu `1,00` und einem Pufferpunkt,
- Obergrenze von drei Pufferpunkten,
- Abbau mit `-` und `--`,
- teilweise Deckung eines `--` durch einen einzelnen Pufferpunkt,
- `0` ohne Änderung,
- `abwesend` ohne Änderung,
- `nicht_beobachtet` ohne Änderung,
- mehrere Stunden in chronologischer Reihenfolge,
- fortlaufende Berechnung über einen frei gewählten Zeitraum ohne automatischen Reset,
- mehrere Stunden am selben Datum,
- kein Eintrag: erster Eintrag erhält intern `lessonSequence = 1`, ohne sichtbare Nummer,
- ein Eintrag: zweiter Eintrag erhält `2`; erst dann werden beide Nummern sichtbar,
- zwei Einträge: dritter Eintrag wird verständlich abgewiesen,
- Vertauschen von `1` und `2` ändert die chronologische Reihenfolge und berechnet den Verlauf neu,
- Löschen eines von zwei Einträgen normalisiert den verbleibenden auf `1` und verbirgt die Nummer; ein neuer zweiter Eintrag erhält `2`,
- unterschiedliche Daten werden unabhängig behandelt; ausschließlich `1` und `2` sind zulässig,
- Ablehnung einer doppelten Kombination aus Datum und Stundennummer innerhalb einer Klasse,
- Sortierung nach Datum, Stundennummer und stabiler Sitzungs-ID als letztem technischem Gleichstand,
- vollständige Neuberechnung nach Korrektur einer Stundennummer,
- Änderung und Löschung einer alten Bewertung,
- Datenmigration aus dem Legacy-Format,
- ungültige Werte und beschädigte Sicherungen.

## 3. Komponenten- und Integrationstests

- Klassenimport mit gültiger, leerer und fehlerhafter Datei,
- Begrenzung auf 45 Personen,
- Anlegen, Umbenennen und Archivieren eines Bewertungszeitraums,
- vollständige Bewertung einer Stunde,
- Auswahl von Abwesenheit und Nichtbeobachtung,
- unmittelbare lokale Speicherung jeder einzelnen Eingabe,
- Neuladen der Anwendung während einer unvollständigen Stunde und Fortsetzen am gespeicherten Stand,
- Überschreiben einer bereits gespeicherten Eingabe ohne doppelten Eintrag,
- Bearbeiten einer alten Stunde,
- Stundennummer nur bei zwei Einträgen desselben Datums sichtbar; deren Reihenfolge ist durch einen atomaren Tausch korrigierbar,
- Tabellen- und Verlaufsanzeige,
- CSV-Export mit dokumentierter Spaltenfolge, allen Statuswerten, chronologischen Fachkernwerten und Schutz gegen Formelausführung,
- vollständiger JSON-Export und Reimport einer Sicherung mit Validierung, Ersetzungswarnung und lokalem Rückfallstand,
- verständliche Fehlermeldung bei Speicherfehlern,
- Tastaturbedienung und Fokusreihenfolge.

## 4. Wenige End-to-End-Abläufe

1. Klasse importieren → mehrere Personen erfassen → Anwendung schließen → laufende Stunde fortsetzen → Tabelle prüfen.
2. Stunde vollständig erfassen → Vollständigkeitsstatus und Tabelle prüfen.
3. Frühere Stunde bearbeiten → Verlauf und aktueller Stand werden neu berechnet.
4. Backup exportieren → leeren Zustand herstellen → Backup importieren.

## 5. Usability-Test mit Lehramtsstudierenden

### Ziel

Prüfen, ob zentrale Bedienhandlungen ohne intensive Einweisung verstanden und ausgeführt werden können.

### Mögliche Aufgaben

- eine fiktive Klasse importieren,
- eine Unterrichtsstunde für alle Personen erfassen,
- eine Person als abwesend markieren,
- eine Person als nicht beobachtet markieren,
- die Erfassung unterbrechen und später am gespeicherten Stand fortsetzen,
- einen früheren Eintrag korrigieren,
- den Verlauf einer Person finden,
- die Klasse als CSV exportieren.

### Messbare Beobachtungen

- Aufgabe erfolgreich oder nicht erfolgreich,
- benötigte Zeit,
- Anzahl erkennbarer Fehlversuche,
- benötigte Hilfestellungen,
- auffällige Abbrüche oder Umwege.

### Subjektive Rückmeldung

Ein kurzer standardisierter Fragebogen kann Verständlichkeit und wahrgenommene Bedienbarkeit erfassen. Die endgültige Auswahl des Instruments und die Auswertungsmethode müssen im Methodenkapitel der Bachelorarbeit begründet werden. Dieses Dokument legt noch kein wissenschaftliches Instrument verbindlich fest.

## 6. Testdaten

- ausschließlich fiktive Namen,
- keine Daten realer Schülerinnen und Schüler,
- identische Ausgangsdaten für alle Testpersonen,
- festgelegte Aufgabenreihenfolge oder dokumentierte Gegenbalancierung,
- Testversion und Datensatz vor Beginn einfrieren.

Die technische Vorbereitung, der fiktive Datensatz und eine konkrete Aufgabenfolge für Version `v0.5.0` stehen in [usability-testversion.md](usability-testversion.md). Die Erhebung selbst ist damit noch nicht durchgeführt.

Die technische Teilprüfung von Tastaturbedienung, Semantik, Kontrast und responsivem Layout ist in [barrierefreiheitspruefung.md](barrierefreiheitspruefung.md) dokumentiert.

## 7. Nicht zulässige Schlussfolgerungen

Aus einem erfolgreichen Usability-Test folgt nicht, dass:

- die errechneten Noten valide sind,
- Lehrkräfte objektiver bewerten,
- Schülerinnen und Schüler motivierter werden,
- das System schulrechtlich überall eingesetzt werden darf,
- die App für einen produktiven Betrieb mit echten Schülerdaten ausreichend abgesichert ist.

## 8. Ergänzende Abnahme der Überarbeitung 0.6.0

- Manuelle Klasse mit Vorname/Nachname, mehreren Personen und vorbelegtem Schuljahr anlegen. Bezeichnung ändern, ohne Daten oder Noten zurückzusetzen.
- Excel/CSV/TXT mit Kopfzeile `Vorname`, `Nachname` einlesen; einspaltige, vertauschte, leere, zusätzliche oder unvollständige Spalten verständlich abweisen. Grenze 45; Dateigröße maximal 5 MB. XLSX mit mehreren Blättern, Formeln oder anderen Zelltypen abweisen.
- Leere Musterklassenliste prüfen; ausgefüllte Vorlage kann lokal importiert werden. Demo-Schaltfläche und Beispiel-CSV enthalten dieselben 20 fiktiven Namen.
- Bei alter Stunde bleibt die Vergleichsgrundlage der Stand vor dieser Stunde. Symbolhinweise zeigen die vom Fachkern berechneten Ergebnisse.
- Letzte Eingabe mit simuliertem Speicherfehler: kein vollständiger Status und keine Erfolgsmeldung. Nach erfolgreichem Wiederholen: Abschlussbestätigung, Tastaturfokus und Rückweg zur Übersicht.
- Excel besitzt Klassenübersicht plus ein Blatt pro Person mit typisierten Zahlen und Daten, ohne IDs oder ausführbare Formeln; gleichnamige und lange Namen erhalten eindeutige gültige Blattnamen. CSV verwendet die dokumentierte deutsche Spaltenfolge.
- Wechsel einer Person im Verlauf behält Achse, Datumsbeschriftungen und Stundennummern bei. Unbewertete Stunden werden nicht als bewertete Leistungsdatenpunkte dargestellt.
- Navigation, Bewertung und Dateiabläufe bei 390, 768 und Desktopbreite prüfen; Farben sind zusätzliche Hinweise, die Texte bleiben maßgeblich.

Die neue Version ersetzt keine bereits laufende Erhebung mit `v0.5.0`. Eine weitere Erhebung benötigt einen separat festgelegten Versionsstand und Datensatz.

## 9. Abnahme der Bedienkorrekturen 0.6.1

- Fünf Symbole in Bewertung und Hilfe in der Reihenfolge `--`, `-`, `0`, `+`, `++`; keine zusätzliche Symbolaufzählung im Bewertungsbildschirm.
- Ergebnishinweis und Puffer getrennt, zurückhaltende Farben und kleine Statusangabe; Darstellung auf Smartphone, Tablet und Desktop visuell prüfen.
- Zwei vollständige Stunden tauschen: stabile IDs und zugehörige Beobachtungen bleiben erhalten; Nummern, sichtbare Reihenfolge, Personenauszug und chronologische Zwischenstände ändern sich. Bei simuliertem Speicherfehler bleibt die vorherige Reihenfolge erhalten und eine Fehlermeldung erscheint.
- Klasse mit mindestens 24 Stunden: zehn neueste anzeigen, zu früheren Fenstern blättern, auf 20 oder alle umschalten. Der Gesamtstand bleibt aus sämtlichen Stunden berechnet. Kein gültiger Eintrag wird abgeschnitten oder gelöscht.
- Kompakt-/Detailansicht und drei Schriftgrößen wechseln. `AW`, `NB`, `Offen` und bewertete `0` bleiben unterscheidbar; nur bewertete Zellen zeigen einen Zwischenstand.
- Diagramm mit einer und mit 20 Stunden: identischer fester horizontaler Stundenabstand. Personenwechsel erhält alle Datumspunkte. Unbewertete Stunden tragen Kurztexte und keine erfundenen Leistungsdatenpunkte.
- Namen, Gesamtstand und Spaltenköpfe beim internen Scrollen prüfen; auch die große Tabelle erzeugt kein horizontales Überlaufen der Seite bei 390 und 768 CSS-Pixeln.
