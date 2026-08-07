import { benefits } from '../data.js'

export default function Benefits() {
  return (
    <section id="benefits" className="section">
      <div className="container" data-reveal>
        <div className="section-head">
          <div className="eyebrow">Why stretch ceiling</div>
          <h2 className="h2">Built to perform, made to impress</h2>
        </div>

        <div className="benefit-grid">
          {benefits.map((b) => (
            <div key={b.no} className="benefit">
              <div className="benefit__no">{b.no}</div>
              <h3 className="benefit__title">{b.title}</h3>
              <p className="benefit__text">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
