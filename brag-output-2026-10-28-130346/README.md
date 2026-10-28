# Gradeflow – Erklärung mit Florian

Neue Stimmfassung vom 28.10.2026: 108 Sekunden (1:48), 1920 × 1080, 30 Bilder/s. Die zuvor abgestimmten Szenen erklären Startwert 2,00, relative Bewertung, Viertelschritte, Puffer, Graph, Status und Exporte. Die Vorgänger bleiben unverändert.

## Was an der Stimme geändert wurde

Yannis hat nach zwei tatsächlichen Hörproben Florian gewählt und flüssigere Betonung gewünscht. Der Sprechertext verwendet jetzt zusammenhängende Sätze, klare Fragen und natürliche Satzgrenzen. Die Stimme **de-DE-FlorianMultilingualNeural** wurde mit der kostenlosen Online-Vorlesefunktion von Microsoft Edge über `edge-tts 7.3.1` erzeugt, mit Rate +5 Prozent und unveränderter Tonhöhe. Die fertigen Aufnahmen werden weder nachträglich beschleunigt noch künstlich in ihren Pausen gekürzt. Die subjektive Abnahme der vollständigen neuen Aufnahme steht noch aus.

Nur der öffentliche, fiktive Erklärtext wurde an den Sprachdienst gesendet. Das private BA-Manuskript und echte Personendaten wurden nicht übermittelt. Spracherzeugung ist online; Schnitt, Mischung, automatische Transkription zur Kontrolle und Videoexport laufen lokal. Es gab keine kostenpflichtigen API-Aufrufe und keine zusätzlichen Ausgaben.

57 kurze Textgruppen folgen den vom Sprachdienst gelieferten Wortzeiten. Die Wortwelle, Kameraaktionen, Werte und Pufferbewegungen wurden auf die neue Aufnahme abgestimmt. Die eigene Instrumentalmusik und dezente Bediengeräusche bleiben leise unter der Stimme.

## Bearbeiten

`narration.json` und `sprechertext.txt` enthalten den Sprechertext. Die zehn enthaltenen Sprachdateien unter `composition/assets/voice/` reichen zum erneuten Videoschnitt ohne Online-Spracherzeugung. `voice-boundaries.json` speichert die tatsächlichen Wortzeiten.

`prepare_timing.py` erzeugt daraus `timing.json` und prüft Wortzuordnung, Reihenfolge und Höchstdauer. `build_film.py` erstellt die zehn Szenen und die Hauptkomposition. `mix_audio.py` baut die Tonmischung mit FFmpeg wieder auf. Alle drei Programme verwenden Python 3; nur das optionale `generate_music.py` benötigt zusätzlich NumPy. Zum Ersetzen der Stimme dient `generate_voice.py` mit `edge-tts==7.3.1`, Internetzugang und FFprobe; das erneute Ausführen kontaktiert den Online-Sprachdienst.

Der Film selbst wird lokal mit Node.js ab 22, FFmpeg, Hyperframes 0.8.207 und GSAP 3.15.0 bearbeitet. In `composition` die Abhängigkeiten installieren, danach `npm run dev`, `npm run check` oder `npm run render` verwenden. Die Laufzeiten und Abhängigkeiten sind nicht mitgeliefert. Das bearbeitbare ZIP enthält die lokalen Grafik-, Ton-, Schrift- und GSAP-Dateien.

`pruefung.json` dokumentiert die tatsächlich ausgeführten Prüfungen. `sprachpruefung.json` enthält den offline kontrollierten Text. `inhalt-und-belege.md` ordnet Aussagen dem unveränderten Produktmodell zu. Das Titelbild ist zusätzlich als erstes Bild in der fertigen MP4 enthalten. MP4 und temporäre Laufzeitdateien bleiben außerhalb von Git.

## Inhaltliche Grenzen

Die App-Ansichten stammen aus Gradeflow 0.10.0 und enthalten ausschließlich fiktive Personen. Rechenbeispiele sind ausdrücklich bezeichnet. Der Startwert ist eine gewählte Ausgangsbasis, der Puffer eine Modellregel; eine pädagogische Wirkung wird nicht behauptet. Die Lehrkraft trifft die Entscheidung. Der Anwendungscode wurde für diese Stimmfassung nicht verändert.
