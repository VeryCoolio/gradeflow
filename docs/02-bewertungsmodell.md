# Bewertungsmodell

## 1. Status der Regeln

Dieses Dokument beschreibt das vom Nutzer entworfene Rechenmodell. Der technische Test kann prüfen, ob die App diese Regeln korrekt umsetzt. Er kann nicht belegen, dass das Modell pädagogisch wirksam, objektiv oder schulrechtlich zulässig ist.

## 2. Startwert

Jede neu angelegte Person beginnt standardmäßig mit dem numerischen Stand `2,00`.

Begründungsabsicht des Nutzers:

- ein positiver Ausgangspunkt statt einer frühen negativen Einordnung,
- weiterhin sichtbarer Raum für Verbesserungen,
- schrittweise Entwicklung statt großer Sprünge.

Diese Begründung ist eine Produktentscheidung. Wissenschaftliche Bezüge in der Bachelorarbeit müssen gesondert mit überprüfbaren Quellen und vorsichtiger Formulierung behandelt werden. Aus dem Pygmalion-Effekt allein folgt nicht automatisch, dass exakt die Note 2,0 empirisch der richtige Startwert ist.

## 3. Eingaben und Änderung

| Symbol | Änderung des Zahlenwerts | Bedeutung in der App                        |
| ------ | -----------------------: | ------------------------------------------- |
| `--`   |                  `+0,50` | deutlich schlechter als der bisherige Stand |
| `-`    |                  `+0,25` | etwas schlechter als der bisherige Stand    |
| `0`    |                   `0,00` | ungefähr auf dem bisherigen Stand           |
| `+`    |                  `-0,25` | etwas besser als der bisherige Stand        |
| `++`   |                  `-0,50` | deutlich besser als der bisherige Stand     |

Im deutschen Notensystem ist ein kleinerer Zahlenwert besser. Der erlaubte Bereich reicht von `1,00` bis `6,00`.

## 4. Technische Repräsentation

Empfehlung für die neue Implementierung:

- intern Viertelschritte als ganze Zahl speichern,
- `4` entspricht Note `1,00`,
- `8` entspricht Note `2,00`,
- `24` entspricht Note `6,00`.

Dadurch werden Rundungsfehler vermieden. Die Anzeige wandelt den Wert in die schulübliche Schreibweise um:

| Zahlenwert | Anzeige |
| ---------: | ------- |
|       1,00 | `1`     |
|       1,25 | `1-`    |
|       1,50 | `1-2`   |
|       1,75 | `2+`    |
|       2,00 | `2`     |

## 5. Puffer bei Note 1

Wenn eine Person bereits den Wert `1,00` erreicht hat, können weitere positive Bewertungen bis zu drei Pufferpunkte aufbauen.

- `+` baut einen Pufferpunkt auf.
- `++` baut bis zu zwei Pufferpunkte auf.
- maximal drei Pufferpunkte,
- ein späteres `-` verbraucht zunächst einen Pufferpunkt,
- ein späteres `--` verbraucht zunächst bis zu zwei Pufferpunkte,
- nur der nicht durch Puffer gedeckte Rest verschlechtert den Zahlenwert.
- Führt ein Verbesserungsschritt teilweise bis zur Note `1,00`, wird ein dabei noch übriger Viertelschritt als Pufferpunkt übernommen. Beispiel: Aus `1,25` wird durch `++` die Note `1,00` mit einem Pufferpunkt.

Beispiel:

- vorher: Note `1`, Puffer `1/3`,
- Eingabe: `--`,
- ein Viertelschritt wird durch den Puffer ausgeglichen,
- ein Viertelschritt bleibt übrig,
- nachher: Note `1-`, Puffer `0/3`.

Der Puffer soll verhindern, dass eine zuvor über längere Zeit sehr gute Entwicklung durch eine einzelne schlechtere Stunde sofort vollständig sichtbar nach unten springt. Das ist eine vom Nutzer festgelegte Produktlogik, kein durch den Usability-Test bestätigter pädagogischer Effekt.

## 6. Status ohne Bewertung

