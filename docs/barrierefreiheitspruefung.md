# Barrierefreiheitsprüfung der Testversion 0.5.0

Prüfdatum: 25.09.2026. Geprüft wurde die lokale Browseroberfläche mit ausschließlich fiktiver Demo-Klasse. Dies ist eine technische Teilprüfung und keine Zertifizierung nach WCAG oder ein Test mit assistiver Technik durch Betroffene.

| Bereich           | Befund                                                                                                                                                                                                                                                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tastatur          | Der erste Tabstopp ist „Zum Inhalt springen“. Die vorhandenen Eingabe-, Bewertungs- und Navigationsschaltflächen sind per Tastatur erreichbar; der Fokus ist sichtbar umrandet. Der vollständige Stundenablauf ist zusätzlich durch einen Integrationstest mit Tab und Enter abgedeckt.                                          |
| Semantik          | Hauptinhalt, Navigation, Tabelle, Spalten- und Zeilenüberschriften, Formularbeschriftungen und Fortschritt besitzen semantische HTML-Elemente. Die Verlaufszeichnung hat einen zugänglichen Namen; alle Ereignisse stehen daneben als Textliste.                                                                                 |
| Statusänderungen  | Aktuelle Person und Erfassungsfortschritt werden als höfliche Live-Regionen angekündigt. Speicherfehler erscheinen als `alert`, erfolgreiche Vorgänge als `status`.                                                                                                                                                              |
| Touch und Fokus   | Reguläre Schaltflächen haben mindestens 44 CSS-Pixel Höhe; Links, Schaltflächen, Eingaben und aufklappbare Bereiche besitzen einen sichtbaren Fokusstil.                                                                                                                                                                         |
| Kontrast          | Stichproben anhand berechneter Browserfarben: Kopfzeile 13,08:1, Scope-Text 10,77:1, gedämpfter Fließtext 5,63:1, aktiver Ansichtsbutton 6,24:1 und kleine Tabellenbeschriftung 5,77:1. Alle geprüften Textproben liegen über 4,5:1.                                                                                             |
| Responsive Layout | Bei 390, 768 und 1280 CSS-Pixeln entsprach die Seitenbreite jeweils der Viewportbreite. Die breite Stundentabelle scrollte bei 390 Pixeln innerhalb ihres beschrifteten Bereichs. Import und Datensicherung sind nach Anlage einer Klasse aufklappbar, damit die laufende Stunde auf kleinen Bildschirmen früher erreichbar ist. |
| Formularprüfung   | Im Browser wurden keine unbeschrifteten Eingabe- oder Auswahlfelder und keine unbenannten Buttons gefunden. Es wurden keine externen Skripte geladen.                                                                                                                                                                            |

Offen bleiben ein praktischer Test mit Screenreader und Vergrößerung, ein systematischer WCAG-Audit aller Zustände sowie der Usability-Test mit Lehramtsstudierenden. Diese Punkte sind vor einer Aussage über umfassende Barrierefreiheit beziehungsweise vor produktivem Einsatz gesondert zu prüfen.

## Ergänzende Teilprüfung 0.6.0 – 10.10.2026

Die Befunde oben beschreiben weiterhin den historischen Stand 0.5.0. Für die überarbeitete Oberfläche wurde zusätzlich geprüft:

- Feste, benannte Navigation und eigene Seiten ersetzen die Aufklappbereiche für Import und Datensicherung.
- Grün-/Rotabstufungen ergänzen Symbol, ausgeschriebene Bedeutung und sichtbare Auswahlumrandung. Der Auswahlzustand ist mit `aria-pressed` zugänglich; Ergebnishinweise sind den Bewertungsbuttons zugeordnet.
- Die erfolgreiche letzte Speicherung führt den Fokus auf „Zur Klassenübersicht“. Ein Integrationstest prüft, dass ein Speicherfehler keine Abschlussbestätigung erzeugt.
- Bei 390, 768 und 1255 CSS-Pixeln entsprach die Seitenbreite der Viewportbreite. Die Personenliste scrollt in ihrem Bereich; Tabellen und Verlauf können innerhalb ihrer Bereiche horizontal scrollen. Die kleinste im mobilen Bewertungsbildschirm gemessene Höhe sichtbarer Buttons betrug 44 CSS-Pixel.
- Die Verlaufsansicht verwendet dieselbe beschriftete Datumsachse für alle Personen; Status und Zahlen sind zusätzlich als semantische Tabelle lesbar.

Diese Ergänzung ist weiterhin keine vollständige WCAG-Prüfung. Screenreader, Vergrößerung, eine systematische Kontrastmessung aller neuen Zustände und die Erhebung mit Testpersonen sind offen.

## Ergänzende Teilprüfung 0.6.1 – 10.10.2026

- Symbolfolge in Bewertung und Hilfe: `--`, `-`, `0`, `+`, `++`. Ergebnis und Puffer sind über `aria-describedby` den Buttons zugeordnet; Symbol, Bedeutung und Auswahl bleiben zusätzlich zu den Farben erkennbar.
- Aus Browserfarben berechnete Textkontraste der fünf Bewertungsflächen: `--` 6,41:1; `-` 6,33:1; `0` 7,67:1; `+` 6,17:1; `++` 6,54:1. Alle fünf liegen über 4,5:1. Dies umfasst die Textfarben der Flächen, nicht einen vollständigen Kontrast-Audit sämtlicher Zustände.
- Bei 390 und 768 CSS-Pixeln kein horizontales Seitenüberlaufen; bei 1280 Desktopdarstellung visuell geprüft. Die mobile Bewertung trennt Bedeutung, Ergebnis und kleine Pufferangabe räumlich, ohne Überschneidung.
- Kompakt-/Detailansicht, Größenwahl und Stundenfenster sind benannte Standard-Bedienelemente. AW/NB/Offen besitzen ausgeschriebene zugängliche Beschriftungen und eine sichtbare Legende. Namen und aktueller Stand bleiben beim tatsächlichen horizontalen Scrollen im Tabellenbereich sichtbar.
- Stundentausch besitzt eine Erfolgsmeldung nach Speicherung und eine direkt sichtbare Änderung am Personenauszug. Ein Integrationstest prüft den Fehlerfall ohne vorgetäuschten Erfolg.

Screenreader, umfassende Vergrößerungsprüfung, vollständiger WCAG-Audit und Test mit Lehramtsstudierenden bleiben offen.
