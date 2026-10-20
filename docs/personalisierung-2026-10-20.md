# Farben, Klassensortierung und Demowerte – 20.10.2026

Auftrag: App-Farbton frei wählen, Klassen Pastellfarben zuordnen, die Klassenliste wahlweise nach Stufe/Alphabet oder Nutzung sortieren und einer bereits angelegten Demo fünf Beispielwochen hinzufügen.

- [x] App-Farbe mit Vorschlägen und freier Auswahl speichern.
- [x] Demo-Klasse zunächst leer anlegen; anschließend auf Wunsch fünf Wochen mit allen Statusarten ergänzen.
- [x] Pastellfarben für Klassen vergeben und sichern.
- [x] Klassen nach Stufe/Alphabet, zuletzt benutzt oder am längsten nicht benutzt sortieren.
- [x] Desktop, Mobilansichten, Speichern/Neuladen und bestehende Abläufe prüfen.
- [x] Version und Dokumentation; Commit/Push mit anschließendem Remote-Abgleich.

## Entscheidungen

Die Demo ergänzt 25 fiktive Stunden (fünf vollständige Montag-bis-Freitag-Wochen) vor der aktuellen Woche oder vor der ältesten vorhandenen Stunde. Alle fünf Symbole, AW, NB und offene Einträge kommen vor. Vorhandene Daten bleiben erhalten. Erneutes versehentliches Füllen wird verhindert. Eine unveränderte ältere Demo wird anhand des exakten Demo-Namens und der bekannten vollständigen fiktiven Namensliste erkannt; normale Klassen erhalten diese Aktion nicht.

App-Farbton, Sortierung und Nutzungsreihenfolge sind Einstellungen dieses Browserprofils. Klassenfarben gehören zur Klasse und damit in die JSON-Sicherung. Optionale Metadaten ergänzen Schema 1 ohne Migration; alte Sicherungen bleiben lesbar. Keine Fachregel wird verändert.

## Demowerte

Die Schaltfläche erscheint erst in der angelegten Demo unter Stunden. Zwei neue Prüfungen sichern 25 eindeutige Termine, alle Statusarten, Erhalt vorhandener Stunden, Einmaligkeit und den tatsächlichen Bedienablauf bis zur Tabelle ab. Demo-/App-Tests, Typecheck und Lint bestanden.

## Version 0.10.0: Bedienung

- **App-Farbe:** „Hilfe und Einstieg → Darstellung und Farben“. Sechs Vorschläge oder freie Wahl über den Farbwähler. Schrift, Schaltflächen, Tabellen und helle Flächen werden passend abgestimmt. Sehr helle Farben erhalten dunklere Text-/Schaltflächenfarben. Bewertungsrot und -grün behalten ihre Bedeutung.
- **Klassenfarbe:** „Klasse bearbeiten → Klassenfarbe“ oder „Klassenfarbe ändern“ im linken Register. Sechs sanfte Pastelltöne und „Ohne Farbe“. Gleiche Jahrgänge können manuell dieselbe Farbe erhalten; es gibt keine automatische Umfärbung anderer Klassen.
- **Reihenfolge:** Im Register „Klassen sortieren“, mobil auch auf der Darstellungsseite. Standard „Klassenstufe (A–Z)“, alternativ „Zuletzt benutzt“ oder „Am längsten nicht benutzt“. Im mobilen Klassenwähler gilt dieselbe Reihenfolge. Stufen werden aus dem Klassennamen gelesen, Parallelklassen alphabetisch eingeordnet; zum Beispiel 7a, 7b, Klasse 8a, Demo 8b, 8c, 10a. Nicht zuordenbare Namen folgen alphabetisch. Noch nie geöffnete Klassen stehen bei längster Nichtnutzung zuerst. Die Nutzung bedeutet Öffnen einer Klasse, nicht das Datum ihrer letzten Bewertung. Die Einstellung erstellt keine Stundenplanprognose.
- **Demo:** Eine Demo anlegen und in der Klassenansicht „Stunden“ auf „Demowerte für fünf Wochen erstellen“ klicken. Erst diese Aktion ergänzt Werte. 25 fiktive Termine (Mo–Fr über fünf vollständige Wochen) liegen vor der aktuellen Woche bzw. der ältesten vorhandenen Stunde. Vorhandene Stunden bleiben unverändert. Wiederholtes versehentliches Erzeugen wird verhindert; nach vollständigem Leeren ist ein erneutes Füllen möglich. Die Werte sind Anschauungsmaterial und kein tatsächlicher Unterrichts-/Ferienkalender.

