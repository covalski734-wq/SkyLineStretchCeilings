import { cities } from '../data.js'
import ServiceAreaMap from './ServiceAreaMap.jsx'

export default function ServiceArea() {
  return (
    <section id="area" className="section section--dark">
      <div
        className="container split"
        data-reveal
        style={{ gap: 'clamp(40px, 6vw, 80px)' }}
      >
        <div>
          <div className="eyebrow eyebrow--light">Service area</div>
          <h2 className="h2 h2--sm" style={{ marginBottom: '22px' }}>
            Proudly serving the Lower Mainland
          </h2>
          <p className="prose prose--light" style={{ marginBottom: '30px' }}>
            Based in Vancouver, we install across the Lower Mainland — from West
            Vancouver to Langley and White Rock — usually with same‑week
            availability.
          </p>

          <div className="city-list">
            {cities.map((c) => (
              <span key={c} className="city">
                <span className="city__dot" />
                {c}
              </span>
            ))}
          </div>
        </div>

        <ServiceAreaMap />
      </div>
    </section>
  )
}
