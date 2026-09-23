# Produktumfang und Anforderungen

## 1. Zweck

Die App unterstützt Lehrkräfte dabei, die mündliche Mitarbeit von Schülerinnen und Schülern nach jeder Unterrichtsstunde einheitlich zu dokumentieren und die Entwicklung über mehrere Stunden sichtbar zu machen.

Ein Eintrag bezieht sich immer auf die **Gesamtleistung einer Person während der jeweiligen Unterrichtsstunde**. Einzelne Wortmeldungen werden nicht als eigene Notenereignisse gespeichert.

## 2. Fachliche Abgrenzung

Zum Gegenstand der App gehört:

- fortlaufende mündliche Mitarbeit im regulären Unterricht,
- eine zusammenfassende Einschätzung pro Person und Stunde,
- zeitlicher Verlauf dieser Einschätzungen,
- nachvollziehbare Dokumentation der von der Lehrkraft eingegebenen Entscheidungen.

Nicht zum Gegenstand gehören:

- mündliche Prüfungen,
- Referate,
- Präsentationen,
- Kolloquien,
- automatische Analyse einzelner Äußerungen,
- Audio- oder Videoauswertung,
- automatische pädagogische Entscheidung durch ein Modell.

Der historisch gewachsene App-Name „Mündliche Notengebung“ ist weiter gefasst als der tatsächliche Funktionsumfang. Die neue Oberfläche muss deshalb an einer gut sichtbaren Stelle erklären, dass die App die fortlaufende mündliche Mitarbeit im Unterricht dokumentiert.

## 3. Nutzergruppen

Primäre Nutzergruppe:

- Lehrkräfte der Sekundarstufe I; das Konzept ist fächerübergreifend.

Testgruppe der Bachelorarbeit:

- Lehramtsstudierende als zukünftige Nutzerinnen und Nutzer.

Der Abschlusstest ist ein reiner Usability- und Bedientest. Er untersucht unter anderem Verständlichkeit, Navigation und flüssige Eingabe. Er ist kein pädagogischer Wirkungstest und prüft nicht, ob das Bewertungskonzept die tatsächliche Unterrichtsleistung objektiv oder gerechter misst.

## 4. Verbindliche Kernanforderungen

### A. Klassen und Personen

- Klassen aus CSV- oder TXT-Dateien importieren.
- Klassennamen eindeutig anzeigen und bearbeiten.
- Für eine Klasse beziehungsweise einen Kurs kann die Lehrkraft einen frei benannten Bewertungszeitraum anlegen.
- Der Bewertungszeitraum besitzt kein automatisch vorgegebenes Enddatum. Er läuft weiter, bis die Lehrkraft ihn selbst beendet oder archiviert.
- Es erfolgt kein automatischer Wechsel und kein automatisches Zurücksetzen nach einem Halbjahr oder Schuljahr.
- Namen nachträglich bearbeiten.
- Für die Bachelorarbeit ausschließlich fiktive Daten verwenden.
- Klassen archivieren oder löschen; Löschungen müssen bewusst bestätigt werden.

### B. Unterrichtsstunde

- Eine Unterrichtsstunde besitzt eine stabile ID, Datum und Erstellungszeit.
- Pro Klasse und Datum sind höchstens zwei Unterrichtsstunden zulässig. Die erste erhält intern `lessonSequence = 1`, die zweite `lessonSequence = 2`; ein dritter Eintrag wird mit verständlicher Fehlermeldung abgewiesen.
- Nur bei zwei Stunden am selben Datum zeigt die Oberfläche ihre Nummern als erste und zweite Stunde an. Diese Reihenfolge ist durch einen atomaren Tausch der Nummern korrigierbar.
- Wird eine von zwei Stunden gelöscht, erhält die verbleibende intern wieder `lessonSequence = 1`; ihre Nummer wird nicht mehr angezeigt. Eine später neu angelegte zweite Stunde erhält `2`.
- Innerhalb derselben Klasse darf die Kombination aus Datum und Stundennummer nicht doppelt vorkommen. Andere Werte als `1` und `2` sind unzulässig.
- Für jede Person wird genau einer der folgenden Zustände gespeichert:
  - `bewertet` mit einem Symbol aus `--`, `-`, `0`, `+`, `++`,
  - `abwesend`,
  - `nicht_beobachtet`.
- `abwesend` und `nicht_beobachtet` verändern Note und Puffer nicht.
- Beide Zustände bleiben in Tabelle, Bearbeitung, Verlauf und Export unterscheidbar.
- Jede Eingabe für eine Person wird unmittelbar lokal gespeichert. Es gibt keinen einzelnen Speichervorgang, bei dem erst die komplette Stunde übernommen wird.
- Eine unterbrochene Stunde bleibt als laufender Stand erhalten und kann später an derselben Stelle fortgesetzt werden.
- Eine Stunde gilt als vollständig erfasst, wenn jede Person einen der drei Zustände `bewertet`, `abwesend` oder `nicht_beobachtet` besitzt. Bereits vorhandene Einträge bleiben auch bei einer unvollständigen Stunde dauerhaft gespeichert.

### C. Bewertung und Verlauf

- Standardstartwert ist 2,0.
- Die Lehrkraft bewertet relativ zum bisherigen Stand mit fünf Symbolen.
- Die Berechnung folgt `02-bewertungsmodell.md`.
- Der Verlauf muss den Startwert und jede bewertete Stunde nachvollziehbar darstellen.
- Abwesenheit und Nichtbeobachtung dürfen im Diagramm nicht wie eine unveränderte Bewertung aussehen.
- Ältere Einträge und Stundennummern können bearbeitet werden; danach werden alle Werte vollständig in der Reihenfolge Datum, Stundennummer und stabile Sitzungs-ID neu berechnet.

### D. Dokumentation und Export

- Tabellenansicht mit Ausgangswert, Stunden, aktuellem Stand und Puffer.
- CSV-Export in einem eindeutig dokumentierten Format.
- Vollständige Datensicherung in einem versionierten JSON-Format.
- Import einer Sicherung darf bestehende Daten nicht ohne klare Warnung ersetzen.
- Exporte und Beispiele dürfen keine Zugangsdaten enthalten.
- Die für die Bachelorarbeit entwickelte und getestete Version speichert ihre Daten ausschließlich lokal. Anmeldung und Cloud-Synchronisierung gehören nicht zu ihrem Funktionsumfang.

### E. Nutzung und Verständlichkeit

- Bedienung auf Smartphone, Tablet und Desktop.
- Bewertung einer Klasse mit möglichst wenigen, klaren Eingaben.
- Aktueller Name, aktueller Stand, gewählter Stundenstatus und Fortschritt sind jederzeit sichtbar.
- Die Bedeutung der Symbole und des Puffers ist direkt in der App erreichbar.
- Die Oberfläche darf nicht suggerieren, dass der errechnete Stand automatisch eine rechtssichere oder objektive Endnote darstellt.

## 5. Anforderungen außerhalb des Bachelorarbeitskerns

Folgende Themen sind wichtig, gehören aber nicht zwingend in den Umfang der ersten getesteten Neufassung:

- App-Store-Veröffentlichung,
- produktiver Einsatz mit echten Schülerdaten,
- vollständige Mehrgeräte-Konfliktlösung,
- native iOS-Veröffentlichung,
- PDF-Berichte,
- Sitzplan,
- automatische Schuljahreskopie,
- gewichtete Kategorien.

Sie dürfen den Kernumbau nicht verdrängen. Der Schwerpunkt der Bachelorarbeit liegt auf begründeter technischer Weiterentwicklung und abschließendem Usability-Test.
