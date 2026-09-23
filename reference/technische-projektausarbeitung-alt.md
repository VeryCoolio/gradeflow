# Projektausarbeitung: Mündliche Notengebung

## Digitales Notenheft für mündliche Mitarbeit

**Projektstand:** 29. Juli 2026  
**Produktname:** Mündliche Notengebung  
**Android-Paketname:** `com.gradeflow_notentracker.app`  
**Technischer Stand:** Funktionsfähige plattformübergreifende Beta-Version  

---

## 1. Kurzfassung

Das Projekt „Mündliche Notengebung“ ist eine digitale Anwendung zur fortlaufenden Bewertung und Dokumentation der mündlichen Mitarbeit von Schülerinnen und Schülern. Die App soll Lehrkräften ermöglichen, Klassenlisten zu importieren, die Mitarbeit nach jeder Unterrichtsstunde schnell zu bewerten und die daraus entstehende Notenentwicklung nachvollziehbar zu dokumentieren.

Im Mittelpunkt steht ein bewusst einfaches Bewertungssystem mit fünf Eingaben:

- `--` für eine deutliche Verschlechterung,
- `-` für eine leichte Verschlechterung,
- `0` für keine Veränderung,
- `+` für eine leichte Verbesserung,
- `++` für eine deutliche Verbesserung.

Alle Schülerinnen und Schüler beginnen mit der Note 2. Die Note verändert sich anschließend in Viertel- oder Halbschritten. Für besonders gute Leistungen auf der Note 1 existiert zusätzlich ein Puffersystem. Dadurch kann eine Schülerin oder ein Schüler bis zu drei Pufferpunkte sammeln, die spätere negative Bewertungen zunächst ausgleichen.

Die Anwendung basiert auf einer gemeinsamen React-Oberfläche und wird auf mehreren Plattformen bereitgestellt:

- als Web-App und installierbare PWA,
- als Android-App für Smartphones und Tablets,
- als Windows-Desktop-App mit eigenem Installer,
- auf iPhone und iPad als PWA über Safari.

Über ein Benutzerkonto und Supabase können Klassen und gespeicherte Stunden zwischen Geräten synchronisiert werden. Zusätzlich werden Daten lokal gespeichert. Die Windows-Version legt außerdem automatische JSON-Sicherungsdateien an.

Der aktuelle Stand ist bereits alltagstauglich für Tests und Pilotnutzung. Für einen uneingeschränkten produktiven Einsatz mit echten Schülerdaten fehlen jedoch noch wichtige Arbeiten in den Bereichen Datensicherheit, Synchronisationskonflikte, automatisierte Tests, Kontolöschung, Release-Prozess und technische Wartbarkeit.

---

## 2. Ausgangslage und Problemstellung

Die Bewertung mündlicher Mitarbeit ist im Schulalltag häufig schwer durchgängig und nachvollziehbar zu dokumentieren. Typische Probleme sind:

- Notizen werden auf Papier oder in verschiedenen Tabellen geführt.
- Einträge werden nicht direkt nach der Stunde vorgenommen.
- Einzelne positive oder negative Eindrücke erhalten zu viel Gewicht.
- Der langfristige Verlauf einer Schülerin oder eines Schülers ist schwer erkennbar.
- Die Übertragung von Notizen in eine Gesamtnote kostet zusätzliche Zeit.
- Daten liegen auf unterschiedlichen Geräten und sind nicht automatisch synchron.
- Bestehende Tabellenlösungen sind auf Smartphones oft umständlich zu bedienen.

Die App soll diese Probleme durch einen schnellen, wiederholbaren Ablauf lösen. Eine Lehrkraft öffnet eine Klasse, bewertet die Lernenden nacheinander und speichert die Stunde. Die App übernimmt die Berechnung, Dokumentation und Darstellung des Verlaufs automatisch.

Der entscheidende Produktgedanke ist dabei nicht, eine klassische Notenliste lediglich zu digitalisieren. Vielmehr soll die Bewertung ähnlich unkompliziert wie das Durcharbeiten von Lernkarten funktionieren: Ein Name erscheint, eine der fünf Bewertungen wird gewählt und anschließend folgt direkt die nächste Person.

---

## 3. Projektidee und Zielsetzung

Das Ziel ist ein digitales Notenheft, das im Unterricht schnell genug bedient werden kann, um tatsächlich regelmäßig verwendet zu werden. Die Anwendung soll gleichzeitig:

- einfach in der Bedienung,
- transparent in der Berechnung,
- nachvollziehbar in der Dokumentation,
- geräteübergreifend verfügbar,
- lokal ausfallsicher,
- und langfristig erweiterbar sein.

### 3.1 Hauptziel

Eine Lehrkraft soll nach oder während einer Unterrichtsstunde alle Schülerinnen und Schüler einer Klasse in kurzer Zeit bewerten können. Aus den Einträgen wird automatisch eine fortlaufende mündliche Note berechnet.

### 3.2 Nebenziele

- Reduzierung manueller Tabellenarbeit
- Vermeidung vergessener Einträge
- Darstellung der Entwicklung statt nur einer Endnote
- Nachträgliche Korrektur fehlerhafter Einträge
- Sicherung und Export der Daten
- Nutzung auf Schul-PC, privatem PC, Tablet und Smartphone
- Synchronisierung über ein persönliches Benutzerkonto

### 3.3 Zielgruppe

Die primäre Zielgruppe sind Lehrkräfte, die mündliche Mitarbeit regelmäßig bewerten. Die App ist grundsätzlich schulform- und fachunabhängig. Besonders sinnvoll ist sie in Fächern, in denen die kontinuierliche Beteiligung einen wesentlichen Teil der Leistungsbewertung ausmacht.

---

## 4. Fachliches Bewertungskonzept

### 4.1 Startnote

Jede neu importierte Schülerin und jeder neu importierte Schüler startet mit:

`Note 2,0`

Dieser Wert ist aktuell fest im Programm hinterlegt.

### 4.2 Bewertungssymbole

| Eingabe | Veränderung | Bedeutung |
|---|---:|---|
| `--` | +0,50 | deutliche Verschlechterung |
| `-` | +0,25 | leichte Verschlechterung |
| `0` | 0,00 | unverändert |
| `+` | -0,25 | leichte Verbesserung |
| `++` | -0,50 | deutliche Verbesserung |

