export function AboutPage() {
  return (
    <article className="card explanation-page">
      <p className="eyebrow">Idee und Anwendung</p>
      <h2 data-tour="about-title">So funktioniert Gradeflow</h2>
      <p className="lead">
        Mündliche Mitarbeit über mehrere Unterrichtsstunden nachvollziehbar
        dokumentieren.
      </p>
      <h3>Warum stundenweise dokumentieren?</h3>
      <p>
        Mündliche Beiträge bleiben nicht wie eine schriftliche Arbeit vorliegen.
        Eine zeitnahe Zusammenfassung nach jeder Stunde hilft dir, deine
        Einschätzungen über den Bewertungszeitraum festzuhalten. Gradeflow
        verarbeitet anschließend deine Eingaben nach festen Regeln.
      </p>
      <h3>Was wird eingeschätzt?</h3>
      <p>
        Du betrachtest die gesamte mündliche Mitarbeit einer Person während
        einer Unterrichtsstunde. Einzelne Wortmeldungen werden nicht einzeln
        benotet. Mündliche Prüfungen, Referate und Präsentationen gehören nicht
        in diese Erfassung.
      </p>
      <p>
        Gemeint sind fachbezogene Antworten, Fragen, Erklärungen und
        Begründungen. Unterscheide die Qualität der Beiträge – etwa fachliche
        Richtigkeit, eigene Gedanken und Begründungen – von ihrer Häufigkeit und
        Regelmäßigkeit. Welche Kriterien für dein Fach und deine Aufgabe zählen,
        legst du als Lehrkraft fest. Die App gibt dafür keine Gewichtung vor.
        Anwesenheit, Disziplin und mitgebrachte Materialien sind in diesem
        Konzept keine eigenen Kriterien der fachlichen Mitarbeit.
      </p>
      <h3>Relativ zum bisherigen Stand</h3>
      <p>
        Alle Personen beginnen bei 2,00. Am Ende einer Stunde vergleichst du die
        Mitarbeit mit dem Stand vor dieser Stunde. Die fünf Symbole von −− bis
        ++ beschreiben eine Veränderung, keine eigenständige Stundennote.
        Ergebnis und Puffer werden vor der Auswahl angezeigt.
      </p>
      <p>
        Der Startwert 2,00 ist ein gewählter Ausgangspunkt des Modells, keine
        bereits beobachtete Leistung. Er soll einen positiven Einstieg mit
        Spielraum bis 1,00 ermöglichen. Eine motivierende Wirkung dieses
        konkreten Startwerts ist nicht nachgewiesen. Der berechnete Stand ist
        kein Durchschnitt unabhängiger Stundennoten.
      </p>
      <h3>Wozu dient der Puffer?</h3>
      <p>
        An der Grenze 1,00 kann ein Puffer bis zu drei Viertelschritte
        aufnehmen. Er soll eine schwächere Stunde abfedern. Das gelingt nur,
        soweit Puffer vorhanden ist: Bei 1,00 mit einem Pufferpunkt führt „−−“
        zu 1,25 und leerem Puffer. Der Puffer verhindert also nicht jede
        Verschlechterung. Diese Regel ist eine Gestaltungsentscheidung des
        Modells.
      </p>
      <h3>Der Ablauf</h3>
      <ol className="explanation-steps">
        <li>
          <strong>Klasse vorbereiten.</strong> Namen eingeben oder eine
          Klassenliste importieren. Der Bewertungszeitraum ist eine frei
          änderbare Bezeichnung.
        </li>
        <li>
          <strong>Stunde erfassen.</strong> Pro Person ein Symbol wählen oder
          Abwesenheit bzw. fehlende Beobachtungsgrundlage ausdrücklich
          dokumentieren. Jede Eingabe wird sofort lokal gespeichert.
        </li>
        <li>
          <strong>Entwicklung nachsehen.</strong> Tabelle und Personenverlauf
          zeigen die Stunden chronologisch. Korrigierst du einen älteren
          Eintrag, werden die folgenden Werte neu berechnet.
        </li>
        <li>
          <strong>Daten sichern.</strong> Excel und CSV sind lesbare Berichte.
          Eine JSON-Sicherung lässt sich vollständig wieder einlesen.
        </li>
      </ol>
      <h3>Abwesenheit ist keine schlechte Mitarbeit</h3>
      <p>
        „Abwesend“ und „Nicht beobachtet“ verändern den berechneten Stand nicht.
        „Offen“ bedeutet, dass noch keine Eingabe vorliegt. Die bewertete 0 ist
        eine eigene Entscheidung und bedeutet unveränderten Stand.
      </p>
      <h3>Was sagt der Verlauf aus?</h3>
      <p>
        Die Kurve zeigt den berechneten Stand deiner dokumentierten
        Einschätzungen. Sie misst keine Kompetenz automatisch. Datum, Symbol und
        Rechenweg machen die Verarbeitung nachvollziehbar; die fachliche
        Begründung einer Einschätzung lässt sich daraus allein nicht ablesen.
        Ein Symbol ersetzt diese Begründung nicht.
      </p>
      <p>
        Nach einer Korrektur einer früheren Stunde ändern sich die folgenden
        Rechenstände. Die später gewählten Symbole bleiben dabei erhalten,
        obwohl sie sich ursprünglich auf den damaligen Stand bezogen. Prüfe
        deshalb auch die späteren Einschätzungen.
      </p>
      <h3>Zeitraum und Verantwortung</h3>
      <p>
        Es gibt keinen automatischen Reset zum Halbjahr oder Schuljahresende. Du
        beendest einen Zeitraum durch Archivieren. Die Einschätzung bleibt deine
        Entscheidung; Gradeflow beobachtet und bewertet keine Sprache oder
        Verhaltensdaten automatisch.
      </p>
      <h3>Der Prototyp in der Bachelorarbeit</h3>
      <p>
        Die Bachelorarbeit verbindet die fachliche Eingrenzung mündlicher
        Mitarbeit mit der Weiterentwicklung und Prüfung des Prototyps.
        Technische Tests prüfen, ob Berechnung und Speicherung den festgelegten
        Regeln entsprechen. Der im Manuskript geplante Usability-Test mit
        Lehramtsstudierenden und fiktiven Daten untersucht, ob sich die Aufgaben
        verständlich bearbeiten lassen. Daraus folgen keine Nachweise für
        gerechtere Noten, höhere Motivation oder bessere Unterrichtswirkung.
      </p>
    </article>
  );
}