## Speicherung und Kompatibilität

`gradeflow-ui-preferences-v1` speichert Farbton, Sortiermodus und die Reihenfolge zuletzt geöffneter Klassen getrennt vom Notebook. Diese Einstellungen gelten für das Browserprofil und werden zwischen dessen Tabs aktualisiert. Sie sind kein Teil der JSON-Sicherung. Scheitert das Speichern, bleibt die gewählte Darstellung für den Besuch erhalten; eine sichtbare Meldung erklärt die Grenze. Eine weitere Auswahl fällt dann nicht auf den älteren gespeicherten Farbton zurück.

Klassenfarben und die optionalen geprüften Kennzeichnungen `demo`/`demoDataGenerated` gehören zur Klasse und bleiben in der JSON-Sicherung erhalten. Bestehende Notebooks ohne diese Felder sind weiterhin gültig. Es gibt keine automatische Datenmigration, keinen Noten-Reset, keine geänderte Fachberechnung und keine neue Abhängigkeit. Importierte ungültige Farben oder Demo-Markierungen werden abgewiesen. Die App-Farbe erlaubt ausschließlich vollständige Hex-Farben; Klassen verwenden geprüfte Palettenwerte.

## Prüfung

- [x] **138 Tests in 24 Dateien**, Typecheck, Lint, Formatprüfung und Produktionsbuild erfolgreich.
- [x] Anwendungsfälle für Demo-Daten, Klassenfarben, Sicherungs-/Ladegrenzen, natürliche Sortierung, Nutzungsreihenfolge und helle/dunkle Farbtöne geprüft.
- [x] Farbauswahl, Klassenfarbe und Sortierung in der App gesetzt und nach erneutem Öffnen erhalten.
- [x] Speicherfehler bei Darstellungseinstellungen simuliert: zuerst eine Regression nachgewiesen, danach korrigiert und im Browser bestanden. Notebook dabei unverändert.
- [x] Demo erst leer, anschließend 25 zusätzliche Stunden. Eine zuvor manuell erfasste Stunde blieb identisch; alle Statusarten und offene Einträge sind in der Tabelle sichtbar.
- [x] Sechs Klassen nach Stufe/Parallelklasse und in beiden Nutzungsreihenfolgen bedient. Gleich gefärbte Parallelklassen und Klasse mit Namenspräfix geprüft.
- [x] JSON-Sicherung heruntergeladen und in einem anderen isolierten Browserprofil eingelesen: Klassenfarben und Demowerte erhalten; persönliche Darstellung bleibt profilbezogen.
- [x] 320×568, 390×844, 768×1024, 1440×1000 sowie 320 Pixel bei 200 Prozent Grundschrift ohne horizontales Seitenüberlaufen geprüft.
- [x] Zweiter Tab: App-Farbe und Klassenfarbe aktualisiert, Änderung der Klassenfarbe dort weiterhin gesperrt.
- [x] Bestehende Tour mit allen 15 Schritten bei 390/768/1440 Pixeln jeweils mit echten Aktionen und ausschließlich „Weiter“ bestanden. Eigene Daten/URL blieben erhalten.
- [x] Keine Browser-Laufzeitfehler in der neuen Abnahme.