Im deutschen Notensystem ist eine kleinere Zahl besser. Deshalb wird bei positiven Leistungen ein negativer mathematischer Wert auf die aktuelle Note angewendet.

### 4.3 Notengrenzen

Die Note wird auf den Bereich von 1 bis 6 begrenzt:

- Beste mögliche Note: 1
- Schlechteste mögliche Note: 6

Die Berechnung wird auf Viertelschritte gerundet.

### 4.4 Anzeige der Zwischennoten

Interne Werte werden für die Oberfläche in schulübliche Bezeichnungen umgewandelt. Beispiele:

| Interner Wert | Anzeige |
|---:|---|
| 1,00 | 1 |
| 1,25 | 1- |
| 1,50 | 1-2 |
| 1,75 | 2+ |
| 2,00 | 2 |

### 4.5 Puffersystem bei Note 1

Wenn die Note 1 bereits erreicht ist, können weitere positive Bewertungen nicht mehr zu einer besseren Zahl führen. Stattdessen werden Pufferpunkte gesammelt.

- maximal drei Pufferpunkte,
- `+` entspricht einem Viertelschritt und erzeugt einen Pufferpunkt,
- `++` entspricht zwei Viertelschritten und kann zwei Pufferpunkte erzeugen,
- negative Bewertungen bauen zunächst den Puffer ab,
- erst wenn nicht genügend Puffer vorhanden ist, verschlechtert sich die Note.

Beispiel:

1. Aktuelle Note: 1, Puffer: 3
2. Bewertung: `-`
3. Ergebnis: Note bleibt 1, Puffer sinkt auf 2

Bei einer Bewertung `--` werden entsprechend zwei Pufferschritte verbraucht.

### 4.6 Neuberechnung

Die App speichert nicht nur den aktuellen Endwert. Jede Unterrichtsstunde wird mit Datum und Bewertungssymbolen gespeichert. Werden ältere Einträge nachträglich geändert, berechnet die Anwendung die gesamte Klasse chronologisch neu. Dadurch bleiben:

- aktuelle Note,
- Pufferstand,
- Verlauf,
- und Tabellenwerte

untereinander konsistent.

### 4.7 Noch zu klärende fachliche Regeln

Für eine endgültige Produktversion sollten folgende Punkte verbindlich festgelegt werden:

- Soll ein überschüssiger Verbesserungsschritt beim Übergang von 1,25 auf 1 als Puffer angerechnet werden?
- Dürfen mehrere Unterrichtsstunden am selben Datum gespeichert werden?
- Wie werden Abwesenheit, Entschuldigung oder „nicht beobachtet“ dokumentiert?
- Soll eine Stunde gespeichert werden dürfen, wenn nicht alle Lernenden bewertet wurden?
- Soll die Startnote pro Klasse oder Person anpassbar sein?
- Wird die Berechnung über ein Schulhalbjahr oder das ganze Schuljahr geführt?

---

## 5. Typischer Bedienablauf

### 5.1 Klasse importieren

Die Lehrkraft lädt eine CSV- oder Textdatei hoch. Die App:

1. liest die Namen aus der Datei,
2. entfernt doppelte identische Namen,
3. begrenzt die Klasse auf maximal 45 Personen,
4. übernimmt den Dateinamen als Klassennamen,
5. legt alle Personen mit der Startnote 2 an.

Unterstützt werden Trennzeichen wie:

- Semikolon,
- Komma,
- Tabulator.

### 5.2 Klasse auswählen

Alle Klassen werden links in einer Liste angezeigt. Sichtbar sind:

- Klassenname,
- Status „Offen“ oder „Erledigt“,
- Datum des letzten Eintrags,
- Anzahl der Schülerinnen und Schüler.

Klassen können nach letzter Nutzung, Name oder Status sortiert werden.

### 5.3 Stunde bewerten

Nach Auswahl einer Klasse wird ein Datum für die Stunde festgelegt. Danach erscheint jeweils eine Person als Bewertungskarte. Nach jeder Eingabe wird automatisch die nächste Person angezeigt.

Die Oberfläche zeigt:

- aktuellen Namen,
- bisherige Note,
- bisherigen Puffer,
- voraussichtliche neue Note,
- voraussichtlichen neuen Puffer,
- Fortschritt der Bewertungsrunde.

Wenn alle Personen bewertet wurden, verschwindet die letzte Bewertungskarte. Stattdessen erscheint eine Abschlussmeldung und die Stunde kann gespeichert werden.

### 5.4 Stunde speichern

Beim Speichern:

- wird eine neue Sitzung mit Datum angelegt,
- werden die Bewertungssymbole gespeichert,
- werden Noten und Puffer neu berechnet,
- entsteht in der Tabelle eine neue Datumsspalte,
- wird der Verlauf jeder betroffenen Person erweitert.

### 5.5 Einträge bearbeiten

Im Tabellenbereich können:

- Schülernamen geändert,
- Sitzungsdaten korrigiert,
- gespeicherte Bewertungssymbole geändert,
- oder Bewertungen entfernt werden.

Nach dem Speichern der Bearbeitung wird der gesamte nachfolgende Verlauf neu berechnet.

### 5.6 Klasse abschließen oder löschen

Klassen können als erledigt markiert werden. Erledigte Klassen bleiben erhalten, werden aber entsprechend gekennzeichnet und bei der Sortierung berücksichtigt.

Das Löschen einer Klasse erfolgt in zwei Stufen:

1. erster Klick aktiviert die Löschbestätigung,
2. anschließend erscheint eine zusätzliche Systemabfrage.

Erst nach der zweiten Bestätigung wird die Klasse entfernt.

---

## 6. Funktionsumfang des aktuellen Stands

