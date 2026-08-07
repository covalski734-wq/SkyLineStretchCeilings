import Header from './components/Header.jsx'
import HeroDark from './components/HeroDark.jsx'
import About from './components/About.jsx'
import Installation from './components/Installation.jsx'
import CeilingTypes from './components/CeilingTypes.jsx'
import Portfolio from './components/Portfolio.jsx'
import Benefits from './components/Benefits.jsx'
import WhyUs from './components/WhyUs.jsx'
import Process from './components/Process.jsx'
import Reviews from './components/Reviews.jsx'
import Faq from './components/Faq.jsx'
import ServiceArea from './components/ServiceArea.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'

import { useScrollReveal } from './hooks/useScrollReveal.js'

export default function App() {
  useScrollReveal()

  return (
    <>
      <Header />
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
      <Footer />
    </>
  )
}
