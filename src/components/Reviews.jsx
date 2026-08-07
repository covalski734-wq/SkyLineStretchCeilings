import { useCallback, useEffect, useRef, useState } from 'react'
import { reviews } from '../data.js'

const GAP = 22

/** Generic profile silhouette — stands in until real client photos exist. */
function AvatarPlaceholder() {
  return (
    <div className="rev-card__avatar" aria-hidden="true">
      <svg viewBox="0 0 40 40" focusable="false">
        <circle cx="20" cy="15.5" r="6.6" />
        <path d="M20 24.4c-7.1 0-12.9 4.5-12.9 10.1V40h25.8v-5.5c0-5.6-5.8-10.1-12.9-10.1Z" />
      </svg>
    </div>
  )
}

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
                <AvatarPlaceholder />
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