| Bereich | Funktion | Status |
|---|---|---|
| Klassen | CSV-/TXT-Import | umgesetzt |
| Klassen | Klassenname aus Dateiname | umgesetzt |
| Klassen | maximal 45 Personen | umgesetzt |
| Klassen | umbenennen | umgesetzt |
| Klassen | sortieren | umgesetzt |
| Klassen | als erledigt markieren | umgesetzt |
| Klassen | doppelt bestätigtes Löschen | umgesetzt |
| Personen | Namen nachträglich ändern | umgesetzt |
| Bewertung | Kartenablauf Person für Person | umgesetzt |
| Bewertung | Symbole `--`, `-`, `0`, `+`, `++` | umgesetzt |
| Bewertung | Viertel- und Halbschritte | umgesetzt |
| Bewertung | Startnote 2 | umgesetzt |
| Bewertung | Puffer bei Note 1 | umgesetzt |
| Bewertung | Bewertungsfortschritt | umgesetzt |
| Bewertung | Karte verschwindet nach letzter Person | umgesetzt |
| Entwurf | offene Bewertung lokal wiederherstellen | umgesetzt |
| Dokumentation | Datumsspalte je gespeicherter Stunde | umgesetzt |
| Dokumentation | nachträgliche Bearbeitung | umgesetzt |
| Tabelle | Startnote, Sitzungen, Puffer, aktuelle Note | umgesetzt |
| Verlauf | Liniendiagramm pro Person | umgesetzt |
| Verlauf | Note 1 oben, Note 6 unten | umgesetzt |
| Verlauf | Datum auf der X-Achse | umgesetzt |
| Export | CSV der aktuellen Klasse | umgesetzt |
| Backup | automatische Windows-JSON-Sicherung | umgesetzt |
| Backup | manueller JSON-Import und -Export unter Windows | umgesetzt |
| Konto | Registrierung und Anmeldung | umgesetzt |
| Konto | gespeicherte Sitzung auf dem Gerät | umgesetzt |
| Konto | Kontowechsel | umgesetzt |
| Konto | Passwort zurücksetzen | umgesetzt, Redirect-Konfiguration erforderlich |
| Cloud | automatischer Datenabgleich | umgesetzt |
| Cloud | manueller Synchronisationsknopf | umgesetzt |
| Cloud | Realtime-Übernahme anderer Geräte | umgesetzt |
| Rechtliches | Datenschutzseite | vorhanden |
| Rechtliches | Impressum | vorhanden |
| Rechtliches | Seite zur Konto- und Datenlöschung | vorhanden |
| Windows | Desktop-Anwendung | umgesetzt |
| Windows | NSIS-Installer | umgesetzt |
| Android | APK | umgesetzt |
| Android | signiertes App Bundle für Google Play | umgesetzt |
| iOS | native Projektstruktur | vorbereitet |
| iOS | Nutzung als PWA | umgesetzt |
| iOS | Veröffentlichung im App Store | nicht umgesetzt |

---

## 7. Technische Architektur

## 7.1 Gemeinsame React-Anwendung

Das Zentrum des Projekts ist eine React-Anwendung. Die wesentliche Geschäftslogik und Oberfläche befinden sich in:

- `src/App.jsx`
- `src/GradeChartPanel.jsx`
- `src/cloudSync.js`
- `src/supabaseClient.js`

Der Vorteil dieser Architektur ist, dass Bewertungslogik, Tabellen, Verlauf und Kontoverwaltung nur einmal entwickelt werden. Dieselbe Web-Anwendung wird anschließend für Windows, Android und PWA verpackt.

### Eingesetzte Kerntechnologien

- React 19 für die Benutzeroberfläche
- Vite für Entwicklung und Produktions-Build
- Recharts für das Verlaufsdiagramm
- Lucide React für Symbole
- Supabase JavaScript SDK für Anmeldung und Synchronisierung
- Vite PWA Plugin für Manifest und Service Worker

### Aktuelle Struktur

Die Anwendung ist funktional, aber `src/App.jsx` enthält derzeit einen sehr großen Teil der Logik, Oberfläche und CSS-Regeln in einer Datei. Das vereinfacht frühe Prototypen, erschwert aber langfristig:

- Wartung,
- Fehlersuche,
- automatisierte Tests,
- parallele Weiterentwicklung,
- und Wiederverwendung einzelner Komponenten.

Eine spätere Aufteilung in Fachmodule ist sinnvoll.

## 7.2 Web-App und PWA

Die Web-Version wird mit Vite gebaut. Der Service Worker ermöglicht:

- Installation auf unterstützten Geräten,
- Laden wichtiger App-Dateien aus dem Cache,
- grundlegende Offline-Nutzung,
- automatische Aktualisierung der PWA.

Rechtsseiten wie Impressum und Datenschutz sind bewusst vom festen PWA-Cache ausgeschlossen. Dadurch wird verhindert, dass nach einer Aktualisierung weiterhin eine alte Fassung des Impressums angezeigt wird.

Auf iPhone und iPad wird die App derzeit als PWA verwendet:

1. Webadresse in Safari öffnen,
2. „Teilen“ auswählen,
3. „Zum Home-Bildschirm“ wählen.

Dieser Weg benötigt kein kostenpflichtiges Apple-Developer-Konto.

## 7.3 Android-App

Die Android-App wird mit Capacitor erzeugt. Capacitor stellt die gebaute Web-Anwendung in einer nativen Android-Hülle bereit.

Aktuelle Konfiguration:

- Paketname: `com.gradeflow_notentracker.app`
- Mindestversion: Android API 24
- Zielversion: Android API 36
- Versionscode: 5
- Versionsname: 1.0.4
- Internetberechtigung für Cloud-Sync
- signierter Release-Build
- Ausgabe als APK und AAB

Die AAB-Datei ist für Google Play vorgesehen. Die APK kann direkt auf Testgeräten installiert werden, unterliegt dann aber den Sicherheitseinstellungen des jeweiligen Android-Geräts.

Die Android-App verwendet dieselbe React-Oberfläche wie die PWA. Für kleine Smartphone-Displays wurden eigene responsive Regeln ergänzt, während Tabletansichten mehrspaltig bleiben.

## 7.4 Windows-Desktop-App

Die Windows-App verwendet Electron. Electron öffnet die gebaute React-Anwendung in einem eigenen Desktopfenster.

Sicherheitsrelevante Einstellungen:

- `contextIsolation: true`
- `nodeIntegration: false`
- begrenzte Kommunikation über eine Preload-Schnittstelle
- externe Links werden im Standardbrowser geöffnet

