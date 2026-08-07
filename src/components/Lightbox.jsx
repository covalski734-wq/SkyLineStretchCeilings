import { useCallback, useEffect, useRef } from 'react'

/**
 * Full-screen image viewer for the portfolio grid.
 * Closes on Esc / backdrop click, steps with the arrow keys, and restores
 * focus to whatever opened it.
 */
export default function Lightbox({ items, index, onClose, onStep }) {
  const closeRef = useRef(null)
  const restoreRef = useRef(null)

  const open = index !== null
  const item = open ? items[index] : null

  // Remember the trigger so focus can go back where it came from.
  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement
    closeRef.current?.focus()
    return () => {
      if (restoreRef.current instanceof HTMLElement) restoreRef.current.focus()
    }
  }, [open])

  // Keyboard: Esc closes, arrows step.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onStep(1)
      else if (e.key === 'ArrowLeft') onStep(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, onStep])

  // Stop the page scrolling behind the overlay, without the layout shifting
  // as the scrollbar disappears.
  useEffect(() => {
    if (!open) return
    const { body } = document
    const gap = window.innerWidth - document.documentElement.clientWidth
    const prevOverflow = body.style.overflow
    const prevPad = body.style.paddingRight
    body.style.overflow = 'hidden'
    if (gap > 0) body.style.paddingRight = `${gap}px`
    return () => {
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPad
    }
  }, [open])

  const step = useCallback(
    (dir) => (e) => {
      e.stopPropagation()
      onStep(dir)
    },
    [onStep]
  )

  if (!open) return null

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        className="lightbox__close"
        aria-label="Close"
        onClick={onClose}
      >
        <span aria-hidden="true">✕</span>
      </button>

      <button
        type="button"
        className="lightbox__nav lightbox__nav--prev"
        aria-label="Previous image"
        onClick={step(-1)}
      >
        <span aria-hidden="true">‹</span>
      </button>

      {/* key forces a remount per slide so the entry animation replays */}
      <figure
        className="lightbox__stage"
        key={index}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={item.img} alt={item.title} className="lightbox__img" />
        <figcaption className="lightbox__caption">
          <span className="lightbox__tag">{item.tag}</span>
          <span className="lightbox__title">{item.title}</span>
          <span className="lightbox__count">
            {index + 1} / {items.length}
          </span>
        </figcaption>
      </figure>

      <button
        type="button"
        className="lightbox__nav lightbox__nav--next"
        aria-label="Next image"
        onClick={step(1)}
      >
        <span aria-hidden="true">›</span>
      </button>
    </div>
  )
}
