# Barrierefreiheitsprüfung der Testversion 0.5.0

Prüfdatum: 25.09.2026. Geprüft wurde die lokale Browseroberfläche mit ausschließlich fiktiver Demo-Klasse. Dies ist eine technische Teilprüfung und keine Zertifizierung nach WCAG oder ein Test mit assistiver Technik durch Betroffene.

| Bereich | Befund |
| --- | --- |
| Tastatur | Der erste Tabstopp ist „Zum Inhalt springen“. Die vorhandenen Eingabe-, Bewertungs- und Navigationsschaltflächen sind per Tastatur erreichbar; der Fokus ist sichtbar umrandet. Der vollständige Stundenablauf ist zusätzlich durch einen Integrationstest mit Tab und Enter abgedeckt. |
| Semantik | Hauptinhalt, Navigation, Tabelle, Spalten- und Zeilenüberschriften, Formularbeschriftungen und Fortschritt besitzen semantische HTML-Elemente. Die Verlaufszeichnung hat einen zugänglichen Namen; alle Ereignisse stehen daneben als Textliste. |
| Statusänderungen | Aktuelle Person und Erfassungsfortschritt werden als höfliche Live-Regionen angekündigt. Speicherfehler erscheinen als `alert`, erfolgreiche Vorgänge als `status`. |
| Touch und Fokus | Reguläre Schaltflächen haben mindestens 44 CSS-Pixel Höhe; Links, Schaltflächen, Eingaben und aufklappbare Bereiche besitzen einen sichtbaren Fokusstil. |
| Kontrast | Stichproben anhand berechneter Browserfarben: Kopfzeile 13,08:1, Scope-Text 10,77:1, gedämpfter Fließtext 5,63:1, aktiver Ansichtsbutton 6,24:1 und kleine Tabellenbeschriftung 5,77:1. Alle geprüften Textproben liegen über 4,5:1. |
| Responsive Layout | Bei 390, 768 und 1280 CSS-Pixeln entsprach die Seitenbreite jeweils der Viewportbreite. Die breite Stundentabelle scrollte bei 390 Pixeln innerhalb ihres beschrifteten Bereichs. Import und Datensicherung sind nach Anlage einer Klasse aufklappbar, damit die laufende Stunde auf kleinen Bildschirmen früher erreichbar ist. |
| Formularprüfung | Im Browser wurden keine unbeschrifteten Eingabe- oder Auswahlfelder und keine unbenannten Buttons gefunden. Es wurden keine externen Skripte geladen. |

Offen bleiben ein praktischer Test mit Screenreader und Vergrößerung, ein systematischer WCAG-Audit aller Zustände sowie der Usability-Test mit Lehramtsstudierenden. Diese Punkte sind vor einer Aussage über umfassende Barrierefreiheit beziehungsweise vor produktivem Einsatz gesondert zu prüfen.