Die Desktop-App besitzt zusätzliche Funktionen, die im Browser nicht verfügbar sind:

- automatische Sicherung als echte JSON-Datei,
- Sicherung exportieren,
- Sicherung importieren,
- Sicherungsordner öffnen.

Die Daten werden unter anderem im Dokumente-Ordner in einer Datei `notenheft-daten.json` abgelegt. Zusätzlich existiert eine App-interne Kopie im Benutzerprofil.

Für Windows wurde ein NSIS-Installer erstellt. Dieser unterstützt eine stille Installation mit dem Parameter:

`/S`

Der aktuelle Windows-Paketstand trägt die Version 0.1.0.

## 7.5 Native iOS-Struktur

Ein Capacitor-iOS-Projekt ist vorbereitet. Ein echter iOS-Build benötigt jedoch:

- macOS,
- Xcode,
- Apple-Signierung,
- ein kostenpflichtiges Apple-Developer-Konto.

Da diese laufenden Kosten aktuell nicht gewünscht sind, ist die PWA die gewählte iOS-Lösung.

---

## 8. Datenmodell

Die Anwendung verwaltet ihre Daten als verschachtelte JSON-Struktur.

Vereinfacht sieht das Modell so aus:

```json
{
  "currentClassId": "uuid",
  "classes": [
    {
      "id": "uuid",
      "name": "Klasse 8b",
      "completed": false,
      "createdAt": "Zeitstempel",
      "updatedAt": "Zeitstempel",
      "students": [
        {
          "id": "uuid",
          "name": "Beispielname",
          "startGrade": 2,
          "currentGrade": 1.75,
          "buffer": 0,
          "history": []
        }
      ],
      "sessions": [
        {
          "id": "uuid",
          "date": "2026-07-29",
          "createdAt": "Zeitstempel",
          "entries": {
            "student-uuid": {
              "symbol": "+",
              "delta": -0.25,
              "gradeBefore": 2,
              "gradeAfter": 1.75,
              "bufferBefore": 0,
              "bufferAfter": 0
            }
          }
        }
      ]
    }
  ]
}
```

### Vorteile des aktuellen Modells

- leicht lokal zu speichern,
- einfach zu exportieren und zu importieren,
- gesamte Benutzerakte kann in einem Vorgang synchronisiert werden,
- Neuberechnung ist ohne komplexe Datenbankabfragen möglich.

### Nachteile des aktuellen Modells

- alle Daten eines Kontos liegen in einem großen Dokument,
- einzelne Klassen können nicht unabhängig synchronisiert werden,
- bei gleichzeitigem Bearbeiten auf mehreren Geräten kann ein Gesamtstand überschrieben werden,
- Daten lassen sich serverseitig nur schwer auswerten,
- eine detaillierte Änderungshistorie fehlt,
- das Modell skaliert schlechter bei sehr vielen Klassen und Schuljahren.

---

## 9. Lokale Speicherung und Datensicherung

## 9.1 Browser, PWA und Android

Die gemeinsame Web-Anwendung speichert den aktuellen App-Zustand im lokalen Speicher der WebView beziehungsweise des Browsers.

Gespeichert werden:

- Klassen,
- Schülerinnen und Schüler,
- gespeicherte Unterrichtsstunden,
- Bewertungen,
- Noten und Puffer,
- aktuell ausgewählte Klasse.

Zusätzlich werden noch nicht gespeicherte Bewertungsrunden als Entwurf lokal abgelegt. Dadurch bleiben bereits vorgenommene Klickbewertungen nach einem Neuladen erhalten.

Wichtig:

- Die Daten bleiben nach normalem Schließen erhalten.
- Sie können verloren gehen, wenn Browserdaten oder App-Daten gelöscht werden.
- Bei Deinstallation der Android-App kann der lokale Stand verloren gehen.
- Der offene Bewertungsentwurf wird derzeit nicht über Supabase synchronisiert.

## 9.2 Windows-Dateisicherung

Unter Windows wird jede Änderung nach kurzer Verzögerung automatisch in zwei JSON-Dateien geschrieben:

- in den Electron-Benutzerdaten,
- als zusätzliche Kopie im Dokumente-Ordner.

Zum sicheren Schreiben wird zunächst eine temporäre Datei erstellt und anschließend umbenannt. Dadurch wird das Risiko reduziert, bei einem Abbruch eine nur teilweise geschriebene Sicherung zu erhalten.

Die Lehrkraft kann außerdem:

- eine Sicherung frei exportieren,
- eine Sicherung wieder importieren,
- den Sicherungsordner direkt öffnen.

## 9.3 CSV-Export

Der CSV-Export enthält für die aktuelle Klasse:

- Namen,
- Startnote,
- jede gespeicherte Stunde als Datumsspalte,
- Bewertungssymbol und resultierende Note,
- aktuellen Puffer,
- aktuelle Note.

Der Export ist für Tabellenprogramme geeignet. Er ersetzt jedoch keine vollständige JSON-Sicherung, da er nicht alle internen IDs und Metadaten enthält.

---

## 10. Benutzerkonto und Cloud-Synchronisierung

## 10.1 Anmeldung

Die Benutzerverwaltung basiert auf Supabase Auth. Unterstützt werden:

- Registrierung mit E-Mail und Passwort,
- Anmeldung,
- dauerhaft gespeicherte Sitzung,
- Abmeldung,
- Wechsel des Kontos auf bereits verwendeten Geräten,
- Passwort-Reset per E-Mail.

Das Passwort wird nicht durch eigenen App-Code im Klartext gespeichert. Supabase speichert stattdessen eine Sitzung mit automatisch erneuerten Authentifizierungsinformationen.

Die zuletzt verwendete E-Mail-Adresse wird als Komfortfunktion lokal gespeichert.

## 10.2 Datenbank

In Supabase existiert die Tabelle:

`public.user_notebooks`

Pro Benutzerkonto wird aktuell genau ein Datensatz gespeichert:

| Feld | Bedeutung |
|---|---|
| `user_id` | Benutzer-ID aus Supabase Auth |
| `data` | vollständiger App-Zustand als JSONB |
| `updated_at` | Zeitpunkt des letzten Datenstands |

