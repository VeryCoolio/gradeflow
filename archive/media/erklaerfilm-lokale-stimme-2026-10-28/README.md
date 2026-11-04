# Gradeflow – So funktioniert es

108 Sekunden (1:48), 1920 × 1080, 30 Bilder/s. Überarbeitete Fassung nach der inhaltlichen Nutzerkorrektur vom 28.10.2026. Der Film erklärt die Anwendung und ihre Regeln: Startwert 2,00, relative Symbole, Viertelschritte, Puffer und persönlicher Graph. Forschungsablauf, historische Entwicklung und Usability sind keine Filmszenen.

## Stimme und Bewegung

Kostenlos lokal erzeugte deutsche Sprecherstimme. Die erste Stimmrichtung wurde vom Nutzer grundsätzlich akzeptiert, mit dem Wunsch nach mehr Tempo und weniger Monotonie. Die fertige Aufnahme wurde mit variierter Sprachmelodie neu erzeugt, längere Pausen wurden gekürzt und das Tempo bei gleicher Tonhöhe erhöht. Es wird keine konkrete ChatGPT-Stimme nachgeahmt. Zehn kurze Aufnahmen vermeiden fehlerhafte Enden langer Sprachgenerierungen. Die lokale Transkription aller Abschnitte wurde auf Vollständigkeit und Zahlenangaben kontrolliert.

58 kurze Sprachtextgruppen folgen den aufgenommenen Wörtern. Das jeweils gesprochene Wort erhält einen einmaligen Impuls aus Vergrößerung und leichter Aufwärtsbewegung. Gezielte Kamerawechsel, Rechenwerte und Pufferpunkte führen durch die Beispiele. Die Stimme steht vor der leisen eigenen Instrumentalmusik; vier dezente Geräusche setzen Akzente.

## Bearbeiten und lokal rendern

`composition/index.html` ist die Hauptkomposition; die zehn Szenen liegen unter `composition/compositions/`. `build_film.py` erzeugt die Szenen aus den festgelegten Inhalten und `timing.json`. `composition/style.css` enthält die Gestaltung. `sprechertext.txt` ist der vollständige Text; `narration.json` ordnet ihn den Szenen zu. `timing.json` enthält die tatsächlichen Sprachzeiten und die Wortgruppen. Bei Änderungen des gesprochenen Texts müssen Aufnahme und Wortzeiten gemeinsam angepasst werden.

Die fertige Tonmischung liegt unter `composition/assets/music/film-mix.mp3`. Die bearbeiteten Sprachabschnitte und die eigene Musik sind ebenfalls enthalten. `mix_audio.py` setzt die Tonspur aus diesen Dateien und den dokumentierten Sprachzeiten mit FFmpeg wieder zusammen. Für einen neuen Musiktake verwendet `generate_music.py` die Länge aus `timing.json` und benötigt NumPy und FFmpeg. Die Sprachmodelle und die lokale Python-Laufzeit werden nicht mitgeliefert oder ins Repository aufgenommen.

Kostenlose Voraussetzungen für den Videoschnitt: Node.js ab 22 und FFmpeg. In `composition` Abhängigkeiten mit `npm install` oder `pnpm install` installieren, danach `npm run dev`, `npm run check` und `npm run render` verwenden. Die genauen Bibliotheksversionen stehen in `package.json`. Der Vorbereitungsschritt kopiert GSAP in die lokalen Assets. Im bearbeitbaren ZIP liegt dieser Baustein bereits bei.

`brag.jpg` zeigt das Titelbild, das auch als erstes Bild in die fertige MP4 eingebettet ist. Die MP4 und Laufzeitdateien bleiben außerhalb von Git. `pruefung.json` protokolliert die tatsächlich ausgeführten Video- und Inhaltsprüfungen; `sprachpruefung.json` die Kontrolle der Sprachtexte.

## Inhalt und Grenzen

Echte Gradeflow-Ansichten aus Version 0.10.0 mit ausschließlich fiktiven Personen. Die Rechenbeispiele sind als solche gekennzeichnet. Der Startwert ist eine gewählte Ausgangsbasis; die Pufferabsicht ist keine nachgewiesene pädagogische Wirkung. Die Entscheidung bleibt bei der Lehrkraft. Die Originalfassungen und das private BA-Manuskript wurden nicht verändert. Der Anwendungscode wurde für diesen Film nicht geändert.
