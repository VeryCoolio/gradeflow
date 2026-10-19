# Revisionsstand 0.7.0 prüfen

Der vollständige Umbau wurde am 18.10.2026 nach dem neuen Audit freigegeben und umgesetzt. [Abschlussbericht](umsetzung/abschluss.md) und [Bildvergleich](umsetzung/vergleich.html) zeigen das Ergebnis. Die bisherigen Dateien unter `nachweise/` und die darunter beschriebenen Ausgangsskripte bleiben historisches Material; sie erwarten teilweise die frühere Oberfläche.

Für 0.7.0 dieselben lokalen Node-/Playwright-Voraussetzungen und die beiden unten genannten Server verwenden. Einen noch nicht verwendeten Ausgabeordner wählen:

```sh
export GRADEFLOW_AUDIT_OUTPUT="$PWD/docs/revision-2026-10-18/wiederholung-0.7-01"
"$HOME/.cache/codex-fact-tools/venv/bin/python" app/e2e/revision.py
python3 app/e2e/verify_exports.py "$GRADEFLOW_AUDIT_OUTPUT"
"$HOME/.cache/codex-fact-tools/venv/bin/python" app/e2e/verify_domain.py
GRADEFLOW_AUDIT_OUTPUT="$GRADEFLOW_AUDIT_OUTPUT/layout" "$HOME/.cache/codex-fact-tools/venv/bin/python" app/e2e/verify_layout.py
```

Die Hauptprüfung beendet sich bei `ERROR` oder `DEFECT` mit Fehlercode. Die anderen Skripte prüfen mit Assertions und bewahren vorhandene Nachweise. Der XLSX-Test erzeugt seine fiktive Datei mit dem bereits vorhandenen ExcelJS; eine weitere Python-Tabellenbibliothek ist nicht nötig. Die 60 Neuladungen nach Einzelbewertungen sind Teil der Hauptprüfung. Testbrowser und anschließend beide Testserver schließen.

# Prüfungen wiederholen

Die vorliegenden Nachweise sind der gesicherte Ausgangsstand vom 18.10.2026. Sie dürfen beim späteren Nachhervergleich nicht überschrieben werden. Die Python-Prüfungen verweigern deshalb einen bestehenden Ergebnisstand. Für einen weiteren Lauf einen neuen Ausgabeordner verwenden.

Voraussetzungen auf diesem Mac: vorhandene `app/node_modules`, gebündeltes Node und das vorhandene kostenlose lokale Playwright mit Chromium. Keine Installation und kein externer Browserdienst waren für die dokumentierten Läufe erforderlich.

Im Projektordner Node/npm erreichbar machen:

```sh
export PATH="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH"
```

In einem Terminal den Produktionsstand bauen und die lokale Vorschau starten:

```sh
npm --prefix app run build
npm --prefix app run preview -- --host 127.0.0.1 --port 4186 --strictPort
```

In einem zweiten Terminal mit demselben PATH den Entwicklungsserver für die direkten Fachmodul-Prüfungen starten:

```sh
npm --prefix app run dev -- --host 127.0.0.1 --port 5186 --strictPort
```

In einem dritten Terminal vom Projektordner aus einen **noch nicht verwendeten** Ergebnisordner wählen. Die drei Skripte laufen nacheinander mit demselben Ordner. Die Ergänzung prüft die vorher erzeugten Downloads:

```sh
export GRADEFLOW_AUDIT_OUTPUT="$PWD/docs/revision-2026-10-18/wiederholung-01"
"$HOME/.cache/codex-fact-tools/venv/bin/python" docs/revision-2026-10-18/browserpruefung.py
"$HOME/.cache/codex-fact-tools/venv/bin/python" docs/revision-2026-10-18/ergaenzende-pruefung.py
"$HOME/.cache/codex-fact-tools/venv/bin/python" docs/revision-2026-10-18/fehlerfaelle.py
```

Danach beide Testserver mit Strg+C beenden. Die ursprünglichen Prüfserver dieser Revision sind bereits beendet. Die Tests erzeugen ausschließlich isolierte Browserprofile mit fiktiven Daten; sie übernehmen kein bestehendes Browserprofil.

`DEFECT` bedeutet in der Hauptprüfung eine tatsächlich reproduzierte Abweichung, `ERROR` einen Prüfabbruch. Ein normaler Prozessabschluss allein ist daher kein Nachweis einer fehlerfreien App. Für den Nachhervergleich die Ergebnisse inhaltlich mit den Kriterien aus dem [Prüfbericht](pruefbericht.md) vergleichen. Der frühere Helferfehler ist separat unter `nachweise/browserergebnisse-erster-lauf.json` erhalten.

Die beiden XLSX-Vorschaubilder wurden zusätzlich über das gebündelte `@oai/artifact-tool` erzeugt. `excel-vorschau.mjs` benötigt eine temporäre `node_modules`-Verknüpfung auf die mit `load_workspace_dependencies` gelieferte Paketablage. Diese Verknüpfung wurde nach der Prüfung entfernt. Eine erneute Vorschau benötigt ebenfalls einen neuen Ausgabeordner mit der zu prüfenden `bericht-390.xlsx`; sie ist keine Voraussetzung für die übrigen Prüfungen. Die bekannte Datumsanzeigegrenze ist im Bericht ausdrücklich abgegrenzt.
