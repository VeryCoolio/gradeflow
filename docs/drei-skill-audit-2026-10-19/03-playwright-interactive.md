# 3. Playwright Interactive – abgeschlossen

Der offizielle Skill wurde mit dokumentierter lokaler Laufzeitanpassung ausgeführt: persistente Node-REPL statt des im Upstream benannten alten `js_repl`, vorhandenes kostenloses Playwright/Chromium statt neuer App-Abhängigkeit. Browserhandles wurden über viele Prüfungen wiederverwendet. Zwei technische REPL-Neustarts während der Aufnahme wurden als Prüfwerkzeuggrenze behandelt; sie sind keine App-Abstürze.

## Vorgehen

1. Prüfinventar aus Nutzerwünschen, sichtbaren Controls und geplanten Abschlussaussagen erstellt.
2. Produktionsvorschau auf eigener Adresse 127.0.0.1:4190 gestartet.
3. Funktionsprüfung mit normalen Klicks, Texteingaben, Dateiauswahl, Tastatur und tatsächlichen Downloads.
4. Gespeicherte Werte und DOM-Zustände gelesen und verglichen; JavaScript nur für Inspektion, Testdatenvorbereitung und gezielte Speicherfehlerinjektion verwendet.
5. Getrennte visuelle Prüfung von Screenshots in Ruhe, Datenregionen nach internem Scrollen und Fehlersituationen.
6. Layoutmessungen, Tutorialgeometrie und Großschrift mit dem tatsächlichen Bild abgeglichen.
7. Fünf konkrete Beobachtungen mit einem separaten Python-Playwright-Skript nochmals nachgestellt.

## Abgedeckte Szenarien

- Anlage manuell und per CSV, Entwurf nach Neuladen, Person ergänzen/entfernen, 45/46-Personengrenze, zehn Klassen mit Suche und mobilem Wechsel.
- Alle fünf Symbole mit Ergebnisvorschau, AW/NB, Fortschritt, sichere Abschlussansicht, Korrektur und bestätigte/abgebrochene Entfernung.
- Unterbrechung, Wiederaufnahme und Neuladen; höchstens zwei Stunden; atomarer Tausch mit stabilen Beobachtungen.
- Tabelle kompakt/detailliert, Größenwahl, Stundenfenster, echtes Tastaturscrollen; AW/NB/Offen im Verlauf.
- Klasse/Zeitraum/Person umbenennen, Archiv und Wiederöffnung; Klassenlöschung abbrechen und aus Rückfall wiederherstellen.
- CSV/XLSX/JSON-Downloads, ungültiges JSON ohne Bestandsänderung, ersetzenden Import abbrechen, Import-Rückfall exakt wiederherstellen.
- Schreibschutz im zweiten Tab, Übernahme nach Schließen des Schreibertabs.
- Speicherfehler: kein Fortschritt oder falscher Abschluss; Wiederholung für die ursprüngliche Person trotz zwischenzeitlicher Personenwahl. Hauptnavigation offenbart B01.
- Tutorial 15 × vier Größen ohne Eingabe und automatischen Download; zusätzlicher tatsächlicher Aktionsablauf einschließlich Datei, Tab/Enter und unveränderten eigenen Daten/Entwurf/URL. Erstbesuch und manuelles Wiederstarten geprüft.
- 200 Prozent CSS-Grundschrift, sieben fokussierte Bewertungs-/Statusaktionen, Escape im nativen Personendialog, reduzierte Bewegung und unveränderte Hovergeometrie.
- Live-Kurzablauf auf Netlify und identische Produktionsdateien.

Die Zwischenversuche wurden erhalten: Eine Dialogsteuerung im Prüfwerkzeug nahm zunächst fälschlich an statt abzubrechen; beim Tabellenpfeil wurde vor dem ersten Browser-Scrollframe gemessen. Beide Prüfungen wurden korrigiert und bestanden. Nach der Wiederherstellung wurde die zunächst wieder geöffnete Erstbesuchstour beendet, statt eine Sicherungsseite zu erwarten. Ein exakter Selektor für umschlossene Select-Beschriftungen wurde erweitert; eine XML-Prüfung übersprang danach Verzeichniseinträge korrekt. Frühe Screenshotframes zeigten gelegentlich auslaufende Tab-Hintergrundübergänge. Aufnahmen nach dem Übergang waren korrekt; daraus wird kein aktiver-Tab-Fehler behauptet. Ein unbeschränktes Warten auf Animationsversprechen wurde durch ruhige Screenshotaufnahmen ersetzt.

## Grenzen

Headless Chromium 156 auf diesem Mac, simulierte Ansichtsgrößen. Keine echten Touch-/Bildschirmtastatur-, Safari-, Firefox-, Windows- oder Screenreaderprüfung. CSS-Großschrift ersetzt keinen nativen Zoom. Die Python-Wiederholung verwendet ebenfalls Chromium und ist keine zusätzliche Browserengine. Details und alle Rohwerte stehen unter `nachweise/`.