Die Kontrastprüfung kontrolliert weiße Schrift auf den abgeleiteten Schaltflächenfarben und dunkle Schrift auf hellen Akzentflächen mit mindestens 4,5:1; die festen Klassen-Pastellflächen mit mindestens 7:1 gegen die verwendete dunkle Schrift. Zusätzlich wurden die tatsächlichen Ansichten betrachtet. Das ersetzt keinen vollständigen Screenreader-/WCAG-Test oder eine Prüfung auf physischen Mobilgeräten. Die freie Farbwahl wurde über das Farb-Eingabefeld in Chromium geprüft; die nativen Betriebssystem-Farbdialoge wurden nicht separat visuell getestet.

Die Web Design Guidelines von Vercel wurden am 20.10.2026 erneut gelesen (`https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`). Geänderte Bedienelemente besitzen Labels, native Tastaturbedienung und Fokusmarkierung. Der Direktweg zur Klassenfarbe ist ein echter Link; das Hilfemenü bleibt intern scrollbar. Die Browserleistenfarbe folgt dem gewählten hellen Hintergrund.

## Nachweise

- [Browser-Abnahme](personalisierung-2026-10-20/ergebnisse.json), [Tour](personalisierung-2026-10-20/tutorial.json), [zweiter Tab](personalisierung-2026-10-20/zweiter-tab.json).
- [Farbwahl mobil](personalisierung-2026-10-20/darstellung-390.png), [pastellfarbenes Register](personalisierung-2026-10-20/klassenfarben-1440.png), [große Schrift](personalisierung-2026-10-20/darstellung-320-schrift200.png).
- [Demotabelle](personalisierung-2026-10-20/demo-tabelle-390.png), [Demoverlauf](personalisierung-2026-10-20/demo-verlauf-390.png).
- Wiederholbarer Test: `app/e2e/personalization.py`. Ausschließlich fiktive Daten und kostenlose lokale Laufzeit.

## Abschluss

Version 0.10.0 in Paketdateien, README und Änderungsverlauf. Entwicklungsprotokoll sowie Anforderungen, Architektur, Testkonzept und bestätigte Entscheidungen ergänzt. Historische Referenzen und `v0.5.0` bleiben erhalten. GitHub-Commit/Push erfolgen gemäß dauerhafter Anweisung; der tatsächliche Remote-Stand wird nach dem Push im Chat bestätigt. Kein manueller Hosting-Deploy.

## Geänderte Quell- und Dokumentdateien

- `CHANGELOG.md`
- `README.md`
- `app/e2e/personalization.py`
- `app/index.html`
- `app/package-lock.json`
- `app/package.json`
- `app/src/App.test.tsx`
- `app/src/App.tsx`
- `app/src/application/appearance.test.ts`
- `app/src/application/appearance.ts`
- `app/src/application/classOrder.test.ts`
- `app/src/application/classOrder.ts`
- `app/src/application/classService.test.ts`
- `app/src/application/classService.ts`
- `app/src/application/demoClass.test.ts`
- `app/src/application/demoClass.ts`
- `app/src/components/AppNavigation.tsx`
- `app/src/components/ClassColorPicker.tsx`
- `app/src/components/ClassSwitcher.tsx`
- `app/src/domain/classes/classColor.ts`
- `app/src/features/classes/ClassWorkspace.tsx`
- `app/src/features/help/InfoPages.tsx`
- `app/src/features/settings/AppearancePage.tsx`
- `app/src/features/useUiPreferences.ts`
- `app/src/infrastructure/local/notebook-v1.schema.json`
- `app/src/infrastructure/local/schema.ts`
- `app/src/infrastructure/local/uiPreferences.test.ts`
- `app/src/infrastructure/local/uiPreferences.ts`
- `app/src/infrastructure/local/workspacePosition.ts`
- `app/src/styles.css`
- `docs/01-produktumfang-und-anforderungen.md`
- `docs/04-zielarchitektur.md`
- `docs/06-testkonzept.md`
- `docs/07-offene-entscheidungen.md`
- `docs/entwicklungsprotokoll.md`
- `docs/personalisierung-2026-10-20.md`

Die zusätzlichen PNG-/JSON-Nachweise liegen im oben verlinkten Nachweisordner.
