import { aboutChips } from '../data.js'

export default function About() {
  return (
    <section id="about" className="section">
      <div className="container split" data-reveal>
        <div>
          <div className="eyebrow">The material</div>
          <h2 className="h2 h2--sm" style={{ marginBottom: '26px' }}>
            What is a stretch ceiling?
          </h2>

          <p className="prose">
            A stretch ceiling is a special membrane held by a hidden perimeter
            track and tensioned into a perfectly flat, modern surface —
            installed just below your existing ceiling, with no cracks, minimal
            dust and no repainting.
          </p>
          <p className="prose prose--last">
            It can be flat, sloped, curved, multi‑level or backlit, and it hides
            wiring, pipes and an uneven old ceiling while integrating LED lines,
            spotlights and speakers with millimetre precision.
          </p>

          <div className="chips">
            {aboutChips.map((c) => (
              <span key={c} className="chip">
                <span className="chip__dot" />
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="media-frame">
          <img
            src="/assets/g08.jpg"
            alt="Modern ceiling with integrated light"
            className="ph-img"
          />
        </div>
      </div>
    </section>
  )
}
