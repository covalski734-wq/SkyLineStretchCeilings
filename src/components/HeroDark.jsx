import { heroStats, site } from '../data.js'

export default function HeroDark() {
  return (
    <section className="hero-pad hero-a">
      <div className="hero-a__bg" />
      <div className="hero-a__glow" />
      <div className="hero-a__scrim" />

      <div className="hero-a__inner">
        <div className="hero-a__copy">
          <div className="hero-kicker">
            <span className="hero-kicker__rule" />
            <span className="hero-kicker__text">Vancouver · Lower Mainland</span>
          </div>

          <h1 className="hero-a__title">Modern ceilings with built‑in light.</h1>

          <p className="hero-a__sub">
            Premium stretch ceilings with integrated LED lighting — perfectly
            flat, installed clean in a single day, and backed by a 10‑year
            warranty.
          </p>

          <div className="hero-actions">
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary"
            >
              Free Quote on WhatsApp
            </a>
            <a href="#portfolio" className="btn btn--ghost-light">
              View Our Work
            </a>
          </div>

          <div className="hero-stats">
            {heroStats.map((s) => (
              <div key={s.label}>
                <div className="hero-stats__value">{s.value}</div>
                <div className="hero-stats__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
