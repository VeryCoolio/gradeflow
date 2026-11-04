# Geprüfte Aussagen des Erklärfilms

| Erklärung | Grundlage und Präzisierung |
|---|---|
| Einschätzung der ganzen Stunde | `docs/01-produktumfang-und-anforderungen.md`, `docs/02-bewertungsmodell.md`; fachbezogene mündliche Gesamtleistung, keine Zählung einzelner Wortmeldungen. |
| Startwert 2,00 | `docs/02-bewertungsmodell.md`, Abschnitt 2; vorgelegte BA, Kapitel 5.2, PDF-Seiten 21–22. Gemeinsamer positiver Ausgangspunkt mit Verbesserungsspielraum. Das ist die Gestaltungsabsicht, kein empirisch nachgewiesener Vorteil. |
| Plus, Minus und doppelte Symbole | `docs/02-bewertungsmodell.md`, Abschnitt 3; `app/src/domain/grading/gradingEngine.ts`. Relative Veränderung des bisherigen Stands, keine unabhängige Stundennote. 2,00 mit Plus → 1,75. |
| Puffer bei 1,00 | `docs/02-bewertungsmodell.md`, Abschnitte 4–5 und 8; BA Kapitel 5.2–5.3. Ein Punkt deckt einen Viertelschritt, höchstens drei. Negative Schritte verbrauchen zuerst vorhandene Punkte. Nur ein ausreichender Puffer hält den Stand unverändert. |
| Verbrauchsbeispiel | Eigenes schematisches Beispiel nach dem tatsächlichen Fachkern: 1,00 und Puffer 2/3 mit Minus → 1,00 und Puffer 1/3. Separates Beispiel mit leerem Puffer: 1,00 mit Minus → 1,25. Der Wechsel wird ausdrücklich als neues Beispiel beschriftet. |
| Graph | Echter Ada-Verlauf aus dem bereits ausgeführten fiktiven Szenario in `brag-output/capture_ui.py`: Start 2,00; danach 2,00 / 1,75 / 2,00 / 1,50 / 2,00 / 1,75. Die bewegte Markierung verwendet dieselben tatsächlichen Bildkoordinaten und Werte. Ein Schritt auf der horizontalen Achse steht für eine Unterrichtsstunde; die Linie zeigt den berechneten Stand. |
| AW und NB | Explizite Zustände, keine bewertete Null, keine Änderung an Stand oder Puffer. Echte Verlaufsgrafik mit AW-Markern aus dem fiktiven Deniz-Beispiel. |
| Tabelle und Excel | Tatsächliche App-Ansicht und implementierter Excel-Bericht mit Einzeleinträgen und Personenblättern; Einträge und Rechenverlauf ersetzen keine fachliche Begründung. |
| Speicherung und Sicherung | `README.md`, Datensicherungsansicht und Speicherkern. Unmittelbare lokale Speicherung im jeweiligen Browser; vollständige Sicherung als zusätzlicher Download. Kein Cloud- oder Synchronisierungsversprechen. |

Der private Volltext der BA ist nicht enthalten und wurde keinem externen Sprachdienst übermittelt. Für diese Fassung wurde ausschließlich der fiktive Sprechertext mit der kostenlosen Edge-Online-Vorlesestimme Florian erzeugt; Schnitt und Textkontrolle erfolgten lokal. Im Film werden keine Literaturstudien oder Erhebungsergebnisse behauptet. Technische Prüfergebnisse stehen ausschließlich im separaten Prüfprotokoll.
