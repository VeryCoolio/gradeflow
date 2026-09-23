# Entscheidungen und offene Punkte

Codex darf offene Punkte nicht eigenständig als fachliche Tatsachen festlegen. Empfehlungen sind erlaubt, müssen aber als Empfehlung gekennzeichnet werden. Bestätigte Entscheidungen sind verbindlich und gehen dem Legacy-Verhalten vor.

Die für den Start des Fachkerns erforderlichen Entscheidungen O1 bis O5 und O7 sind getroffen. Die nachfolgend genannten nicht blockierenden Punkte können während der Oberflächenplanung geklärt werden.

## Fachliche Entscheidungen vor der Implementierung

### O1 – Überschüssiger Verbesserungsschritt – entschieden

Fall: aktueller Stand `1,25`, Eingabe `++`.

- Variante A: Ergebnis `1,00`, Puffer bleibt unverändert.
- Variante B: Ergebnis `1,00`, der überschüssige Viertelschritt wird als ein Pufferpunkt gespeichert.

Legacy-Verhalten: Variante A.

Entscheidung vom 23.09.2026: **Variante B**. Der überschüssige Viertelschritt wird als ein Pufferpunkt gespeichert.

### O2 – Unvollständige Stunde – entschieden

- Variante A: Endgültiges Speichern erst, wenn jede Person bewertet, abwesend oder nicht beobachtet ist.
- Variante B: Teilweise Stunden dürfen endgültig gespeichert werden; fehlende Einträge bleiben ein eigener Status.
- Variante C: Jede einzelne Eingabe wird sofort lokal gespeichert. Die Stunde bleibt bei fehlenden Personen als laufende Erfassung erhalten und kann später fortgesetzt werden.

Legacy-Verhalten: Eine Stunde kann gespeichert werden, sobald mindestens eine Bewertung vorhanden ist.

Entscheidung vom 23.09.2026: **Variante C**. Ein fehlender Eintrag bedeutet ausschließlich, dass diese Person in der laufenden Stunde noch nicht bearbeitet wurde. `abwesend` und `nicht_beobachtet` müssen weiterhin ausdrücklich gewählt werden.

### O3 – Startwert – entschieden

- Variante A: Startwert 2,0 ist fest.
- Variante B: 2,0 ist Standard, kann aber pro Klasse geändert werden.
- Variante C: individuelle Startwerte.

Bestätigte Produktregel: **Variante A**. Jede Person beginnt in der ersten Version fest mit `2,00`.

### O4 – Berechnungszeitraum – entschieden

- Halbjahr,
- Schuljahr,
- frei gewählter Bewertungszeitraum.

Entscheidung vom 23.09.2026: Die Lehrkraft bestimmt die Dauer selbst. Der Zeitraum ist technisch nicht automatisch begrenzt und läuft weiter, bis die Lehrkraft ihn bewusst beendet oder archiviert. Es gibt keinen automatischen Reset nach einem Halbjahr oder Schuljahr.

## Umfang der Bachelorarbeitsversion

### O5 – Umfang der Bachelorarbeit – entschieden

Entscheidung vom 23.09.2026: Die neu entwickelte und getestete Version speichert ausschließlich lokal. Anmeldung und Cloud-Synchronisierung werden bewusst ausgeklammert.

### O6 – Konfliktstrategie – außerhalb des aktuellen Umfangs

Für parallele Änderungen auf mehreren Geräten ist keine verbindliche fachliche Regel festgelegt. Da die Bachelorarbeitsversion keine Cloud-Synchronisierung enthält, blockiert dieser Punkt die Entwicklung nicht. Er bleibt eine mögliche spätere Anschlussperspektive.

## Weitere fachliche Entscheidung

### O7 – Mehrere Stunden am selben Datum – entschieden

Entscheidung vom 23.09.2026, anschließend präzisiert: Pro Klasse und Datum sind höchstens zwei Stunden zulässig. Die erste erhält intern `lessonSequence = 1` und zeigt keine Nummer. Die zweite erhält `2`; nur dann werden beide als erste und zweite Stunde angezeigt. Ein dritter Eintrag wird verständlich abgewiesen. Gültig sind ausschließlich `1` und `2`, und Datum plus Nummer sind je Klasse eindeutig. Eine Korrektur vertauscht die beiden Nummern atomar und berechnet den Verlauf vollständig neu. Nach Löschung einer von zwei Stunden erhält die verbleibende intern `1`, ihre Nummer wird verborgen und der Verlauf neu berechnet; die nächste zweite Stunde erhält wieder `2`. Chronologisch wird nach Datum, Nummer und zuletzt stabiler Sitzungs-ID sortiert.

## Nicht blockierende Entscheidungen

- Freitextnotiz bereits in der ersten Testversion oder erst später,
- Anzeige des Klassendurchschnitts,
- Referenzlinie bei Note 2 im Diagramm,
- zusätzliche sichtbare Uhrzeit bei mehreren Stunden am selben Datum,
- Bezeichnung der Zwischenwerte wie `1-2` und `2+`,
- endgültiger Produktname.

## Entscheidungsprotokoll

- 23.09.2026: O1 mit Variante B bestätigt.
- 23.09.2026: O2 mit Variante C bestätigt; einzelne Eingaben werden unmittelbar lokal gesichert.
- 23.09.2026: O3 aus der bereits festgelegten Produktregel übernommen; der Startwert `2,00` ist fest.
- 23.09.2026: O4 bestätigt; die Lehrkraft bestimmt die Dauer des Bewertungszeitraums selbst.
- 23.09.2026: O5 bestätigt; die Bachelorarbeitsversion bleibt lokal und enthält keine Cloud-Synchronisierung.
- 23.09.2026: O7 bestätigt; `lessonSequence` unterscheidet Stunden am selben Datum und bestimmt ihre Berechnungsreihenfolge.
- 23.09.2026: O7 präzisiert; höchstens zwei Stunden je Klasse und Datum, Nummer nur bei zwei Stunden sichtbar, atomarer Tausch und Normalisierung nach Löschung.
