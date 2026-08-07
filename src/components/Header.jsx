import { useState } from 'react'
import { nav, site } from '../data.js'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header id="top" className="site-header">
      <div className="site-header__inner">
        <a href="#top" className="logo-box">
          <img
            src="/assets/logo-white.png"
            alt={site.name}
            className="site-header__logo"
            width="916"
            height="645"
          />
        </a>

        <nav className="nav-links">
          {nav.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <a href={site.phoneHref} className="header-phone">
            {site.phone}
          </a>
          <a
            href={site.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary btn--header"
          >
            Free Quote
          </a>
          <button
            type="button"
            className={`nav-burger${open ? ' is-open' : ''}`}
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="nav-burger__bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {/* Always rendered so opening and closing can animate. */}
      <div
        id="mobile-nav"
        className={`mobile-nav${open ? ' is-open' : ''}`}
        aria-hidden={!open}
      >
        <div className="mobile-nav__inner">
          {nav.map((link) => (
            <a
              key={link.href}
              href={link.href}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  )
}
