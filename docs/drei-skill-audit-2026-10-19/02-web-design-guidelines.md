# 2. Web Design Guidelines – abgeschlossen

Frische Referenz: Vercel `web-interface-guidelines/command.md`, abgerufen am 19.10.2026. SHA-256 und Quelle stehen in [skills.json](skills.json). Der vollständige fremde Regeltext wird nicht ins Projekt kopiert.

Geprüft: alle gerenderten Hauptkomponenten einschließlich AppNavigation, ClassSwitcher, ClassCreation, ClassWorkspace, AssessmentWorkspace, ClassTable, StudentHistory, BackupPanel, Tutorial, RatingGuide, InfoPages, App, styles.css und die Exportdarstellung. Nicht anwendbare Bereiche wie Bild-/Video-Medien, Virtualisierung riesiger Listen oder Zahlungsvorgänge wurden nicht erfunden. Die in diesem Produkt begrenzte Personenliste umfasst maximal 45 Personen.

Konkrete Befunde im geforderten Dateiformat, bezogen auf den untersuchten Commit:

- `app/src/App.tsx:579` — B01: Hauptnavigation verwirft fehlgeschlagene Eingabe ohne Erhalt oder Rückfrage.
- `app/src/features/classes/ClassWorkspace.tsx:285` — B03: dynamischer Editor nach vollständiger Liste; Fokus und sichtbarer Bezug fehlen.
- `app/src/features/classes/ClassWorkspace.tsx:68` — B04: ungespeicherte Formularwerte gehen beim Entfernen der Komponente verloren.
- `app/src/App.tsx:626` — B05: globale Fehlermeldung außerhalb der sichtbaren Dateiaktion; Inlinezuordnung fehlt.
- `app/src/features/table/ClassTable.tsx:11` — B07: relevante Ansichtseinstellungen nur flüchtig; im URL-Zustand nicht erhalten.
- `app/src/components/AppNavigation.tsx:41` — B07: tatsächliche Navigationsziele als Buttons; native Linkfunktionen fehlen.
- `app/src/features/classes/ClassWorkspace.tsx:122` — B08: Singularfall nicht berücksichtigt.

Positiv geprüft: beschriftete Controls, sichtbarer Tastaturfokus, native Formulare und Dialoge, benannte Scrollregionen, Tabellenköpfe, Status-/Fehlermeldungen, minimale Aktionshöhen, endliche gezielte Übergänge und reduzierte Bewegung. Tabellen verwenden Ziffern gleicher Breite. Aufgeklebte Namen und aktueller Stand behalten ihren Kontext beim internen Scrollen.

Die Regelprüfung wurde durch zehn Axe-Zustände und echte Browserbedienung ergänzt. Null automatisch bestätigte Verstöße bedeutet keine vollständige WCAG-Prüfung. Insbesondere Tabellen-/SVG-Kontraste und einige ARIA-Attribute verbleiben als manuelle Restprüfungen. B02 ist zusätzlich eine visuelle Hierarchiebewertung und wird nicht als automatisch nachgewiesener Standardverstoß ausgegeben.