Die Benutzer-ID ist Primärschlüssel und verweist auf `auth.users`. Wird ein Benutzerkonto serverseitig gelöscht, wird der zugehörige Notebook-Datensatz durch `on delete cascade` ebenfalls entfernt.

## 10.3 Zugriffsschutz

Row Level Security ist aktiviert. Die Datenbankregeln erlauben angemeldeten Personen nur den Zugriff auf den Datensatz, dessen `user_id` ihrer eigenen Authentifizierungs-ID entspricht.

Die App verwendet ausschließlich den öffentlichen Client-Schlüssel. Ein geheimer Server-Schlüssel gehört nicht in die Anwendung.

## 10.4 Synchronisationsablauf

Nach der Anmeldung:

1. Die App lädt den lokalen Stand.
2. Sie lädt den Cloud-Datensatz.
3. Die Zeitstempel werden verglichen.
4. Der neuere Gesamtstand wird übernommen.
5. Änderungen werden nach kurzer Verzögerung hochgeladen.
6. Realtime-Ereignisse melden Änderungen anderer Geräte.

Zusätzlich existiert der Knopf „Jetzt synchronisieren“, der den Abgleich manuell erneut startet.

## 10.5 Aktuelle Konfliktstrategie

Die aktuelle Strategie ist „neuester Gesamtstand gewinnt“. Sie ist für einfache Einzelnutzung verständlich, hat aber Grenzen.

Beispiel:

- Gerät A bearbeitet Klasse 8a offline.
- Gerät B bearbeitet Klasse 9b offline.
- Beide Geräte gehen später online.
- Da jeweils das komplette Notebook gespeichert wird, kann der zuletzt hochgeladene Gesamtstand die Änderung des anderen Geräts überschreiben.

Für eine robuste Mehrgeräteversion sollten Klassen, Sitzungen und Entwürfe getrennt gespeichert und konfliktbewusst zusammengeführt werden.

## 10.6 Noch nicht synchronisierte Daten

Offene Bewertungsentwürfe werden lokal gesichert, gehören aber nicht zum Cloud-Datensatz. Eine halb bearbeitete Unterrichtsstunde kann daher nach einem Gerätewechsel nicht auf einem anderen Gerät fortgesetzt werden.

Gespeicherte Unterrichtsstunden werden dagegen über den normalen App-Zustand synchronisiert.

---

## 11. Verlaufsanzeige

Die Verlaufsansicht verwendet ein Liniendiagramm.

### Darstellung

- Y-Achse: Noten 1 bis 6
- Note 1 befindet sich oben
- Note 6 befindet sich unten
- X-Achse: Datum der gespeicherten Unterrichtsstunden
- Startpunkt: Note 2
- Verbindung: gerade Linie zwischen den Datenpunkten
- zusätzliche Markierung der Startnote 2

Für kleine Bildschirme werden weniger Datumsbeschriftungen angezeigt und die Beschriftungen stärker gedreht. Dadurch bleibt der Verlauf auf Smartphones lesbarer.

Technisch wird der Startpunkt kurz vor dem ersten tatsächlichen Sitzungszeitpunkt eingeordnet. Dadurch entsteht bereits bei der ersten gespeicherten Stunde eine sichtbare Linie von der Startnote 2 zum ersten Ergebnis.

---

## 12. Gestaltung und Bedienoberfläche

Die Oberfläche wurde als eigenständiges Dashboard gestaltet und verwendet:

- ein warmes, helles Farbsystem,
- dunkelblaue Navigationsflächen,
- orangefarbene Akzente,
- große Bewertungsschaltflächen,
- Karten für Klassen, Statistik und Bewertung,
- responsive Umbrüche für verschiedene Bildschirmgrößen.

### Desktop und Tablet

Auf breiten Bildschirmen werden Klassenverwaltung, Hauptbereich und Zwischenstand nebeneinander dargestellt. Tablets profitieren besonders von dieser Ansicht, da ausreichend Platz für die Bewertungsoberfläche und Klassenliste vorhanden ist.

### Smartphone

Für Smartphones wurden:

- Abstände verkleinert,
- Karten untereinander angeordnet,
- Schaltflächen angepasst,
- Statistikbereiche kompakter dargestellt,
- Diagrammachsen reduziert.

Trotz dieser Anpassungen sollte das Smartphone-Layout weiterhin mit mehreren realen Geräten und verschiedenen Browserleisten getestet werden.

### Barrierefreiheit

Grundlegende Beschriftungen und klare Kontraste sind vorhanden. Eine vollständige Barrierefreiheitsprüfung wurde noch nicht durchgeführt. Offen sind insbesondere:

- vollständige Tastaturbedienung,
- sichtbare Fokuszustände,
- Screenreader-Beschriftungen,
- Prüfung der Farbkontraste,
- Unterstützung hoher Schriftvergrößerung,
- Touch-Zielgrößen auf kleinen Geräten.

---

## 13. Datenschutz und Sicherheit

Die Anwendung verarbeitet besonders schützenswerte schulische Informationen, darunter Namen und Leistungsdaten. Deshalb ist Datenschutz kein Zusatzthema, sondern ein zentraler Bestandteil der Produktreife.

### 13.1 Derzeit vorhandene Schutzmaßnahmen

- Übertragung zu Supabase über HTTPS beziehungsweise sichere WebSocket-Verbindungen
- Supabase-Authentifizierung
- Row Level Security pro Benutzerkonto
- kein geheimer Server-Schlüssel im Frontend
- Electron mit deaktivierter Node-Integration
- lokale Sicherung zusätzlich zur Cloud
- Datenschutzerklärung
- Impressum
- öffentliche Seite zur Konto- und Datenlöschung
- Support-Adresse `benutzerunterstuetzung@web.de`

### 13.2 Wichtige Einschränkungen

- Es existiert keine Ende-zu-Ende-Verschlüsselung.
- Lokale Browserdaten sind nicht durch die App verschlüsselt.
- Die Windows-JSON-Sicherungsdatei liegt unverschlüsselt auf dem Datenträger.
- Wer Zugriff auf das Windows-Benutzerkonto und die Datei hat, kann die Inhalte lesen.
- Die App erhebt selbst keine ausdrückliche Geräte-ID. Infrastruktur- und Authentifizierungsdienste können jedoch übliche technische Metadaten wie IP-Adresse, Browserinformationen und Protokolldaten verarbeiten.
- Die Android-Konfiguration erlaubt derzeit System-Backups (`android:allowBackup="true"`). Es sollte geprüft werden, ob dies für Schülerdaten gewünscht ist.
- Die Kontolöschung wird momentan per E-Mail angefragt und nicht sofort automatisiert in der App ausgeführt.

