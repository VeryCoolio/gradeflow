import { RATING_GUIDE } from "../../application/ratingGuide";
export { RATING_GUIDE } from "../../application/ratingGuide";

export function RatingGuide() {
  return (
    <section className="card rating-guide">
      <p className="eyebrow">So wird bewertet</p>
      <h2>Die Mitarbeit über die gesamte Stunde</h2>
      <p>
        Du schätzt die gesamte mündliche Mitarbeit einer Person in dieser
        Unterrichtsstunde ein. Vergleiche sie mit ihrem bisherigen Stand vor der
        Stunde – einzelne Wortmeldungen sind keine eigenen Notenereignisse.
      </p>
      <div className="guide-grid">
        {Object.entries(RATING_GUIDE).map(([symbol, rule]) => (
          <div key={symbol} className={`rating-tile ${rule.tone}`}>
            <strong>{symbol}</strong>
            <span>{rule.meaning}</span>
            <small>Zahlenwert {rule.change}</small>
          </div>
        ))}
      </div>
      <p>
        Alle Personen starten bei <strong>2,00</strong>. Ein kleinerer
        Zahlenwert ist besser. Die Symbole beschreiben eine Veränderung, keine
        feste Note für die Stunde.
      </p>
      <p>
        <strong>Puffer bei 1,00:</strong> weitere Verbesserungen sammeln bis zu
        drei Punkte. Ein „−“ verbraucht zuerst einen, ein „−−“ bis zu zwei
        Pufferpunkte. Beispiel: 1,25 mit ++ ergibt 1,00 und einen Pufferpunkt.
        Der Stand bleibt zwischen 1,00 und 6,00.
      </p>
      <p>
        <strong>Abwesend:</strong> nicht anwesend.{" "}
        <strong>Nicht beobachtet:</strong> keine ausreichende Grundlage für eine
        Einschätzung der ganzen Stunde. Beide verändern weder Stand noch Puffer.
        „0“ ist dagegen eine bewertete Stunde auf dem bisherigen Niveau.
      </p>
      <p className="muted">
        Mündliche Prüfungen, Referate und Präsentationen gehören nicht in diese
        Erfassung. Du entscheidest über die pädagogische Bewertung und eine
        Endnote; die App dokumentiert deine Eingaben und berechnet den Verlauf.
      </p>
    </section>
  );
}
