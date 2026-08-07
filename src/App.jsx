import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './components/Home.jsx'
import PrivacyPolicy from './components/PrivacyPolicy.jsx'

/**
 * A router does not restore scroll for us: without this you land halfway down
 * the privacy policy after clicking the footer link from the bottom of the
 * landing page. Honours a hash target when there is one.
 */
function useRouteScroll() {
  const { pathname, hash } = useLocation()
  const previousPath = useRef(null)

  useEffect(() => {
    // Changing route should feel like a page load — jump. Moving between
    // anchors on the page we are already on should glide. Smooth-scrolling a
    // route change also loses the race: the landing page unmounts mid-animation
    // and the scroll never reaches the top.
    const changedRoute = previousPath.current !== pathname
    previousPath.current = pathname
    const behavior = changedRoute ? 'instant' : 'smooth'

    if (hash) {
      const target = document.querySelector(hash)
      if (target) {
        target.scrollIntoView({ behavior })
        return
      }
    }
    window.scrollTo({ top: 0, behavior })
  }, [pathname, hash])
}

export default function App() {
  useRouteScroll()

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  )
}
