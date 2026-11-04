# Gradeflow – BA kompakt

Die neue Fassung dauert 90 Sekunden und hält die Nutzergrenze von maximal zwei Minuten ein. Sie übernimmt den bestätigten Stil des 80-Sekunden-Produktfilms und ersetzt einige Funktionsszenen durch die Begründung aus der Bachelorarbeit. Der bisherige Film und die ursprüngliche BA bleiben unverändert.

## Inhalt

Ausgangsproblem, Bezug zur Forschungsfrage, Bestandsanalyse des Prototyps, relative Einschätzung einer ganzen Stunde, gewählter Startwert 2,00, Puffer bei 1,00, AW/NB, sofortige Speicherung, Verlauf/Excel, lokale Sicherung sowie technische Prüfung und vorbereiteter Usability-Test. Eigene Modellentscheidungen und nachgewiesene Umsetzung werden getrennt. Die pädagogische Entscheidung bleibt bei der Lehrkraft.

## Bearbeiten

`composition/index.html` ist die direkt bearbeitbare Hyperframes-Komposition. `build_film.py` erzeugt sie aus dem Szenenaufbau und `composition/style.css` erneut. `scene-timing.json` nennt die elf Zeitfenster; `brag-plan.md` und `inhalt_und_belege.md` beschreiben Aussagen und Belege. Es werden keine privaten Manuskriptseiten mitgeliefert.

Kostenlose lokale Voraussetzungen zum Rendern: Node.js ab 22 und FFmpeg. In `composition` zunächst `npm install` oder `pnpm install` ausführen. Der Vorbereitungsschritt kopiert GSAP in die Assets; Abhängigkeiten und Laufzeitdateien werden nicht in Git aufgenommen. Danach `npm run dev`, `npm run check`, `npm run render`. Für einen erneuten Textaufbau reicht Python 3; für eine neue Musikerzeugung zusätzlich NumPy und FFmpeg. Es sind keine kostenpflichtigen Aufrufe erforderlich.

`brag.mp4` ist die lokal erzeugte Ausgabe und bleibt außerhalb von Git. `brag.jpg` ist das Titelbild und zugleich das erste Videobild. `pruefung.json` enthält die tatsächlichen Prüfergebnisse und die Dateiprüfsumme. Im ZIP liegt der benötigte lokale GSAP-Baustein bei.

## Einordnung

Echte App-Aufnahmen aus Gradeflow 0.10.0, ausschließlich fiktive Daten. Cursor und Übergänge werden filmisch nachgestellt; die dargestellten Eingabeschritte wurden tatsächlich ausgeführt. Das Modellschema ist eine Erklärung der festgelegten Regeln. Es ist keine Messung von Lernleistungen. Die technischen Tests belegen Regelumsetzung und Speicherung; der vorbereitete Usability-Test liefert in den vorliegenden Materialien noch keine Erhebungsergebnisse.

Automatisierte Filmprüfung: Browserlaufzeit, Layout, Bewegung und Kontrast. Strukturelle Hinweise auf wiederholte Bilder und elf Szenen in einer Datei werden durch die Sichtprüfung und einen Vergleich der dekodierten MP4-Bilder mit den Vorschaubildern kontrolliert.
