import HeroDark from './HeroDark.jsx'
import About from './About.jsx'
import Installation from './Installation.jsx'
import CeilingTypes from './CeilingTypes.jsx'
import Portfolio from './Portfolio.jsx'
import Benefits from './Benefits.jsx'
import WhyUs from './WhyUs.jsx'
import Process from './Process.jsx'
import Reviews from './Reviews.jsx'
import Faq from './Faq.jsx'
import ServiceArea from './ServiceArea.jsx'
import Contact from './Contact.jsx'

import { useScrollReveal } from '../hooks/useScrollReveal.js'

export default function Home() {
  // Lives here rather than in App so the observer is rebuilt whenever the
  // landing page is mounted again after visiting another route.
  useScrollReveal()

  return (
    <>
      <HeroDark />
      <About />
      <Installation />
      <CeilingTypes />
      <Portfolio />
      <Benefits />
      <WhyUs />
      <Process />
      <Reviews />
      <Faq />
      <ServiceArea />
      <Contact />
    </>
  )
}