### 13.3 Organisatorische Anforderungen vor Schuleinsatz

Vor dem Einsatz mit echten Schülerdaten sollten mindestens geklärt werden:

- Wer ist datenschutzrechtlich verantwortlich?
- Darf die Lehrkraft den Dienst eigenständig verwenden?
- Ist eine Freigabe durch Schule oder Schulträger erforderlich?
- Welche Aufbewahrungs- und Löschfristen gelten?
- Wird ein Vertrag zur Auftragsverarbeitung mit dem Cloud-Anbieter benötigt?
- In welcher Region werden die Cloud-Daten gespeichert?
- Welche Personen dürfen auf Backups zugreifen?
- Wie werden Auskunft, Berichtigung und Löschung praktisch umgesetzt?

Die vorhandenen Rechtstexte sind eine technische Grundlage, ersetzen aber keine individuelle rechtliche Prüfung durch eine fachkundige Stelle oder den zuständigen Datenschutzbeauftragten.

---

## 14. Veröffentlichung und Verteilung

## 14.1 Web und iOS-PWA

Die Web-App kann als fertiger `dist`-Ordner oder vorbereitetes Netlify-Paket veröffentlicht werden. Voraussetzungen:

- öffentliche HTTPS-Adresse,
- korrekte Umgebungsvariablen für Supabase,
- erreichbare Rechtsseiten,
- funktionierende Redirect-URL für Passwort-Reset.

Auf iOS erfolgt die Installation über Safari und den Home-Bildschirm.

## 14.2 Android

Für Android existieren:

- APK für direkte Tests,
- signiertes AAB für Google Play.

Der Paketname wurde an den Google-Play-Eintrag angepasst. Für jede neue Veröffentlichung muss der Versionscode erhöht werden.

Für einen öffentlichen Store-Release fehlen je nach Play-Console-Stand noch:

- finaler Store-Eintrag,
- Screenshots für Smartphone und Tablet,
- App-Beschreibung,
- Daten-Sicherheitsformular,
- Altersfreigabe und Zielgruppenangaben,
- Testfreigabe,
- Prüfung der Löschfunktion,
- eventuell geschlossener Testzeitraum,
- nächste eindeutige Versionsnummer.

## 14.3 Windows

Für Windows existieren:

- portable Ordner-Version,
- Electron-Anwendung,
- NSIS-Setup-Datei,
- stille Installation mit `/S`.

Für eine professionelle öffentliche Verteilung fehlt vor allem eine vertrauenswürdige Windows-Code-Signatur. Ohne Signatur kann Windows SmartScreen Warnungen anzeigen. Eine Code-Signatur erfordert in der Regel ein kostenpflichtiges Zertifikat oder einen geeigneten Store-Signierungsprozess.

---

## 15. Bisherige technische Herausforderungen und Lösungen

### 15.1 Leeres Electron-Fenster

Die Desktop-App zeigte zunächst nur eine leere Fläche. Ursache waren absolute Web-Pfade und PWA-Verhalten innerhalb des lokalen `file:`-Kontexts.

Gelöst wurde dies durch:

- relative Vite-Basispfade,
- Unterdrückung der Service-Worker-Registrierung unter `file:`,
- sichtbare Fehleranzeige bei Startproblemen,
- zusätzliche Electron-Ladeprotokolle.

### 15.2 Überlappende Desktop-Oberfläche

Mehrere frühe Layoutvarianten verwendeten zu starre Höhen und Spaltenbreiten. Das führte je nach Vollbildauflösung zu Überlagerung, Verzerrung oder fehlendem Scrollen.

Die Oberfläche wurde auf flexiblere Grid- und Scrollregeln umgestellt. Trotzdem bleibt eine systematische Prüfung mehrerer Windows-Skalierungen sinnvoll.

### 15.3 Android-Play-Store-Build

Im Verlauf mussten mehrere typische Veröffentlichungsprobleme gelöst werden:

- Debug-Signatur durch Release-Signatur ersetzen,
- Paketnamen an Play Console anpassen,
- harte Test-Track-Einschränkung aus dem Manifest entfernen,
- Versionscode mehrfach erhöhen,
- Upload-Keystore sichern.

### 15.4 Alte Impressumsseite in der PWA

Die PWA lieferte trotz aktualisierter Datei teilweise eine alte Impressumsfassung aus. Ursache war der Service-Worker-Cache.

Die Rechtsseiten wurden deshalb aus dem festen Precache entfernt und vom Navigations-Fallback ausgeschlossen.

### 15.5 Kontowechsel auf bereits verwendeten Geräten

Auf Geräten mit einer alten Supabase-Sitzung konnte ein anderes Konto nicht zuverlässig angemeldet werden.

Vor einer neuen Anmeldung wird nun der lokale Authentifizierungszustand defensiv bereinigt. Zusätzlich existiert ein eigener Knopf „Konto wechseln“.

### 15.6 Verlust offener Bewertungen

Nicht gespeicherte Bewertungen lagen anfangs nur im React-Arbeitsspeicher und verschwanden nach dem Neuladen.

Für jede Klasse wird nun ein lokaler Bewertungsentwurf mit Datum und Symbolen gespeichert. Nach dem endgültigen Speichern oder Zurücksetzen wird dieser Entwurf entfernt.

---

## 16. Qualitätssicherung und aktueller technischer Zustand

### 16.1 Erfolgreicher Produktions-Build

Der aktuelle Vite-Produktions-Build wurde am 29. Juli 2026 erfolgreich ausgeführt. Die PWA-Dateien und der Service Worker werden erzeugt.

### 16.2 Fehlende automatisierte Tests

Im Projekt existiert aktuell keine eigene automatisierte Testsuite. Es fehlen insbesondere:

