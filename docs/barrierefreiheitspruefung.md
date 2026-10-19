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

## Ergänzende Teilprüfung des visuellen Redesigns – 10.10.2026

Die vorangehenden Abschnitte dokumentieren ihre jeweiligen historischen Gestaltungsstände. Die aktuelle CSS-Überarbeitung verändert keine Semantik, Beschriftung, Live-Region, Handler oder fachliche Funktion.

- Hauptnavigation, Klassen- und Tabellenauswahl besitzen zusätzlich zur Farbe eine Kontur beziehungsweise einen Akzentstreifen. Die ursprünglichen `aria-current`-/`aria-pressed`-Attribute bleiben unverändert.
- Aus den final verwendeten Farbwerten berechnete Kontraste: Bewertungsflächen 6,08:1 bis 6,63:1, niedrigster geprüfter Sekundärtext 5,38:1, aktive Navigation 8,52:1, Primärbutton 7,98:1, Erfolgs-/Fehlertext 6,80:1 / 7,50:1 und Diagrammbeschriftung 6,02:1. Eingabekonturen wurden auf 3,40:1 gegen Weiß beziehungsweise 3,29:1 gegen Papier angehoben. Dies ist eine Stichprobe, kein vollständiger Audit aller Zustände.
- Im tatsächlich bedienten Bewertungsablauf wurde ein 3 px breiter Tastaturfokus in `rgb(121,87,35)` festgestellt. Eingabe, Neuladen und Abschluss/Rückweg funktionieren auf dem isolierten fiktiven Datensatz; der Abschlussbutton wird weiterhin durch den vorhandenen Code fokussiert. Der programmgesteuert fokussierte, nicht interaktive Hauptinhalt besitzt keinen zusätzlichen flächigen Rahmen.
- Smartphonebewertung bei 320/390 px, Tablet bei 768 px, Desktop bei 1280/1920 px gerendert betrachtet. Die gemessene Seitenbreite entspricht den geprüften schmalen/breiten Viewports; Tabelle/Verlauf scrollen intern. Beschriftungen bleiben erhalten.
- Grundschrift `100%` berücksichtigt die Standardschrift. Statische exportierte DOM-Proben mit finaler CSS und 32 px Grundschrift wurden bei 390 px für Bewertung, Tabelle, Hilfe und manuelle Anlage geprüft. Navigation und Namenseingabe wechseln auf ausreichend breite Zeilen. Bei sehr schmalem Tabelleninhalt relativ zur Textgröße scrollen die sonst fixierten Namens-/Standspalten mit, damit sie Zellen nicht verdecken. Die Seiten überlaufen in diesen Proben nicht horizontal.
- Alle dekorativen Animationen sind endlich; Controls bewegen sich nicht. `prefers-reduced-motion: reduce` deaktiviert Übergänge und Animationen. Gerenderte pausierte Zwischenzustände und eine erzwungene statische Alternative wurden betrachtet; ein tatsächlicher OS-Wechsel der Bewegungspräferenz wurde nicht geprüft.

Ein nativer Archivierungsdialog war über das Browserwerkzeug nicht bedienbar; dessen vollständiger Tastaturablauf bleibt in dieser Browserrunde unbestätigt. Screenreader, vollständiger WCAG-Audit, echte Browser-/OS-Vergrößerung über alle Zustände, andere Browserengines und Test mit Lehramtsstudierenden bleiben offen. Die Vergrößerungsproben und Kontrastwerte begründen keine Aussage über umfassende Barrierefreiheit.

Bildbelege, exakte Prüfgrenzen und Änderungsumfang: [Visuelles Redesign](visuelles-redesign.md).

## Revisionsprüfung 0.7.0 – 18.10.2026

- Chromium 156 bei 390×844, 768×1024 und 1440×1000: Hauptnavigation sichtbar, zwei Tab-Schritte vom Hauptinhalt bis zum ersten Symbol, Personenwahl und Abschluss per Tastatur. Mobile Personenwahl als nativer Dialog, Fokus nach Auswahl zurück zum ersten Symbol. Die Eingabe steht im DOM vor der ergänzenden Liste.
- Haftender Kontext hält Name, Stunde, Fortschritt und Speicherfeedback bei der Eingabe. Speicherfehler bleiben im Bewertungsfeld; Wiederholung betrifft die ursprünglich fehlgeschlagene Person. HTML-Schaltflächen im zuletzt geprüften Zustand mindestens 44 px hoch.
- Lange fiktive Namen, 200 Prozent CSS-Grundschrift und reduzierte Bewegung geprüft. Der gesamte Name bleibt im Text erhalten; fokussierte Statusaktion liegt unterhalb des Kontexts. Kein Seitenüberlauf in den geprüften drei Breiten. Fehlerdetails sind aufklappbar. Die kompakte Stundenansicht, die zugängliche Tabelle und die eigene Scrollregion im Verlauf wurden geprüft.
- Die Verlaufstabelle besitzt nun ausdrücklich `role=region`, einen personenbezogenen Namen und `tabIndex=0`. Chromium konnte die alte Scrollfläche bereits automatisch fokussieren; der alte Zustand wird deshalb nicht pauschal als unbedienbar bezeichnet.
- Grenzen: Keine Zertifizierung, kein Screenreader, keine weitere Browserengine, keine echten Mobilgeräte, keine Windows-Prüfung und kein echter OS-/Browser-Zoom. Technische Ergebnisse und Bilder stehen im [Abschlussbericht](revision-2026-10-18/umsetzung/abschluss.md). Ein Test mit Lehramtsstudierenden bleibt erforderlich.
