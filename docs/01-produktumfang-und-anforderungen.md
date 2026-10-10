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

- Klassen manuell mit Klassenname und je Person Vorname und Nachname anlegen oder aus Excel (.xlsx), CSV oder TXT importieren.
- Klassenlisten besitzen genau zwei Spalten: `Vorname` und `Nachname`, in dieser Reihenfolge und mit Kopfzeile. Beide Namensfelder sind erforderlich, maximal 45 Personen. Eine leere Musterklassenliste steht als Excel und CSV bereit.
- Klassennamen eindeutig anzeigen und bearbeiten.
- Bei einer neuen Klasse wird eine änderbare Schuljahresbezeichnung vorbelegt. Eine Auswahl ist im normalen Ablauf nicht erforderlich. Die Lehrkraft kann eine andere Bezeichnung (auch Halbjahr oder frei gewählter Zeitraum) verwenden.
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
- Excel-Klassenbericht mit Übersicht und einem Tabellenblatt je Person, ohne technische IDs; deutsche Bezeichnungen für Klasse, Bewertungszeitraum, Datum, Status, Symbol, Stand und Puffer.
- CSV bleibt als zusätzliche lesbare Auswertung ohne technische IDs verfügbar.
- Vollständige Datensicherung in einem versionierten JSON-Format.
- Import einer Sicherung darf bestehende Daten nicht ohne klare Warnung ersetzen.
- Exporte und Beispiele dürfen keine Zugangsdaten enthalten.
- Die für die Bachelorarbeit entwickelte und getestete Version speichert ihre Daten ausschließlich lokal. Anmeldung und Cloud-Synchronisierung gehören nicht zu ihrem Funktionsumfang.

### E. Nutzung und Verständlichkeit

- Bedienung auf Smartphone, Tablet und Desktop.
- Bewertung einer Klasse mit möglichst wenigen, klaren Eingaben.
- Aktueller Name, aktueller Stand, gewählter Stundenstatus und Fortschritt sind jederzeit sichtbar.
- Feste Navigation zu Klassen, Klassenerstellung, Datensicherung und Bewertungshilfe; keine Aufklappbereiche für diese Abläufe.
- Die Symbole sind zusätzlich zu Text und Auswahlzustand farblich abgestuft: `++` dunkelgrün, `+` hellgrün, `0` neutral, `-` hellrot, `--` dunkelrot.
- Bedeutung, Berechnung, Grenzen und Puffer sind direkt erklärt. Bei der Bewertung zeigt jedes Symbol das konkrete Ergebnis vom Stand vor der Stunde aus an.
- Nach der letzten erfolgreichen Speicherung erscheint eine eindeutige Abschlussbestätigung mit Rückweg zur Klassenübersicht. Speicherfehler dürfen keine Erfolgsmeldung auslösen.
- Der Verlauf verwendet für alle Personen dieselbe Achse mit allen Unterrichtsdaten, auch bei Abwesenheit, Nichtbeobachtung und offenen Einträgen. Die Ereignisse stehen in einer lesbaren Tabelle.
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