- Unit-Tests für die Notenberechnung,
- Tests für die Pufferlogik,
- Tests für chronologische Neuberechnung,
- Importtests für CSV-Dateien,
- Synchronisationstests,
- Konflikttests mit mehreren Geräten,
- UI-Tests für Smartphone, Tablet und Desktop,
- End-to-End-Tests für Anmeldung und Passwort-Reset.

Gerade die Noten- und Pufferlogik sollte vor produktivem Einsatz durch automatisierte Testfälle abgesichert werden.

### 16.3 Abhängigkeitssicherheit

Der aktuelle Lauf von `npm audit --omit=dev` meldet:

- drei Sicherheitsmeldungen mit Einstufung „high“,
- eine Sicherheitsmeldung mit Einstufung „critical“.

Betroffen sind transitive Abhängigkeiten rund um:

- `@xmldom/xmldom`,
- `brace-expansion`,
- `tar`,
- `ws`.

Für alle Meldungen wird ein Updatepfad über `npm audit fix` angegeben. Vor einem neuen produktiven Release müssen diese Aktualisierungen durchgeführt und anschließend Build sowie Plattformpakete erneut getestet werden.

### 16.4 Versionsverwaltung

Die Versionen sind derzeit nicht zentral vereinheitlicht:

- Web-/Windows-Paket: 0.1.0
- Android: 1.0.4
- Android-Versionscode: 5

Ein einheitliches Versionierungskonzept fehlt. Außerdem ist der aktuelle Projektordner nicht als Git-Repository eingerichtet. Dadurch fehlen:

- nachvollziehbare Änderungshistorie,
- saubere Releases und Tags,
- Rückkehr zu stabilen Versionen,
- automatisierte Builds,
- kontrollierte Zusammenarbeit.

### 16.5 Zeichenkodierung

In einzelnen Quelldateien sind noch fehlerhaft codierte Umlaute sichtbar, beispielsweise in PWA-Metadaten und einzelnen Texten des Diagramms. Diese Stellen sollten bereinigt werden, damit App-Name und deutsche Texte auf allen Plattformen korrekt erscheinen.

---

## 17. Was vor einem produktiven Einsatz noch fehlt

## 17.1 Priorität 1: Datenintegrität und Sicherheit

### Offene Entwürfe in die Cloud aufnehmen

Der aktuelle Bewertungsentwurf muss Teil der geräteübergreifenden Synchronisierung werden, wenn eine Unterrichtsstunde auf einem Gerät begonnen und auf einem anderen fortgesetzt werden soll.

### Konfliktsichere Synchronisierung

Das einzelne große JSON-Dokument sollte in getrennte Datenbanktabellen oder Datensätze aufgeteilt werden:

- Klassen,
- Personen,
- Unterrichtsstunden,
- Bewertungen,
- Entwürfe.

Jeder Datensatz benötigt eigene Änderungszeitpunkte oder Versionsnummern. Dadurch können Änderungen zusammengeführt werden, statt den gesamten Stand zu überschreiben.

### Verschlüsselte lokale Sicherungen

Für echte Schülerdaten sollte geprüft werden:

- verschlüsselte Backup-Datei,
- Passwortschutz für Exportdateien,
- sichere Schlüsselablage des Betriebssystems,
- Sperre der App nach Inaktivität,
- optional PIN oder biometrische Entsperrung.

### Automatisierte Kontolöschung

Statt ausschließlich einer E-Mail-Anfrage sollte eine sichere serverseitige Funktion:

1. die Identität erneut bestätigen,
2. die Cloud-Daten löschen,
3. das Auth-Konto löschen,
4. das Ergebnis bestätigen.

Ein geheimer Supabase-Service-Schlüssel darf dafür ausschließlich serverseitig verwendet werden.

### Sicherheitsupdates

Die aktuellen Audit-Meldungen müssen behoben werden. Danach sind neue Web-, Android- und Windows-Builds erforderlich.

## 17.2 Priorität 2: Testbarkeit und Wartbarkeit

### Automatisierte Fachtests

Mindestens folgende Fälle sollten getestet werden:

- Startnote 2,
- jedes Bewertungssymbol,
- Grenze bei Note 1,
- Grenze bei Note 6,
- Pufferaufbau,
- Pufferabbau,
- `--` bei teilweise vorhandenem Puffer,
- Änderung einer alten Sitzung,
- unterschiedliche Sitzungsreihenfolge,
- Löschen einer Bewertung,
- Legacy-Datenmigration.

### Aufteilung von `App.jsx`

Empfohlene Struktur:

```text
src/
  components/
    ClassSidebar.jsx
    RatingCard.jsx
    GradeTable.jsx
    CloudAccountPanel.jsx
    BackupPanel.jsx
  features/
    grading/
      gradingEngine.js
      gradingEngine.test.js
    classes/
      classImport.js
    sync/
      syncService.js
  hooks/
    useLocalStorage.js
    useCloudSync.js
  styles/
    app.css
```

Die Notenberechnung sollte als unabhängiges, rein funktionales Modul ohne React-Abhängigkeit geführt werden.

### Git und automatisierte Builds

Empfohlen werden:

- Git-Repository,
- `main`- und Entwicklungsbranch,
- Versions-Tags,
- automatischer Web-Build,
- automatischer Android-Build,
- automatischer Windows-Build,
- Prüfungen vor jedem Release.

## 17.3 Priorität 3: Schulischer Funktionsumfang

Sinnvolle Erweiterungen:

- Schuljahr und Halbjahr
- Fach und Kurs
- Lehrkraft oder Profilbezeichnung
- Abwesenheit und Entschuldigung
- „nicht bewertet“-Status
- Freitextnotiz pro Stunde
- Freitextnotiz pro Person
- Sitzplanansicht
- Such- und Filterfunktion
- Klassen archivieren und wiederherstellen
- automatische Schuljahreskopie
- individuelle Startnoten
- gewichtete Bewertungskategorien
- PDF-Bericht pro Person
- Druckansicht
- vollständiger JSON-Backupimport auf Web und Android

## 17.4 Priorität 4: Produkt und Betrieb

