import { useCallback, useEffect, useRef, useState } from 'react'
import { reviews } from '../data.js'

const GAP = 22

export default function Reviews() {
  const trackRef = useRef(null)
  const [active, setActive] = useState(0)

  // Below 900px the track becomes a scroll-snap carousel; keep the dots in
  // sync with however far the user has swiped.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const onScroll = () => {
      const card = track.querySelector('.rev-card')
      const step = card ? card.offsetWidth + GAP : track.clientWidth
      const index = Math.round(track.scrollLeft / step)
      setActive((current) => (index === current ? current : index))
    }

    track.addEventListener('scroll', onScroll, { passive: true })
    return () => track.removeEventListener('scroll', onScroll)
  }, [])

  const goTo = useCallback((index) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('.rev-card')
    const step = card ? card.offsetWidth + GAP : track.clientWidth
    track.scrollTo({ left: index * step, behavior: 'smooth' })
  }, [])

  return (
    <section id="reviews" className="section section--alt">
      <div className="container" data-reveal>
        <div className="section-head--center">
          <div className="eyebrow">Reviews</div>
          <h2 className="h2" style={{ marginBottom: '16px' }}>
            What our clients say
          </h2>
          <p className="lead">
            Rated 5.0 by clients across Vancouver and the Lower Mainland.
          </p>
        </div>

        <div className="rev-track" ref={trackRef}>
          {reviews.map((r, i) => (
            <div key={i} className="lift rev-card">
              <div className="rev-card__stars" aria-label="5 out of 5 stars">
                ★★★★★
              </div>
              <p className="rev-card__text">“{r.text}”</p>
              <div className="rev-card__who">
                <div className="rev-card__avatar" />
                <div>
                  <div className="rev-card__name">{r.name}</div>
                  <div className="rev-card__loc">{r.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rev-dots">
          {reviews.map((r, i) => (
            <button
              key={i}
              type="button"
              className={`rev-dot${i === active ? ' is-active' : ''}`}
              aria-label={`Go to review ${i + 1}`}
              aria-current={i === active}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