| Status             | Notenänderung | Pufferänderung | Bedeutung                                                                                |
| ------------------ | ------------: | -------------: | ---------------------------------------------------------------------------------------- |
| `abwesend`         |         keine |          keine | Person war in der Stunde nicht anwesend                                                  |
| `nicht_beobachtet` |         keine |          keine | Es lag keine ausreichende Beobachtungsgrundlage für eine Bewertung der ganzen Stunde vor |

Diese Zustände werden als Ereignisse dokumentiert, aber nicht als Datenpunkt einer bewerteten Leistung behandelt. In einem Liniendiagramm kann die Linie zwischen bewerteten Stunden verbunden werden; der Status muss zusätzlich erkennbar oder in einer Ereignisliste zugänglich sein.

## 7. Chronologische Neuberechnung

Ausgangszustand ist immer der Startwert. Danach werden Sitzungen sortiert nach:

1. Datum,
2. `lessonSequence` aufsteigend bei gleichem Datum,
3. stabiler Sitzungs-ID als letzter technischer Gleichstand.

Pro Klasse und Datum sind höchstens zwei Stunden zulässig. Die erste erhält intern `lessonSequence = 1`, die zweite `lessonSequence = 2`. Nur bei zwei Stunden werden die Nummern sichtbar; ein dritter Eintrag wird verständlich abgewiesen. Die Kombination aus Datum und Nummer ist innerhalb der Klasse eindeutig, und ausschließlich `1` und `2` sind zulässig.

Eine Korrektur bei zwei Stunden tauscht die Nummern atomar zwischen `1` und `2` und berechnet danach den vollständigen Verlauf neu. Beim Löschen einer von zwei Stunden wird die verbleibende auf `1` normalisiert und der Verlauf neu berechnet. Solange nur eine Stunde vorhanden ist, wird keine Nummer angezeigt; eine später neu angelegte zweite Stunde erhält `2`.

Nur Einträge mit Status `bewertet` verändern Note oder Puffer. Werden alte Einträge geändert oder gelöscht oder wird eine Stundennummer korrigiert, wird der vollständige Verlauf deterministisch neu berechnet.

## 8. Ergänzende festgelegte Regeln

Die Lehrkraft entscheidet selbst, wie lange ein Bewertungszeitraum läuft. Es gibt keine automatische zeitliche Begrenzung und keinen automatischen Noten-Reset nach einem Halbjahr oder Schuljahr. Ein Zeitraum endet erst, wenn die Lehrkraft ihn bewusst beendet oder archiviert.

Pufferpunkte können nur beim Stand `1,00` vorhanden sein. Eine Verschlechterung über `1,00` hinaus tritt erst ein, nachdem die vorhandenen Pufferpunkte verbraucht wurden. Sobald der Stand schlechter als `1,00` ist, beträgt der Puffer deshalb immer `0/3`.

Der Startwert `2,00` ist für die erste Version fest vorgegeben. Die Übernahme eines überschüssigen Verbesserungsschritts in den Puffer ist bestätigt.

Siehe `07-offene-entscheidungen.md`.

## 9. Darstellung nach der Rückmeldung vom 10.10.2026

**Entscheidung:** Die fünf Symbole erhalten Grün- beziehungsweise Rotabstufungen; `0` bleibt neutral. Beschriftung und sichtbarer Auswahlzustand ergänzen die Farben. Die Bedeutung bezieht sich auf den berechneten Stand **vor der betreffenden Stunde**. Das gilt auch bei der Korrektur einer älteren Stunde; spätere Stunden beeinflussen diese Vergleichsgrundlage nicht. Die Ergebnishinweise auf den Schaltflächen verwenden dieselbe Puffer- und Grenzlogik wie die gespeicherte Berechnung.

**Entscheidung:** Eine vorbelegte Schuljahresbezeichnung verändert weder den Berechnungszeitraum noch den Startwert. Kein Enddatum, kein automatischer Reset.

**Offen:** Ein fachspezifischer Kriterienkatalog für die Beobachtung der mündlichen Mitarbeit wurde nicht vorgegeben. Die Oberfläche erläutert das bestätigte relative Modell, ohne neue Kriterien, feste Symbolnoten oder automatische pädagogische Urteile zu erfinden.