export function DataPage({ onBackup }: { onBackup: () => void }) {
  return (
    <article className="card explanation-page">
      <p className="eyebrow">Speicherung und Sicherung</p>
      <h2>Wo sind meine Daten?</h2>
      <p className="lead">
        Deine Klassen, Namen und Bewertungen liegen im lokalen Speicher dieses
        Browserprofils.
      </p>
      <h3>Diese Adresse, dieser Browser</h3>
      <p>
        Der Datenbestand gehört zu{" "}
        <strong className="data-origin">{window.location.origin}</strong>. Ein
        anderer Browser, ein anderes Profil oder eine andere Adresse hat einen
        eigenen Bestand. Auch eine lokale Vorschau und die Netlify-Adresse
        teilen ihre Daten nicht.
      </p>
      <p>
        Die Website lädt die App-Dateien vom Hosting-Anbieter. Die App überträgt
        deine Klassen und Bewertungen nicht an einen Gradeflow-Server. Es gibt
        kein Benutzerkonto und keine automatische Synchronisierung zwischen
        Geräten.
      </p>
      <h3>Wann wird gespeichert?</h3>
      <p>
        Jede bestätigte Beobachtung wird sofort lokal gespeichert. Du kannst
        eine Stunde unterbrechen und später fortsetzen. Die Klassenerstellung
        speichert zunächst einen eigenen lokalen Entwurf; erst „Klasse lokal
        anlegen“ übernimmt ihn als Klasse. Ausgewählte Dateien müssen nach einem
        Neuladen erneut ausgewählt werden.
      </p>
      <h3>Was kann verloren gehen?</h3>
      <p>
        Das Löschen von Website- oder Browserdaten, ein verlorenes Gerät oder
        die Bereinigung eines privaten Browserfensters kann den Bestand
        entfernen. Eine Neuinstallation kann ihn ebenfalls verlieren. Die App
        verschlüsselt die lokalen Daten nicht selbst. Schütze dein Gerät und
        heruntergeladene Dateien vor fremdem Zugriff.
      </p>
      <h3>So sicherst du deine Klassen</h3>
      <ol className="explanation-steps">
        <li>
          Öffne die Datensicherung und lade die vollständige JSON-Sicherung
          herunter.
        </li>
        <li>
          Bewahre diese Datei geschützt außerhalb der Browserdaten auf.
          Wiederhole das regelmäßig und vor einem Geräte- oder Browserwechsel.
        </li>
        <li>
          Wähle auf dem Zielgerät dieselbe App-Adresse und importiere die
          JSON-Datei. Prüfe die angezeigte Zusammenfassung vor dem Ersetzen des
          Bestands.
        </li>
      </ol>
      <button type="button" className="primary" onClick={onBackup}>
        Zur Datensicherung
      </button>
      <h3>Bericht und Vollsicherung</h3>
      <p>
        <strong>JSON</strong> enthält alle angelegten Klassen, Personen und
        Stunden und ist das Wiederherstellungsformat. Ein noch nicht
        übernommener Klassenentwurf gehört nicht dazu.{" "}
        <strong>Excel und CSV</strong> sind Auswertungen; sie ersetzen keine
        Vollsicherung.
      </p>
      <p>
        Vor einem ersetzenden JSON-Import und vor einer Klassenlöschung legt die
        App einen lokalen Rückfallstand an. Dieser liegt im selben Browser und
        kann zusammen mit den übrigen Browserdaten verloren gehen. Die
        Importgrenze beträgt 5 MiB pro JSON-Datei.
      </p>
      <h3>Fiktive Namen und Personenbezug</h3>
      <p>
        Verwende zum Ausprobieren erfundene Personen. Kürzel für echte Personen
        machen einen Datensatz nicht automatisch anonym. Auch heruntergeladene
        Sicherungen und Berichte können Namen und Bewertungen enthalten und
        müssen entsprechend geschützt aufbewahrt werden.
      </p>
      <h3>Mehrere Tabs</h3>
      <p>
        Ein Tab darf schreiben. Weitere Tabs zeigen den aktuellen Stand an. So
        überschreiben sie nicht versehentlich neuere Eingaben. Das ist keine
        Gerätesynchronisierung.
      </p>
    </article>
  );
}
