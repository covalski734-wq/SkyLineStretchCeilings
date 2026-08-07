import { useLayoutEffect } from 'react'

/**
 * Fades sections in as they enter the viewport.
 * Anything already on screen at first paint is shown instantly, with no
 * entry animation — only content you scroll down to animates.
 */
export function useScrollReveal() {
  useLayoutEffect(() => {
    const nodes = Array.from(document.querySelectorAll('[data-reveal]'))
    if (!nodes.length) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || typeof IntersectionObserver === 'undefined') {
      nodes.forEach((el) => el.classList.add('is-instant', 'is-visible'))
      return
    }

    const viewport = window.innerHeight || 800
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -7% 0px' }
    )

    nodes.forEach((el) => {
      if (el.getBoundingClientRect().top < viewport * 0.92) {
        el.classList.add('is-instant', 'is-visible')
        return
      }
      io.observe(el)
    })

    return () => io.disconnect()
  }, [])
}
