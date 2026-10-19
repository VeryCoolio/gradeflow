# Visuelles Redesign – 10.10.2026

## Auftrag und geprüfter Ausgangsstand

**Iststand:** Ausgangspunkt ist `ada6c55929857ca08c69ce68495c80f5a68b83c3` (0.6.1). Gelesen wurden `AGENTS.md`, die nummerierten Dokumente 01–08 sowie die tatsächlichen React-Komponenten, Styles, Fach-, Speicher- und Exportmodule. React, Vite, striktes TypeScript, Vitest und npm bleiben bestehen. Die vorher vorhandene, unversionierte `app/src/main.ts` wurde nicht bearbeitet.

Das Produkt dokumentiert die relative mündliche Mitarbeit über die gesamte Unterrichtsstunde. Die Lehrkraft beurteilt selbst; Prüfungen, Referate und Präsentationen sind ausgeschlossen. Jede Beobachtung wird unmittelbar lokal gespeichert, eine unterbrochene Stunde wiederaufgenommen. Bewertungszeiträume haben keinen automatischen Abschluss oder Reset. Quellen: `docs/01-produktumfang-und-anforderungen.md`, `docs/02-bewertungsmodell.md`, `app/src/domain/`, `app/src/infrastructure/local/localRepository.ts`.

**Ansichteninventar:** Meine Klassen, Klasse anlegen (manuell/Datei), Datensicherung und Bewertung verstehen; innerhalb einer Klasse Stunden, Tabelle, Verlauf, Personen und Klasse bearbeiten; zusätzlich offene, teilweise erfasste und vollständige Stunden sowie bestehende Leer-, Fehler-, Lade- und Wiederherstellungszustände. Die App besitzt keine neue URL-Routenstruktur. Quellen: `app/src/App.tsx` und `app/src/features/`.

**Ausgangsbefund:** Gleichartige Karten und starke Buttonkonturen konkurrierten mit Ergebnissen und Kontext. Hauptnavigation, Klassenkontext und lokale Ansichten waren visuell wenig getrennt. Ergebnis und Zusatzinformation Puffer hatten zu ähnliche Gewichtung. Formulare, Hilfe und Sicherung wirkten wie voneinander getrennte Gestaltungssysteme. Vorherbilder wurden vor der Implementierung gesichert. Alle fünf technischen Ausgangsprüfungen bestanden mit 95 Tests.

**Kritische Abläufe:** Eingabe/sofortige Speicherung, Wiederaufnahme, vollständiger Abschluss und Rückweg, Korrektur früherer Beobachtungen, Zwei-Stunden-Grenze, atomarer Tausch, Löschung/Normalisierung, Tabellenfenster, Personenauswahl, Import, Excel/CSV-Auswertung, JSON-Vollsicherung und Rückfall. Diese Abläufe stammen aus dem vorhandenen Code und wurden nicht neu definiert.

## Gestaltungsentscheidung

**Entscheidung:** „Unterrichtsregister“ verbindet Papierflächen, violette Orientierung und eine schmale Randmarkierung. Der Name der aktuellen Person erhält eine ruhige Serifenschrift; Bedienung bleibt in System-Sans, Noten erscheinen mit gleichmäßigen Ziffern. Grün und Rot kennzeichnen die fünf bestehenden Bewertungsrichtungen. Die Gestaltung übernimmt die Gliederung eines Registers und eines Eintrags, ohne neue Produkttexte einzuführen.

Zwei getrennte lokale Entwürfe wurden mit demselben exportierten Bewertungs-DOM tatsächlich gerendert und verglichen:

| Entwurf | Komposition und Charakter | Entscheidung |
| --- | --- | --- |
| A: Unterrichtsregister | Seitlicher Arbeitsbereich, Personen als Registerzeilen, hervorgehobene aktuelle Person, Papier/Violett, Randlinien | Gewählt: klarer Stundenkontext und deutliche Hierarchie zwischen Person, Bedeutung, Ergebnis und Puffer |
| B: Dokumentationspult | Breite obere Navigation, horizontale Kontextzeile, gerade Konturen, reine Sans, Graphit/Mint | Verworfen: mehr vertikale Kontextfläche und schwächere Trennung zwischen Arbeitsnavigation und Bewertungsfarben |

Die [statischen Entwürfe](visual-redesign/entwuerfe/direction-a.html) und [Entwurf B](visual-redesign/entwuerfe/variant-b.html) liegen ausschließlich in der Dokumentation. Sie enthalten keine App-Logik und sind keine Bedienvorschau. [A](visual-redesign/entwurf-a.jpg) und [B](visual-redesign/entwurf-b.jpg) zeigen die gerenderten Varianten.