- zentrale Status- und Supportseite,
- verständliches Onboarding,
- Demo-Klasse ohne echte Daten,
- In-App-Hilfe zur Berechnungslogik,
- Fehlerprotokoll ohne Schülerdaten,
- Monitoring des Cloud-Dienstes,
- definierter Backup- und Wiederherstellungsprozess,
- Store-Screenshots und Produkttexte,
- Windows-Code-Signatur,
- später optional native iOS-Veröffentlichung.

---

## 18. Empfohlener weiterer Projektplan

## Phase 1: Stabilisierung

Ziel: Die vorhandene App zuverlässig machen.

Arbeiten:

- Umlaute und Zeichencodierung vollständig bereinigen,
- Abhängigkeiten aktualisieren,
- Notenlogik aus `App.jsx` auslagern,
- Unit-Tests für Berechnung und Puffer schreiben,
- Smartphone-Layout auf mehreren Geräten testen,
- Versionsnummern vereinheitlichen.

## Phase 2: Sichere Synchronisierung

Ziel: Datenverlust bei mehreren Geräten verhindern.

Arbeiten:

- relationales oder dokumentweise getrenntes Cloud-Datenmodell,
- Synchronisierung pro Klasse und Sitzung,
- Cloud-Sync für offene Entwürfe,
- Konfliktanzeige und Konfliktlösung,
- zuverlässige Offline-Warteschlange,
- serverseitige Kontolöschung.

## Phase 3: Datenschutzreife

Ziel: Einsatz mit realen schulischen Daten verantwortbar vorbereiten.

Arbeiten:

- verschlüsselte Exporte,
- Android-Backupverhalten prüfen,
- Lösch- und Aufbewahrungskonzept,
- Cloud-Region und Verträge prüfen,
- Rechtstexte fachlich prüfen lassen,
- Berechtigungskonzept dokumentieren.

## Phase 4: Schulischer Ausbau

Ziel: Aus der Bewertungs-App ein langfristig nutzbares Notenheft machen.

Arbeiten:

- Schuljahre, Fächer und Halbjahre,
- Abwesenheiten,
- Notizen,
- Archivierung,
- PDF-Auswertungen,
- erweiterte Exporte.

## Phase 5: Veröffentlichung

Ziel: reproduzierbare und gepflegte Releases.

Arbeiten:

- Google-Play-Test und Produktionsfreigabe,
- Windows-Signatur und stabile Download-URL,
- Netlify-/PWA-Produktionsdeployment,
- automatisierte Release-Pipeline,
- Changelog und Supportprozess.

---

## 19. Bewertung des aktuellen Reifegrads

### Fachliche Idee

Die Grundidee ist stark und klar verständlich. Der Kartenablauf reduziert die Bedienung auf eine konkrete Entscheidung pro Person. Das Viertelschrittmodell ermöglicht eine feinere Entwicklung als selten vergebene ganze Noten. Das Puffersystem löst sinnvoll das Problem, dass weitere gute Leistungen bei Note 1 sonst keine Wirkung mehr hätten.

### Funktionsumfang

Der aktuelle Funktionsumfang deckt den zentralen Alltag bereits weitgehend ab:

- Klassen anlegen,
- Unterrichtsstunden bewerten,
- Verlauf anzeigen,
- Einträge korrigieren,
- Daten exportieren,
- Geräte synchronisieren.

### Technische Reife

Die App ist eine funktionsfähige Beta. Sie kann mit Testdaten realistisch erprobt werden. Für einen breit ausgerollten produktiven Einsatz fehlen jedoch Schutzmechanismen und Qualitätssicherung, die bei personenbezogenen Leistungsdaten besonders wichtig sind.

### Skalierbarkeit

Für einzelne Lehrkräfte mit einer überschaubaren Anzahl von Klassen ist das aktuelle JSON-Modell ausreichend. Für mehrere Schuljahre, viele Geräte, parallele Bearbeitung oder institutionelle Nutzung sollte die Datenbankstruktur weiterentwickelt werden.

### Gesamturteil

Das Projekt hat den Schritt von einer einzelnen JSX-Vorschau zu einer echten plattformübergreifenden Anwendung erfolgreich vollzogen. Es besitzt eine erkennbare Produktidee, eine funktionierende Bewertungslogik und reale Distributionswege für Web, Android und Windows.

Der nächste sinnvolle Schwerpunkt ist nicht eine möglichst große Zahl neuer Funktionen. Wichtiger sind jetzt:

1. Datenintegrität,
2. automatisierte Tests,
3. sichere Synchronisierung,
4. Datenschutzreife,
5. ein reproduzierbarer Release-Prozess.

Wenn diese Punkte umgesetzt sind, kann aus der aktuellen Beta eine belastbare Anwendung für den regelmäßigen schulischen Einsatz werden.

---

## 20. Wichtige Projektdateien

| Datei oder Ordner | Aufgabe |
|---|---|
| `src/App.jsx` | Hauptoberfläche, Bewertungslogik und Anwendungszustand |
| `src/GradeChartPanel.jsx` | Notenverlauf als Liniendiagramm |
| `src/cloudSync.js` | Anmeldung und Supabase-Synchronisierung |
| `src/supabaseClient.js` | Konfiguration des Supabase-Clients |
| `supabase/schema.sql` | Cloud-Tabelle und Zugriffsrichtlinien |
| `electron/main.cjs` | Windows-Fenster und Dateisicherung |
| `electron/preload.cjs` | sichere Desktop-Schnittstelle |
| `capacitor.config.ts` | Android- und iOS-Verpackung |
| `android/app/build.gradle` | Android-Version, Paketname und Signierung |
| `vite.config.js` | Web-Build, PWA und Service Worker |
| `public/privacy-policy.html` | Datenschutzerklärung |
| `public/account-deletion.html` | Konto- und Datenlöschung |
| `public/impressum.html` | Impressum |
| `package.json` | Abhängigkeiten und Build-Befehle |

---

## 21. Build-Befehle

### Web/PWA

```powershell
npm run build
```

### Android aktualisieren

```powershell
npm run android:sync
```

### Android-Projekt öffnen

```powershell
npm run android:open
```

### Windows-Installer

```powershell
npm run desktop:installer
```

### iOS-Projekt synchronisieren

```powershell
npm run ios:sync
```

Ein nativer iOS-Build ist nur auf einem Mac mit Xcode und Apple-Signierung möglich.

