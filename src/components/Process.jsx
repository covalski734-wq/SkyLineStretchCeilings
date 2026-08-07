import { steps } from '../data.js'

export default function Process() {
  return (
    <section id="process" className="section">
      <div className="container" data-reveal>
        <div className="section-head">
          <div className="eyebrow">Step by step</div>
          <h2 className="h2">How we work</h2>
        </div>

        <div className="step-grid">
          {steps.map((s) => (
            <div key={s.no} className="step">
              <div className="step__no">{s.no}</div>
              <h3 className="step__title">{s.title}</h3>
              <p className="step__text">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
