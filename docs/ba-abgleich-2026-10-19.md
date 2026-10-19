# Bachelorarbeitsabgleich vom 19.10.2026

Grundlage ist die vom Nutzer lokal bereitgestellte Zwischenfassung „Wissenschaftlich fundierte Weiterentwicklung einer digitalen Anwendung zur Dokumentation mündlicher Leistungen“, 27 PDF-Seiten. Die Seitenangaben unten nennen zuerst die gedruckte Seite, danach die PDF-Seite. Das Manuskript ist eine fachliche Arbeitsgrundlage, kein zusätzlicher Auftrag zu neuen Funktionen. PDF und vollständige Textextraktion werden nicht ins Repository aufgenommen. Die Quelldatei bleibt unverändert (SHA-256: `beaef7920da9ad9304782bb35bab07ee5dc42b7c72e6de32cc9735f45a5f07eb`).

## Zuordnung zur App-Erklärung

| Grundlage im Manuskript | Übernahme in die App |
| --- | --- |
| Einleitung, S. 1–2 / PDF 7–8; 3.5, S. 7–8 / PDF 13–14 | Begründung der zeitnahen, stundenweisen Dokumentation; Einschätzung der Lehrkraft und Verarbeitung durch die Software unterscheiden. |
| 3.4, S. 7 / PDF 13 | Fachbezogene Antworten, Fragen, Erklärungen und Begründungen; Qualität und Häufigkeit unterscheiden. Kriterien und Gewichtung bleiben fach- und aufgabenbezogene Entscheidungen der Lehrkraft. Anwesenheit, Disziplin und Materialien gehören im gewählten Konzept nicht zu den eigenen fachlichen Bewertungskriterien. |
| 3.5–3.6, S. 7–8 / PDF 13–14 | Symbol, Datum und Rechenweg erklären die Verarbeitung, speichern jedoch nicht die fachliche Begründung. Der Verlauf ist keine automatische Kompetenzmessung. |
| 5.1, S. 15 / PDF 21 | AW, NB, Offen und bewertete 0 bleiben ausdrücklich verschieden; keine neue Berechnungsregel. |
| 5.2, S. 15–16 / PDF 21–22 | Startwert 2,00 als gewählter Ausgangspunkt mit beabsichtigtem positivem Einstieg; keine behauptete Motivationswirkung. Puffer als begrenzte Abfederung, einschließlich Gegenbeispiel 1,00/Puffer 1 plus „−−“ ergibt 1,25/Puffer 0. Kein Mittelwert unabhängiger Stundennoten. |
| 5.3, S. 16 / PDF 22 | Frühere Korrekturen ändern die folgenden Rechenstände, beurteilen die späteren ursprünglichen Symbole jedoch nicht neu. Hinweis, diese Einschätzungen ebenfalls zu prüfen. |
| 5.4, S. 17 / PDF 23 | Bestehende lokale Speicherung und JSON-Vollsicherung bestätigt. Fiktive Testpersonen von Kürzeln für echte Personen unterscheiden; exportierte Dateien können Personenbezug enthalten. |
| Kapitel 2 und 6, S. 3–4 und 18–19 / PDF 9–10 und 24–25 | Geplanter Usability-Test bleibt als Planung bezeichnet. Technische Prüfungen belegen Regelkonformität; keine Aussage zu gerechteren Noten, Motivation oder Unterrichtswirkung. |

## Bewusste Grenzen und Abweichungen

- Abschnitt 5.3 beschreibt noch die ausgeblendete Stundennummer bei einer einzelnen Stunde. Die jüngere ausdrückliche Nutzerentscheidung O16 verlangt durchgehend ausgeschriebene Stundennummern. Dieser App-Stand bleibt bestehen; die Manuskriptstelle muss bei einer später beauftragten Textrevision angepasst werden.
- Die historische Prototypanalyse in Kapitel 4 beschreibt frühere Speicher-/Synchronisationswege. Sie wird nicht als Beschreibung des heutigen lokalen Betriebs übernommen.
- Ein Notizfeld bleibt im Manuskript eine offene Gestaltungsfrage. Es wird durch diesen Abgleich nicht automatisch implementiert.
- Sekundärquellen und rechtliche Ausführungen des Manuskripts wurden nicht unabhängig als Literatur- oder Rechtsprüfung verifiziert. Die App erklärt das gewählte Konzept ohne neue Rechtsbehauptungen oder erfundene Wirkungsnachweise.
- Keine sprachliche Gesamtüberarbeitung, keine PDF-Änderung und kein Upload des Manuskripts an externe Dienste.

## Betroffene Oberfläche

`app/src/features/help/InfoPages.tsx`: „So funktioniert Gradeflow“ und ergänzender Abschnitt auf „Wo sind meine Daten?“. Die geführte Tour öffnet die Erklärung über das tatsächliche Hilfemenü. Fachkern, Notebook-Schema und vorhandene Regeln bleiben unverändert.