**Referenzprinzipien:** Die dokumentierte Trennung von Arbeitsbereich und zugehörigen Ansichten bei [Linear](https://linear.app/docs/default-team-pages), stabile benannte Orte und sichtbare Datumszuordnung bei [Things](https://culturedcode.com/things/support/articles/2803579/) und zusätzlich zur Farbe erkennbare aktuelle Navigation bei [GOV.UK](https://design-system.service.gov.uk/components/service-navigation/) dienten als Orientierung. Dies ist eine gestalterische Übertragung aus veröffentlichten Dokumentationen und Markupbeispielen. Eingeloggte Produkte, deren mobile Bedienung und reale Übergänge wurden nicht geprüft; die Linear-Bildquelle war nicht abrufbar.

## Implementierung und Bewegung

**Geprüfte Änderung:** Der produktive Diff betrifft ausschließlich `app/src/styles.css`. Alle bestehenden TS/TSX-Dateien, Tests, Datenmodelle, Speicherschlüssel, Exportziele, Dateien in `public/`, Pakete sowie `legacy-source/` und `reference/` sind unverändert.

- Papier-/Tintenfarben, Kontraste, Radien, Schatten und Übergangszeiten stehen zentral in CSS-Tokens.
- Hauptnavigation, Klassenansichten, Zeilen, Formulare, Hilfe, Tabelle, Verlauf und Sicherung folgen denselben Kontur- und Abstandsregeln.
- Die aktuelle Person, Auswahl und Ergebnis sind hervorgehoben; Puffer und vorhandener Status bleiben als kleinere Zusatzinformation erhalten.
- Eine eigens gezeichnete CSS-Papiermarke und die Randlinie sind reine Dekoration mit leerem Pseudoelement-Inhalt.
- Verwendet werden ausschließlich vorhandene Systemschriften. Keine Fontdatei, Bibliothek, externe Anfrage oder neue Datenübertragung wurde ergänzt.
- Mobile Bewertung verwendet lesbare horizontale Zeilen; bei geringem Platz oder vergrößerter Schrift wandern Ergebnis und Puffer darunter. Navigation und Formulare passen ihre Spalten an die Textgröße an.
- Tabelle und Diagramm scrollen weiterhin innerhalb beschrifteter Bereiche. Bei normaler mobiler Schrift bleiben Namen und aktueller Stand fixiert. In sehr schmalem Inhaltsraum relativ zur Schriftgröße scrollen diese Spalten mit, damit sie Stundenwerte nicht verdecken. Die Kopfzeile bleibt vertikal fixiert.
- SVG-Inhalte, Koordinaten, Datumsbeschriftungen, Titel und 112 Einheiten je Stunde bleiben erhalten; die Darstellung skaliert mit der Grundschrift. Bei 16 px wurden 2793 × 315 px und unverändertes `viewBox="0 0 2793 315"` gemessen.

| Auslöser | Visuelle Rückmeldung | Dauer / Verlauf | Reduzierte Alternative |
| --- | --- | --- | --- |
| Hover oder Fokus eines vorhandenen Controls | Hintergrund, Kontur und Schatten | 140 ms, gemeinsame Kurve `cubic-bezier(.2,.7,.2,1)` | Sofortiger statischer Zustand |
| Bereits bestehende Auswahl eines Bewertungssymbols | Auswahlkontur setzt sich durch einen kurzen Schattenübergang | 260 ms, einmalig | Statische Kontur und Punkt |
| Erscheinen der Bewertungsfläche | Nicht interaktive Randlinie wächst über `transform` und `opacity` | 380 ms, einmalig | Vollständige Randlinie |
| Tatsächlicher vollständiger Stundenstatus | Linke Abschlusskontur erscheint | 380 ms, einmalig | Sofortige Abschlusskontur |

Keine Steuerfläche wird verschoben. Texte und Bedienung warten auf keine Animation. Keine zusätzliche Endlosschleife und keine fingierte Speicher- oder Fortschrittsanzeige. `prefers-reduced-motion: reduce` deaktiviert Animationen und Übergänge. Normale Zustandswechsel wurden bedient; Zwischenzustände bei 25/75 Prozent und eine statische Alternative wurden aus derselben CSS als pausierte lokale Proben gerendert und betrachtet. Die Proben ersetzen keine Messung der Bildrate oder einen OS-Test der Bewegungseinstellung.

## Visuelle Prüfungen und Nachbesserungen

**Durchlauf 1 – Desktop und Hilfe:** Bewertungsflächen, Schrift, Formulare und Navigationshierarchie gerendert geprüft. Zu schwache Eingabekonturen wurden von 2,45:1 auf 3,40:1 gegen Weiß angehoben. Aktive Klasse und Tabellenmodus erhielten zusätzliche Akzentstreifen. Zu kleine Puffer-/Statusangaben wurden vergrößert. Die Grundschrift wurde auf `100%` gesetzt; lange Namen können umbrechen. Der zusätzliche Browserrahmen am programmgesteuert fokussierten Hauptinhalt wurde entfernt; interaktive Fokusmarkierungen bleiben sichtbar.

**Durchlauf 2 – 320/390/768 px und 24 Stunden:** Mobile Ergebnisanordnung entquetscht, einzelne Klasse auf volle Breite gesetzt, aktive Hoverfarben korrigiert. Lange Detailstatus in der Tabelle umbrechen innerhalb ihrer Zellen. Tabellenbereich tatsächlich horizontal bedient, Kopf-/Namens-/Standspalten geprüft.

**Abschlussverfeinerung – große Schrift und breite Ansicht:** Bei 200 Prozent Grundschrift wurden zunächst zu schmale Navigation, ein überbreiter Anlegen-Button, überlagernde fixierte Tabellenspalten sowie ungünstige Hilfe-/Namensspalten gefunden. Navigation, Hilfe und Namenseingabe erhalten ausreichend breite Zeilen; der Anlegen-Button ist auf die Formularbreite begrenzt. In der sehr schmalen Tabelle scrollen alle Spalten horizontal, Notenzahlen bleiben zusammen. Eine spätere schmale Medienregel überschreibt die angepasste Bewertungsanordnung nicht mehr.

| Tatsächlich geprüfte Darstellung | Ergebnis / Beleg |
| --- | --- |
| 320 × 740, Bewertung | Kein horizontales Seitenüberlaufen; [Bild](visual-redesign/nachher-bewertung-320.jpg) |
| 390 × 844, Bewertung | Kein horizontales Seitenüberlaufen; [Vorher](visual-redesign/vorher-bewertung-mobil.jpg), [Nachher](visual-redesign/nachher-bewertung-mobil.jpg) |
| 768 × 1024, Bewertung | Geprüfte Tabletkomposition; [Bild](visual-redesign/nachher-bewertung-tablet.jpg) |
| 1280 × 900, Bewertung | Gerendert geprüft; [Vorher](visual-redesign/vorher-bewertung-desktop.jpg), [Nachher](visual-redesign/nachher-bewertung-desktop.jpg) |
| 1920 × 1080, Bewertung | Begrenzter Arbeitsbereich, kein Seitenüberlaufen; [Bild](visual-redesign/nachher-bewertung-breit.jpg) |
| 390 px, detaillierte Tabelle / alle 24 Stunden / groß | Internes Scrollen; 319 px breiter Bereich, Namensspalte 112 px, aktueller Stand 80 px; [Bild](visual-redesign/nachher-tabelle-mobil.jpg) |
| 390 px, Grundschrift 32 px | Bewertung, Tabelle, Hilfe und manuelle Anlage als statische DOM-Proben mit finaler CSS gerendert; kein horizontales Seitenüberlaufen. [Bewertung](visual-redesign/schrift-200.jpg), [Tabelle](visual-redesign/tabelle-schrift-200.jpg), [Hilfe](visual-redesign/hilfe-schrift-200.jpg), [Anlage](visual-redesign/anlegen-schrift-200.jpg) |

Die 200-Prozent-Proben erzwingen `:root { font-size:200% }` auf exportiertem DOM. Sie sind keine Prüfung des Browserzooms, von OS-Textskalierung oder sämtlicher interaktiver Zustände. Exportierte native Selects können ihren ursprünglichen HTML-Auswahlzustand zeigen; die Tabelle selbst wurde aus dem aktiven Zustand mit allen 24 Stunden und großer Darstellung exportiert. Anfangs falsch zugeordnete „Mobile“-Aufnahmen mit tatsächlich 1280 px Breite wurden verworfen; die hier verlinkten Smartphonebilder haben nachgemessene 320/390 px Breite.

## Inhaltstreue und Funktionserhalt

**Automatischer Quellvergleich:** `node scripts/verify-redesign.mjs` vergleicht mit dem festgehaltenen Ausgangscommit. 74 Dateien werden bytegenau geschützt; sechs produktive TSX-Dateien über den vollständigen Syntaxbaum verglichen. Erlaubte Ausnahmen sind Klassenbezeichner und statische, ereignisfreie, ausdrücklich ausgeblendete SVG-Dekoration. Diese Umsetzung nutzt keine solche TSX-Ausnahme: alle sechs Dateien blieben byteidentisch. Elf Selbstprüfungen erkennen unter anderem veränderte Texte, ARIA-Namen, Handler, Zahlen, Links, Downloadnamen und Diagrammkoordinaten. CSS-Sichtbarkeit und Laufzeitbedienung benötigen weiterhin die ergänzende Browserprüfung.

**Browservergleich:** Zehn identische Zustände wurden vor/nach CSS-Wechsel verglichen: Bewertung, Sicherung, manuelle Anlage, Hilfe, Verlauf, Import, Übersicht, Personen, Einstellungen und Tabelle. Sichtbarer Text, Linkziele und Downloadattribute sowie Texte/Werte/ARIA-/Auswahlattribute von Bedienelementen stimmen in allen zehn Zuständen überein. Rohdaten und Ergebnisse: [inhaltvergleich.json](visual-redesign/inhaltvergleich.json). Der Vergleich erfolgte bei derselben fiktiven Klasse; keine echten Nutzerdaten wurden zum Erzeugen der Bilder verändert.

**Ergänzende Bedienprüfung auf getrennten lokalen Ursprüngen:**

- Fiktive Klasse manuell angelegt; `--`, Abwesend und Nicht beobachtet erfasst.
- Nach einer Eingabe neu geladen: Teilstand und Fortsetzung vorhanden.
- Vollständiger Abschluss nach drei Eingaben mit echter Speicherbestätigung; Rückweg per Enter bedient.
- Tastaturfokus an Bewertungsbutton: 3 px, `rgb(121,87,35)`; Tabellenbereich per Tastatur tatsächlich gescrollt.
- Zweite Stunde am Datum angelegt; dritte Stunde verständlich abgewiesen.
- Excel-Erzeugung mit erfolgreicher Rückmeldung und gestartetem Download.
- Tabellenfenster/Detail-/Größenwahl, Personenauswahl und Hauptansichten geprüft.
- Konsole der geprüften regulären Produktions-Tabs: keine Warnungen oder Fehler. Styles, HTML und JavaScript wurden geladen. Die temporären Python-Prüfserver protokollierten jedoch 404 für automatisch angefragtes `favicon.ico`; im unveränderten App-HTML ist kein Favicon verlinkt. Keine neu eingeführte App-Ressource fehlt. Downloaddateien und Linkattribute sind zusätzlich durch den Quell-/Dateivergleich geschützt.

**Prüfgrenze:** Die native Archivierungsbestätigung blockierte den betreffenden automatisierten Browser-Tab; die Dialog-API lieferte keinen bedienbaren Dialog. Archivierung und Rückfall wurden deshalb im Browser in dieser Runde nicht vollständig abgeschlossen. Die vorhandenen automatisierten Tests bestehen. Dateiauswahl/JSON-Rückfall, eine Ladefehlerwiederherstellung und native Excel-Bedienung wurden nicht erneut vollständig manuell geprüft. Deren bestehender Code und Testerwartungen sind geschützt.

## Technische Prüfungen und gemessener Umfang

Befehle wurden in `app/` mit npm ausgeführt; [Prüfausgaben](visual-redesign/pruefergebnisse.txt):

| Prüfung | Ergebnis |
| --- | --- |
| `npm run typecheck` | Bestanden |
| `npm test` | 95/95 Tests in 15 Dateien bestanden, separater Lauf 15,54 s |
| `npm run lint` | Bestanden |
| `npm run format:check` | Bestanden |
| `npm run build` | Bestanden; bekannte Warnung zum separat geladenen Excel-Modul |
| `node scripts/verify-redesign.mjs` | PASS, 74 bytegeschützte Dateien, sechs TSX-Dateien, elf Selbstprüfungen |
| `git diff --check` | Ohne Befund |

Ein vorheriger paralleler Lauf zusammen mit Build und anderen Prüfungen endete mit 94/95 Tests: Der unveränderte asynchrone Excel-Importtest fand die Klassenüberschrift innerhalb seines Zeitlimits nicht; die Anzeige war noch „Klassenliste wird geprüft …“. Der danach separat ausgeführte vollständige Lauf bestand. Die längere parallele Laufzeit deutet auf Last-/Timingempfindlichkeit hin; deren Ursache wurde nicht abschließend bewiesen. Kein Timeout und keine Testerwartung wurden geändert.

| Produktionsdatei | Vorher | Nachher |
| --- | ---: | ---: |
| CSS, minifiziert / gzip | 14,50 / 3,71 kB | 29,66 / 6,73 kB |
| Haupt-JavaScript / gzip | 284,72 / 87,31 kB | 284,72 / 87,31 kB |
| Separates Excel-Modul / gzip | 940,22 / 272,17 kB | 940,22 / 272,17 kB |

Gleicher Vite-Produktionsbefehl; CSS wächst um 3,02 kB gzip. Keine zusätzlichen Assets oder Laufzeitpakete. JavaScript-Dateinamen ändern sich durch den eingebundenen CSS-Hash; die Logikdateien bleiben unverändert. Navigation-Timing war über die verfügbare Browser-Schnittstelle nicht abrufbar. Keine LCP-, FPS-, schwache-Geräte- oder belastbare Ladezeitmessung wurde vorgenommen; eine Performanceverbesserung wird nicht behauptet.

**Offen:** Screenreader, vollständiger WCAG-Audit, echte Browser-/OS-Vergrößerung, weitere Browserengines, schwächere Geräte und Usability-Erhebung mit Lehramtsstudierenden. Lokale Speicherung bleibt browser-/ursprungsgebunden; Speicherbereinigung, Quoten- und Geräteverlust sowie der Schutz externer personenbezogener Sicherungen bleiben bestehende Risiken. Keine Migration, Cloud-Synchronisierung, Veröffentlichung oder Deployment in diesem Auftrag.

**Lokale Vorschau:** `http://127.0.0.1:5174/`. Der Entwicklungsserver bleibt gestartet. Isolierte Prüfansichten und Entwurfserver sind Arbeitsmittel; Screenshots zeigen ausschließlich fiktive Daten.

## Exakte Dateiänderungen

**Bearbeitet:** `app/src/styles.css`, `docs/barrierefreiheitspruefung.md` und `docs/entwicklungsprotokoll.md`.

**Neu:** `docs/visuelles-redesign.md`, `app/scripts/verify-redesign.mjs` und die unten aufgelisteten Dokumentationsbelege. `app/src/main.ts` war bereits vorher unversioniert und gehört nicht zu den Änderungen.


```text
docs/visual-redesign/animation-25.jpg
docs/visual-redesign/animation-75.jpg
docs/visual-redesign/animation-statisch.jpg
docs/visual-redesign/anlegen-schrift-200.jpg
docs/visual-redesign/entwuerfe/base.css
docs/visual-redesign/entwuerfe/direction-a.css
docs/visual-redesign/entwuerfe/direction-a.html
docs/visual-redesign/entwuerfe/variant-b.css
docs/visual-redesign/entwuerfe/variant-b.html
docs/visual-redesign/entwurf-a.jpg
docs/visual-redesign/entwurf-b.jpg
docs/visual-redesign/fehler-dritte-stunde.jpg
docs/visual-redesign/hilfe-schrift-200.jpg
docs/visual-redesign/inhaltvergleich.json
docs/visual-redesign/leer.jpg
docs/visual-redesign/nachher-bewertung-320.jpg
docs/visual-redesign/nachher-bewertung-breit.jpg
docs/visual-redesign/nachher-bewertung-desktop.jpg
docs/visual-redesign/nachher-bewertung-mobil.jpg
docs/visual-redesign/nachher-bewertung-tablet.jpg
docs/visual-redesign/nachher-hilfe.jpg
docs/visual-redesign/nachher-import.jpg
docs/visual-redesign/nachher-sicherung.jpg
docs/visual-redesign/nachher-tabelle-mobil.jpg
docs/visual-redesign/nachher-tabelle.jpg
docs/visual-redesign/nachher-uebersicht.jpg
docs/visual-redesign/nachher-verlauf.jpg
docs/visual-redesign/pruefergebnisse.txt
docs/visual-redesign/schrift-200.jpg
docs/visual-redesign/stunde-abgeschlossen.jpg
docs/visual-redesign/stunde-offen.jpg
docs/visual-redesign/tabelle-schrift-200.jpg
docs/visual-redesign/tastaturfokus.jpg
docs/visual-redesign/vorher-bewertung-desktop.jpg
docs/visual-redesign/vorher-bewertung-mobil.jpg
```
