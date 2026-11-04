# Gradeflow – Produktpitch

80 Sekunden, 1920 × 1080, 30 Bilder/s. Der Film zeigt den lokalen Bachelorarbeitsprototyp 0.10.0 anhand ausschließlich fiktiver Daten. Er erklärt Klassenwahl, Bewertung, relative Berechnung, AW/NB, Abschluss, Tabelle, Verlauf, Excel, Farben, Demo und JSON-Sicherung. Es gibt Musik und kurze Geräusche; keine Sprachspur.

## Dateien

- `brag.mp4`: fertiger Film (lokal erzeugt, nicht in Git).
- `brag.jpg`: Titelbild; auch als erstes Videobild eingebaut.
- `composition/`: bearbeitbare Hyperframes-Komposition mit echten App-Abbildungen.
- `brag-plan.md`: Aussagen, Ablauf und Zeitplan.
- `composition-brief.md`: Gestaltungs- und Produktionsvorgaben.
- `CREDITS.txt`: Musik, Schriften und Geräusche.
- `share-copy.txt`: kurzer Begleittext.
- `pruefung.json`: Prüfergebnisse der tatsächlichen Ausgabe.

## Wieder bearbeiten und exportieren

Kostenlose lokale Voraussetzungen: Node.js ab 22 und FFmpeg. Im Unterordner `composition` die Abhängigkeiten mit `npm install` (oder `pnpm install`) installieren. `prepare_assets.mjs` kopiert GSAP aus der lokalen Installation; Abhängigkeiten und Laufzeitdateien werden nicht in Git abgelegt. Danach `npm run dev` für die Vorschau, `npm run check` für die Prüfung und `npm run render` für die MP4. Der Inhalt steht in `index.html`; das optionale `build_pitch.py` baut diese Datei erneut aus den Texten und dem mitgelieferten fiktiven Excel-Bericht auf (Python mit openpyxl).

`capture_ui.py` erstellt die App-Abbildungen in einem getrennten Chromium-Profil. Dafür die unveränderte App auf Port 4197 starten und Python mit Playwright verwenden. Das Skript greift nicht auf das normale Browserprofil zu. `generate_music.py` erzeugt die eigene Instrumentalmusik lokal mit NumPy und FFmpeg. Bestehende Medien reichen zum Rendern; Aufnahmen und Musik müssen für Textänderungen nicht neu erzeugt werden.

## Nachweis und Grenzen

Produktgrundlage: App-Commit `2a429ea`. Die Excel-Vorschau verwendet Werte und Blattnamen aus der tatsächlich exportierten Datei; sie ist als Filmvorschau gesetzt und keine Aufnahme von Microsoft Excel. Der Smartphone-Rahmen zeigt eine echte responsive Browseransicht, keinen geprüften nativen App-Build. Cursor und Übergänge werden in der Filmkomposition nachgestellt; der Eingabeablauf wurde zuvor tatsächlich ausgeführt.

Automatische Prüfung: keine Fehler in Lint, Browserlaufzeit, Layout, Bewegungsnachweisen und Kontrast. Strukturelle Hinweise auf wiederverwendete Bilder und die zehn Szenen in einer Datei wurden anhand der Einzelbilder geprüft. Sie verändern die App nicht. Eine technische Prüfung der Filmangaben ist kein wissenschaftlicher Wirksamkeitsnachweis.
