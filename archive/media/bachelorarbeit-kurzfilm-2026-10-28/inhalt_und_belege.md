# Inhalt und Belege – kompakte BA-Fassung

Grundlage ist die vorgelegte 27-seitige Zwischenfassung „Wissenschaftlich fundierte Weiterentwicklung einer digitalen Anwendung zur Dokumentation mündlicher Leistungen“ sowie der dokumentierte App-Stand 0.10.0. Die Originalfassung und ihre vollständige Textextraktion bleiben privat und unverändert. Aus den zitierten Manuskriptabschnitten wird keine eigenständige Literatur- oder Rechtsprüfung abgeleitet. Der Film nennt keine ungeprüften Einzelstudien oder Rechtsvorschriften.

Die zentrale Forschungsfrage steht auf PDF-Seite 8 / gedruckter Seite 2: Welche didaktischen und technischen Anforderungen muss eine digitale Anwendung erfüllen, um Lehrkräfte bei der kontinuierlichen und transparenten Dokumentation mündlicher Leistungen zu unterstützen? Im Film wird sie in fachliche Anforderungen, technische Umsetzung und Prüfung der Bedienbarkeit verdichtet.

| Film | BA-Grundlage | Umsetzungsbeleg / Präzisierung |
|---|---|---|
| Ausgangsproblem | Kap. 1.1–1.3, PDF 7–8 | docs/01-produktumfang-und-anforderungen.md; Dokumentation als Zweck, keine Wirksamkeitsbehauptung. |
| Fachliche Bedeutung und gesamte Stunde | Kap. 3.4–3.6, PDF 13–14 | docs/ba-abgleich-2026-10-19.md; fachbezogene Gesamteinschätzung durch die Lehrkraft, keine Wortmeldungszählung. |
| Begründete Weiterentwicklung | Kap. 4.3–4.4, PDF 20 | Fehlende AW-/NB-Zustände, frühere Speicherabläufe und Pufferübergang werden als historische Entwicklungsbedarfe gezeigt. `reference/screenshots/02-bewertungskarte.png` ist ausdrücklich mit fiktiven Daten dokumentiert. |
| Relative Symbole | Kap. 4.2 / 5.1, PDF 18 und 21 | app/src/domain/grading/gradingEngine.ts und tatsächlich ausgeführte fiktive Eingabe: 2,00 plus „+“ ergibt 1,75. |
| Startwert und Puffer | Kap. 5.2–5.3, PDF 21–22 | docs/02-bewertungsmodell.md und Fachkern; keine bestätigte Motivationswirkung. Maximal drei Pufferpunkte, nur bei 1,00. |
| Status unterscheiden | Kap. 3.5 und 5.1, PDF 14 und 21 | AW, NB, bewertete 0 und fehlende Eingabe unterscheiden sich. AW und NB verändern Stand und Puffer nicht. |
| Speichern und Wiederaufnahme | Kap. 5.4, PDF 23 | docs/entwicklungsprotokoll.md; unmittelbare lokale Speicherung mit Wiederaufnahme und sichtbaren Fehlern. |
| Korrekturen und Nachvollziehbarkeit | Kap. 3.5 und 5.3, PDF 14 und 22 | Frühere Korrekturen berechnen Folgewerte chronologisch neu. Die Lehrkraft muss die fachliche Passung späterer relativer Einschätzungen weiterhin prüfen. |
| Tabelle, Verlauf und Excel | Kap. 3.5–3.6, PDF 14 | docs/csv-exportformat.md und tatsächlicher XLSX-Bericht. Der Rechenweg ersetzt keine Begründung der Symbolwahl; ein Notizfeld ist im beschriebenen App-Stand nicht vorhanden. |
| Lokaler Betrieb und Sicherung | Kap. 5.4, PDF 23 | README.md und echte Sicherungsansicht. Browserprofil-/Ursprungsbezug, keine automatische Mehrgeräte-Synchronisierung; JSON als externe Vollsicherung. |
| Prüfung und Grenzen | Kap. 2.4–2.5 und 6, PDF 10 und 24–25 | Technische Prüfungen sind in docs/entwicklungsprotokoll.md dokumentiert. Usability-Unterlagen sind vorbereitet; in den vorliegenden Materialien keine Erhebungsergebnisse. Kein pädagogischer Wirkungsnachweis. |

Sprachprüfung: kurze vollständige Aussagen, einheitlich „Stand“, „Einschätzung“ und „mündliche Mitarbeit“. Entwicklungsabsicht, ausgeführte Umsetzung und geplanter Bedientest werden getrennt formuliert. Die App ersetzt weder fachliche Kriterien noch die Entscheidung der Lehrkraft.
